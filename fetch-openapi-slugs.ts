import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import axios from 'axios';
import {
  isAllowedOpenApiPath,
  openApiGenerationConfig,
} from './openapi-generation.config';

type JsonObject = Record<string, unknown>;

const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
  'trace',
] as const;

function slugify(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getFirstOperationTag(pathItem: JsonObject): string | null {
  for (const method of HTTP_METHODS) {
    const operation = pathItem[method];

    if (
      operation &&
      typeof operation === 'object' &&
      !Array.isArray(operation)
    ) {
      const tags = (operation as JsonObject).tags;

      if (
        Array.isArray(tags) &&
        typeof tags[0] === 'string' &&
        tags[0].trim() !== ''
      ) {
        return tags[0];
      }
    }
  }

  return null;
}

function getDomainForPath(path: string, pathItem: JsonObject): string {
  const tag = getFirstOperationTag(pathItem);

  if (tag) {
    const tagSlug = slugify(tag);

    return tagSlug.startsWith('admin-')
      ? tagSlug
      : `admin-${tagSlug}`;
  }

  const adminPrefix = '/v1/admin/';
  const relativePath = path.startsWith(adminPrefix)
    ? path.slice(adminPrefix.length)
    : '';

  const firstSegment = relativePath.split('/').filter(Boolean)[0];

  return firstSegment
    ? `admin-${slugify(firstSegment)}`
    : 'admin';
}

function getDomainNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function findRefs(value: unknown, refs: Set<string>): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      findRefs(item, refs);
    }

    return;
  }

  const record = value as JsonObject;
  const ref = record.$ref;

  if (typeof ref === 'string') {
    refs.add(ref);
  }

  for (const nestedValue of Object.values(record)) {
    findRefs(nestedValue, refs);
  }
}

function decodeJsonPointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function getValueByRef(fullDocument: JsonObject, ref: string): unknown {
  if (!ref.startsWith('#/')) {
    return undefined;
  }

  const parts = ref
    .slice(2)
    .split('/')
    .map(decodeJsonPointerSegment);

  let current: unknown = fullDocument;

  for (const part of parts) {
    if (
      !current ||
      typeof current !== 'object' ||
      Array.isArray(current) ||
      !(part in current)
    ) {
      return undefined;
    }

    current = (current as JsonObject)[part];
  }

  return current;
}

function setValueByRef(
  targetDocument: JsonObject,
  ref: string,
  value: unknown,
): void {
  if (!ref.startsWith('#/')) {
    return;
  }

  const parts = ref
    .slice(2)
    .split('/')
    .map(decodeJsonPointerSegment);

  let current = targetDocument;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const existingValue = current[part];

    if (
      !existingValue ||
      typeof existingValue !== 'object' ||
      Array.isArray(existingValue)
    ) {
      current[part] = {};
    }

    current = current[part] as JsonObject;
  }

  current[parts.at(-1) as string] = value;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const record = value as JsonObject;
  const keys = Object.keys(record).sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function checkOutputMissing(slug: string): boolean {
  const endpointFile = join(
    openApiGenerationConfig.generated.endpointsRoot,
    slug,
    `${slug}.ts`,
  );
  const modelsDirectory = join(
    openApiGenerationConfig.generated.modelsRoot,
    slug,
  );

  if (!existsSync(endpointFile) || !existsSync(modelsDirectory)) {
    return true;
  }

  try {
    return readdirSync(modelsDirectory).length === 0;
  } catch {
    return true;
  }
}

async function prepareOpenApi(): Promise<void> {
  try {
    console.log(
      `Fetching OpenAPI specification from: ${openApiGenerationConfig.source}`,
    );

    const response = await axios.get(openApiGenerationConfig.source, {
      headers: {
        Accept: 'application/json',
      },
      timeout: 30_000,
    });

    const fullDocument = response.data as JsonObject;
    const paths = fullDocument.paths;

    if (!paths || typeof paths !== 'object' || Array.isArray(paths)) {
      throw new Error('Invalid OpenAPI structure: missing "paths" object.');
    }

    let previousManifest: JsonObject = {
      version: 1,
      domains: {},
    };

    if (existsSync(openApiGenerationConfig.manifestFile)) {
      try {
        previousManifest = JSON.parse(
          readFileSync(openApiGenerationConfig.manifestFile, 'utf8'),
        ) as JsonObject;
      } catch {
        console.warn(
          'Could not parse sync manifest. A fresh manifest state will be used.',
        );
      }
    }

    mkdirSync(openApiGenerationConfig.domainSpecsRoot, {
      recursive: true,
    });

    const allowedPaths: Record<string, JsonObject> = {};

    for (const [path, pathItem] of Object.entries(paths as JsonObject)) {
      if (
        isAllowedOpenApiPath(path) &&
        pathItem &&
        typeof pathItem === 'object' &&
        !Array.isArray(pathItem)
      ) {
        allowedPaths[path] = pathItem as JsonObject;
      }
    }

    const pathsByDomain: Record<string, Record<string, JsonObject>> = {};

    for (const [path, pathItem] of Object.entries(allowedPaths)) {
      const domainSlug = getDomainForPath(path, pathItem);

      pathsByDomain[domainSlug] ??= {};
      pathsByDomain[domainSlug][path] = pathItem;
    }

    const previousDomains =
      previousManifest.domains &&
      typeof previousManifest.domains === 'object' &&
      !Array.isArray(previousManifest.domains)
        ? (previousManifest.domains as JsonObject)
        : {};

    const metadataDomains: Array<{
      name: string;
      slug: string;
      specification: string;
      paths: string[];
    }> = [];

    const processedSlugs = new Set<string>();
    const newDomains: string[] = [];
    const changedDomains: string[] = [];
    const unchangedDomains: string[] = [];
    const missingOutputDomains: string[] = [];

    for (const domainSlug of Object.keys(pathsByDomain).sort()) {
      processedSlugs.add(domainSlug);

      const domainPaths = pathsByDomain[domainSlug];
      const domainName = getDomainNameFromSlug(domainSlug);
      const specificationPath = join(
        openApiGenerationConfig.domainSpecsRoot,
        `${domainSlug}.json`,
      );

      const domainSpecification: JsonObject = {
        openapi:
          typeof fullDocument.openapi === 'string'
            ? fullDocument.openapi
            : '3.0.0',
        info: {
          title: `PetVex Admin - ${domainName}`,
          version:
            fullDocument.info &&
            typeof fullDocument.info === 'object' &&
            !Array.isArray(fullDocument.info) &&
            typeof (fullDocument.info as JsonObject).version === 'string'
              ? (fullDocument.info as JsonObject).version
              : '1.0.0',
          description: `Filtered OpenAPI specification for ${domainName}.`,
        },
        servers: Array.isArray(fullDocument.servers)
          ? fullDocument.servers
          : [],
        paths: domainPaths,
        components: {},
      };

      if (Array.isArray(fullDocument.security)) {
        domainSpecification.security = fullDocument.security;
      }

      const referencesToProcess = new Set<string>();

      for (const pathItem of Object.values(domainPaths)) {
        findRefs(pathItem, referencesToProcess);
      }

      const processedReferences = new Set<string>();

      while (referencesToProcess.size > 0) {
        const ref = referencesToProcess.values().next().value as string;
        referencesToProcess.delete(ref);

        if (processedReferences.has(ref)) {
          continue;
        }

        processedReferences.add(ref);

        const referencedValue = getValueByRef(fullDocument, ref);

        if (referencedValue === undefined) {
          throw new Error(
            `Unresolved OpenAPI reference "${ref}" in domain "${domainSlug}".`,
          );
        }

        setValueByRef(domainSpecification, ref, referencedValue);

        const nestedReferences = new Set<string>();
        findRefs(referencedValue, nestedReferences);

        for (const nestedRef of nestedReferences) {
          if (!processedReferences.has(nestedRef)) {
            referencesToProcess.add(nestedRef);
          }
        }
      }

      const components = domainSpecification.components;

      if (
        components &&
        typeof components === 'object' &&
        !Array.isArray(components) &&
        Object.keys(components).length === 0
      ) {
        delete domainSpecification.components;
      }

      const normalizedSpecification = stableStringify(domainSpecification);
      const hash = createHash('sha256')
        .update(normalizedSpecification)
        .digest('hex');

      writeFileSync(
        specificationPath,
        `${JSON.stringify(domainSpecification, null, 2)}
`,
        'utf8',
      );

      const previousDomain = previousDomains[domainSlug] as
        | JsonObject
        | undefined;
      const previousHash =
        previousDomain && typeof previousDomain.hash === 'string'
          ? previousDomain.hash
          : null;

      if (!previousDomain) {
        newDomains.push(domainSlug);
      } else if (previousHash !== hash) {
        changedDomains.push(domainSlug);
      } else if (checkOutputMissing(domainSlug)) {
        missingOutputDomains.push(domainSlug);
      } else {
        unchangedDomains.push(domainSlug);
      }

      metadataDomains.push({
        name: domainName,
        slug: domainSlug,
        specification: specificationPath,
        paths: Object.keys(domainPaths).sort(),
      });
    }

    const removedDomains = Object.keys(previousDomains)
      .filter((slug) => !processedSlugs.has(slug))
      .sort();

    const metadata = {
      source: openApiGenerationConfig.source,
      allowedPathPrefixes:
        openApiGenerationConfig.allowedPathPrefixes,
      domains: metadataDomains,
    };

    writeFileSync(
      openApiGenerationConfig.metadataFile,
      `${JSON.stringify(metadata, null, 2)}
`,
      'utf8',
    );

    const toGenerate = [
      ...newDomains,
      ...changedDomains,
      ...missingOutputDomains,
    ].sort();

    const generationPlan = {
      generatedAt: new Date().toISOString(),
      domains: {
        new: newDomains.sort(),
        changed: changedDomains.sort(),
        unchanged: unchangedDomains.sort(),
        missingOutput: missingOutputDomains.sort(),
        removed: removedDomains,
      },
      toGenerate,
    };

    writeFileSync(
      openApiGenerationConfig.generationPlanFile,
      `${JSON.stringify(generationPlan, null, 2)}
`,
      'utf8',
    );

    console.log('OpenAPI Admin prepared successfully.');
    console.log(`- New: ${newDomains.length}`);
    console.log(`- Changed: ${changedDomains.length}`);
    console.log(`- Missing output: ${missingOutputDomains.length}`);
    console.log(`- Unchanged: ${unchangedDomains.length}`);
    console.log(`- Removed: ${removedDomains.length}`);
    console.log(`- Total to generate: ${toGenerate.length}`);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error('Error during OpenAPI preparation:', message);
    process.exitCode = 1;
  }
}

if (process.argv.includes('--execute')) {
  await prepareOpenApi();
}
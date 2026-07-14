import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'orval';
import { openApiGenerationConfig } from './openapi-generation.config';

interface DomainMetadata {
  name: string;
  slug: string;
  specification: string;
  paths: string[];
}

interface OpenApiMetadata {
  source: string;
  allowedPathPrefixes: string[];
  domains: DomainMetadata[];
}

interface GenerationPlan {
  generatedAt: string;
  domains: {
    new: string[];
    changed: string[];
    unchanged: string[];
    missingOutput: string[];
    removed: string[];
  };
  toGenerate: string[];
}

function readJsonFile<T>(path: string, fallback: T): T {
  if (!existsSync(path)) {
    return fallback;
  }

  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

if (!existsSync(openApiGenerationConfig.metadataFile)) {
  console.warn(
    `\n[WARNING] Metadata not found: ${openApiGenerationConfig.metadataFile}`,
  );
  console.warn(
    'Run "npm run api:prepare" before "npm run api:orval".\n',
  );
}

if (!existsSync(openApiGenerationConfig.generationPlanFile)) {
  console.warn(
    `\n[WARNING] Generation plan not found: ${openApiGenerationConfig.generationPlanFile}`,
  );
  console.warn(
    'Run "npm run api:prepare" before "npm run api:orval".\n',
  );
}

const metadata = readJsonFile<OpenApiMetadata>(
  openApiGenerationConfig.metadataFile,
  {
    source: '',
    allowedPathPrefixes: [],
    domains: [],
  },
);

const generationPlan = readJsonFile<GenerationPlan>(
  openApiGenerationConfig.generationPlanFile,
  {
    generatedAt: '',
    domains: {
      new: [],
      changed: [],
      unchanged: [],
      missingOutput: [],
      removed: [],
    },
    toGenerate: [],
  },
);

const domainsToGenerate = new Set(generationPlan.toGenerate);

if (
  domainsToGenerate.size === 0 &&
  existsSync(openApiGenerationConfig.generationPlanFile)
) {
  console.log('\n[INFO] No Admin API contract changes detected.');
  console.log('No endpoint or model needs regeneration.\n');
}

const selectedDomains = metadata.domains.filter((domain) =>
  domainsToGenerate.has(domain.slug),
);

function sanitizeOperationName(value: string): string {
  return value
    .replace(/[-_]([a-z])/g, (_, character: string) =>
      character.toUpperCase(),
    )
    .replace(/[^a-zA-Z0-9_$]/g, '');
}

function getOperationName(
  operation: { operationId?: string },
  route: string,
  verb: string,
): string {
  if (operation.operationId) {
    return sanitizeOperationName(operation.operationId);
  }

  const cleanRoute = route
    .replace(/\{[^}]+\}/g, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  const segments = cleanRoute.split('/').filter(Boolean);
  const resource = segments.at(-1) ?? 'admin';
  const normalizedResource = sanitizeOperationName(resource);
  const capitalizedResource =
    normalizedResource.charAt(0).toUpperCase() +
    normalizedResource.slice(1);

  const isDetail = route.includes('{');

  if (verb === 'get') {
    return isDetail
      ? `get${capitalizedResource}`
      : `list${capitalizedResource}`;
  }

  if (verb === 'post') {
    return `create${capitalizedResource}`;
  }

  if (verb === 'put' || verb === 'patch') {
    return `update${capitalizedResource}`;
  }

  if (verb === 'delete') {
    return `delete${capitalizedResource}`;
  }

  return sanitizeOperationName(`${verb}_${cleanRoute}`);
}

const configurations = Object.fromEntries(
  selectedDomains.map((domain) => [
    domain.slug,
    {
      input: {
        target: domain.specification,
      },
      output: {
        mode: 'single' as const,
        target:
          `${openApiGenerationConfig.generated.endpointsRoot}` +
          `/${domain.slug}/${domain.slug}.ts`,
        schemas:
          `${openApiGenerationConfig.generated.modelsRoot}` +
          `/${domain.slug}`,
        client: 'react-query' as const,
        httpClient: 'axios' as const,
        override: {
          mutator: {
            path: './src/core/http/orval-mutator.ts',
            name: 'customInstance',
          },
          operationName: getOperationName,
        },
      },
    },
  ]),
);

export default defineConfig(configurations);
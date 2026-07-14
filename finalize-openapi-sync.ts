import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { openApiGenerationConfig } from './openapi-generation.config';

type JsonObject = Record<string, unknown>;

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

function checkOutputValid(slug: string): boolean {
  const endpointFile = join(
    openApiGenerationConfig.generated.endpointsRoot,
    slug,
    `${slug}.ts`,
  );
  const modelsDirectory = join(
    openApiGenerationConfig.generated.modelsRoot,
    slug,
  );

  if (!existsSync(endpointFile)) {
    console.error(
      `[ERROR] Missing generated endpoint for "${slug}": ${endpointFile}`,
    );
    return false;
  }

  if (!existsSync(modelsDirectory)) {
    console.error(
      `[ERROR] Missing generated models directory for "${slug}": ${modelsDirectory}`,
    );
    return false;
  }

  try {
    if (readdirSync(modelsDirectory).length === 0) {
      console.error(
        `[ERROR] Empty generated models directory for "${slug}": ${modelsDirectory}`,
      );
      return false;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error(
      `[ERROR] Failed to inspect generated models for "${slug}": ${message}`,
    );
    return false;
  }

  return true;
}

function finalizeSync(): void {
  try {
    if (!existsSync(openApiGenerationConfig.generationPlanFile)) {
      console.warn('No generation plan found. Nothing to finalize.');
      return;
    }

    const plan = JSON.parse(
      readFileSync(
        openApiGenerationConfig.generationPlanFile,
        'utf8',
      ),
    ) as {
      toGenerate?: string[];
      domains?: {
        removed?: string[];
      };
    };

    const toGenerate = Array.isArray(plan.toGenerate)
      ? plan.toGenerate
      : [];

    for (const slug of toGenerate) {
      if (!checkOutputValid(slug)) {
        throw new Error(
          'Generated outputs are missing or incomplete. Manifest was not updated.',
        );
      }
    }

    let manifest: {
      version: number;
      domains: Record<string, JsonObject>;
    } = {
      version: 1,
      domains: {},
    };

    if (existsSync(openApiGenerationConfig.manifestFile)) {
      try {
        manifest = JSON.parse(
          readFileSync(
            openApiGenerationConfig.manifestFile,
            'utf8',
          ),
        ) as typeof manifest;
      } catch {
        console.warn(
          'Could not parse sync manifest. A fresh manifest will be created.',
        );
      }
    }

    manifest.domains ??= {};

    for (const slug of toGenerate) {
      const specificationPath = join(
        openApiGenerationConfig.domainSpecsRoot,
        `${slug}.json`,
      );

      if (!existsSync(specificationPath)) {
        throw new Error(
          `Domain specification not found for "${slug}": ${specificationPath}`,
        );
      }

      const domainSpecification = JSON.parse(
        readFileSync(specificationPath, 'utf8'),
      ) as JsonObject;

      const hash = createHash('sha256')
        .update(stableStringify(domainSpecification))
        .digest('hex');

      manifest.domains[slug] = {
        hash,
        specification: specificationPath,
        generatedAt: new Date().toISOString(),
      };
    }

    const removedDomains = Array.isArray(plan.domains?.removed)
      ? plan.domains.removed
      : [];

    for (const slug of removedDomains) {
      delete manifest.domains[slug];
      console.log(
        `Removed obsolete Admin domain "${slug}" from the sync manifest.`,
      );
    }

    writeFileSync(
      openApiGenerationConfig.manifestFile,
      `${JSON.stringify(manifest, null, 2)}
`,
      'utf8',
    );

    console.log('Admin OpenAPI synchronization finalized successfully.');
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error(
      'Error during synchronization finalization:',
      message,
    );
    process.exitCode = 1;
  }
}

if (process.argv.includes('--execute')) {
  finalizeSync();
}
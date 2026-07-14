export const openApiGenerationConfig = {
  source:
    process.env.OPENAPI_URL ??
    'https://api.petvex.com.br/api/v1/openapi/types',

  allowedPathPrefixes: ['/v1/admin'],

  metadataFile: './openapi/metadata.json',
  manifestFile: './openapi/sync-manifest.json',
  generationPlanFile: './openapi/generation-plan.json',
  domainSpecsRoot: './openapi/domains',

  generated: {
    endpointsRoot: './src/core/http/generated/endpoints',
    modelsRoot: './src/core/http/generated/models',
  },
} as const;

export function isAllowedOpenApiPath(path: string): boolean {
  return openApiGenerationConfig.allowedPathPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
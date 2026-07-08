import { defineConfig } from 'orval';

export default defineConfig({
  petvex: {
    input: {
      target: './openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/core/http/generated/endpoints/endpoints.ts',
      schemas: './src/core/http/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/core/http/orval-mutator.ts',
          name: 'customInstance',
        },
      },
    },
  },
});

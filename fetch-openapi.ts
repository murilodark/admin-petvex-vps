import axios from 'axios';
import { openApiGenerationConfig } from './openapi-generation.config';

async function fetchOpenApi(): Promise<void> {
  try {
    const response = await axios.get(
      openApiGenerationConfig.source,
      {
        headers: {
          Accept: 'application/json',
        },
        timeout: 30_000,
      },
    );

    console.log(
      `OpenAPI available: ${response.status} ${openApiGenerationConfig.source}`,
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch OpenAPI.', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected OpenAPI fetch error.', error);
    }

    process.exitCode = 1;
  }
}

await fetchOpenApi();
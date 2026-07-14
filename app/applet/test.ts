import axios from 'axios';

const paths = [
  'https://api.petvex.com.br/api/v1/openapi',
  'https://api.petvex.com.br/api/v1/openapi/types',
  'https://api.petvex.com.br/openapi.json',
  'https://api.petvex.com.br/api/v1/openapi.json',
  'https://api.petvex.com.br/api/v1/swagger.json',
  'https://api.petvex.com.br/swagger.json',
  'https://api.petvex.com.br/api-docs',
  'https://api.petvex.com.br/api/v1/api-docs',
];

async function main() {
  for (const path of paths) {
    try {
      const res = await axios.get(path);
      console.log('FOUND:', path, 'STATUS:', res.status, 'KEYS:', Object.keys(res.data).slice(0, 10));
    } catch (e: any) {
      console.log('NOT FOUND:', path, 'STATUS:', e.response?.status);
    }
  }
}

main();

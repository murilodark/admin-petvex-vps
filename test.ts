import axios from 'axios';

async function main() {
  const urls = [
    'https://api.petvex.com.br/openapi/types',
    'https://api.petvex.com.br/api/v1/openapi/types',
    'http://localhost:3000/openapi/types',
    'https://admin.petvex.com.br/openapi/types',
  ];
  for (const url of urls) {
    try {
      const res = await axios.get(url);
      console.log('SUCCESS:', url);
      console.log('STATUS:', res.status);
      console.log('BODY:', JSON.stringify(res.data).substring(0, 500));
    } catch (error: any) {
      console.log('FAIL:', url);
      console.log('ERROR STATUS:', error?.response?.status);
      console.log('ERROR DATA:', error?.response?.data);
    }
  }
}

main();

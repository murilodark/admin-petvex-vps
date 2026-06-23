const getEnvVal = (key: string): any => {
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key];
  }
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[key] !== undefined) {
    return metaEnv[key];
  }
  return undefined;
};


export const env = {
  API_BASE_URL: getEnvVal('VITE_API_URL')+'/v1' ||  'http://localhost:8990/api/v1',
};

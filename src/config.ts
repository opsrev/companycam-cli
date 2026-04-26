export interface CompanyCamConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ConfigOptions {
  apiKey?: string;
}

const BASE_URL = "https://api.companycam.com/v2";

export function getConfig(options: ConfigOptions): CompanyCamConfig {
  const apiKey = options.apiKey ?? process.env.COMPANYCAM_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing required credential: COMPANYCAM_API_KEY (set env var or pass --api-key)"
    );
  }

  return {
    baseUrl: BASE_URL,
    apiKey,
  };
}

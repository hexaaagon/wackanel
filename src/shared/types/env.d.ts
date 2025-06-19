export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;

      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      BETTER_AUTH_WAKATIME_CLIENT_ID: string;
      BETTER_AUTH_WAKATIME_CLIENT_SECRET: string;
    }
  }
}

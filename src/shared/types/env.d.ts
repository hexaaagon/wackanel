export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_URL: string;
      POSTGRES_USER: string;
      POSTGRES_HOST: string;
      SUPABASE_JWT_SECRET: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      POSTGRES_PRISMA_URL: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      POSTGRES_URL_NON_POOLING: string;

      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      BETTER_AUTH_WAKATIME_CLIENT_ID: string;
      BETTER_AUTH_WAKATIME_CLIENT_SECRET: string;
    }
  }
}

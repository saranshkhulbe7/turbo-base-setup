import { z, ZodError } from 'zod';

const envVariables = z.object({
  // SERVER
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string(),
  TIMEOUT: z.string(), // Ensure it's a valid number

  // BASE_URL
  BASE_URL: z.string().url(), // Validate it's a valid URL

  // APP
  APP_VERSION: z.string(), // Ensure it's a string (could add version format if needed)
  APP_NAME: z.string(), // Ensure it's a string

  // DB
  MONGO_URI: z.string().url(), // Validate it's a valid Mongo URI
  MONGO_DB: z.string(), // Ensure it's a string

  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),

  OTP_TIMEOUT: z.coerce.number().int().positive().default(2),

  USER_JWT_SECRET: z.string(),
  USER_ACCESS_TOKEN_EXPIRY: z.string(),
  USER_ACCESS_TOKEN_COOKIE_EXPIRY: z.coerce.number().int().positive().default(1),
  USER_REFRESH_TOKEN_EXPIRY: z.string(),
  USER_REFRESH_TOKEN_COOKIE_EXPIRY: z.coerce.number().int().positive().default(1),

  ADMIN_JWT_SECRET: z.string(),
  ADMIN_ACCESS_TOKEN_EXPIRY: z.string(),
  ADMIN_ACCESS_TOKEN_COOKIE_EXPIRY: z.coerce.number().int().positive().default(1),
  ADMIN_REFRESH_TOKEN_EXPIRY: z.string(),
  ADMIN_REFRESH_TOKEN_COOKIE_EXPIRY: z.coerce.number().int().positive().default(1),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().positive(),
  REDIS_PASSWORD: z.string().optional(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export const parsedEnv = () => {
  try {
    envVariables.parse(process.env);
  } catch (e) {
    const errors = (e as ZodError).errors.map((issue: any) => ({
      field: issue.path.join('.'),
      errorMessage: issue.message,
    }));
    console.log({
      message: 'Invalid environment variables',
      errors,
    });
    process.exit(1);
  }
};

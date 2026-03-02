import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.string().default("development")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
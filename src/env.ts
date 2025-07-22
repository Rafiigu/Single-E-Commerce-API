export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  SYSTEM_EMAIL_ADDRESS: process.env.SYSTEM_EMAIL_ADDRESS || "",
  SYSTEM_EMAIL_PASSWORD: process.env.SYSTEM_EMAIL_PASSWORD || "",
  PORT: parseInt(process.env.PORT || ""),
  FILE_DIRECTORY: process.env.FILE_DIRECTORY || "./data",
};

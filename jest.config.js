import nextJest from "next/jest.js";
import dotenv from "dotenv";

dotenv.config({ path: [".env.development", ".env"] });
const createJestConfig = nextJest({
  dir: ".",
});

const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});

export default jestConfig;

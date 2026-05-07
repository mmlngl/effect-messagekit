import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/domain/index.ts", "src/infra/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: "es2022",
  external: ["effect"],
});

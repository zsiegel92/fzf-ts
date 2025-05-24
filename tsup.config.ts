import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm"],
  dts: false,
  splitting: false,
  clean: false,
  sourcemap: false,
  banner: { js: "#!/usr/bin/env node" },
});

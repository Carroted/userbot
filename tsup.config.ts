import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "src/index.ts",
    ],
    splitting: false,
    sourcemap: true,
    platform: "node",
    dts: true,
    clean: true,
    format: [
        "esm"
    ],
    minify: true, // minify for production
    silent: true, // silent so we can build and run at once without loads of output
})
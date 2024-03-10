import dts from 'bun-plugin-dts'

console.log('Building...');

await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'bun',
    minify: true,
    plugins: [dts()]
});

console.log('Build complete');
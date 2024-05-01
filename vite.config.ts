import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig( {
    base: '/',
    plugins: [solidPlugin(), createHtmlPlugin( {
        minify: true,
        entry: '/src/index.tsx',
        template: './src/index.html'
    } )],
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: './',
        sourcemap: false,
        rollupOptions: {
            input: '/src/index.tsx',
            output: {
                manualChunks( id: string ) {
                    if ( id.includes( 'node_modules' ) ) {
                        return 'vendors'
                    }
                },
                entryFileNames: 'assets/js/main.[hash].js',
                chunkFileNames: 'assets/js/[name].[hash].js',
                assetFileNames: 'assets/css/[name].[hash][extname]'
            }
        }
    },
    server: {
        port: 3000,
        strictPort: true
    }
} )

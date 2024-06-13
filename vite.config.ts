import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig( {
    base: '/',
    plugins: [
        solidPlugin(),
        createHtmlPlugin( {
            minify: true,
            entry: '/src/index.tsx',
            template: './src/index.html'
        } ),
        visualizer( {
            filename: './dist/stats.html',
            open: false
        } )
    ],
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: './',
        sourcemap: false,
        rollupOptions: {
            input: '/src/index.tsx',
            output: {
                manualChunks( id ) {
                    if ( id.includes( 'node_modules' ) ) {
                        if ( id.includes( 'ammojs3' ) ) {
                            return 'vendor-ammojs3'
                        }

                        if ( id.includes( 'three' ) ) {
                            return 'vendor-three'
                        }

                        if ( id.includes( 'solid-js' ) ) {
                            return 'vendor-solid-js'
                        }

                        return 'vendor'
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
    },
    resolve: {
        alias: {
            fs: 'empty-module',
            path: 'empty-module'
        }
    }
} )

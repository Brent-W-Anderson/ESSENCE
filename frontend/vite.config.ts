import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

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
            filename: '../dist/frontend/stats.html',
            open: false,
        } ),
        viteCompression( {
            algorithm: 'gzip',
            ext: '.gz',
            deleteOriginFile: false,
            filter: ( file ) => !/\.(html|css|ico)$/.test( file )
        } ),
        viteStaticCopy( {
            targets: [
                {
                    src: '../dist/frontend/assets/css/index.css',
                    dest: 'assets/css'
                },
                {
                    src: '../node_modules/ammojs3/dist/ammo.wasm.wasm',
                    dest: 'assets/js'
                },
                {
                    src: '../node_modules/ammojs3/dist/ammo.wasm.js',
                    dest: 'assets/js'
                }
            ]
        } )
    ],
    build: {
        target: 'esnext',
        outDir: '../dist/frontend',
        emptyOutDir: true,
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
                            if ( id.includes( 'three/examples/jsm/controls' ) ) {
                                return 'three-controls'
                            }

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
            '@': path.resolve( __dirname, 'src' ),
            '@/config': path.resolve( __dirname, 'config.ts' ),
            fs: 'empty-module',
            path: 'empty-module'
        }
    }
} )

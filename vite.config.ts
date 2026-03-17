import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        sveltekit(),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/onnxruntime-web/dist/*.jsep.*',
                    dest: 'wasm'
                }
            ]
        })
    ],
    define: {
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
        APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
    },
    build: {
        sourcemap: true,
        commonjsOptions: {
            include: [/@tiptap/, /node_modules/]
        }
    },
    worker: {
        format: 'es'
    },
    esbuild: {
        pure: process.env.ENV === 'dev' ? [] : ['console.log', 'console.debug', 'console.error']
    },
    // HIER IST DER NEUE SSR-BLOCK
    ssr: {
        noExternal: [/^@tiptap\//, /^prosemirror-/]
    },
    optimizeDeps: {
        include: [
            '@tiptap/core',
            '@tiptap/pm',
            '@tiptap/starter-kit',
            'prosemirror-state',
            'prosemirror-transform',
            'prosemirror-model',
            'prosemirror-view'
        ]
    }
});
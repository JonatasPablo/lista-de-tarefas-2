import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { APP_NAME, APP_VERSION } from './src/config/app'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                id: '/lista-de-tarefas-2/',
                name: `${APP_NAME} v${APP_VERSION}`,
                short_name: 'Tarefas',
                description: `${APP_NAME} v${APP_VERSION} - Aplicativo para organizar tarefas, anexos e histórico de concluídas.`,
                theme_color: '#404040',
                background_color: '#d9d9d9',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/lista-de-tarefas-2/',
                start_url: '/lista-de-tarefas-2/#/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
    base: '/lista-de-tarefas-2/',
})
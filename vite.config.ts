import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { APP_NAME, APP_VERSION } from './src/config/app'

const escapeRegExp = (value: string) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = env.VITE_API_URL
    const apiUrlPattern = apiUrl
        ? new RegExp(`^${escapeRegExp(apiUrl.replace(/\/$/, ''))}/`)
        : /^$/

    return {
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.svg',
                'favicon.png',
                'apple-touch-icon.png',
            ],
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
                // Nunca cachear chamadas de API — garante que 401/redirect passam direto ao network
                runtimeCaching: [
                    {
                        urlPattern: apiUrlPattern,
                        handler: 'NetworkOnly',
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    base: '/lista-de-tarefas-2/',
    }
})

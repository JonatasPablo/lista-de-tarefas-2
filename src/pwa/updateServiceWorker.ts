import { registerSW } from 'virtual:pwa-register'

const SW_RELOAD_KEY = 'lista_tarefas_sw_reload_at'
const RELOAD_COOLDOWN_MS = 30_000

export const initServiceWorker = () => {
    if (!('serviceWorker' in navigator)) return

    registerSW({
        immediate: true,
        onNeedRefresh() {
            const lastStr = sessionStorage.getItem(SW_RELOAD_KEY)

            if (lastStr && Date.now() - Number(lastStr) < RELOAD_COOLDOWN_MS) {
                return
            }

            sessionStorage.setItem(SW_RELOAD_KEY, String(Date.now()))
            window.location.reload()
        },
    })
}

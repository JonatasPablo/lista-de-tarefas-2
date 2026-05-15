/**
 * Singleton de controle de sincronização.
 *
 * Garante que o polling automático nunca compete com operações manuais.
 * Usa contador de operações em vez de booleano para suportar operações
 * concorrentes sem liberar cedo demais.
 */

const COOLDOWN_ENTRE_REFRESHES_MS = 800
const BACKOFF_PADRAO_429_MS = 12000

const _estado = {
    contadorOperacoes: 0,
    refreshEmAndamento: false,
    ultimoRefresh: 0,
    backoffAte: 0,
}

export const sincronizacao = {
    pausar(): void {
        _estado.contadorOperacoes++
    },

    liberar(): void {
        _estado.contadorOperacoes = Math.max(0, _estado.contadorOperacoes - 1)
    },

    podeExecutarRefresh(): boolean {
        if (_estado.contadorOperacoes > 0) return false
        if (_estado.refreshEmAndamento) return false
        if (Date.now() < _estado.backoffAte) return false
        if (Date.now() - _estado.ultimoRefresh < COOLDOWN_ENTRE_REFRESHES_MS) return false
        return true
    },

    marcarInicioRefresh(): void {
        _estado.refreshEmAndamento = true
        _estado.ultimoRefresh = Date.now()
    },

    marcarFimRefresh(): void {
        _estado.refreshEmAndamento = false
    },

    aplicarBackoff(ms: number = BACKOFF_PADRAO_429_MS): void {
        _estado.backoffAte = Date.now() + ms
    },

    emOperacaoManual(): boolean {
        return _estado.contadorOperacoes > 0
    },
}

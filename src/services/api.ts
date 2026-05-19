const getApiUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL

    if (!apiUrl) {
        throw new Error(
            'VITE_API_URL não foi configurada. Crie o arquivo .env.local na raiz do frontend.'
        )
    }

    return apiUrl.replace(/\/$/, '')
}

export const API_URL = getApiUrl()

export const API_HEADERS = {
    'ngrok-skip-browser-warning': 'true',
}

export class ApiError extends Error {
    readonly status: number

    constructor(status: number, message: string) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
}

export const apiRequest = async <ResponseData>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<ResponseData> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...API_HEADERS,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store',
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
        let errorMessage = `Erro na requisição: ${response.status}`

        try {
            const data = await response.json()

            if (data?.message) {
                errorMessage = data.message
            }
        } catch {
            const text = await response.text().catch(() => '')

            if (text) {
                errorMessage = text
            }
        }

        throw new ApiError(response.status, errorMessage)
    }

    if (response.status === 204) {
        return null as ResponseData
    }

    return response.json()
}

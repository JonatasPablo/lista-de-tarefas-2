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

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
}

export const apiRequest = async <ResponseData>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<ResponseData> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
        const errorMessage = await response.text()

        throw new Error(
            errorMessage || `Erro na requisição: ${response.status}`
        )
    }

    if (response.status === 204) {
        return null as ResponseData
    }

    return response.json()
}
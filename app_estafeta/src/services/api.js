const API_URL = 'http://localhost:1338/api'

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    })

    if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
    }

    return response.json()
}

export async function getPedidos(estafetaId) {
    return request(`/pedido-missions?filters[estafeta][id][$eq]=${estafetaId}&populate=*`)
}

export async function getPedidoById(documentId) {
    return request(`/pedido-missions/${documentId}?populate=*`)
}

export async function updatePedidoEstado(documentId, estado) {
    return request(`/pedido-missions/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({
            data: {
                Estado: estado,
            },
        }),
    })
}

export async function updatePedido(documentId, data) {
    return request(`/pedido-missions/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({
            data,
        }),
    })
}

export function getEstafetaLogado() {
    const dados = localStorage.getItem('estafeta')
    return dados ? JSON.parse(dados) : null
}
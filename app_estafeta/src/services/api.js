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
    const result = await request(
        `/pedido-missions?populate[bilhete][populate]=cliente&populate[cliente]=*&populate[estafeta]=*&populate[estafeta2]=*`
    )

    result.data = result.data.filter((pedido) => {
        return (
            pedido.estafeta?.id === estafetaId ||
            pedido.estafeta2?.id === estafetaId
        )
    })

    return result
}

export async function getPedidoById(documentId) {
    return request(
        `/pedido-missions/${documentId}?populate[bilhete][populate]=cliente&populate[cliente]=*&populate[estafeta]=*&populate[estafeta2]=*`
    )
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
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

export async function getPedidos() {
    return request('/pedido-missions?populate=*')
}

export async function getPedidoById(id) {
    return request(`/pedido-missions/${id}?populate=*`)
}

export async function updatePedidoEstado(id, estado) {
    return request(`/pedido-missions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            data: {
                Estado: estado,
            },
        }),
    })
}
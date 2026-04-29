// Serviço para comunicar com a API do Strapi
const STRAPI_URL = 'http://localhost:1338';
const STRAPI_API_TOKEN = 'e5c8410d2d4b81559a226941df1112c58791d9ebfeaf62f90e3f1055e06b05bae371cf49690d3f832aa83e8c577292c95f2b1f2a917f85bd5fc5888c755dea11276758af6986d1e5323ec20a12a361a4898dff9f2337da80b1c9cda498e71b56c81917ef9a62821fcf49529819510110fd66a0cbf965822ef7f2493181ed373e';

// Headers padrão para todas as requisições
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`
};

/**
 * Criar um novo cliente no Strapi
 * @param {string} email - Email do cliente
 * @param {string} primeiroNome - Primeiro nome do cliente
 * @param {string} ultimoNome - Último nome do cliente
 * @returns {Promise<object>} - Dados do cliente criado
 */
export async function criarClienteStrapi(email, primeiroNome, ultimoNome) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/clientes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          Email: email,
          PrimeiroNome: primeiroNome,
          UltimoNome: ultimoNome
        }
      })
    });

    if (!response.ok) {
  const errorDetails = await response.json();
  console.error('Erro detalhado do Strapi:', JSON.stringify(errorDetails, null, 2));
  throw new Error(`Erro ${response.status}: ${errorDetails.error.message}`);
}

    const data = await response.json();
    console.log('Cliente criado no Strapi:', data);
    return data;
  } catch (error) {
    console.error('Erro na criação do cliente:', error);
    throw error;
  }
}

/**
 * Verificar se um cliente existe no Strapi pelo email
 * @param {string} email - Email do cliente a verificar
 * @returns {Promise<object|null>} - Dados do cliente ou null se não existir
 */
export async function verificarClienteStrapi(email) {
  try {
    // Usar filtros para procurar por email
    const response = await fetch(
      `${STRAPI_URL}/api/clientes?filters[Email][$eq]=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao verificar cliente no Strapi: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log('Cliente encontrado no Strapi:', data.data[0]);
      return data.data[0];
    }
    
    console.log('Cliente não encontrado no Strapi');
    return null;
  } catch (error) {
    console.error('Erro na verificação do cliente:', error);
    return null;
  }
}

/**
 * Obter todos os clientes do Strapi
 * @returns {Promise array>} - Lista de clientes
 */
export async function obterClientesStrapi() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/clientes`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter clientes do Strapi: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erro ao obter clientes:', error);
    throw error;
  }
}
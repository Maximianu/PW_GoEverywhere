# 🗺️ Implementação do Mapa com Leaflet - Back-office GoEverywhere

## 📋 Mudanças Implementadas

### ✅ MapView.vue Completo
O ficheiro `src/views/MapView.vue` foi completamente refatorado com:

- **Leaflet integrado** com tiles escuras (CartoDB Dark)
- **5 estafetas mock** com dados de localização (latitude/longitude)
- **Marcadores personalizados** com cores baseadas no estado:
  - 🟢 Verde: Disponível
  - 🔵 Azul: Ativo
  - ⚫ Cinzento: Offline
- **Popups interativos** ao clicar nos marcadores
- **Botão "Centralizar"** para ajustar o zoom aos marcadores
- **Card premium** com tema escuro lunar
- **Legendas** com estado dos estafetas
- **Estatísticas** em tempo real (Total, Disponíveis, Ativos, Offline)
- **Responsivo** em desktop, tablet e mobile

### 📦 Dependências Adicionadas
- `leaflet: ^1.9.4` - adicionado ao `package.json`

## 🚀 Como Instalar e Usar

### Passo 1: Instalar Leaflet
Execute um dos seguintes comandos no diretório `back-office`:

```bash
# Usando npm
npm install

# Ou apenas Leaflet
npm install leaflet
```

**Alternativa:** Clique duas vezes em `setup-leaflet.bat` (Windows)

### Passo 2: Testar o Mapa
1. Abra o back-office em desenvolvimento: `npm run dev`
2. Navegue para "Mapa" na sidebar
3. Verá o mapa com 5 estafetas distribuídos no Porto/Aveiro

### Passo 3: Personalizar (Opcional)

#### Adicionar Estafetas Reais
Edite `src/views/MapView.vue` e substitua o array `courierData`:

```javascript
const courierData = [
  {
    id: 'C-xxxxx',
    nome: 'Nome do Estafeta',
    estado: 'Disponível', // ou 'Ativo' ou 'Offline'
    latitude: 41.1599,
    longitude: -8.6291,
    performance: 85
  },
  // ... mais estafetas
]
```

#### Mudar Centro do Mapa
Na função `initMap()`, altere:
```javascript
map = L.map(mapContainer.value, {
  center: [41.5, -8.5],  // Latitude, Longitude
  zoom: 11
})
```

#### Integrar com API Real
Substitua o `courierData` por:
```javascript
onMounted(async () => {
  const response = await fetch('/api/couriers')
  const data = await response.json()
  // Mapear dados da API para o formato esperado
  setTimeout(initMap, 100)
})
```

## 🎨 Tema e Estilo

O mapa utiliza:
- **Tiles**: CartoDB Dark (escuras e elegantes)
- **Marcadores**: Gradientes suaves com brilho
- **Popups**: Tema lunar com bordas ciano
- **Controles**: Botões com cores primárias

Tudo integrado com o design do back-office!

## 📍 Funcionalidades

✅ Mapa interativo com zoom  
✅ Marcadores com states  
✅ Popups customizados  
✅ Centralizar automático  
✅ Legendas  
✅ Estatísticas  
✅ Tema escuro  
✅ Responsivo  

## ⚙️ Estrutura do Código

```
MapView.vue
├── Script
│   ├── Data: courierData (mock)
│   ├── Funções
│   │   ├── initMap() - Inicializar Leaflet
│   │   ├── getMarkerColor() - Cor por estado
│   │   ├── createCustomMarker() - Ícone customizado
│   │   ├── fitMarkers() - Ajustar bounds
│   │   └── centerMap() - Centralizar
│   └── onMounted() - Lifecycle
├── Template
│   ├── Header com título e botão
│   ├── Card com mapa
│   ├── Legendas
│   └── Estatísticas
└── Styles
    ├── Leaflet customizado
    ├── Popups escuros
    ├── Controles
    └── Marcadores
```

## 🔗 Ressources

- [Leaflet Documentation](https://leafletjs.com/)
- [CartoDB Tiles](https://carto.com/basemaps/)
- [OpenStreetMap](https://www.openstreetmap.org/)

## 📝 Notas

- Os dados dos estafetas são **mock temporários** para demonstração
- O sistema está pronto para integração com uma API real
- O mapa não interfere com outras funcionalidades do back-office
- O tema está 100% integrado ao design lunar

---

**Status**: ✅ Implementação Completa | 🚀 Pronto para Usar

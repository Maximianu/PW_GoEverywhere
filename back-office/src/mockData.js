import { reactive } from 'vue'

export const mockData = reactive({
  stats: {
    availableCouriers: 1284,
    totalOrders: 24850,
    avgDeliveryTime: '18.4h'
  },
  regionStats: [
    { name: 'Braga', count: '12.4k', percent: 50 },
    { name: 'Porto', count: '7.2k', percent: 30 },
    { name: 'Guimarães', count: '4.1k', percent: 15 },
    { name: 'Barcelos', count: '1.1k', percent: 5 }
  ],
  ordersStats: {
    total: 24,
    pending: 48,
    approvedToday: 12
  },
  orders: [
    { id: '1', client: 'Alice Johnson', email: 'alice.j@example.com', initials: 'AJ', destination: 'Braga', date: 'Set 24, 2026', status: 'Pendente' },
    { id: '2', client: 'Bob Smith', email: 'bob.s@company.net', initials: 'BS', destination: 'Porto', date: 'Jun 23, 2026', status: 'Pendente' },
    { id: '3', client: 'Charlie Brown', email: 'charlie@web.io', initials: 'CB', destination: 'Guimarães', date: 'Ago 2, 2026', status: 'Aprovado' },
    { id: '4', client: 'Diana Prince', email: 'diana.p@themyscira.com', initials: 'DP', destination: 'Barcelos', date: 'Abr 4, 2026', status: 'Pendente' }
  ],
  couriersStats: {
    total: 80,
    available: 24,
    active: 56
  },
  couriers: [
    { id: 'C-1024', name: 'Alex Johnson', initials: 'AJ', performance: 95, status: 'Disponível' },
    { id: 'C-1025', name: 'Maria Garcia', initials: 'MG', performance: 88, status: 'Disponível' },
    { id: 'C-1026', name: 'James Wilson', initials: 'JW', performance: 92, status: 'Disponível' },
    { id: 'C-1027', name: 'Sarah Chen', initials: 'SC', performance: 79, status: 'Disponível' }
  ]
})

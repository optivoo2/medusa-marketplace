import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}

export const Dashboard: React.FC = () => {
  const { vendor } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        axios.get('/api/vendor/products'),
        axios.get('/api/vendor/orders')
      ])

      const products = productsResponse.data.products || []
      const orders = ordersResponse.data.orders || []

      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + (order.total || 0)
      }, 0)

      const pendingOrders = orders.filter((order: any) => 
        order.status === 'pending' || order.status === 'processing'
      ).length

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  })

  const statCards = [
    {
      name: 'Total de animais',
      value: stats.totalProducts,
      icon: '📦',
      color: 'bg-blue-500'
    },
    {
      name: 'Total de solicitações',
      value: stats.totalOrders,
      icon: '📋',
      color: 'bg-green-500'
    },
    {
      name: 'Total arrecadado',
      value: currencyFormatter.format(stats.totalRevenue),
      icon: '💰',
      color: 'bg-yellow-500'
    },
    {
      name: 'Solicitações pendentes',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Visão geral</h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo de volta, {vendor?.name}! Veja como andam seus resgates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${card.color} rounded-md flex items-center justify-center text-white text-lg`}>
                    {card.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade recente</h3>
          <div className="text-gray-500">
            <p>Nenhuma atividade recente para exibir.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

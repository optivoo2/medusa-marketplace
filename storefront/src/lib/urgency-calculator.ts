export interface UrgencyInfo {
  daysLeft: number
  status: 'novo' | 'oportunidade' | 'urgente' | 'expirado'
  color: 'green' | 'yellow' | 'red' | 'gray'
  message: string
  badgeText: string
}

export function calculateUrgency(highlightUntil: string): UrgencyInfo {
  if (!highlightUntil) {
    return {
      daysLeft: 0,
      status: 'expirado',
      color: 'gray',
      message: 'Anúncio sem destaque',
      badgeText: 'Sem destaque'
    }
  }

  const now = new Date()
  const highlightDate = new Date(highlightUntil)
  const timeDiff = highlightDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysLeft <= 0) {
    return {
      daysLeft: 0,
      status: 'expirado',
      color: 'gray',
      message: 'Período de destaque expirado',
      badgeText: 'Sem destaque'
    }
  }

  if (daysLeft > 20) {
    return {
      daysLeft,
      status: 'novo',
      color: 'green',
      message: 'Novo pet para adoção!',
      badgeText: 'Novo'
    }
  }

  if (daysLeft > 10) {
    return {
      daysLeft,
      status: 'oportunidade',
      color: 'yellow',
      message: 'Oportunidade de adoção!',
      badgeText: 'Oportunidade'
    }
  }

  return {
    daysLeft,
    status: 'urgente',
    color: 'red',
    message: 'Urgente - Precisa de um lar!',
    badgeText: 'Urgente'
  }
}

export function getUrgencyStyles(color: 'green' | 'yellow' | 'red' | 'gray') {
  const styles = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200'
    }
  }

  return styles[color]
}

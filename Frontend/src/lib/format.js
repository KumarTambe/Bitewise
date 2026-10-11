const categoryStyles = {
    breakfast: { bg: 'bg-butter-soft', text: 'text-butter' },
    lunch: { bg: 'bg-leaf-soft', text: 'text-leaf' },
    dinner: { bg: 'bg-leaf-soft', text: 'text-leaf' },
    snacks: { bg: 'bg-tomato-soft', text: 'text-tomato-dark' },
    snack: { bg: 'bg-tomato-soft', text: 'text-tomato-dark' },
    beverages: { bg: 'bg-sky-soft', text: 'text-sky' },
    beverage: { bg: 'bg-sky-soft', text: 'text-sky' },
    desserts: { bg: 'bg-berry-soft', text: 'text-berry' },
    dessert: { bg: 'bg-berry-soft', text: 'text-berry' },
}

export function categoryStyle(category) {
    return categoryStyles[category?.toLowerCase()] || { bg: 'bg-cream', text: 'text-ink-soft' }
}

export function initials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '?'
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]
    for (const [unit, size] of units) {
        const n = Math.floor(seconds / size)
        if (n >= 1) return `${n} ${unit}${n > 1 ? 's' : ''} ago`
    }
    return 'just now'
}

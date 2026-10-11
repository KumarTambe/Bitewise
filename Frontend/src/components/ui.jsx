// Small shared presentational pieces used across pages.

import { categoryStyle, initials } from '../lib/format'

const avatarPalette = [
    'bg-tomato-soft text-tomato-dark',
    'bg-leaf-soft text-leaf',
    'bg-butter-soft text-butter',
    'bg-sky-soft text-sky',
    'bg-berry-soft text-berry',
]

export function Avatar({ name, size = 'h-9 w-9 text-xs' }) {
    let hash = 0
    for (const ch of name ?? '') hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return (
        <span className={`${size} ${avatarPalette[hash % avatarPalette.length]} shrink-0 rounded-full inline-flex items-center justify-center font-semibold`}>
            {initials(name)}
        </span>
    )
}

export function DishTile({ name, category, size = 'h-14 w-14 text-xl' }) {
    const style = categoryStyle(category)
    return (
        <span className={`${size} ${style.bg} ${style.text} shrink-0 rounded-2xl inline-flex items-center justify-center font-display font-semibold`}>
            {initials(name)}
        </span>
    )
}

export function Logo({ className = 'h-8 w-8' }) {
    return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#e4572e" />
            <mask id="bitewise-bite">
                <rect width="32" height="32" fill="#fff" />
                <circle cx="24" cy="9" r="5" fill="#000" />
                <circle cx="26.5" cy="14.5" r="3.2" fill="#000" />
            </mask>
            <circle cx="16" cy="16" r="9" fill="#fff6ee" mask="url(#bitewise-bite)" />
        </svg>
    )
}

export function ClockIcon({ className = 'h-3.5 w-3.5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

export function ChatIcon({ className = 'h-3.5 w-3.5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.84L3 20l1.4-3.72A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    )
}

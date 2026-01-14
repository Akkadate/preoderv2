'use client'

import dynamic from 'next/dynamic'

// Dynamic import for LocationView (Leaflet requires window)
const LocationViewMap = dynamic(
    () => import('@/components/LocationView').then(mod => ({ default: mod.LocationView })),
    { ssr: false, loading: () => <div className="h-[150px] bg-muted rounded-lg animate-pulse" /> }
)

interface LocationViewWrapperProps {
    location: { lat: number; lng: number }
    size?: number
}

export function LocationViewWrapper({ location, size = 150 }: LocationViewWrapperProps) {
    return <LocationViewMap location={location} size={size} />
}

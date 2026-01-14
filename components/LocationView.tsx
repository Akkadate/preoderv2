'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { Button } from '@/components/ui/button'
import { ExternalLink, MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

interface LocationViewProps {
    location: { lat: number; lng: number }
    size?: number
}

export function LocationView({ location, size = 200 }: LocationViewProps) {
    const [mapReady, setMapReady] = useState(false)

    useEffect(() => {
        setMapReady(true)
    }, [])

    const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`

    if (!mapReady) {
        return (
            <div
                className="bg-muted rounded-lg animate-pulse flex items-center justify-center"
                style={{ height: size }}
            >
                <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="rounded-lg overflow-hidden border" style={{ height: size }}>
                <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.lat, location.lng]} />
                </MapContainer>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                >
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        เปิดใน Google Maps
                    </a>
                </Button>
            </div>
        </div>
    )
}

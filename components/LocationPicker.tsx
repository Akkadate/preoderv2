'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2, Navigation } from 'lucide-react'
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

interface LocationPickerProps {
    value: { lat: number; lng: number } | null
    onChange: (location: { lat: number; lng: number } | null) => void
}

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

// Component to pan/zoom map when location changes
function MapController({ location }: { location: { lat: number; lng: number } | null }) {
    const map = useMap()

    useEffect(() => {
        if (location) {
            map.flyTo([location.lat, location.lng], 15, {
                duration: 1
            })
        }
    }, [location, map])

    return null
}

// Component to handle marker drag
function DraggableMarker({
    position,
    onDragEnd
}: {
    position: [number, number]
    onDragEnd: (lat: number, lng: number) => void
}) {
    const markerRef = useRef<L.Marker>(null)

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current
            if (marker) {
                const { lat, lng } = marker.getLatLng()
                onDragEnd(lat, lng)
            }
        },
    }

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    )
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
    const [isLocating, setIsLocating] = useState(false)
    const [mapReady, setMapReady] = useState(false)

    // Default center: Bangkok
    const defaultCenter: [number, number] = [13.7563, 100.5018]
    const position: [number, number] = value
        ? [value.lat, value.lng]
        : defaultCenter

    // Handle getting current location
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์ของคุณไม่รองรับ GPS')
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onChange({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                })
                setIsLocating(false)
            },
            (error) => {
                console.error('Geolocation error:', error)
                alert('ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง')
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleLocationSelect = (lat: number, lng: number) => {
        onChange({ lat, lng })
    }

    // Leaflet requires window, so we need to check if we're on client
    useEffect(() => {
        setMapReady(true)
    }, [])

    if (!mapReady) {
        return (
            <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="h-48 rounded-lg overflow-hidden border">
                <MapContainer
                    center={position}
                    zoom={value ? 15 : 10}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    <MapController location={value} />
                    {value && (
                        <DraggableMarker
                            position={[value.lat, value.lng]}
                            onDragEnd={handleLocationSelect}
                        />
                    )}
                </MapContainer>
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                >
                    {isLocating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังระบุตำแหน่ง...
                        </>
                    ) : (
                        <>
                            <Navigation className="mr-2 h-4 w-4" />
                            ใช้ตำแหน่งปัจจุบัน
                        </>
                    )}
                </Button>
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onChange(null)}
                        title="ล้างตำแหน่ง"
                    >
                        ✕
                    </Button>
                )}
            </div>

            {value && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    พิกัด: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                </p>
            )}
        </div>
    )
}

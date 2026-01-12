'use client'

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ZoomIn } from 'lucide-react'

interface ImageDialogProps {
    src: string
    alt: string
    className?: string
}

export function ImageDialog({ src, alt, className }: ImageDialogProps) {
    if (!src) return null

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={`cursor-pointer overflow-hidden relative group ${className}`}>
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                <DialogTitle className="sr-only">{alt}</DialogTitle>
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}


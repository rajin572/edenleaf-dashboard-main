import { useState } from "react"
import { X, ZoomIn } from "lucide-react"
import { Button } from "../button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "../tooltip"

export function ImagePreview({ src, alt, className = "", title = "" }: {
    src: string;
    alt: string;
    className?: string;
    title?: string;
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={`relative group cursor-pointer overflow-hidden rounded-lg ${className}`}
                        onClick={() => setIsOpen(true)}
                    >
                        <img
                            src={src}
                            alt={alt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-80 transition-opacity duration-300" size={32} />
                        </div>
                    </div>
                </TooltipTrigger>
                {
                    title && <TooltipContent>
                        <p>{title}</p>
                    </TooltipContent>
                }

            </Tooltip>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/20"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={24} />
                    </Button>

                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    )
}
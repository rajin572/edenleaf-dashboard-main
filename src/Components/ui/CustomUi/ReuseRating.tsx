import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
    value: number;
    setValue?: (value: number) => void;
    canChange?: boolean;
    maxRating?: number;
    size?: number;
    fillColor?: string;
    emptyColor?: string;
    hoverColor?: string;
    showValue?: boolean;
    allowHalf?: boolean;
    className?: string;
}

export default function ReuseRating({
    value,
    setValue,
    canChange = false,
    maxRating = 5,
    size = 24,
    fillColor = '#fbbf24',
    emptyColor = '#d1d5db',
    hoverColor = '#f59e0b',
    showValue = false,
    allowHalf = true,
    className = '',
}: RatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const handleClick = (rating: number) => {
        if (canChange && setValue) {
            setValue(rating);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        if (!canChange) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isHalf = x < rect.width / 2;

        if (allowHalf) {
            setHoverValue(isHalf ? index + 0.5 : index + 1);
        } else {
            setHoverValue(index + 1);
        }
    };

    const handleMouseLeave = () => {
        if (canChange) {
            setHoverValue(null);
        }
    };

    const displayValue = hoverValue !== null ? hoverValue : value;

    const getStarFill = (index: number) => {
        const starValue = index + 1;

        if (displayValue >= starValue) {
            return '100%';
        } else if (displayValue > index && displayValue < starValue) {
            const percentage = (displayValue - index) * 100;
            return `${percentage}%`;
        }
        return '0%';
    };

    const getStarColor = (index: number) => {
        if (hoverValue !== null && canChange) {
            return hoverValue > index ? hoverColor : emptyColor;
        }
        return value > index ? fillColor : emptyColor;
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex items-center gap-1">
                {Array.from({ length: maxRating }, (_, index) => (
                    <div
                        key={index}
                        className={`relative ${canChange ? 'cursor-pointer' : ''}`}
                        onMouseMove={(e) => handleMouseMove(e, index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => {
                            if (allowHalf) {
                                const rect = (event?.target as HTMLElement)?.getBoundingClientRect();
                                const x = (event as MouseEvent)?.clientX - rect?.left;
                                const isHalf = x < rect?.width / 2;
                                handleClick(isHalf ? index + 0.5 : index + 1);
                            } else {
                                handleClick(index + 1);
                            }
                        }}
                    >
                        {/* Background star (empty) */}
                        <Star
                            size={size}
                            fill={emptyColor}
                            stroke={emptyColor}
                            className="absolute"
                        />

                        {/* Foreground star (filled) with clip path */}
                        <div
                            style={{
                                clipPath: `inset(0 ${100 - parseFloat(getStarFill(index))}% 0 0)`,
                            }}
                        >
                            <Star
                                size={size}
                                fill={getStarColor(index)}
                                stroke={getStarColor(index)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {showValue && (
                <span className="text-sm font-medium text-gray-700 min-w-8">
                    ({displayValue.toFixed(1)})
                </span>
            )}
        </div>
    );
}
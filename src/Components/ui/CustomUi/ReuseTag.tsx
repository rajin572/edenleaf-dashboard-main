import { cn } from '@/lib/utils';
import React from 'react';
import { ComponentProps } from 'react';

type TagProps = {
    children: string | number;
    theme?: 'error' | 'warning' | 'success' | 'blue' | 'purple' | 'orange';
    className?: string; // Custom className
} & ComponentProps<'span'>;

const Tag: React.FC<TagProps> = ({ children, theme = 'blue', className, ...props }) => {
    // Define theme-specific styles
    const themeClasses: Record<string, string> = {
        error: 'bg-red-100 text-red-600',
        warning: 'bg-yellow-100 text-yellow-600',
        success: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-500',
    };

    // Combine theme styles with custom className
    const tagClasses = cn(
        'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full', // Default base styles
        themeClasses[theme], // Apply theme styles
        className // Apply custom class if passed
    );

    return (
        <span {...props} className={tagClasses}>
            {children}
        </span>
    );
};

export default Tag;

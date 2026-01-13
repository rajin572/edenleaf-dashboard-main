import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

export interface MultiSelectProps extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange" | "value"> {
    value?: string[];
    onChange: (value: string[]) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}

// Multi-select component
export const MultiSelect = ({
    value = [],
    onChange,
    options = [],
    placeholder = "Select items...",
    className = "",
    ...props
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    const toggleOption = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const removeOption = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    return (
        <div className="relative">
            <button
                type="button"
                className={`flex w-full items-center justify-between rounded-md border border-secondary-color bg-base-color/5 px-3 py-2 text-sm ${className}`}
                onClick={() => setIsOpen(!isOpen)}
                {...props}
            >
                <div className="flex flex-wrap gap-1 flex-1">
                    {selectedOptions.length === 0 ? (
                        <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        selectedOptions.map(opt => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs"
                            >
                                {opt.label}
                                <X
                                    className="size-3 cursor-pointer hover:text-destructive"
                                    onClick={(e) => removeOption(opt.value, e)}
                                />
                            </span>
                        ))
                    )}
                </div>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50 ml-2" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-secondary-color bg-background shadow-lg">
                        <div className="max-h-60 overflow-auto p-1">
                            {options.map(option => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className={`flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent ${isSelected ? "bg-accent/50" : ""
                                            }`}
                                        onClick={() => toggleOption(option.value)}
                                    >
                                        <div className={`flex size-4 items-center justify-center rounded border ${isSelected ? "border-primary bg-primary" : "border-input"
                                            }`}>
                                            {isSelected && <Check className="size-3 text-primary-foreground" />}
                                        </div>
                                        {option.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
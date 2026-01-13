import React, { ChangeEvent, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "../../input";
import { cn } from "@/lib/utils";

interface ReuseSearchInputProps {
    placeholder?: string;
    setSearch: (value: string) => void;
    setPage: (page: number) => void;
    debounceDelay?: number;
    className?: string;
    showIcon?: boolean;
    defaultValue?: string;
}

const ReuseSearchInput: React.FC<ReuseSearchInputProps> = ({
    placeholder = "Search...",
    setSearch,
    setPage,
    debounceDelay = 500,
    className = "",
    showIcon = true,
    defaultValue,
}) => {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSearch = useCallback(
        (value: string) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                setSearch(value);
            }, debounceDelay);
        },
        [setSearch, debounceDelay]
    );

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setPage(1);
        debouncedSearch(e.target.value);
    };

    return (
        <div className={cn(`relative`, className)}>
            {showIcon && (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            )}
            <Input
                type="text"
                placeholder={placeholder}
                defaultValue={defaultValue}
                onChange={handleSearch}
                className={`${showIcon ? 'pl-10 py-5' : ''} border-[#E5E5E5] bg-[#F5F5F5] outline-none! shadow-none! ring-0! text-base`}
            />
        </div>
    );
};

export default ReuseSearchInput;
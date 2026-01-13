import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../sheet";

interface ReusableSheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    side?: "right" | "left" | "top" | "bottom";
    width?: string;
}

function ReusableSheet({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    footer,
    side = "right",
    width = "sm:max-w-md",
}: ReusableSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}

            <SheetContent side={side} className={`${width} flex flex-col p-0`}>
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                    <SheetTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-color!">
                        {title}
                    </SheetTitle>
                    {description && (
                        <SheetDescription>{description}</SheetDescription>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {footer && (
                    <SheetFooter className="px-6 pb-6 pt-2 border-t border-border">
                        {footer}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default ReusableSheet;

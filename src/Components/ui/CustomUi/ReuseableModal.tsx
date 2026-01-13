import React from 'react';
import { Button } from "../button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../dialog";

interface ReusableModalProps {
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    maxWidth?: string;
    showCloseButton?: boolean;
    closeButtonText?: string;
}

function ReusableModal({
    trigger,
    title,
    description,
    children,
    footer,
    open,
    onOpenChange,
    maxWidth = "sm:max-w-[625px]",
    showCloseButton = false,
    closeButtonText = "Cancel",
}: ReusableModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className={maxWidth}>
                <DialogHeader>
                    <DialogTitle className='text-lg sm:text-xl lg:text-2xl font-bold'>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="py-4 px-1 max-h-[70vh] overflow-y-auto">{children}</div>

                {(footer || showCloseButton) && (
                    <DialogFooter>
                        {showCloseButton && (
                            <DialogClose asChild>
                                <Button variant="outline">{closeButtonText}</Button>
                            </DialogClose>
                        )}
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default ReusableModal;
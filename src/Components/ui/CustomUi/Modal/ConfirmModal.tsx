import {
    AlertTriangle,
    Ban,
    CheckCircle2,
    ShieldCheck,
    Trash2,
    UserCheck,
    UserX,
    XCircle,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../button";
import { FormTextarea } from "../ReuseForm/Form";
import ReusableModal from "../ReuseableModal";
import { confirmReasonSchema } from "@/schemas/confirmReason";

type ConfirmVariant = "danger" | "warning" | "success" | "info";

export type ConfirmIconPreset =
    | "delete"
    | "block"
    | "unblock"
    | "decline"
    | "accept"
    | "approve"
    | "cancel";

const iconPresets: Record<ConfirmIconPreset, (variant: ConfirmVariant) => React.ReactNode> = {
    delete: (v) => <Trash2 className={`size-7 ${iconColor(v)}`} />,
    block: (v) => <Ban className={`size-7 ${iconColor(v)}`} />,
    unblock: (v) => <ShieldCheck className={`size-7 ${iconColor(v)}`} />,
    decline: (v) => <XCircle className={`size-7 ${iconColor(v)}`} />,
    accept: (v) => <CheckCircle2 className={`size-7 ${iconColor(v)}`} />,
    approve: (v) => <UserCheck className={`size-7 ${iconColor(v)}`} />,
    cancel: (v) => <UserX className={`size-7 ${iconColor(v)}`} />,
};

function iconColor(variant: ConfirmVariant) {
    return {
        danger: "text-destructive",
        warning: "text-amber-500",
        success: "text-emerald-500",
        info: "text-primary",
    }[variant];
}

const variantConfig: Record<
    ConfirmVariant,
    { iconBg: string; confirmClass: string }
> = {
    danger: {
        iconBg: "bg-destructive/10",
        confirmClass: "bg-destructive hover:bg-destructive/90 text-white",
    },
    warning: {
        iconBg: "bg-amber-500/10",
        confirmClass: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    success: {
        iconBg: "bg-emerald-500/10",
        confirmClass: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
    info: {
        iconBg: "bg-primary/10",
        confirmClass: "",
    },
};

interface ConfirmModalProps<T> {
    open: boolean;
    onCancel: () => void;
    currentRecord: T | null;
    onConfirm: (record: T, reason?: string) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
    loading?: boolean;
    iconPreset?: ConfirmIconPreset;
    icon?: React.ReactNode;
    withReason?: boolean;
    reasonLabel?: string;
    reasonRequired?: boolean;
    warningText?: React.ReactNode;
}

function ConfirmModal<T>({
    open,
    onCancel,
    currentRecord,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
    iconPreset,
    icon,
    withReason = false,
    reasonLabel = "Reason",
    reasonRequired = true,
    warningText,
}: ConfirmModalProps<T>) {
    const config = variantConfig[variant];
    const resolvedIcon = icon ?? (iconPreset ? iconPresets[iconPreset](variant) : null);

    const schema = useMemo(
        () => confirmReasonSchema(reasonLabel, reasonRequired),
        [reasonLabel, reasonRequired]
    );

    const { control, handleSubmit, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { reason: "" },
    });

    const handleCancel = () => {
        reset();
        onCancel();
    };

    // Called by form submit (withReason mode)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFormSubmit = (values: any) => {
        onConfirm(currentRecord as T, values.reason);
        reset();
    };

    // Called directly (no reason mode)
    const handleDirectConfirm = () => {
        onConfirm(currentRecord as T);
    };

    return (
        <ReusableModal
            open={open}
            onOpenChange={(v) => !v && handleCancel()}
            title=""
            maxWidth="sm:max-w-sm md:max-w-lg "
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type={withReason ? "submit" : "button"}
                        form={withReason ? "confirm-reason-form" : undefined}
                        className={config.confirmClass}
                        onClick={withReason ? undefined : handleDirectConfirm}
                        disabled={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            {/* Title + description (with optional icon) */}
            {resolvedIcon ? (
                <div className="flex flex-col items-center gap-4 text-center -mt-4">
                    <div className={`p-4 rounded-full ${config.iconBg}`}>
                        {resolvedIcon}
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5">
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            )}

            {/* Warning banner */}
            {warningText && (
                <div className="mt-4 flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/5 p-3">
                    <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <div className="text-xs text-destructive space-y-0.5">{warningText}</div>
                </div>
            )}

            {/* Reason form */}
            {withReason && (
                <form
                    id="confirm-reason-form"
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="mt-4"
                >
                    <FormTextarea
                        control={control}
                        name="reason"
                        label={reasonLabel}
                    />
                </form>
            )}
        </ReusableModal>
    );
}

export default ConfirmModal;

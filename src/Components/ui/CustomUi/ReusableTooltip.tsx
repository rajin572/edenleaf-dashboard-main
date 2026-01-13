import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "../tooltip"

interface ReusableTooltipProps {
    children: React.ReactNode
    content: string | React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
    align?: "start" | "center" | "end"
    delayDuration?: number
}

export function ReusableTooltip({
    children,
    content,
    side = "top",
    align = "center",
    delayDuration = 200
}: ReusableTooltipProps) {
    return (
        <Tooltip delayDuration={delayDuration}>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent side={side} align={align}>
                {typeof content === 'string' ? <p>{content}</p> : content}
            </TooltipContent>
        </Tooltip>
    )
}
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { chartColors } from './ChartConfig';

export const ChartTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="rounded-lg border bg-background p-3 shadow-sm"
        style={{ 
          borderColor: chartColors.tooltipBorder,
        }}
      >
        <p className="mb-2 text-sm font-medium">{label}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

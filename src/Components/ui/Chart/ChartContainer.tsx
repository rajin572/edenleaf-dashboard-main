import { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
}

export const ChartContainer = ({
  children,
  height = 350,
  className,
}: ChartContainerProps) => {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as any}
      </ResponsiveContainer>
    </div>
  );
};

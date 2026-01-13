import { cn } from '@/lib/utils';


interface PageWraperProps {
    className?: string;
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

const PageWraper: React.FC<PageWraperProps> = ({ className, title, description, actions, children }) => {
    return (
        <section className={cn("space-y-5 min-h-screen p-10", className)}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className='text-2xl lg:text-3xl font-bold text-foreground'>{title}</h1>
                    {
                        description &&
                        <p className='text-xs lg:text-sm text-[#6A7282] mt-1'>{description}</p>
                    }
                </div>
                {actions && <div className="shrink-0">{actions}</div>}
            </div>
            {children}
        </section>
    );
};

export default PageWraper;

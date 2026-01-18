import { SidebarTrigger } from '../ui/sidebar';
import { useRef, useState } from 'react';
import { AlertTriangle, Bell, ClipboardCheck, CreditCard } from 'lucide-react';

// TODO: replace with real notifications API data once the endpoint exists.
const notifications = [
    {
        title: "New verification pending",
        body: "Owner verification document submitted for review.",
        time: "2 minutes ago",
        icon: ClipboardCheck,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    {
        title: "Dispute opened",
        body: "Booking #12345 — customer complaint filed.",
        time: "1 hour ago",
        icon: AlertTriangle,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
    },
    {
        title: "Payment failed",
        body: "Transaction #45785 requires attention.",
        time: "3 hours ago",
        icon: CreditCard,
        iconBg: "bg-red-100",
        iconColor: "text-red-500",
    },
];

const Topbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openNotif = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setNotifOpen(true);
    };
    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setNotifOpen(false), 150);
    };

    return (
        <div className="flex items-center justify-between w-full z-50 px-2">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
            </div>

            <div
                className="relative"
                onMouseEnter={openNotif}
                onMouseLeave={scheduleClose}
            >
                <button
                    type="button"
                    className="relative p-1 rounded-full bg-white border border-border shadow-sm hover:bg-muted transition-colors cursor-pointer"
                >
                    <Bell className="size-5 text-base-color" />
                    <span className="absolute -top-1.5 -right-2 size-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                        {notifications.length}
                    </span>
                </button>

                {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 sm:w-80 bg-popover text-popover-foreground rounded-md border border-border shadow-md z-50">
                        <div className="px-4 py-3">
                            <p className="font-bold text-base-color text-lg">Notifications</p>
                            <p className="text-xs text-secondbase-color">{notifications.length} unread</p>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="max-h-[30vh] overflow-y-auto">
                            {notifications.map((n, i) => {
                                const Icon = n.icon;
                                return (
                                    <div key={i} className="flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                                        <div className={`size-8 rounded-full ${n.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon className={`size-4 ${n.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-base-color leading-snug">{n.title}</p>
                                            <p className="text-xs text-secondbase-color mt-0.5 leading-snug">{n.body}</p>
                                            <p className="text-[10px] text-secondbase-color mt-1">{n.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topbar;

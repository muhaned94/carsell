"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Car, Users, LogOut, Star, Loader2, RefreshCw, BarChart2, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const [pendingCount, setPendingCount] = useState(0);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role !== 'admin') {
                alert("غير مصرح لك بدخول لوحة التحكم");
                router.push("/");
                return;
            }

            setIsAuthorized(true);

            // Fetch pending count
            const fetchPendingCount = async () => {
                const { count } = await supabase
                    .from("premium_requests")
                    .select("*", { count: 'exact', head: true })
                    .eq("status", "pending");
                setPendingCount(count || 0);
            };

            fetchPendingCount();

            // Realtime subscription
            const channel = supabase
                .channel('admin_notifications')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'premium_requests'
                    },
                    (payload) => {
                        console.log('Change received!', payload);
                        fetchPendingCount();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };
        const cleanup = checkAuth();

    }, [router]);

    if (isAuthorized === null) {
        return <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>;
    }

    const navItems = [
        { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
        { href: "/admin/requests", label: "طلبات التمييز", icon: Star, badge: pendingCount },
        { href: "/admin/reports", label: "التقارير", icon: BarChart2 },
        { href: "/admin/cars", label: "السيارات", icon: Car },
        { href: "/admin/users", label: "المشتركين", icon: Users },
        { href: "/admin/settings", label: "الإعدادات", icon: RefreshCw },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-30">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground p-1 rounded">Admin</span>
                </h2>
                <button onClick={() => setIsMobileOpen(true)} className="p-2 text-gray-600 dark:text-gray-300">
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div className={cn(
                "fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl",
                isMobileOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground p-1 rounded">Admin</span>
                        <span className="dark:text-white">لوحة التحكم</span>
                    </h2>
                    <button onClick={() => setIsMobileOpen(false)} className="text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                                <div className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                            isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <Link href="/">
                        <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut size={18} />
                            <span>تسجيل الخروج</span>
                        </Button>
                    </Link>
                </div>
            </div>


            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-l dark:border-gray-800 hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b dark:border-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground p-1 rounded">Admin</span>
                        <span className="dark:text-white">لوحة التحكم</span>
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                            isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <Link href="/">
                        <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut size={18} />
                            <span>تسجيل الخروج</span>
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Car, Users, LogOut, Star, Loader2, RefreshCw } from "lucide-react";
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

            // Fetch pending count only if authorized
            const { count } = await supabase
                .from("premium_requests")
                .select("*", { count: 'exact', head: true })
                .eq("status", "pending");
            setPendingCount(count || 0);
        };
        checkAuth();
    }, [router]);

    if (isAuthorized === null) {
        return <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>;
    }

    const navItems = [
        { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
        { href: "/admin/requests", label: "طلبات التمييز", icon: Star, badge: pendingCount },
        { href: "/admin/cars", label: "السيارات", icon: Car },
        { href: "/admin/users", label: "المشتركين", icon: Users },
        { href: "/admin/settings", label: "الإعدادات", icon: RefreshCw },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-l dark:border-gray-800 hidden md:flex flex-col">
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
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}

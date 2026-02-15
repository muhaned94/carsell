import { supabase } from "@/lib/supabase";
import { Car, CheckCircle, Users } from "lucide-react";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

async function getStats() {
    const { count: carsCount } = await supabase.from("cars").select("*", { count: 'exact', head: true });
    const { count: premiumCount } = await supabase.from("cars").select("*", { count: 'exact', head: true }).eq('is_premium', true);
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });

    // Fetch visitor stats using RPC
    const { data: visitorData } = await supabase.rpc('get_visitor_stats');
    const vStats = visitorData?.[0] || { current_online: 0, weekly_visits: 0, monthly_visits: 0 };

    // Fetch revenue chart data
    const { data: revenueData } = await supabase.rpc('get_financial_chart_data');

    return {
        cars: carsCount || 0,
        premium: premiumCount || 0,
        users: usersCount || 0,
        visitors: vStats,
        revenueData: revenueData || []
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8">ملخص الموقع</h1>

            {/* Top Cards (Main Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Cars */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                        <Car size={32} />
                    </div>
                    <div>
                        <p className="text-muted-foreground font-medium">إجمالي الإعلانات</p>
                        <h3 className="text-3xl font-bold">{stats.cars}</h3>
                    </div>
                </div>

                {/* Premium Cars */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <p className="text-muted-foreground font-medium">إعلانات مميزة</p>
                        <h3 className="text-3xl font-bold">{stats.premium}</h3>
                    </div>
                </div>

                {/* Users */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-muted-foreground font-medium">المشتركين</p>
                        <h3 className="text-3xl font-bold">{stats.users}</h3>
                    </div>
                </div>
            </div>

            {/* Middle Section: Charts */}
            <DashboardCharts revenueData={stats.revenueData} />

            {/* Bottom Section: Visitor Stats (Smaller) */}
            <div>
                <h3 className="text-lg font-bold mb-4 text-muted-foreground">نشاط الزوار</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Online */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">المتواجدون الآن</span>
                        </div>
                        <span className="text-xl font-bold text-green-700 dark:text-green-300">{stats.visitors.current_online}</span>
                    </div>

                    {/* Weekly Visits */}
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">زوار الأسبوع</span>
                        <span className="text-xl font-bold">{stats.visitors.weekly_visits}</span>
                    </div>

                    {/* Monthly Visits */}
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">زوار الشهر</span>
                        <span className="text-xl font-bold">{stats.visitors.monthly_visits}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

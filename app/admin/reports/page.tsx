"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { Loader2, TrendingUp, DollarSign, Car, Star, BarChart2 } from "lucide-react";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // 1. Fetch Car Stats (Premium vs Free)
            const { count: premiumCount } = await supabase.from("cars").select("*", { count: 'exact', head: true }).eq('is_premium', true);
            const { count: regularCount } = await supabase.from("cars").select("*", { count: 'exact', head: true }).eq('is_premium', false);

            // 2. Fetch Financial Stats (Approved premium requests)
            const { data: approvedRequests } = await supabase
                .from("premium_requests")
                .select("id")
                .eq("status", "approved");

            const totalRevenue = (approvedRequests?.length || 0) * 5000;

            // 3. Fetch Province Stats
            const { data: provinceData } = await supabase.rpc('get_province_stats'); // I should create this helper or use count

            setData({
                cars: [
                    { name: "مميزة", value: premiumCount || 0 },
                    { name: "عادية", value: regularCount || 0 }
                ],
                totalRevenue,
                premiumCount: premiumCount || 0,
                regularCount: regularCount || 0,
                totalRequests: (approvedRequests?.length || 0)
            });
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    const COLORS = ['#fab005', '#228be6'];

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-3xl font-bold dark:text-white">التقارير والإحصائيات</h1>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">إجمالي الإيرادات</p>
                            <h3 className="text-2xl font-bold dark:text-white">{new Intl.NumberFormat("ar-IQ").format(data.totalRevenue)} د.ع</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">طلبات التمييز المقبولة</p>
                            <h3 className="text-2xl font-bold dark:text-white">{data.totalRequests} طلب</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                            <Car size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">إجمالي السيارات</p>
                            <h3 className="text-2xl font-bold dark:text-white">{data.premiumCount + data.regularCount} سيارة</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Car Distribution Chart */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                        <TrendingUp size={20} className="text-primary" />
                        توزيع الإعلانات
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.cars}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.cars.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {data.cars.map((entry: any, index: number) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                <span className="text-sm dark:text-gray-300">{entry.name}: {entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growth Info or Placeholder */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border dark:border-gray-800 shadow-sm flex flex-col justify-center items-center text-center">
                    <BarChart2 size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold mb-2">مزيد من البيانات قريباً</h3>
                    <p className="text-muted-foreground">سيتم إضافة رسوم بيانية تفصيلية حسب المحافظات والشهور فور توفر بيانات كافية.</p>
                </div>
            </div>
        </div>
    );
}

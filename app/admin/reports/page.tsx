"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { Loader2, DollarSign, Car, Users } from "lucide-react";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchReports();

        // Realtime Subscriptions
        const channels = [
            // Listen for new processed payments
            supabase.channel('public:premium_requests')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'premium_requests' },
                    () => fetchReports()
                )
                .subscribe(),

            // Listen for new cars (Ads)
            supabase.channel('public:cars')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'cars' },
                    () => fetchReports()
                )
                .subscribe(),

            // Listen for new users (Subscribers)
            supabase.channel('public:profiles')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'profiles' },
                    () => fetchReports()
                )
                .subscribe()
        ];

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel));
        };
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // 1. Fetch Financial Data (Approved Requests)
            const { data: approvedRequests } = await supabase
                .from("premium_requests")
                .select("created_at")
                .eq("status", "approved");

            // 2. Fetch Growth Data
            const { data: carsData } = await supabase.from("cars").select("created_at");
            const { data: usersData } = await supabase.from("profiles").select("created_at");

            // --- Process Financials ---
            const now = new Date();

            const getStartOfDay = (d: Date) => {
                const date = new Date(d);
                date.setHours(0, 0, 0, 0);
                return date;
            };

            const getStartOfWeek = (d: Date) => {
                const date = new Date(d);
                const day = date.getDay(); // 0 (Sun) to 6 (Sat)
                // Assuming week starts on Sunday
                const diff = date.getDate() - day;
                date.setDate(diff);
                date.setHours(0, 0, 0, 0);
                return date;
            };

            const getStartOfMonth = (d: Date) => {
                const date = new Date(d);
                date.setDate(1);
                date.setHours(0, 0, 0, 0);
                return date;
            };

            const startToday = getStartOfDay(now);
            const startThisWeek = getStartOfWeek(now);
            const startThisMonth = getStartOfMonth(now);

            const dailyRevenue = approvedRequests?.filter(r => new Date(r.created_at) >= startToday).length || 0;
            const weeklyRevenue = approvedRequests?.filter(r => new Date(r.created_at) >= startThisWeek).length || 0;
            const monthlyRevenue = approvedRequests?.filter(r => new Date(r.created_at) >= startThisMonth).length || 0;

            const PRICE_PER_REQUEST = 5000;

            // --- Process Growth Charts (Last 30 Days) ---
            const last30Days = Array.from({ length: 30 }, (_, i) => {
                const date = new Date(now);
                date.setDate(date.getDate() - (29 - i));

                // Format MM/DD
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const formattedDate = `${month}/${day}`;

                const endOfDate = new Date(date);
                endOfDate.setHours(23, 59, 59, 999);

                return {
                    date: formattedDate,
                    endOfDateIso: endOfDate.toISOString(),
                    cars: 0,
                    users: 0
                };
            });

            // Cumulative Counts
            const chartData = last30Days.map(day => {
                // Count items created ON or BEFORE this day
                const carsCount = carsData?.filter(c => new Date(c.created_at) <= new Date(day.endOfDateIso)).length || 0;
                const usersCount = usersData?.filter(u => new Date(u.created_at) <= new Date(day.endOfDateIso)).length || 0;

                return {
                    name: day.date,
                    cars: carsCount,
                    users: usersCount
                };
            });

            setData({
                financials: {
                    daily: dailyRevenue * PRICE_PER_REQUEST,
                    weekly: weeklyRevenue * PRICE_PER_REQUEST,
                    monthly: monthlyRevenue * PRICE_PER_REQUEST,
                },
                charts: chartData
            });

        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto space-y-8 pb-12">
            <h1 className="text-3xl font-bold dark:text-white">التقارير والإحصائيات</h1>

            {/* Financial Overview */}
            <h2 className="text-xl font-semibold dark:text-gray-200 flex items-center gap-2">
                <DollarSign className="text-green-500" />
                التقارير المالية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <p className="text-sm text-muted-foreground font-medium mb-2">إيرادات اليوم</p>
                    <h3 className="text-3xl font-bold dark:text-white text-green-600">
                        {new Intl.NumberFormat("ar-IQ").format(data.financials.daily)} <span className="text-lg text-gray-500">د.ع</span>
                    </h3>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <p className="text-sm text-muted-foreground font-medium mb-2">إيرادات هذا الأسبوع</p>
                    <h3 className="text-3xl font-bold dark:text-white text-blue-600">
                        {new Intl.NumberFormat("ar-IQ").format(data.financials.weekly)} <span className="text-lg text-gray-500">د.ع</span>
                    </h3>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <p className="text-sm text-muted-foreground font-medium mb-2">إيرادات هذا الشهر</p>
                    <h3 className="text-3xl font-bold dark:text-white text-purple-600">
                        {new Intl.NumberFormat("ar-IQ").format(data.financials.monthly)} <span className="text-lg text-gray-500">د.ع</span>
                    </h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* Ads Growth Chart */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                        <Car size={20} className="text-blue-500" />
                        ازدياد عدد الإعلانات
                    </h3>
                    <div className="h-[300px] w-full dir-ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.charts}>
                                <defs>
                                    <linearGradient id="colorCars" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="cars" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCars)" name="الإعلانات" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subscribers Growth Chart */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                        <Users size={20} className="text-green-500" />
                        ازدياد عدد المشتركين
                    </h3>
                    <div className="h-[300px] w-full dir-ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.charts}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="users" stroke="#22c55e" fillOpacity={1} fill="url(#colorUsers)" name="المشتركين" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

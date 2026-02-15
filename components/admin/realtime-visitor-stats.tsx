"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface VisitorStats {
    current_online: number;
    weekly_visits: number;
    monthly_visits: number;
}

interface RealtimeVisitorStatsProps {
    initialStats: VisitorStats;
}

export function RealtimeVisitorStats({ initialStats }: RealtimeVisitorStatsProps) {
    const [stats, setStats] = useState<VisitorStats>(initialStats);

    useEffect(() => {
        const fetchStats = async () => {
            const { data: visitorData } = await supabase.rpc('get_visitor_stats');
            if (visitorData && visitorData[0]) {
                setStats(visitorData[0]);
            }
        };

        // Realtime subscription
        const channel = supabase
            .channel('admin_visitors')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'page_views'
                },
                (payload) => {
                    console.log('New visit!', payload);
                    fetchStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Online */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">المتواجدون الآن</span>
                </div>
                <span className="text-xl font-bold text-green-700 dark:text-green-300">{stats.current_online}</span>
            </div>

            {/* Weekly Visits */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">زوار الأسبوع</span>
                <span className="text-xl font-bold">{stats.weekly_visits}</span>
            </div>

            {/* Monthly Visits */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">زوار الشهر</span>
                <span className="text-xl font-bold">{stats.monthly_visits}</span>
            </div>
        </div>
    );
}

import { supabase } from "@/lib/supabase";
import { Car, CheckCircle, Users } from "lucide-react";

async function getStats() {
    const { count: carsCount } = await supabase.from("cars").select("*", { count: 'exact', head: true });
    const { count: premiumCount } = await supabase.from("cars").select("*", { count: 'exact', head: true }).eq('is_premium', true);
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });

    return {
        cars: carsCount || 0,
        premium: premiumCount || 0,
        users: usersCount || 0,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">ملخص الموقع</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Cars */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
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
        </div>
    );
}

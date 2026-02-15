"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminCarActions from "@/components/admin-car-actions";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Search, Filter, ArrowUpDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminCarsPage() {
    const [cars, setCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const fetchCars = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("cars")
            .select("*, profiles(full_name, phone)")
            .order("created_at", { ascending: sortBy === "oldest" });
        setCars(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchCars();
    }, [sortBy]);

    const filteredCars = cars.filter(car => {
        const matchesSearch =
            (car.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (car.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "premium" && car.is_premium) ||
            (statusFilter === "normal" && !car.is_premium);
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">إدارة الإعلانات</h1>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="بحث بالسيارة أو البائع..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-10 pr-10 pl-4 rounded-md border text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="premium">إعلانات مميزة</option>
                        <option value="normal">إعلانات عادية</option>
                    </select>
                </div>
                <div className="relative">
                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full h-10 pr-10 pl-4 rounded-md border text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="newest">الأحدث أولاً</option>
                        <option value="oldest">الأقدم أولاً</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium">السيارة</th>
                                <th className="px-6 py-4 font-medium">السعر</th>
                                <th className="px-6 py-4 font-medium">البائع</th>
                                <th className="px-6 py-4 font-medium">واتساب</th>
                                <th className="px-6 py-4 font-medium">الحالة</th>
                                <th className="px-6 py-4 font-medium">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCars.map((car: any) => (
                                <tr key={car.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border">
                                                <Image
                                                    src={car.images?.[0] || "/placeholder-car.jpg"}
                                                    alt={car.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <Link href={`/cars/${car.id}`} target="_blank" className="font-medium hover:underline flex items-center gap-1">
                                                    {car.title}
                                                    <ExternalLink size={12} className="text-gray-400" />
                                                </Link>
                                                <p className="text-xs text-muted-foreground">{new Date(car.created_at).toLocaleDateString("ar-IQ")}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {new Intl.NumberFormat("ar-IQ").format(car.price)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{car.profiles?.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{car.governorate}</p>
                                    </td>
                                    <td className="px-6 py-4 font-mono dir-ltr text-right">
                                        {car.profiles?.phone}
                                    </td>
                                    <td className="px-6 py-4">
                                        {car.is_premium ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                ميز
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                عادي
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <AdminCarActions
                                            carId={car.id}
                                            isPremium={car.is_premium}
                                            onActionComplete={fetchCars}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {filteredCars.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        لا توجد سيارات مطابقة للبحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [governorate, setGovernorate] = useState("");

    const handleSearch = () => {
        let url = '/cars/search';
        const params = new URLSearchParams();
        if (query) params.append('brand', query);
        if (governorate) params.append('governorate', governorate);
        if (params.toString()) url += `?${params.toString()}`;
        router.push(url);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 max-w-4xl w-full">
            <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 border border-gray-100">
                <MapPin className="text-gray-400 ml-2" size={20} />
                <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="bg-transparent h-12 w-full text-gray-900 outline-none appearance-none"
                >
                    <option value="">جميع المحافظات</option>
                    <option value="بغداد">بغداد</option>
                    <option value="البصرة">البصرة</option>
                    <option value="نينوى">نينوى</option>
                    <option value="أربيل">أربيل</option>
                    <option value="النجف">النجف</option>
                    <option value="كربلاء">كربلاء</option>
                    <option value="كركوك">كركوك</option>
                    <option value="الأنبار">الأنبار</option>
                    <option value="ديالى">ديالى</option>
                    <option value="المثنى">المثنى</option>
                    <option value="القادسية">القادسية</option>
                    <option value="ميسان">ميسان</option>
                    <option value="ذي قار">ذي قار</option>
                    <option value="صلاح الدين">صلاح الدين</option>
                    <option value="دهوك">دهوك</option>
                    <option value="السليمانية">السليمانية</option>
                    <option value="بابل">بابل</option>
                    <option value="واسط">واسط</option>
                </select>
            </div>
            <div className="w-px h-8 bg-gray-200 my-auto hidden md:block"></div>
            <div className="flex-1 relative bg-gray-50 rounded-lg px-3 border border-gray-100 flex items-center">
                <Search className="text-gray-400 ml-2" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن نوع السيارة..."
                    className="bg-transparent w-full h-12 text-gray-900 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <Button
                size="lg"
                className="w-full md:w-auto h-12 text-lg px-8"
                onClick={handleSearch}
            >
                بحث
            </Button>
        </div>
    );
}

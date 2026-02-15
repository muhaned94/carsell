"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export default function FilterSidebar({ className }: { className?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters
    const [filters, setFilters] = useState({
        governorate: searchParams.get("governorate") || "",
        brand: searchParams.get("brand") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        minYear: searchParams.get("minYear") || "",
        maxYear: searchParams.get("maxYear") || "",
        transmission: searchParams.get("transmission") || "",
        fuel_type: searchParams.get("fuel_type") || "",
    });

    // Debounce function to avoid too many URL updates
    const useDebouncedEffect = (effect: Function, deps: any[], delay: number) => {
        useEffect(() => {
            const handler = setTimeout(() => effect(), delay);
            return () => clearTimeout(handler);
        }, [...deps || [], delay]);
    };

    const updateUrl = useCallback(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        // Use replace to prevent history stack buildup
        router.replace(`/cars/search?${params.toString()}`, { scroll: false });
    }, [filters, router]);

    // Apply filters automatically when state changes (with debounce)
    useDebouncedEffect(updateUrl, [filters], 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({
            governorate: "",
            brand: "",
            minPrice: "",
            maxPrice: "",
            minYear: "",
            maxYear: "",
            transmission: "",
            fuel_type: "",
        });
        router.replace("/cars/search");
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">تصفية النتائج</h3>
                {(searchParams.toString().length > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 h-8 px-2">
                        <X size={16} className="ml-1" />
                        مسح
                    </Button>
                )}
            </div>

            {/* Governorate */}
            <div className="space-y-2">
                <label className="text-sm font-medium">المحافظة</label>
                <select
                    name="governorate"
                    value={filters.governorate}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                    <option value="">الكل</option>
                    <option value="بغداد">بغداد</option>
                    <option value="أربيل">أربيل</option>
                    <option value="البصرة">البصرة</option>
                    <option value="النجف">النجف</option>
                    <option value="كربلاء">كربلاء</option>
                    <option value="نينوى">نينوى</option>
                    <option value="السليمانية">السليمانية</option>
                    <option value="دهوك">دهوك</option>
                    <option value="كركوك">كركوك</option>
                    <option value="الأنبار">الأنبار</option>
                    <option value="بابل">بابل</option>
                    <option value="ديالى">ديالى</option>
                    <option value="ميسان">ميسان</option>
                    <option value="المثنى">المثنى</option>
                    <option value="القادسية">الديوانية (القادسية)</option>
                    <option value="صلاح الدين">صلاح الدين</option>
                    <option value="واسط">واسط</option>
                    <option value="ذي قار">ذي قار</option>
                </select>
            </div>

            {/* Brand */}
            <div className="space-y-2">
                <label className="text-sm font-medium">نوع السيارة</label>
                <input
                    type="text"
                    name="brand"
                    value={filters.brand}
                    onChange={handleChange}
                    placeholder="مثال: تويوتا، هيونداي..."
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
                <label className="text-sm font-medium">السعر (د.ع)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleChange}
                        placeholder="من"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleChange}
                        placeholder="إلى"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    />
                </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
                <label className="text-sm font-medium">سنة الصنع</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        name="minYear"
                        value={filters.minYear}
                        onChange={handleChange}
                        placeholder="من"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    />
                    <input
                        type="number"
                        name="maxYear"
                        value={filters.maxYear}
                        onChange={handleChange}
                        placeholder="إلى"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    />
                </div>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
                <label className="text-sm font-medium">نوع القير</label>
                <select
                    name="transmission"
                    value={filters.transmission}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                    <option value="">الكل</option>
                    <option value="automatic">أوتوماتيك</option>
                    <option value="manual">عادي</option>
                </select>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
                <label className="text-sm font-medium">نوع الوقود</label>
                <select
                    name="fuel_type"
                    value={filters.fuel_type}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                    <option value="">الكل</option>
                    <option value="petrol">بانزين</option>
                    <option value="diesel">ديزل</option>
                    <option value="hybrid">هايبرد</option>
                    <option value="electric">كهربائي</option>
                </select>
            </div>
        </div>
    );
}

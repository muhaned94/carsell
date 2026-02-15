import { Suspense } from "react";
import FilterSidebar from "@/components/filter-sidebar";
import { CarCard, Car } from "@/components/car-card";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// Helper function to build Supabase query
async function getCars(searchParams: { [key: string]: string | string[] | undefined }) {
    let query = supabase.from("cars").select("*, profiles(phone)");

    // Filter by Governorate
    if (searchParams.governorate) {
        query = query.eq("governorate", searchParams.governorate);
    } else if (searchParams.gov) { // Support legacy 'gov' param
        query = query.eq("governorate", searchParams.gov);
    }

    // Filter by Brand or Search Query (partial match)
    const searchTerm = searchParams.brand || searchParams.q;
    if (searchTerm) {
        // Search in both brand and title
        query = query.or(`brand.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
    }

    // Filter by Premium (if needed)
    if (searchParams.premium === "true") {
        query = query.eq("is_premium", true);
    }

    // Filter by Price Range
    if (searchParams.minPrice) {
        query = query.gte("price", searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
        query = query.lte("price", searchParams.maxPrice);
    }

    // Filter by Year Range
    if (searchParams.minYear) {
        query = query.gte("year", searchParams.minYear);
    }
    if (searchParams.maxYear) {
        query = query.lte("year", searchParams.maxYear);
    }

    // Filter by Transmission
    if (searchParams.transmission) {
        query = query.eq("transmission", searchParams.transmission);
    }

    // Filter by Fuel Type
    if (searchParams.fuel_type) {
        query = query.eq("fuel_type", searchParams.fuel_type);
    }

    // Sorting (default to newest first)
    // Can add sort param later
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching cars:", error);
        return [];
    }

    return data as Car[] || [];
}

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage(props: SearchPageProps) {
    const searchParams = await props.searchParams;
    const cars = await getCars(searchParams);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">تصفح السيارات المعروضة للبيع</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 bg-white p-4 rounded-xl border h-fit shadow-sm">
                    <Suspense fallback={<div>جاري التحميل...</div>}>
                        <FilterSidebar />
                    </Suspense>
                </aside>

                {/* Results Grid */}
                <div className="flex-1">
                    {cars.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed">
                            <p className="text-xl text-muted-foreground mb-4">لا توجد سيارات مطابقة لبحثك</p>
                            <p className="text-sm text-gray-400">حاول تغيير خيارات البحث أو تقليل الفلاتر</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cars.map((car) => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CarCard, Car } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface RealtimeCarsProps {
    initialCars: Car[];
    isPremium?: boolean;
    limit?: number;
    viewAllLink?: string;
}

export function RealtimeCars({ initialCars, isPremium, limit = 6, viewAllLink }: RealtimeCarsProps) {
    const [cars, setCars] = useState<Car[]>(initialCars);

    useEffect(() => {
        setCars(initialCars);
    }, [initialCars]);

    useEffect(() => {
        const fetchCars = async () => {
            let query = supabase
                .from("cars")
                .select("*, profiles(phone)")
                .order("created_at", { ascending: false })
                .limit(limit);

            if (isPremium) {
                query = query.eq("is_premium", true);
            }

            const { data } = await query;
            if (data) setCars(data as unknown as Car[]);
        };

        const channel = supabase.channel('realtime_cars_home')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cars' },
                () => {
                    fetchCars();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isPremium, limit]);

    if (cars.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg">
                لا توجد سيارات {isPremium ? "مميزة" : "مضافة"} حالياً
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>

            {viewAllLink && (
                <div className="text-center mt-12">
                    <Button asChild variant="outline" size="lg" className="group">
                        <Link href={viewAllLink}>
                            عرض المزيد
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        </Link>
                    </Button>
                </div>
            )}
        </>
    );
}

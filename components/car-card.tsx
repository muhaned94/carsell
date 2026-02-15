"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Gauge, Fuel, Calendar, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";

export interface Car {
    id: string;
    title: string;
    price: number;
    currency?: string;
    governorate: string;
    brand: string;
    year: number;
    transmission: string;
    fuel_type: string;
    images: string[];
    is_premium?: boolean;
    created_at?: string;
    profiles?: {
        phone: string;
    };
}

export function CarCard({ car }: { car: Car }) {
    const prices = formatPrice(car.price, car.currency || 'IQD');

    const getWhatsappLink = (phone?: string, title?: string) => {
        if (!phone) return "#";
        const cleanPhone = phone.replace(/\D/g, "");
        const finalPhone = cleanPhone.startsWith("964") ? cleanPhone : `964${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}`;
        return `https://wa.me/${finalPhone}?text=${encodeURIComponent(`مرحباً، استفسر عن سيارتك: ${title}`)}`;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col relative">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                    src={car.images?.[0] || "/placeholder-car.jpg"}
                    alt={car.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {car.is_premium && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-10">
                        <Star size={10} fill="currentColor" /> مميز
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {car.title}
                    </h3>
                </div>

                {/* Price Display */}
                <div className="mt-auto pt-3 border-t dark:border-gray-800 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-lg text-primary">{prices.primary}</span>
                        <span className="text-xs text-muted-foreground">{prices.secondary}</span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-muted-foreground text-[11px] mb-4">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="truncate">{car.governorate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{car.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Gauge size={12} className="text-gray-400" />
                        <span>{car.transmission === 'automatic' ? 'أوتوماتيك' : 'عادي'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Fuel size={12} className="text-gray-400" />
                        <span>{car.fuel_type === 'petrol' ? 'بانزين' : car.fuel_type}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link href={`/cars/${car.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs h-9">
                            التفاصيل
                        </Button>
                    </Link>
                    <a
                        href={getWhatsappLink(car.profiles?.phone, car.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                    >
                        <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-900/30 dark:hover:bg-green-900/20">
                            <MessageCircle size={18} />
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}

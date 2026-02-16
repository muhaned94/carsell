"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import {
    MapPin, Calendar, Gauge, Fuel, Phone, MessageCircle, ArrowRight, Loader2, User as UserIcon, X
} from "lucide-react";

export default function CarDetailsPage({ params }: { params: any }) {
    const [car, setCar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (car?.images && selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % car.images.length);
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (car?.images && selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + car.images.length) % car.images.length);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "Escape") setSelectedIndex(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, car?.images]);

    useEffect(() => {
        const fetchCar = async () => {
            const resolvedParams = await params;
            const { data, error } = await supabase
                .from("cars")
                .select("*, profiles(full_name, phone, created_at)")
                .eq("id", resolvedParams.id)
                .single();

            if (error || !data) {
                setCar(null);
            } else {
                setCar(data);
            }
            setLoading(false);
        };
        fetchCar();
    }, [params]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!car) {
        notFound();
        return null; // unreachable but for TS
    }

    const prices = formatPrice(car.price, car.currency || 'IQD');

    const cleanPhone = car.profiles?.phone?.replace(/\D/g, "");
    const finalPhone = cleanPhone?.startsWith("964") ? cleanPhone : `964${cleanPhone?.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}`;
    const whatsappLink = `https://wa.me/${finalPhone}?text=${encodeURIComponent(`مرحباً، استفسر بخصوص سيارتك: ${car.title}`)}`;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/cars/search" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                    <ArrowRight size={16} className="ml-1" />
                    العودة للبحث
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border dark:border-gray-800">
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 cursor-pointer" onClick={() => setSelectedIndex(0)}>
                            <Image
                                src={car.images?.[0] || "/placeholder-car.jpg"}
                                alt={car.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {car.images && car.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 p-2">
                                {car.images.slice(1).map((img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-video rounded-md overflow-hidden border dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setSelectedIndex(idx + 1)}
                                    >
                                        <Image src={img} alt={`${car.title} - ${idx + 2}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800">
                        <h2 className="text-xl font-bold mb-4">تفاصيل السيارة</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {car.description || "لا يوجد وصف إضافي."}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm">
                        <h1 className="text-2xl font-bold mb-2">{car.title}</h1>
                        <p className="text-sm text-muted-foreground mb-4 flex items-center">
                            <MapPin size={14} className="ml-1" />
                            {car.governorate}
                        </p>

                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-primary">{prices.primary}</span>
                            <span className="text-lg text-muted-foreground">{prices.secondary}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                            {[
                                { icon: Calendar, label: "السنة", value: car.year },
                                { icon: Gauge, label: "القير", value: car.transmission === 'automatic' ? 'أوتوماتيك' : 'عادي' },
                                { icon: Fuel, label: "الوقود", value: car.fuel_type === 'petrol' ? 'بانزين' : car.fuel_type },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                                        <item.icon size={12} /> {item.label}
                                    </span>
                                    <span className="font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                                    <MessageCircle size={18} /> تواصل عبر واتساب
                                </Button>
                            </a>
                            <a href={`tel:${finalPhone}`} className="w-full">
                                <Button variant="outline" className="w-full gap-2">
                                    <Phone size={18} /> {car.profiles?.phone || "رقمه مخفي"}
                                </Button>
                            </a>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800">
                        <h3 className="font-bold mb-4">معلومات البائع</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                                {car.profiles?.full_name?.charAt(0) || <UserIcon />}
                            </div>
                            <div>
                                <p className="font-semibold">{car.profiles?.full_name || "مستخدم"}</p>
                                <p className="text-xs text-muted-foreground">عضو منذ {new Date(car.profiles?.created_at || new Date()).toLocaleDateString('ar-IQ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Image Modal */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center transition-all overflow-hidden"
                    onClick={() => setSelectedIndex(null)}
                    onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                        if (!touchStart) return;
                        const touchEnd = e.changedTouches[0].clientX;
                        const diff = touchStart - touchEnd;
                        if (diff > 50) handleNext(); // Swipe left -> Next
                        if (diff < -50) handlePrev(); // Swipe right -> Prev
                        setTouchStart(null);
                    }}
                >
                    <button
                        className="absolute top-6 right-6 text-white hover:scale-110 transition-transform z-[110] bg-black/20 p-2 rounded-full"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <X size={32} />
                    </button>

                    {/* Navigation Buttons */}
                    {car.images && car.images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 md:left-10 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-[110]"
                                onClick={handlePrev}
                            >
                                <ArrowRight className="rotate-180" size={32} />
                            </button>
                            <button
                                className="absolute right-4 md:right-10 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-[110]"
                                onClick={handleNext}
                            >
                                <ArrowRight size={32} />
                            </button>
                        </>
                    )}

                    <div className="relative w-full h-full p-4 md:p-10 pointer-events-none">
                        <Image
                            src={car.images[selectedIndex]}
                            alt="Full Screen Car"
                            fill
                            className="object-contain"
                            quality={100}
                        />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {selectedIndex + 1} / {car.images.length}
                    </div>
                </div>
            )}
        </div>
    );
}

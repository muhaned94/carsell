"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PremiumRequest {
    id: string;
    car_id: string;
    user_id: string;
    receipt_url: string;
    status: string;
    created_at: string;
    cars: {
        title: string;
        price: number;
    };
    profiles: {
        full_name: string;
        phone: string;
    };
}

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<PremiumRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [showHistory]);

    const fetchRequests = async () => {
        setLoading(true);
        let query = supabase
            .from("premium_requests")
            .select(`
        *,
        cars (title, price),
        profiles (full_name, phone, address, date_of_birth)
      `);

        if (showHistory) {
            query = query.neq("status", "pending");
        } else {
            query = query.eq("status", "pending");
        }

        const { data, error } = await query
            .order("created_at", { ascending: false });

        if (error) console.error("Error fetching requests:", error);
        else setRequests(data as any || []);
        setLoading(false);
    };

    const handleAction = async (requestId: string, carId: string, action: 'approve' | 'reject') => {
        setActionLoading(requestId);
        try {
            if (action === 'approve') {
                const { error: carError } = await supabase
                    .from('cars')
                    .update({ is_premium: true })
                    .eq('id', carId);
                if (carError) throw carError;
            }

            const { error: reqError } = await supabase
                .from('premium_requests')
                .update({ status: action === 'approve' ? 'approved' : 'rejected' })
                .eq('id', requestId);

            if (reqError) throw reqError;

            setRequests(prev => prev.filter(r => r.id !== requestId));
            alert(action === 'approve' ? "تم قبول الطلب بنجاح" : "تم رفض الطلب");

        } catch (error: any) {
            console.error("Error processing request:", error);
            alert("حدث خطأ: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold dark:text-white">
                    {showHistory ? "أرشيف الطلبات" : "طلبات التمييز المعلقة"}
                </h1>
                <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? "عرض المعلقة" : "عرض الأرشيف"}
                </Button>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed dark:border-gray-800 text-muted-foreground">
                    لا توجد طلبات {showHistory ? "مؤرشفة" : "معلقة"} حالياً
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 shadow-sm p-4 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold dark:text-white">{req.profiles?.full_name}</h3>
                                    <p className="text-sm text-muted-foreground dir-ltr">{req.profiles?.phone}</p>
                                    {(req as any).profiles?.address && (
                                        <p className="text-[10px] text-muted-foreground mt-1">العنوان: {(req as any).profiles.address}</p>
                                    )}
                                    {(req as any).profiles?.date_of_birth && (
                                        <p className="text-[10px] text-muted-foreground">التولد: {(req as any).profiles.date_of_birth}</p>
                                    )}
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded text-xs font-bold",
                                    req.status === 'pending' ? "bg-yellow-50 text-yellow-700" :
                                        req.status === 'approved' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                )}>
                                    {new Date(req.created_at).toLocaleDateString("ar-IQ")}
                                </div>
                            </div>

                            <div className="border-t dark:border-gray-800 pt-4">
                                <p className="text-sm text-muted-foreground mb-1">السيارة:</p>
                                <Link href={`/cars/${req.car_id}`} target="_blank" className="flex items-center gap-2 font-medium hover:text-primary dark:text-gray-300">
                                    {req.cars?.title} <ExternalLink size={14} />
                                </Link>
                                <p className="font-bold text-primary mt-1">{new Intl.NumberFormat("ar-IQ").format(req.cars?.price)} د.ع</p>
                            </div>

                            <div className="border-t dark:border-gray-800 pt-4">
                                <p className="text-sm text-muted-foreground mb-2">إيصال التحويل:</p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:opacity-90 overflow-hidden">
                                            <Image src={req.receipt_url} alt="Receipt" fill className="object-cover" />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <div className="relative w-full h-[80vh]">
                                            <Image src={req.receipt_url} alt="Receipt Full" fill className="object-contain" />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {!showHistory && (
                                <div className="mt-auto pt-4 flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(req.id, req.car_id, 'approve')}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === req.id ? <Loader2 className="animate-spin" /> : <><CheckCircle size={16} className="ml-2" /> قبول</>}
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant="destructive"
                                        onClick={() => handleAction(req.id, req.car_id, 'reject')}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === req.id ? <Loader2 className="animate-spin" /> : <><XCircle size={16} className="mr-2" /> رفض</>}
                                    </Button>
                                </div>
                            )}
                            {showHistory && (
                                <div className="mt-auto pt-4">
                                    <div className={cn(
                                        "w-full text-center py-2 rounded-lg text-sm font-bold",
                                        req.status === 'approved' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                        الحالة: {req.status === 'approved' ? "مقبول" : "مرفوض"}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

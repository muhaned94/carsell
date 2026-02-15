"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Loader2 } from "lucide-react";

interface AdminCarActionsProps {
    carId: string;
    isPremium: boolean;
    onActionComplete?: () => void;
}

export default function AdminCarActions({ carId, isPremium, onActionComplete }: AdminCarActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const togglePremium = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from("cars")
                .update({ is_premium: !isPremium })
                .eq("id", carId);

            if (error) throw error;

            if (onActionComplete) {
                onActionComplete();
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error("Error updating premium status:", error);
            alert("حدث خطأ أثناء تحديث الحالة - تأكد من تشغيل سكربت RLS");
        } finally {
            setLoading(false);
        }
    };

    const deleteCar = async () => {
        if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("cars")
                .delete()
                .eq("id", carId);

            if (error) throw error;

            if (onActionComplete) {
                onActionComplete();
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error("Error deleting car:", error);
            alert("حدث خطأ أثناء الحذف - تأكد من تشغيل سكربت RLS");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={isPremium ? "secondary" : "outline"}
                size="sm"
                onClick={togglePremium}
                disabled={loading}
                className={isPremium ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100" : ""}
            >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Star size={16} fill={isPremium ? "currentColor" : "none"} />}
                <span className="mr-2">{isPremium ? "إلغاء التميز" : "تمييز"}</span>
            </Button>

            <Button
                variant="destructive"
                size="sm"
                onClick={deleteCar}
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 size={16} />}
            </Button>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";

interface PremiumRequestModalProps {
    carId: string;
    carTitle: string;
}

export function PremiumRequestModal({ carId, carTitle }: PremiumRequestModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const router = useRouter();

    const [adminPhone, setAdminPhone] = useState<string>("");
    const [fetchingPhone, setFetchingPhone] = useState(true);

    useEffect(() => {
        const fetchAdminPhone = async () => {
            const { data } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "admin_phone")
                .single();

            if (data) {
                setAdminPhone(data.value);
            }
            setFetchingPhone(false);
        };
        if (open) {
            fetchAdminPhone();
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // 1. Upload Receipt
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);

            // 2. Create Request Record
            const { error: dbError } = await supabase
                .from('premium_requests')
                .insert({
                    car_id: carId,
                    user_id: user.id,
                    receipt_url: publicUrlData.publicUrl,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            setOpen(false);
            alert("تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.");
            router.refresh();

        } catch (error: any) {
            console.error("Error submitting request:", error);
            alert("حدث خطأ أثناء إرسال الطلب: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                    <CheckCircle size={16} className="mr-2" />
                    طلب تمييز (5,000 د.ع)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>طلب تمييز الإعلان</DialogTitle>
                    <DialogDescription>
                        صورة إشعار التحويل لتفعيل الاعلان المميز لسيارة: {carTitle}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 space-y-2">
                        <p className="font-semibold">طريقة الدفع:</p>
                        <p>يرجى تحويل مبلغ <strong>5,000 د.ع</strong> إلى زين كاش:</p>
                        {fetchingPhone ? (
                            <div className="flex justify-center py-2">
                                <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                            </div>
                        ) : (
                            <p dir="ltr" className="font-mono text-lg font-bold text-center select-all">
                                {adminPhone || "يرجى التواصل مع الإدارة"}
                            </p>
                        )}
                        <p>ثم ارفع صورة إشعار التحويل في الأسفل.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="receipt">صورة الإيصال</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                            <Input
                                id="receipt"
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                required
                            />
                            {preview ? (
                                <div className="relative h-40 w-full">
                                    <Image src={preview} alt="Receipt Preview" fill className="object-contain" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload size={32} />
                                    <span>اضغط لرفع الصورة</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading || !file} className="w-full">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "إرسال الطلب"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

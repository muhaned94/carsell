"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RefreshCw } from "lucide-react";

export default function AdminSettings() {
    const [rate, setRate] = useState<string>("153000");
    const [adminPhone, setAdminPhone] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            // Fetch exchange rate
            const { data: rateData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "exchange_rate")
                .single();

            if (rateData) {
                setRate(rateData.value);
            }

            // Fetch admin phone
            const { data: phoneData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "admin_phone")
                .single();

            if (phoneData) {
                setAdminPhone(phoneData.value);
            }

            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);

        // Save exchange rate
        const { error: rateError } = await supabase
            .from("settings")
            .upsert({ key: "exchange_rate", value: rate, updated_at: new Date().toISOString() });

        if (rateError) {
            alert("حدث خطأ أثناء حفظ سعر الصرف: " + rateError.message);
            setSaving(false);
            return;
        }

        // Save admin phone
        const { error: phoneError } = await supabase
            .from("settings")
            .upsert({ key: "admin_phone", value: adminPhone, updated_at: new Date().toISOString() });

        if (phoneError) {
            alert("حدث خطأ أثناء حفظ رقم الهاتف: " + phoneError.message);
        } else {
            alert("تم تحديث الإعدادات بنجاح");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-8 py-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">إعدادات النظام</h1>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b pb-4 mb-4">
                    <RefreshCw className="text-primary" size={24} />
                    <h2 className="text-lg font-bold">الإعدادات العامة</h2>
                </div>

                <div className="space-y-6">
                    {/* Exchange Rate Setting */}
                    <div className="space-y-2">
                        <Label htmlFor="rate">سعر الـ 100 دولار بالدينار (مثال: 153,000)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="rate"
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="text-xl font-bold h-12"
                            />
                            <span className="text-lg font-medium text-muted-foreground whitespace-nowrap">دينار عراقي</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            سيتم استخدام هذا السعر في جميع أنحاء الموقع لتحويل الأسعار بين الدينار والدولار.
                        </p>
                    </div>

                    {/* Admin Phone Setting */}
                    <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="adminPhone">رقم هاتف مسؤول زين كاش</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="adminPhone"
                                type="text"
                                value={adminPhone}
                                onChange={(e) => setAdminPhone(e.target.value)}
                                placeholder="مثال: 07800000000"
                                className="text-xl font-bold h-12 text-left"
                                dir="ltr"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            سيتم عرض هذا الرقم للعملاء عند طلب تمييز إعلاناتهم للدفع عبر زين كاش.
                        </p>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full h-12 gap-2 text-lg mt-4">
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        حفظ الإعدادات
                    </Button>
                </div>
            </div>
        </div>
    );
}

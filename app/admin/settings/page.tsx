"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RefreshCw } from "lucide-react";

export default function AdminSettings() {
    const [rate, setRate] = useState<string>("153000");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "exchange_rate")
                .single();

            if (data) {
                setRate(data.value);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("settings")
            .upsert({ key: "exchange_rate", value: rate, updated_at: new Date().toISOString() });

        if (error) {
            alert("حدث خطأ أثناء حفظ الإعدادات: " + error.message);
        } else {
            alert("تم تحديث سعر الصرف بنجاح");
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
                    <h2 className="text-lg font-bold">سعر صرف الـ 100 دولار (IQD/100$)</h2>
                </div>

                <div className="space-y-4">
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

                    <Button onClick={handleSave} disabled={saving} className="w-full h-12 gap-2 text-lg">
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        حفظ الإعدادات
                    </Button>
                </div>
            </div>
        </div>
    );
}

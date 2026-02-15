"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Save, X, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const GOVERNORATES = [
    "بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "كركوك", "الأنبار", "ديالى", "المثنى", "القادسية", "ميسان", "ذي قار", "صلاح الدين", "دهوك", "السليمانية", "بابل", "واسط"
];

export default function EditCarPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<any>({
        title: "",
        price: "",
        currency: "IQD",
        governorate: "",
        year: "",
        description: "",
        transmission: "automatic",
        fuel_type: "petrol",
        images: []
    });

    useEffect(() => {
        const fetchCar = async () => {
            const { data, error } = await supabase
                .from("cars")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                alert("تعذر العثور على السيارة");
                router.push("/profile");
                return;
            }

            setFormData({
                ...data,
                price: data.price.toString(),
                year: data.year.toString(),
                images: data.images || []
            });
            setLoading(false);
        };
        fetchCar();
    }, [id, router]);

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_: any, index: number) => index !== indexToRemove)
        });
    };

    const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages = [...formData.images];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("cars")
                .upload(filePath, file);

            if (uploadError) {
                alert("خطأ في رفع الصورة: " + uploadError.message);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from("cars")
                .getPublicUrl(filePath);

            newImages.push(publicUrl);
        }

        setFormData({ ...formData, images: newImages });
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from("cars")
            .update({
                title: formData.title,
                price: parseFloat(formData.price),
                currency: formData.currency,
                governorate: formData.governorate,
                year: parseInt(formData.year),
                description: formData.description,
                transmission: formData.transmission,
                fuel_type: formData.fuel_type,
                images: formData.images
            })
            .eq("id", id);

        if (error) {
            alert("حدث خطأ أثناء الحفظ: " + error.message);
        } else {
            alert("تم تحديث الإعلان بنجاح");
            router.push("/profile");
        }
        setSaving(false);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/profile" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                    <ArrowRight size={18} className="ml-1" />
                    العودة للملف الشخصي
                </Link>
                <h1 className="text-2xl font-bold">تعديل الإعلان</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800">

                {/* Image Management */}
                <div className="space-y-4">
                    <Label className="text-lg font-bold">صور السيارة</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {formData.images.map((url: string, index: number) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-800 group">
                                <Image src={url} alt={`Car ${index}`} fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-500 hover:text-primary">
                            {uploading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                            <span className="text-[10px] mt-1">إضافة صور</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleAddImages}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>عنوان الإعلان</Label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>السعر</Label>
                        <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>العملة</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        >
                            <option value="IQD">دينار عراقي</option>
                            <option value="USD">دولار أمريكي</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>المحافظة</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.governorate}
                            onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                        >
                            <option value="">اختر المحافظة</option>
                            {GOVERNORATES.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>السنة</Label>
                        <Input
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>ناقل الحركة</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.transmission}
                            onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                        >
                            <option value="automatic">أوتوماتيك</option>
                            <option value="manual">عادي</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>نوع الوقود</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.fuel_type}
                            onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                        >
                            <option value="petrol">بانزين</option>
                            <option value="hybrid">هايبيرد</option>
                            <option value="electric">كهرباء</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>الوصف</Label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={5}
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t dark:border-gray-800">
                    <Button type="submit" className="flex-1 gap-2" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        حفظ التعديلات
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push("/profile")} disabled={saving}>
                        <X size={18} className="ml-1" />
                        إلغاء
                    </Button>
                </div>
            </form>
        </div>
    );
}

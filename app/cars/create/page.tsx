"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { compressImage } from "@/lib/image-compression";

export default function CreateCarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        currency: "IQD",
        governorate: "بغداد",
        brand: "",
        year: new Date().getFullYear().toString(),
        transmission: "automatic",
        fuel_type: "petrol",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages([...images, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Cleanup
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const uploadImages = async (userId: string) => {
        const uploadedUrls: string[] = [];

        for (const file of images) {
            try {
                // Compress image before uploading
                const compressedBlob = await compressImage(file);

                // Construct filename (ensure it ends with .jpg since we convert to jpeg)
                const fileName = `${userId}/${Math.random()}.jpg`;

                // Convert Blob back to File for Supabase (optional, but good for metadata)
                const compressedFile = new File([compressedBlob], fileName, { type: 'image/jpeg' });

                const { error: uploadError } = await supabase.storage
                    .from('cars')
                    .upload(fileName, compressedFile);

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    continue;
                }

                const { data } = supabase.storage.from('cars').getPublicUrl(fileName);
                uploadedUrls.push(data.publicUrl);

            } catch (error) {
                console.error("Error compressing/uploading image:", error);
                // Fallback to original file if compression fails? 
                // meaningful error handling or continue
                continue;
            }
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("يجب عليك تسجيل الدخول أولاً");
                router.push("/login");
                return;
            }

            // Upload images first
            const imageUrls = await uploadImages(user.id);

            // Insert car data
            const { data, error } = await supabase
                .from('cars')
                .insert([
                    {
                        user_id: user.id,
                        title: formData.title,
                        price: parseFloat(formData.price),
                        currency: formData.currency,
                        governorate: formData.governorate,
                        brand: formData.brand,
                        year: parseInt(formData.year),
                        transmission: formData.transmission,
                        fuel_type: formData.fuel_type,
                        description: formData.description,
                        images: imageUrls,
                        is_premium: false, // Default to free
                    }
                ])
                .select();

            if (error) throw error;

            router.push(`/cars/${data[0].id}`);
            router.refresh();

        } catch (error: any) {
            console.error("Error creating ad:", error);
            alert("حدث خطأ أثناء نشر الإعلان: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-primary">نشر إعلان جديد</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm">

                {/* Title */}
                <div className="space-y-2">
                    <label className="font-semibold block text-sm dark:text-gray-300">عنوان الإعلان</label>
                    <input
                        required
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="مثال: تويوتا كامري 2022 نظيفة جداً"
                        className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                {/* Brand & Year */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="font-semibold block text-sm dark:text-gray-300">نوع السيارة</label>
                        <input
                            required
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="مثال: Toyota"
                            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="font-semibold block text-sm dark:text-gray-300">سنة الصنع</label>
                        <input
                            required
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            min="1980"
                            max={new Date().getFullYear() + 1}
                            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 outline-none"
                        />
                    </div>
                </div>

                {/* Price & Currency */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="font-semibold block text-sm">السعر</label>
                        <input
                            required
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="مثال: 25000000"
                            className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="font-semibold block text-sm">العملة</label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white outline-none"
                        >
                            <option value="IQD">دينار عراقي (IQD)</option>
                            <option value="USD">دولار أمريكي (USD)</option>
                        </select>
                    </div>
                </div>

                {/* Governorate */}
                <div className="space-y-2">
                    <label className="font-semibold block text-sm">المحافظة</label>
                    <select
                        name="governorate"
                        value={formData.governorate}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white outline-none"
                    >
                        {["بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "كركوك", "الأنبار", "ديالى", "المثنى", "القادسية", "ميسان", "ذي قار", "صلاح الدين", "دهوك", "السليمانية", "بابل", "واسط"].map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="font-semibold block text-sm dark:text-gray-300">نوع القير</label>
                        <select
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 outline-none"
                        >
                            <option value="automatic">أوتوماتيك</option>
                            <option value="manual">عادي</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="font-semibold block text-sm dark:text-gray-300">نوع الوقود</label>
                        <select
                            name="fuel_type"
                            value={formData.fuel_type}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 outline-none"
                        >
                            <option value="petrol">بانزين</option>
                            <option value="diesel">ديزل</option>
                            <option value="hybrid">هايبرد</option>
                            <option value="electric">كهربائي</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="font-semibold block text-sm dark:text-gray-300">وصف السيارة</label>
                    <textarea
                        required
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="اكتب مواصفات السيارة، حالتها، وأي تفاصيل أخرى..."
                        className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 outline-none resize-none"
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="font-semibold block text-sm dark:text-gray-300">صور السيارة (يمكنك رفع ما يصل إلى 10 صور)</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={images.length >= 10}
                        />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImagePlus size={32} />
                            <span>اضغط لإضافة صور</span>
                            <span className="text-xs text-gray-400 max-w-xs block">JPG, PNG بحد أقصى 5 ميجابايت للصورة</span>
                        </div>
                    </div>

                    {/* Previews */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                    <Image src={src} alt="Preview" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            جاري النشر...
                        </>
                    ) : (
                        "نشر الإعلان"
                    )}
                </Button>
            </form>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, LogOut, User as UserIcon, Star, Loader2, Edit2, Save, X, CalendarDays, Home, Shield, Trash2 } from "lucide-react";
import { PremiumRequestModal } from "@/components/premium-request-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/currency";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [cars, setCars] = useState<any[]>([]);
    const [pendingCarIds, setPendingCarIds] = useState<Set<string>>(new Set());

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        full_name: "",
        address: "",
        date_of_birth: ""
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: "", confirm: "" });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch Profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                setProfile(profile);
                setEditData({
                    full_name: profile.full_name || "",
                    address: profile.address || "",
                    date_of_birth: profile.date_of_birth || ""
                });
            }

            // Fetch Cars
            const { data: cars } = await supabase
                .from("cars")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            setCars(cars || []);

            // Fetch Pending Requests
            const { data: requests } = await supabase
                .from("premium_requests")
                .select("car_id, status")
                .eq("user_id", user.id)
                .eq("status", "pending");

            const ids = new Set((requests || []).map((r: any) => r.car_id));
            setPendingCarIds(ids);

            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleUpdatePassword = async () => {
        if (passwordData.password !== passwordData.confirm) {
            alert("كلمتا السر غير متطابقتين");
            return;
        }
        if (passwordData.password.length < 6) {
            alert("يجب أن تكون كلمة السر 6 أحرف على الأقل");
            return;
        }

        setPasswordLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.password
            });

            if (error) throw error;

            alert("تم تغيير كلمة السر بنجاح");
            setPasswordData({ password: "", confirm: "" });
            setIsChangingPassword(false);
        } catch (error: any) {
            alert("خطأ في تغيير كلمة السر: " + error.message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaveLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: editData.full_name,
                    address: editData.address,
                    date_of_birth: editData.date_of_birth || null
                })
                .eq("id", user.id);

            if (error) throw error;

            setProfile({ ...profile, ...editData });
            setIsEditing(false);
            alert("تم تحديث البيانات بنجاح");
        } catch (error: any) {
            alert("خطأ في التحديث: " + error.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDeleteCar = async (carId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.")) return;

        try {
            const { error } = await supabase
                .from("cars")
                .delete()
                .eq("id", carId);

            if (error) throw error;

            setCars(prev => prev.filter(c => c.id !== carId));

            if (pendingCarIds.has(carId)) {
                const newPending = new Set(pendingCarIds);
                newPending.delete(carId);
                setPendingCarIds(newPending);
            }
        } catch (error: any) {
            console.error("Error deleting car:", error);
            alert("حدث خطأ أثناء الحذف: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm">
                        <div className="text-center mb-6">
                            <div className="relative w-24 h-24 mx-auto mb-4 group">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden border-2 border-primary/10">
                                    {profile?.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt={profile.full_name || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        profile?.full_name?.charAt(0) || <UserIcon size={40} />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Edit2 size={20} />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            setLoading(true);
                                            try {
                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                                                const filePath = `avatars/${fileName}`;

                                                const { error: uploadError } = await supabase.storage
                                                    .from('receipts') // Using receipts bucket as a generic one or create new
                                                    .upload(filePath, file);

                                                if (uploadError) throw uploadError;

                                                const { data: { publicUrl } } = supabase.storage
                                                    .from('receipts')
                                                    .getPublicUrl(filePath);

                                                const { error: updateError } = await supabase
                                                    .from('profiles')
                                                    .update({ avatar_url: publicUrl })
                                                    .eq('id', user.id);

                                                if (updateError) throw updateError;

                                                setProfile({ ...profile, avatar_url: publicUrl });
                                                alert("تم تحديث الصورة الشخصية بنجاح");
                                            } catch (error: any) {
                                                alert("خطأ في رفع الصورة: " + error.message);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {!isEditing ? (
                                <>
                                    <h2 className="text-xl font-bold mb-1">{profile?.full_name || "مستخدم"}</h2>
                                    <p className="text-muted-foreground dir-ltr font-mono text-sm mb-4">{profile?.phone}</p>

                                    <div className="text-right text-sm space-y-2 mb-6 border-t pt-4">
                                        {profile?.address && (
                                            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Home size={14} /> {profile.address}
                                            </p>
                                        )}
                                        {profile?.date_of_birth && (
                                            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <CalendarDays size={14} /> {profile.date_of_birth}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full mb-2"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit2 size={16} className="ml-2" />
                                        تعديل البيانات
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-4 text-right">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">الاسم الكامل</label>
                                        <Input
                                            value={editData.full_name}
                                            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">العنوان</label>
                                        <Input
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            placeholder="بغداد - الكرادة"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">تاريخ الميلاد</label>
                                        <Input
                                            type="date"
                                            value={editData.date_of_birth}
                                            onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            className="flex-1"
                                            size="sm"
                                            onClick={handleSaveProfile}
                                            disabled={saveLoading}
                                        >
                                            {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="ml-1" />}
                                            حفظ
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="flex-1"
                                            size="sm"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            <X size={14} className="ml-1" />
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full gap-2 border-primary/20 hover:bg-primary/5"
                                onClick={() => setIsChangingPassword(true)}
                            >
                                <Shield size={16} />
                                تغيير كلمة السر
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-none mt-4"
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    router.push("/login");
                                    router.refresh();
                                }}
                            >
                                <LogOut size={16} className="ml-2" />
                                تسجيل الخروج
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">إعلاناتي</h1>
                        <Link href="/cars/create">
                            <Button>أضف إعلان جديد</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cars.map((car: any) => (
                            <div key={car.id} className="bg-white rounded-xl border overflow-hidden flex flex-col">
                                <div className="relative aspect-video bg-gray-100">
                                    <Image
                                        src={car.images?.[0] || "/placeholder-car.jpg"}
                                        alt={car.title}
                                        fill
                                        className="object-cover"
                                    />
                                    {car.is_premium && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                            <Star size={12} fill="currentColor" /> مميز
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold line-clamp-1">{car.title}</h3>
                                    </div>

                                    <div className="text-muted-foreground text-sm space-y-1 mb-4">
                                        <p className="flex items-center gap-2">
                                            <MapPin size={14} /> {car.governorate}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar size={14} /> {car.year}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4 border-t flex flex-col gap-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-lg text-primary">
                                                {formatPrice(car.price, car.currency || 'IQD').primary}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatPrice(car.price, car.currency || 'IQD').secondary}
                                            </span>
                                        </div>

                                        {!car.is_premium && (
                                            pendingCarIds.has(car.id) ? (
                                                <Button disabled variant="secondary" className="w-full bg-yellow-50 text-yellow-700">
                                                    <Clock size={16} className="mr-2" />
                                                    طلب التمييز قيد المراجعة
                                                </Button>
                                            ) : (
                                                <PremiumRequestModal carId={car.id} carTitle={car.title} />
                                            )
                                        )}

                                        <div className="grid grid-cols-3 gap-2">
                                            <Link href={`/cars/${car.id}`} className="block">
                                                <Button variant="outline" className="w-full text-xs px-1" size="sm">عرض</Button>
                                            </Link>
                                            <Link href={`/cars/${car.id}/edit`} className="block">
                                                <Button variant="outline" className="w-full gap-1 text-xs px-1" size="sm">
                                                    <Edit2 size={12} /> تعديل
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                className="w-full gap-1 text-xs px-1"
                                                size="sm"
                                                onClick={() => handleDeleteCar(car.id)}
                                            >
                                                <Trash2 size={12} /> حذف
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cars.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                                <p className="text-muted-foreground mb-4">ليس لديك أي إعلانات حالياً</p>
                                <Link href="/cars/create">
                                    <Button>أضف إعلانك الأول</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            {/* Change Password Modal */}
            {isChangingPassword && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Shield size={18} /> تغيير كلمة السر
                            </h3>
                            <button onClick={() => setIsChangingPassword(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-right">
                            <div className="space-y-2">
                                <Label>كلمة السر الجديدة</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>تأكيد كلمة السر</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleUpdatePassword}
                                    disabled={passwordLoading}
                                    className="flex-1 gap-2"
                                >
                                    {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    تغيير الكلمة
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsChangingPassword(false)}
                                    className="flex-1"
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

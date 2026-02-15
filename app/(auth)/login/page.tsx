"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        password: "",
        fullName: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper to create a dummy email from phone
    const getEmailFromPhone = (phone: string) => {
        // Remove non-digits
        const cleanPhone = phone.replace(/\D/g, '');
        return `${cleanPhone}@carmarket.com`;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simple phone validation
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setError("يرجى إدخال رقم هاتف صحيح (على الأقل 10 أرقام)");
            setLoading(false);
            return;
        }

        const email = getEmailFromPhone(cleanPhone);

        try {
            if (isLogin) {
                // LOGIN
                const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: formData.password,
                });
                if (signInError) throw signInError;

                // Check role for redirection
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user?.id)
                    .single();

                router.refresh();
                if (profile?.role === 'admin') {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
            } else {
                // SIGN UP
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName || "مستخدم جديد",
                            phone: formData.phone,
                            role: "user",
                        }
                    }
                });

                if (authError) throw authError;

                // Create Profile if needed - using the generic client or authenticated client
                // Note: user_id trigger is best, but we are doing it manually.
                if (authData.user) {
                    const { error: profileError } = await supabase
                        .from("profiles")
                        .insert([
                            {
                                id: authData.user.id,
                                full_name: formData.fullName || "مستخدم جديد",
                                phone: formData.phone,
                                role: "user",
                            },
                        ]);
                    if (profileError) {
                        console.error("Profile creation error:", profileError);
                    }
                }

                alert("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");

                // Try to sign in immediately just in case
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: formData.password,
                });

                if (!signInError) {
                    router.refresh();
                    router.push("/");
                } else {
                    setIsLogin(true);
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            if (err.message.includes("Invalid login")) {
                setError("رقم الهاتف أو كلمة المرور غير صحيحة");
            } else if (err.message.includes("already registered")) {
                setError("رقم الهاتف مسجل بالفعل");
            } else {
                setError(err.message || "حدث خطأ غير متوقع");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-50 items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">
                        {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isLogin ? "سجل دخولك برقم الهاتف" : "أنشئ حسابك للبدء في بيع وشراء السيارات"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">الاسم الكامل</label>
                            <input
                                required
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="الاسم الثلاثي"
                                className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">رقم الهاتف</label>
                        <input
                            required
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="07xxxxxxxxx"
                            className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary/20 dir-ltr text-right"
                            dir="ltr"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">كلمة المرور</label>
                        <input
                            required
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</p>}

                    <Button type="submit" className="w-full h-10" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "دخول" : "تسجيل")}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">
                        {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                    </span>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="mr-1 font-semibold text-primary hover:underline"
                    >
                        {isLogin ? "أنشئ حساباً" : "سجل دخولك"}
                    </button>
                </div>
            </div>
        </div>
    );
}

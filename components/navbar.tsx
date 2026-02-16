"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Car, User, PlusCircle, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            if (authUser) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", authUser.id)
                    .single();
                setProfile(data);
            }
        };
        fetchData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => setProfile(data));
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!mounted) return null;

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Mobile menu button (Right in RTL) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none p-2"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                                <Car size={24} />
                            </div>
                            <span className="font-bold text-xl tracking-tight">سيارتك</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            الرئيسية
                        </Link>
                        <Link href="/cars/search" className="text-sm font-medium hover:text-primary transition-colors">
                            تصفح السيارات
                        </Link>
                        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                            من نحن
                        </Link>
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {profile?.role === 'admin' && (
                            <Link href="/admin">
                                <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white">
                                    <LayoutDashboard size={18} />
                                    <span>لوحة التحكم</span>
                                </Button>
                            </Link>
                        )}
                        <Link href="/cars/create">
                            <Button variant="default" className="gap-2">
                                <PlusCircle size={18} />
                                <span>بيع سيارتك</span>
                            </Button>
                        </Link>

                        {user ? (
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-full overflow-hidden border p-0">
                                    {profile?.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {profile?.full_name?.charAt(0) || <User size={20} />}
                                        </div>
                                    )}
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="outline">تسجيل الدخول</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Actions */}
                    <div className="md:hidden flex items-center gap-2">
                        {!user && (
                            <Link href="/login">
                                <Button variant="outline" size="sm">دخول</Button>
                            </Link>
                        )}
                        {user && (
                            <Link href="/profile" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" size="icon" className="relative w-8 h-8 rounded-full overflow-hidden border p-0">
                                    {profile?.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {profile?.full_name?.charAt(0) || <User size={20} />}
                                        </div>
                                    )}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Menu Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-[280px] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex items-center justify-between">
                        <span className="font-bold text-lg">القائمة</span>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                             <Car size={20} />
                            <span>الرئيسية</span>
                        </Link>
                        <Link
                            href="/cars/search"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                             <Car size={20} />
                            <span>تصفح السيارات</span>
                        </Link>
                        {profile?.role === 'admin' && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard size={20} />
                                <span>لوحة التحكم</span>
                            </Link>
                        )}
                        <Link
                            href="/cars/create"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <PlusCircle size={20} />
                            <span>بيع سيارتك</span>
                        </Link>

                        <div className="border-t my-2 pt-2">
                             {!user ? (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User size={20} />
                                    <span>تسجيل الدخول</span>
                                </Link>
                             ) : (
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User size={20} />
                                    <span>حسابي</span>
                                </Link>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

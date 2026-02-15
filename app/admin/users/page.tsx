"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Phone, Shield, Loader2, Search, Filter, ArrowUpDown, Pencil, Trash2, X, Save } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ full_name: "", phone: "", password: "" });
    const router = useRouter();

    const fetchUsers = async () => {
        setLoading(true);
        let query = supabase.from("profiles").select("*");

        const { data } = await query.order("created_at", { ascending: sortBy === "oldest" });
        setUsers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [sortBy]);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.phone?.includes(searchTerm));
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleToggleRole = async (userId: string, currentRole: string) => {
        setActionLoading(userId);
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert("خطأ في تحديث الرتبة: " + error.message);
        } else {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
        setActionLoading(null);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        setActionLoading(editingUser.id);

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: editForm.full_name,
                phone: editForm.phone
            })
            .eq('id', editingUser.id);

        if (error) {
            alert("خطأ في التحديث: " + error.message + " - تأكد من تشغيل سكربت RLS");
        } else {
            if (editForm.password) {
                alert("تم تحديث البيانات، ولكن تغيير كلمة السر للمستخدمين الآخرين يتطلب صلاحيات إضافية (Service Role). سيتم تحديث الاسم والهاتف فقط.");
            }
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, full_name: editForm.full_name, phone: editForm.phone } : u));
            setEditingUser(null);
        }
        setActionLoading(null);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيؤدي هذا لإزالة بياناته من قاعدة البيانات (سيظل حسابه فعالاً في نظام الدخول ولكن بدون ملف شخصي).")) return;

        setActionLoading(userId);
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            alert("خطأ في الحذف: " + error.message + " - تأكد من تشغيل سكربت RLS");
        } else {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
        setActionLoading(null);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setEditForm({ full_name: user.full_name || "", phone: user.phone || "", password: "" });
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">إدارة المستخدمين والصلاحيات</h1>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="بحث بالاسم أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full h-10 pr-10 pl-4 rounded-md border text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">جميع الرتب</option>
                            <option value="user">مستخدم عادي</option>
                            <option value="admin">أدمن</option>
                        </select>
                    </div>
                </div>
                <div className="relative">
                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full h-10 pr-10 pl-4 rounded-md border text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="newest">الأحدث أولاً</option>
                        <option value="oldest">الأقدم أولاً</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="divide-y">
                    {filteredUsers.map((user: any) => (
                        <div key={user.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg overflow-hidden border border-primary/10">
                                    {user.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.full_name || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        user.full_name?.charAt(0) || "U"
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {user.full_name || "مستخدم غير معروف"}
                                        </h3>
                                        <div className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1",
                                            user.role === 'admin' ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            <Shield size={10} /> {user.role === 'admin' ? "أدمن" : "مستخدم عادي"}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Phone size={12} /> {user.phone}
                                        </span>
                                        {user.address && (
                                            <span className="flex items-center gap-1">
                                                العنوان: {user.address}
                                            </span>
                                        )}
                                        {user.date_of_birth && (
                                            <span className="flex items-center gap-1">
                                                التولد: {user.date_of_birth}
                                            </span>
                                        )}
                                        <span className="text-[10px] bg-gray-50 dark:bg-gray-800 px-1 rounded">ID: {user.id.slice(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end lg:self-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs gap-1 border-primary/20 hover:bg-primary/5"
                                    onClick={() => openEditModal(user)}
                                >
                                    <Pencil size={12} /> تعديل
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "h-8 text-xs gap-1",
                                        user.role === 'admin' ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-primary"
                                    )}
                                    onClick={() => handleToggleRole(user.id, user.role)}
                                    disabled={actionLoading === user.id}
                                >
                                    {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                    {user.role === 'admin' ? "سحب رتبة أدمن" : "ترقية إلى أدمن"}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={actionLoading === user.id}
                                >
                                    {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    حذف
                                </Button>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            لا يوجد مشتركين حتى الآن
                        </div>
                    )}
                </div>
            </div>
            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Pencil size={18} /> تعديل بيانات المشترك
                            </h3>
                            <button onClick={() => setEditingUser(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">الاسم الكامل</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                    placeholder="أدخل الاسم الجديد"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">رقم الهاتف</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="أدخل رقم الهاتف الجديد"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-password">كلمة سر جديدة (اختياري)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="اتركه فارغاً للحفاظ على القديمة"
                                />
                                <p className="text-[10px] text-amber-600 bg-amber-50 p-1 rounded">
                                    ملاحظة: تغيير الكلمة للأعضاء يتطلب صلاحيات Service Role.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleUpdateUser}
                                    disabled={actionLoading === editingUser.id}
                                    className="flex-1 gap-2"
                                >
                                    {actionLoading === editingUser.id ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    حفظ التعديلات
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingUser(null)}
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

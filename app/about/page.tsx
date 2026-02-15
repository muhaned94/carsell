import { Car, Shield, Users, Target } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-6 text-primary">من نحن</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    "سيارتك" هي المنصة الرائدة في العراق لبيع وشراء السيارات بطريقة عصرية، آمنة، وسريعة.
                    نحن نجمع بين البائع والمشتري في مكان واحد لتسهيل عملية التداول.
                </p>
            </div>

            {/* Mission & Vision Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-xl border shadow-sm text-center">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Target size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">رؤيتنا</h3>
                    <p className="text-gray-600">
                        أن نكون الوجهة الأولى والموثوقة لكل من يبحث عن سيارة في العراق، من خلال توفير تجربة مستخدم استثنائية.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl border shadow-sm text-center">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <Shield size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">قيمنا</h3>
                    <p className="text-gray-600">
                        الأمانة، الشفافية، والاحترافية. نحن نسعى جاهدين لبناء مجتمع سيارات آمن وموثوق لجميع المستخدمين.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl border shadow-sm text-center">
                    <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">مجتمعنا</h3>
                    <p className="text-gray-600">
                        نحن نخدم آلاف المستخدمين يومياً، من الأفراد إلى معارض السيارات، ونعمل على تلبية احتياجات الجميع.
                    </p>
                </div>
            </div>

            {/* Stats or Additional Info */}
            <div className="bg-gray-900 text-white rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-8">لماذا تختار "سيارتك"؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">+1000</div>
                            <div className="text-gray-300">سيارة معروضة</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-400 mb-2">+500</div>
                            <div className="text-gray-300">عملية بيع ناجحة</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                            <div className="text-gray-300">دعم فني</div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}

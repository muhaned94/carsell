import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car } from "@/components/car-card";
import { supabase } from "@/lib/supabase";
import { HeroSearch } from "@/components/hero-search";
import { RealtimeCars } from "@/components/realtime-cars";

export const revalidate = 0;

async function getFeaturedCars() {
  const { data } = await supabase
    .from('cars')
    .select('*, profiles(phone)')
    .eq('is_premium', true)
    .order('created_at', { ascending: false })
    .limit(4);

  return data || [];
}

async function getRecentCars() {
  const { data } = await supabase
    .from('cars')
    .select('*, profiles(phone)')
    .eq('is_premium', false)
    .order('created_at', { ascending: false })
    .limit(8);

  return data || [];
}

export default async function Home() {
  // Try to fetch real data
  const realFeatured = await getFeaturedCars();
  const realRecent = await getRecentCars();

  const featuredCars = realFeatured as Car[];
  const recentCars = realRecent as Car[];

  return (
    <div className="flex flex-col gap-16 pb-16">

      {/* Hero Section */}
      <section className="relative min-h-[400px] md:h-[500px] flex items-center justify-center bg-gray-900 text-white overflow-hidden py-12 md:py-0">

        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-50">
          <div
            className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2048&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6">
            ابحث عن سيارة أحلامك
          </h1>
          <p className="text-lg md:text-2xl mb-6 md:mb-8 text-gray-200 max-w-2xl mx-auto">
            أكبر سوق لبيع وشراء السيارات في العراق. تصفح آلاف الإعلانات المميزة.
          </p>

          {/* Search Box */}
          <div className="flex justify-center">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Featured Listing Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">إعلانات مميزة</h2>
            <p className="text-muted-foreground">أحدث السيارات المميزة المعروضة للبيع</p>
          </div>
          <Link href="/cars/search?premium=true">
            <Button variant="outline">عرض الكل</Button>
          </Link>
        </div>

        <RealtimeCars initialCars={featuredCars} isPremium={true} limit={4} />
      </section>

      {/* Recent Listings Section */}
      <section className="container mx-auto px-4 bg-gray-50 py-16 rounded-3xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">أحدث الإعلانات</h2>
            <p className="text-muted-foreground">تصفح أحدث السيارات المضافة حديثاً</p>
          </div>
          <Link href="/cars/search">
            <Button variant="outline">عرض الكل</Button>
          </Link>
        </div>

        <RealtimeCars initialCars={recentCars} isPremium={false} limit={8} />
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 text-center">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">هل ترغب ببيع سيارتك؟</h2>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              أضف إعلانك مجاناً خلال دقائق واستقبل العروض مباشرة من المشترين عبر واتساب.
            </p>
            <Link href="/cars/create">
              <Button size="lg" variant="secondary" className="text-primary font-bold text-lg px-8 h-14">
                أضف إعلانك الآن
              </Button>
            </Link>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

    </div>
  );
}

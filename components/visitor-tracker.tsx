"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const trackView = async () => {
            try {
                // 1. Get or create a persistent visitor ID
                let visitorId = localStorage.getItem("visitor_id");
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem("visitor_id", visitorId);
                }

                // 2. Check if user is logged in
                const { data: { user } } = await supabase.auth.getUser();
                const finalVisitorId = user?.id || visitorId;

                // 3. Log the view
                await supabase.from("page_views").insert({
                    path: pathname,
                    visitor_id: finalVisitorId, // Use the persistent ID
                });
            } catch (error) {
                console.error("Error tracking visitor:", error);
            }
        };

        trackView();
    }, [pathname]);

    return null;
}

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { setExchangeRate } from "@/lib/currency";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    useEffect(() => {
        const fetchRate = async () => {
            try {
                const { data } = await supabase
                    .from("settings")
                    .select("value")
                    .eq("key", "exchange_rate")
                    .single();
                if (data?.value) {
                    setExchangeRate(parseFloat(data.value));
                }
            } catch (e) {
                console.error("Failed to fetch exchange rate", e);
            }
        };
        fetchRate();
    }, []);

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

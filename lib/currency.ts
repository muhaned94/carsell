export let EXCHANGE_RATE = 153000; // Default fallback (per 100$)

export function setExchangeRate(rate: number) {
    EXCHANGE_RATE = rate;
}

export function formatPrice(price: number, currency: string = 'IQD', rate: number = EXCHANGE_RATE) {
    const safeRate = rate > 0 ? rate : 1530;

    const iqdFormatter = new Intl.NumberFormat("ar-IQ", {
        style: "currency",
        currency: "IQD",
        maximumFractionDigits: 0,
    });

    const usdFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });

    if (currency === 'USD') {
        const iqdValue = Math.round(price * (safeRate / 100));
        return {
            primary: usdFormatter.format(price),
            secondary: iqdFormatter.format(iqdValue)
        };
    } else {
        const usdValue = Math.round(price / (safeRate / 100));
        return {
            primary: iqdFormatter.format(price),
            secondary: usdFormatter.format(usdValue)
        };
    }
}

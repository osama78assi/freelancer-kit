export const pageSizeOptions = [10, 20, 30, 40, 50, 100];

export function currencySymbol(currency: string): string {
    return (
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            currencyDisplay: "narrowSymbol",
        })
            .formatToParts(0)
            .find((part) => part.type === "currency")?.value ?? currency
    );
}

export function roundStr(value: string, percision: number = 2): string {
    const [base, floating] = value.split(".");
    return floating ? base + "." + floating?.slice(0, percision) : base;
}

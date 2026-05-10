import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/types";

function money(n: number | null) {
  if (n === null) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(n: number | null) {
  if (n === null) return "Not specified";
  return `${n}%`;
}

function months(n: number | null) {
  if (n === null) return "Not specified";
  if (n >= 12) {
    const yrs = Math.floor(n / 12);
    const rem = n % 12;
    return rem ? `${yrs} yr ${rem} mo` : `${yrs} yr${yrs > 1 ? "s" : ""}`;
  }
  return `${n} months`;
}

const ROWS: {
  label: string;
  key: keyof Property;
  fmt: (v: number | null) => string;
}[] = [
  { label: "Down Payment", key: "down_payment", fmt: money },
  { label: "Monthly Payment", key: "monthly_payment", fmt: money },
  { label: "Option Fee", key: "option_fee", fmt: money },
  { label: "Lease Term", key: "lease_term_months", fmt: months },
  { label: "Interest Rate", key: "interest_rate", fmt: pct },
  { label: "Balloon Due", key: "balloon_months", fmt: months },
];

export function FinancingTerms({ property }: { property: Property }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financing Terms</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {ROWS.map(({ label, key, fmt }) => (
            <div key={key}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium mt-0.5">
                {fmt(property[key] as number | null)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

import type { ReactNode } from "react";
import { analyzeRatio, formatCurrency, type RatioTone } from "../lib/pricing";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-2xl">{children}</h2>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {description}
      </p>
    </header>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint ? (
        <span className="block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  inputMode,
  prefix,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "decimal" | "text";
  prefix?: string;
  type?: string;
}) {
  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
          {prefix}
        </span>
      ) : null}
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30 ${
          prefix ? "pl-9" : ""
        }`}
      />
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "ghost" | "accent";
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : variant === "accent"
        ? "border border-accent/40 bg-accent/5 text-foreground hover:bg-accent/10"
        : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}

export function ResultRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          strong
            ? "text-sm font-semibold text-foreground"
            : "text-sm font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

const TONE_STYLES: Record<RatioTone, string> = {
  loss: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-warning/40 bg-warning/15 text-warning-foreground",
  ok: "border-warning/30 bg-warning/10 text-warning-foreground",
  good: "border-success/30 bg-success/10 text-success",
  great: "border-success/40 bg-success/15 text-success",
  excellent: "border-success/50 bg-success/20 text-success",
};

export function AnalysisBox({
  tone,
  title,
  detail,
}: {
  tone: RatioTone;
  title: string;
  detail: string;
}) {
  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${TONE_STYLES[tone]}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-0.5">{detail}</p>
    </div>
  );
}

export function EmptyState({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "warning";
}) {
  const toneClass =
    tone === "warning"
      ? "border-warning/40 bg-warning/10 text-warning-foreground"
      : "border-border bg-surface text-muted-foreground";
  return (
    <div
      className={`flex h-full min-h-48 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm ${toneClass}`}
    >
      {children}
    </div>
  );
}

export type PricingRow = { label: string; value: string; emphasis?: boolean };

export function PricingResult({
  cost,
  price,
  netValue,
  ratio,
  rows,
  detail,
}: {
  cost: number;
  price: number;
  netValue: number;
  ratio: number;
  rows: PricingRow[];
  detail?: string[];
}) {
  const analysis = analyzeRatio(ratio, cost, netValue);
  const profit = netValue - cost;
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Resultado
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-x-10 gap-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Valor líquido</p>
            <p className="font-display text-4xl">{formatCurrency(netValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Proporção líquido / custo
            </p>
            <p className="font-display text-4xl">{ratio.toFixed(3)}x</p>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-border pt-4 sm:grid-cols-2">
        <ResultRow label="Custo do produto" value={formatCurrency(cost)} />
        <ResultRow label="Preço de venda" value={formatCurrency(price)} />
        {rows.map((row) => (
          <ResultRow
            key={row.label}
            label={row.label}
            value={row.value}
            strong={row.emphasis}
          />
        ))}
        <ResultRow
          label="Lucro por unidade"
          value={formatCurrency(profit)}
          strong
        />
      </dl>

      {detail && detail.length > 0 ? (
        <details className="rounded-md border border-border bg-surface p-3 text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            Ver cálculo detalhado
          </summary>
          <div className="mt-2 space-y-1 font-mono text-xs text-foreground">
            {detail.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </details>
      ) : null}

      <AnalysisBox
        tone={analysis.tone}
        title={analysis.title}
        detail={analysis.detail}
      />
    </div>
  );
}

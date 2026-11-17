import { useMemo, useState } from "react";
import {
  formatCurrency,
  formatPercent,
  suggestTikTokPrice,
  tiktokResult,
  TIKTOK_SFP_RATE,
  type TikTokOptions,
} from "../lib/pricing";
import { parseNumber } from "../lib/utils";
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  PricingResult,
  TextField,
  type PricingRow,
} from "./common";

export function TikTokCalculator() {
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [target, setTarget] = useState("1.20");
  const [sfp, setSfp] = useState(true);
  const [extraPercent, setExtraPercent] = useState("");
  const [extraFixed, setExtraFixed] = useState("");

  const costValue = parseNumber(cost);
  const priceValue = parseNumber(price);
  const targetValue = parseNumber(target) ?? 1.2;

  const options: TikTokOptions = useMemo(
    () => ({
      sfp,
      extraRate: (parseNumber(extraPercent) ?? 0) / 100,
      extraFixed: parseNumber(extraFixed) ?? 0,
    }),
    [sfp, extraPercent, extraFixed],
  );

  const result = useMemo(() => {
    if (costValue === null || costValue <= 0 || priceValue === null) return null;
    return tiktokResult(costValue, priceValue, options);
  }, [costValue, priceValue, options]);

  const suggestion =
    costValue !== null && costValue > 0
      ? suggestTikTokPrice(costValue, options, targetValue)
      : null;

  const hasExtra = options.extraRate !== 0 || options.extraFixed !== 0;

  const rows: PricingRow[] = [];
  const detail: string[] = [];
  if (result !== null) {
    const { fee } = result;
    rows.push({
      label: `Comissão (${formatPercent(fee.commissionRate)} + ${formatCurrency(
        fee.commissionFixed,
      )})`,
      value: formatCurrency(fee.commission),
    });
    detail.push(
      `Comissão = ${formatPercent(fee.commissionRate)} de ${formatCurrency(
        result.price,
      )} + ${formatCurrency(fee.commissionFixed)} = ${formatCurrency(
        fee.commission,
      )}`,
    );
    if (sfp) {
      rows.push({
        label: `Programa de Frete (${formatPercent(TIKTOK_SFP_RATE)})`,
        value: formatCurrency(fee.sfp),
      });
      detail.push(
        `SFP = ${formatPercent(TIKTOK_SFP_RATE)} de ${formatCurrency(
          result.price,
        )} = ${formatCurrency(fee.sfp)}`,
      );
    }
    if (hasExtra) {
      rows.push({
        label: `Outros custos (${formatPercent(options.extraRate)} + ${formatCurrency(
          options.extraFixed,
        )})`,
        value: formatCurrency(fee.extra),
      });
      detail.push(
        `Outros = ${formatPercent(options.extraRate)} de ${formatCurrency(
          result.price,
        )} + ${formatCurrency(options.extraFixed)} = ${formatCurrency(fee.extra)}`,
      );
    }
    detail.push(
      `${formatCurrency(result.price)} - ${formatCurrency(
        fee.total,
      )} = ${formatCurrency(result.netValue)}`,
      `${formatCurrency(result.netValue)} / ${formatCurrency(
        result.cost,
      )} = ${result.ratio.toFixed(3)}x`,
    );
  }

  const sfpRate = sfp ? TIKTOK_SFP_RATE : 0;
  const extraRate = options.extraRate;
  const extraFixedLabel =
    options.extraFixed !== 0 ? ` + ${options.extraFixed.toFixed(2)}` : "";
  const divisorA = 1 - 0.1 - sfpRate - extraRate;
  const divisorB = 1 - 0.06 - sfpRate - extraRate;

  return (
    <div>
      <PageHeader
        eyebrow="Calculadora"
        title="TikTok Shop"
        description="Comissão por faixa de preço (abaixo de R$ 50 ou R$ 50 ou mais), Programa de Frete opcional e outros custos por venda. Sugere o preço de venda para atingir a proporção alvo sobre o custo."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <div className="space-y-5">
            <Field label="Custo do produto">
              <TextField
                value={cost}
                onChange={setCost}
                inputMode="decimal"
                prefix="R$"
                placeholder="0,00"
              />
            </Field>

            <Field label="Preço de venda sugerido">
              <TextField
                value={price}
                onChange={setPrice}
                inputMode="decimal"
                prefix="R$"
                placeholder="0,00"
              />
            </Field>

            <Field
              label="Proporção alvo (líquido / custo)"
              hint="Usada na sugestão de preço abaixo. Ex: 1,20 = 20% de retorno sobre o custo."
            >
              <TextField
                value={target}
                onChange={setTarget}
                inputMode="decimal"
                placeholder="1,20"
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={sfp}
                onChange={(event) => setSfp(event.target.checked)}
                className="h-4 w-4 accent-current"
              />
              Inscrito no Programa de Frete (SFP): +6% sobre o preço
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Outros custos (%)"
                hint="Afiliados, anúncios, impostos..."
              >
                <TextField
                  value={extraPercent}
                  onChange={setExtraPercent}
                  inputMode="decimal"
                  placeholder="0"
                />
              </Field>
              <Field label="Outros custos fixos" hint="Por venda (embalagem...)">
                <TextField
                  value={extraFixed}
                  onChange={setExtraFixed}
                  inputMode="decimal"
                  prefix="R$"
                  placeholder="0,00"
                />
              </Field>
            </div>

            {suggestion !== null ? (
              <button
                type="button"
                onClick={() => setPrice(suggestion.toFixed(2))}
                className="w-full rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent/10"
              >
                Sugerir preço para proporção {targetValue.toFixed(2)}x:{" "}
                <span className="font-semibold">
                  {formatCurrency(suggestion)}
                </span>
              </button>
            ) : null}

            <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Tarifas e fórmula</p>
              <ul className="mt-1 space-y-0.5">
                <li>Abaixo de R$ 50: 10% + R$ 4,00</li>
                <li>R$ 50 ou mais: 6% + R$ 6,00</li>
                <li>Programa de Frete (se inscrito): +6%</li>
              </ul>
              <ul className="mt-2 space-y-0.5 font-mono">
                <li>
                  V &lt; 50: V = (C × {targetValue.toFixed(2)} + 4
                  {extraFixedLabel}) / {divisorA.toFixed(2)}
                </li>
                <li>
                  V ≥ 50: V = (C × {targetValue.toFixed(2)} + 6
                  {extraFixedLabel}) / {divisorB.toFixed(2)}
                </li>
              </ul>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setCost("");
                setPrice("");
                setTarget("1.20");
                setSfp(true);
                setExtraPercent("");
                setExtraFixed("");
              }}
            >
              Limpar campos
            </Button>
          </div>
        </Card>

        <div>
          {result === null ? (
            <EmptyState>
              Informe custo e preço de venda para ver o resultado.
            </EmptyState>
          ) : (
            <PricingResult
              cost={result.cost}
              price={result.price}
              netValue={result.netValue}
              ratio={result.ratio}
              rows={rows}
              detail={detail}
            />
          )}
        </div>
      </div>
    </div>
  );
}

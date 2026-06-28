import { useMemo, useState } from "react";
import {
  formatCurrency,
  formatPercent,
  shopeeResult,
  suggestShopeePrice,
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
} from "./common";

export function ShopeeCalculator() {
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [target, setTarget] = useState("1.20");

  const costValue = parseNumber(cost);
  const priceValue = parseNumber(price);
  const targetValue = parseNumber(target) ?? 1.2;

  const result = useMemo(() => {
    if (costValue === null || costValue <= 0 || priceValue === null) return null;
    return shopeeResult(costValue, priceValue);
  }, [costValue, priceValue]);

  const suggestion =
    costValue !== null && costValue > 0
      ? suggestShopeePrice(costValue, targetValue)
      : null;

  return (
    <div>
      <PageHeader
        eyebrow="Calculadora"
        title="Shopee"
        description="A tarifa da plataforma é um percentual sobre o preço mais um valor fixo, conforme a faixa de preço de venda."
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
              <p className="font-medium text-foreground">Tarifas por faixa</p>
              <ul className="mt-1 space-y-0.5">
                <li>Até R$ 79,99: 20% + R$ 4,00</li>
                <li>R$ 80,00 a R$ 99,99: 14% + R$ 16,00</li>
                <li>R$ 100,00 a R$ 199,99: 14% + R$ 20,00</li>
                <li>R$ 200,00 ou mais: 14% + R$ 26,00</li>
              </ul>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setCost("");
                setPrice("");
                setTarget("1.20");
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
              rows={[
                {
                  label: `Tarifa (${formatPercent(result.fee.rate)} + ${formatCurrency(
                    result.fee.fixed,
                  )})`,
                  value: formatCurrency(result.fee.total),
                },
              ]}
              detail={[
                `Tarifa = ${formatPercent(result.fee.rate)} de ${formatCurrency(
                  result.price,
                )} + ${formatCurrency(result.fee.fixed)} = ${formatCurrency(
                  result.fee.total,
                )}`,
                `${formatCurrency(result.price)} - ${formatCurrency(
                  result.fee.total,
                )} = ${formatCurrency(result.netValue)}`,
                `${formatCurrency(result.netValue)} / ${formatCurrency(
                  result.cost,
                )} = ${result.ratio.toFixed(3)}x`,
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

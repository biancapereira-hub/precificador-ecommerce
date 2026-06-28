import { useMemo, useState } from "react";
import {
  AMAZON_CATEGORIES,
  amazonCommissionRate,
  amazonResult,
  formatCurrency,
  formatPercent,
  suggestAmazonPrice,
} from "../lib/pricing";
import { parseNumber } from "../lib/utils";
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  PricingResult,
  SelectField,
  TextField,
} from "./common";

export function AmazonCalculator() {
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState<string>(AMAZON_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("1.20");

  const costValue = parseNumber(cost);
  const priceValue = parseNumber(price);
  const weightValue = parseNumber(weight);
  const targetValue = parseNumber(target) ?? 1.2;

  const result = useMemo(() => {
    if (costValue === null || costValue <= 0 || priceValue === null) return null;
    return amazonResult(costValue, priceValue, category, weightValue);
  }, [costValue, priceValue, category, weightValue]);

  const suggestion =
    costValue !== null && costValue > 0
      ? suggestAmazonPrice(costValue, category, weightValue, targetValue)
      : null;

  return (
    <div>
      <PageHeader
        eyebrow="Calculadora"
        title="Amazon"
        description="A comissão é definida pela categoria do produto e o frete segue a tabela oficial por faixa de preço. Para preços acima de R$ 78,99 o peso é obrigatório."
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

            <Field
              label="Categoria"
              hint={`Comissão atual: ${formatPercent(
                amazonCommissionRate(category, priceValue ?? 0),
              )}`}
            >
              <SelectField
                value={category}
                onChange={setCategory}
                options={AMAZON_CATEGORIES}
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
              label="Peso do produto (kg)"
              hint="Obrigatório para preços acima de R$ 78,99."
            >
              <TextField
                value={weight}
                onChange={setWeight}
                inputMode="decimal"
                placeholder="0,450"
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
              suggestion.needsWeight ? (
                <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                  Informe o peso para sugerirmos um preço com a proporção alvo.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrice(suggestion.price.toFixed(2))}
                  className="w-full rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent/10"
                >
                  Sugerir preço para proporção {targetValue.toFixed(2)}x:{" "}
                  <span className="font-semibold">
                    {formatCurrency(suggestion.price)}
                  </span>
                </button>
              )
            ) : null}

            <Button
              variant="ghost"
              onClick={() => {
                setCost("");
                setPrice("");
                setWeight("");
                setTarget("1.20");
                setCategory(AMAZON_CATEGORIES[0]);
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
          ) : result.needsWeight ? (
            <EmptyState tone="warning">
              Para este preço precisamos do peso para calcular o frete.
            </EmptyState>
          ) : (
            <PricingResult
              cost={result.cost}
              price={result.price}
              netValue={result.netValue}
              ratio={result.ratio}
              rows={[
                ...(result.weightKg !== null
                  ? [
                      {
                        label: "Peso considerado",
                        value: `${result.weightKg.toFixed(3)} kg`,
                      },
                    ]
                  : []),
                { label: "Frete", value: formatCurrency(result.freight) },
                {
                  label: `Comissão (${formatPercent(result.commissionRate)})`,
                  value: formatCurrency(result.commissionValue),
                },
              ]}
              detail={[
                `${formatCurrency(result.price)} (preço) - ${formatCurrency(
                  result.freight,
                )} (frete) - ${formatCurrency(
                  result.commissionValue,
                )} (comissão) = ${formatCurrency(result.netValue)}`,
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

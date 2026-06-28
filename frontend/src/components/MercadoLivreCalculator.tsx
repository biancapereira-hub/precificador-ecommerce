import { useMemo, useState } from "react";
import {
  MERCADO_LIVRE_LISTING_TYPES,
  formatCurrency,
  formatPercent,
  mercadoLivreFixedFee,
  mercadoLivreResult,
  suggestMercadoLivrePrice,
  type MercadoLivreListingType,
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

export function MercadoLivreCalculator() {
  const [cost, setCost] = useState("");
  const [listingType, setListingType] =
    useState<MercadoLivreListingType>("classico");
  const [commissionPercent, setCommissionPercent] = useState("14");
  const [fixedFeeManual, setFixedFeeManual] = useState("");
  const [useAutoFixedFee, setUseAutoFixedFee] = useState(true);
  const [shipping, setShipping] = useState("");
  const [price, setPrice] = useState("");
  const [target, setTarget] = useState("1.20");

  const costValue = parseNumber(cost);
  const priceValue = parseNumber(price);
  const commissionValue = parseNumber(commissionPercent);
  const autoFixedFee = priceValue !== null ? mercadoLivreFixedFee(priceValue) : 0;
  const fixedFeeValue = useAutoFixedFee ? autoFixedFee : (parseNumber(fixedFeeManual) ?? 0);
  const shippingValue = parseNumber(shipping) ?? 0;
  const targetValue = parseNumber(target) ?? 1.2;

  const result = useMemo(() => {
    if (
      costValue === null ||
      costValue <= 0 ||
      priceValue === null ||
      commissionValue === null
    ) {
      return null;
    }
    return mercadoLivreResult(
      costValue,
      priceValue,
      commissionValue / 100,
      fixedFeeValue,
      shippingValue,
    );
  }, [costValue, priceValue, commissionValue, fixedFeeValue, shippingValue]);

  const suggestion =
    costValue !== null && costValue > 0 && commissionValue !== null
      ? suggestMercadoLivrePrice(
          costValue,
          commissionValue / 100,
          fixedFeeValue,
          shippingValue,
          targetValue,
        )
      : null;

  function applyListingType(type: MercadoLivreListingType) {
    setListingType(type);
    const found = MERCADO_LIVRE_LISTING_TYPES.find((item) => item.id === type);
    if (found) setCommissionPercent(String(found.suggestedRate * 100));
  }

  const currentType = MERCADO_LIVRE_LISTING_TYPES.find(
    (t) => t.id === listingType,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Calculadora"
        title="Mercado Livre"
        description="A tarifa varia conforme a modalidade (Clássico ou Premium) e a categoria. Informe a comissão da sua categoria e, se houver, o custo fixo e o frete por sua conta."
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

            <Field label="Tipo de anúncio">
              <div className="flex gap-2">
                {MERCADO_LIVRE_LISTING_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => applyListingType(type.id)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      listingType === type.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label="Comissão (%)"
              hint={`Faixa do tipo selecionado: ${
                currentType?.rangeLabel ?? ""
              }. A porcentagem exata varia por categoria - confirme no painel do Mercado Livre. Algumas categorias com preço entre R$ 150 e R$ 700 pagam tarifa menor.`}
            >
              <TextField
                value={commissionPercent}
                onChange={setCommissionPercent}
                inputMode="decimal"
                placeholder="14"
              />
            </Field>

            <Field
              label="Custo fixo por unidade (R$)"
              hint={
                useAutoFixedFee
                  ? `Calculado automaticamente: ${priceValue !== null && priceValue > 0 ? `R$ ${autoFixedFee.toFixed(2).replace(".", ",")}` : "informe o preço"} (< R$12,50: 50% do valor | R$12,50–R$29: R$6,25 | R$29–R$50: R$6,50 | R$50–R$79: R$6,75 | R$79+: sem custo fixo)`
                  : "Informe manualmente o custo fixo cobrado pelo Mercado Livre."
              }
            >
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={useAutoFixedFee}
                    onChange={(e) => setUseAutoFixedFee(e.target.checked)}
                    className="rounded border-input"
                  />
                  Calcular automaticamente
                </label>
              </div>
              {!useAutoFixedFee ? (
                <TextField
                  value={fixedFeeManual}
                  onChange={setFixedFeeManual}
                  inputMode="decimal"
                  prefix="R$"
                  placeholder="0,00"
                />
              ) : null}
            </Field>

            <Field
              label="Frete por sua conta (R$) - opcional"
              hint="Se você oferece frete grátis, informe o valor que fica por sua conta."
            >
              <TextField
                value={shipping}
                onChange={setShipping}
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

            <Button
              variant="ghost"
              onClick={() => {
                setCost("");
                setPrice("");
                setFixedFeeManual("");
                setUseAutoFixedFee(true);
                setShipping("");
                setTarget("1.20");
                applyListingType("classico");
              }}
            >
              Limpar campos
            </Button>
          </div>
        </Card>

        <div>
          {result === null ? (
            <EmptyState>
              Informe custo, comissão e preço de venda para ver o resultado.
            </EmptyState>
          ) : (
            <PricingResult
              cost={result.cost}
              price={result.price}
              netValue={result.netValue}
              ratio={result.ratio}
              rows={[
                {
                  label: `Comissão (${formatPercent(result.fee.commissionRate)})`,
                  value: formatCurrency(result.fee.commissionValue),
                },
                ...(result.fee.fixedFee > 0
                  ? [
                      {
                        label: "Custo fixo",
                        value: formatCurrency(result.fee.fixedFee),
                      },
                    ]
                  : []),
                ...(result.fee.shipping > 0
                  ? [
                      {
                        label: "Frete por sua conta",
                        value: formatCurrency(result.fee.shipping),
                      },
                    ]
                  : []),
                { label: "Tarifa total", value: formatCurrency(result.fee.total) },
              ]}
              detail={[
                `Tarifa = ${formatCurrency(result.fee.commissionValue)} (comissão)${
                  result.fee.fixedFee > 0
                    ? ` + ${formatCurrency(result.fee.fixedFee)} (custo fixo)`
                    : ""
                }${
                  result.fee.shipping > 0
                    ? ` + ${formatCurrency(result.fee.shipping)} (frete)`
                    : ""
                } = ${formatCurrency(result.fee.total)}`,
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

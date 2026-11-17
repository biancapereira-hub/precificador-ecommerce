import { useMemo, useState } from "react";
import { analyzeRatio, formatCurrency } from "../lib/pricing";
import { parseNumber } from "../lib/utils";
import {
  AnalysisBox,
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  ResultRow,
  TextField,
} from "./common";

export function SimpleCalculator() {
  const [cost, setCost] = useState("");
  const [net, setNet] = useState("");
  const [target, setTarget] = useState("1.20");

  const costValue = parseNumber(cost);
  const netValue = parseNumber(net);
  const targetValue = parseNumber(target) ?? 1.2;

  const result = useMemo(() => {
    if (costValue === null || costValue <= 0 || netValue === null) return null;
    const ratio = netValue / costValue;
    return {
      cost: costValue,
      netValue,
      ratio,
      profit: netValue - costValue,
      analysis: analyzeRatio(ratio, costValue, netValue),
    };
  }, [costValue, netValue]);

  const suggestion =
    costValue !== null && costValue > 0
      ? Math.ceil(costValue * targetValue * 100) / 100
      : null;

  return (
    <div>
      <PageHeader
        eyebrow="Calculadora"
        title="Calculadora simplificada"
        description="Para quando as taxas já foram descontadas: informe o custo do produto e o valor que você vai receber, e veja a proporção líquido / custo."
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
              label="Valor que vou receber"
              hint="Valor líquido, já sem as taxas do marketplace."
            >
              <TextField
                value={net}
                onChange={setNet}
                inputMode="decimal"
                prefix="R$"
                placeholder="0,00"
              />
            </Field>

            <Field
              label="Proporção alvo (líquido / custo)"
              hint="Usada na sugestão abaixo. Ex: 1,20 = 20% de retorno sobre o custo."
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
                onClick={() => setNet(suggestion.toFixed(2))}
                className="w-full rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent/10"
              >
                Sugerir valor a receber para proporção {targetValue.toFixed(2)}x:{" "}
                <span className="font-semibold">
                  {formatCurrency(suggestion)}
                </span>
              </button>
            ) : null}

            <Button
              variant="ghost"
              onClick={() => {
                setCost("");
                setNet("");
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
              Informe o custo e o valor a receber para ver o resultado.
            </EmptyState>
          ) : (
            <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Resultado
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-x-10 gap-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor líquido</p>
                    <p className="font-display text-4xl">
                      {formatCurrency(result.netValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Proporção líquido / custo
                    </p>
                    <p className="font-display text-4xl">
                      {result.ratio.toFixed(3)}x
                    </p>
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-border pt-4 sm:grid-cols-2">
                <ResultRow
                  label="Custo do produto"
                  value={formatCurrency(result.cost)}
                />
                <ResultRow
                  label="Valor a receber"
                  value={formatCurrency(result.netValue)}
                />
                <ResultRow
                  label="Lucro por unidade"
                  value={formatCurrency(result.profit)}
                  strong
                />
              </dl>

              <details className="rounded-md border border-border bg-surface p-3 text-sm">
                <summary className="cursor-pointer text-muted-foreground">
                  Ver cálculo detalhado
                </summary>
                <div className="mt-2 space-y-1 font-mono text-xs text-foreground">
                  <div>
                    {formatCurrency(result.netValue)} /{" "}
                    {formatCurrency(result.cost)} = {result.ratio.toFixed(3)}x
                  </div>
                  <div>
                    {formatCurrency(result.netValue)} -{" "}
                    {formatCurrency(result.cost)} ={" "}
                    {formatCurrency(result.profit)}
                  </div>
                </div>
              </details>

              <AnalysisBox
                tone={result.analysis.tone}
                title={result.analysis.title}
                detail={result.analysis.detail}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

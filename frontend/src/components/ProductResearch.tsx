import { useState } from "react";
import { researchProduct, type ResearchResult } from "../lib/api";
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  TextField,
} from "./common";

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded-md border border-input bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
    >
      {copied ? "Copiado" : (label ?? "Copiar")}
    </button>
  );
}

function Block({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function formatDimensions(result: ResearchResult): string | null {
  const dim = result.dimensionsCm;
  if (!dim) return null;
  const parts: string[] = [];
  if (dim.length != null) parts.push(`C ${dim.length} cm`);
  if (dim.width != null) parts.push(`L ${dim.width} cm`);
  if (dim.height != null) parts.push(`A ${dim.height} cm`);
  return parts.length > 0 ? parts.join(" x ") : null;
}

export function ProductResearch() {
  const [productName, setProductName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);

  async function handleSearch() {
    if (productName.trim().length < 2) {
      setError("Digite o nome do produto.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await researchProduct(productName, notes);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const dimensions = result ? formatDimensions(result) : null;

  return (
    <div>
      <PageHeader
        eyebrow="Cadastro"
        title="Pesquisa de produto"
        description="Informe o nome do produto e gere uma sugestão de cadastro (título com SEO, GTIN, medidas, peso, descrição e materiais) com base em dados encontrados na web."
      />
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <Card>
        <div className="space-y-4">
          <Field label="Nome do produto">
            <TextField
              value={productName}
              onChange={setProductName}
              placeholder="Ex: Garrafa térmica inox 1 litro"
            />
          </Field>
          <Field
            label="Observações (opcional)"
            hint="Detalhes como marca, cor, modelo ou variação ajudam a refinar a busca."
          >
            <TextField
              value={notes}
              onChange={setNotes}
              placeholder="Ex: cor preta, tampa com alça"
            />
          </Field>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Pesquisando..." : "Pesquisar produto"}
          </Button>
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </Card>

      <div>
        {result === null ? (
          <Card>
            <EmptyState>
              {loading
                ? "Buscando informações na web..."
                : "Os dados sugeridos para o cadastro aparecerão aqui."}
            </EmptyState>
          </Card>
        ) : (
          <div className="space-y-4">
            {!result.aiEnhanced ? (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
                Resultado gerado a partir de páginas públicas, sem IA. Confira e
                ajuste os campos antes de publicar.
              </div>
            ) : null}

            <Block
              title="Título sugerido (SEO)"
              action={<CopyButton text={result.seoTitle} />}
            >
              <p className="text-sm text-foreground">{result.seoTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.seoTitle.length} caracteres
              </p>
            </Block>

            <div className="grid gap-4 sm:grid-cols-2">
              <Block title="Categoria sugerida">
                <p className="text-sm text-foreground">
                  {result.category ?? "Não identificada"}
                </p>
              </Block>
              <Block title="GTIN / EAN">
                <p className="text-sm text-foreground">
                  {result.gtin && result.gtin.trim() !== ""
                    ? result.gtin
                    : "Não encontrado"}
                </p>
                {result.gtinNote ? (
                  <p className="mt-1 text-xs text-muted-foreground">{result.gtinNote}</p>
                ) : null}
              </Block>
              <Block title="Medidas estimadas">
                <p className="text-sm text-foreground">
                  {dimensions ?? "Não identificadas"}
                </p>
              </Block>
              <Block title="Peso estimado">
                <p className="text-sm text-foreground">
                  {result.weightKg != null
                    ? `${result.weightKg} kg`
                    : "Não identificado"}
                </p>
              </Block>
            </div>

            <Block
              title="Descrição completa"
              action={<CopyButton text={result.description} />}
            >
              <p className="whitespace-pre-line text-sm text-foreground">
                {result.description}
              </p>
            </Block>

            {result.bulletPoints.length > 0 ? (
              <Block title="Pontos principais">
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                  {result.bulletPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {result.materials.length > 0 ? (
              <Block title="Composição / materiais">
                <div className="flex flex-wrap gap-2">
                  {result.materials.map((material, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </Block>
            ) : null}

            {result.keywords.length > 0 ? (
              <Block
                title="Palavras-chave"
                action={<CopyButton text={result.keywords.join(", ")} />}
              >
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Block>
            ) : null}

            {result.imageSuggestions.length > 0 ? (
              <Block title="Sugestões de imagens">
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                  {result.imageSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {result.referenceImages.length > 0 ? (
              <Block title="Imagens de referência (apenas para consulta)">
                <div className="flex flex-wrap gap-3">
                  {result.referenceImages.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block h-24 w-24 overflow-hidden rounded-lg border border-border bg-surface"
                    >
                      <img
                        src={url}
                        alt={`Referência ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </Block>
            ) : null}

            {result.warnings.length > 0 ? (
              <Block title="Avisos">
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {result.sources.length > 0 ? (
              <Block title="Fontes consultadas">
                <ul className="space-y-1 text-sm">
                  {result.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-accent underline"
                      >
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

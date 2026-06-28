import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  SelectField,
  TextField,
} from "./common";

const DENSITY_OPTIONS = [
  "203 dpi (8 pontos/mm) - padrao",
  "152 dpi (6 pontos/mm)",
  "300 dpi (12 pontos/mm)",
  "600 dpi (24 pontos/mm)",
] as const;

const DENSITY_TO_DPMM: Record<string, string> = {
  "203 dpi (8 pontos/mm) - padrao": "8",
  "152 dpi (6 pontos/mm)": "6",
  "300 dpi (12 pontos/mm)": "12",
  "600 dpi (24 pontos/mm)": "24",
};

const CONTRAST_OPTIONS = [
  "Alto contraste (escuro) - ideal para impressao",
  "Normal (sem ajuste)",
] as const;

function parseInches(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 15) return null;
  return parsed;
}

/** Count printable labels by sending the full ZPL to Labelary sequentially. */

function enhanceContrast(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const threshold = 180;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    if (gray < threshold) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a single label PNG from Labelary by index.
 * Sends the ENTIRE ZPL so that ~DGR graphic data is available.
 * Returns null when the index is out of range (no more labels).
 * Retries with exponential backoff on rate-limit errors.
 */
async function fetchLabelPng(
  fullZpl: string,
  dpmm: string,
  width: number,
  height: number,
  index: number,
): Promise<HTMLImageElement | null> {
  const maxRetries = 5;
  let retryDelay = 2000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const form = new FormData();
    form.append(
      "file",
      new Blob([fullZpl], { type: "text/plain" }),
      "label.zpl",
    );
    const response = await fetch(
      `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${width}x${height}/${index}/`,
      {
        method: "POST",
        headers: { Accept: "image/png" },
        body: form,
      },
    );
    if (response.status === 404) return null;
    if (response.status === 429 || (!response.ok && (await response.clone().text()).toLowerCase().includes("rate limit"))) {
      if (attempt < maxRetries) {
        await delay(retryDelay);
        retryDelay *= 2;
        continue;
      }
      throw new Error("Limite de requisições do Labelary excedido. Aguarde alguns minutos e tente novamente.");
    }
    if (!response.ok) {
      const text = (await response.text().catch(() => "")).trim();
      if (
        text.toLowerCase().includes("no labels") ||
        text.toLowerCase().includes("out of range")
      ) {
        return null;
      }
      throw new Error(
        text || `Erro ao renderizar etiqueta (status ${response.status}).`,
      );
    }
    const blob = await response.blob();
    if (blob.size === 0) return null;
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Falha ao carregar imagem da etiqueta."));
      };
      img.src = url;
    });
  }
  return null;
}

function buildPdf(
  images: HTMLCanvasElement[],
  widthIn: number,
  heightIn: number,
): Blob {
  const widthMm = widthIn * 25.4;
  const heightMm = heightIn * 25.4;
  const orientation = widthMm > heightMm ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: [widthMm, heightMm],
  });

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage([widthMm, heightMm], orientation);
    const canvas = images[i];
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, widthMm, heightMm);
  }

  return pdf.output("blob");
}

export function LabelConverter() {
  const [zpl, setZpl] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [density, setDensity] = useState<string>(DENSITY_OPTIONS[0]);
  const [contrast, setContrast] = useState<string>(CONTRAST_OPTIONS[0]);
  const [widthIn, setWidthIn] = useState("4");
  const [heightIn, setHeightIn] = useState("6");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLabels, setPdfLabels] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetPdf() {
    setPdfUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setPdfLabels(0);
  }

  async function handleFile(file: File) {
    const text = await file.text();
    setZpl(text);
    setFileName(file.name);
    setError(null);
    resetPdf();
  }

  function applyPreset(w: string, h: string) {
    setWidthIn(w);
    setHeightIn(h);
    resetPdf();
  }

  async function generate() {
    setError(null);
    const content = zpl.trim();
    if (!content.includes("^XA")) {
      setError(
        "Cole um codigo ZPL valido ou envie um arquivo. O ZPL deve conter ao menos um bloco iniciando com ^XA.",
      );
      return;
    }
    const width = parseInches(widthIn);
    const height = parseInches(heightIn);
    if (width === null || height === null) {
      setError(
        "Informe largura e altura validas em polegadas (entre 0 e 15). Ex: 4 x 6.",
      );
      return;
    }

    const dpmm = DENSITY_TO_DPMM[density] ?? "8";
    const applyContrast = contrast === CONTRAST_OPTIONS[0];
    setLoading(true);
    setProgress("Separando etiquetas...");
    resetPdf();

    try {
      const canvases: HTMLCanvasElement[] = [];
      let index = 0;

      while (true) {
        setProgress(
          `Renderizando etiqueta ${index + 1}${canvases.length > 0 ? ` de ${index + 1}+` : ""}...`,
        );
        if (index > 0) {
          await delay(1500);
        }
        const img = await fetchLabelPng(content, dpmm, width, height, index);
        if (!img) break;

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Falha ao criar canvas.");
        ctx.drawImage(img, 0, 0);

        if (applyContrast) {
          enhanceContrast(canvas);
        }

        canvases.push(canvas);
        index++;
      }

      if (canvases.length === 0) {
        throw new Error(
          "Nenhuma etiqueta foi gerada pelo Labelary. Verifique se o ZPL esta correto.",
        );
      }

      setProgress("Montando PDF...");
      const pdfBlob = buildPdf(canvases, width, height);
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setPdfLabels(canvases.length);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao converter o ZPL. Tente novamente.",
      );
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  function downloadZpl() {
    const content = zpl.trim();
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName ?? "etiquetas").replace(/\.[^.]+$/, "") + ".zpl";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setZpl("");
    setFileName(null);
    setError(null);
    resetPdf();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <PageHeader
        eyebrow="Etiquetas"
        title="ZPL para PDF"
        description="Cole o codigo ZPL ou envie um arquivo (.zpl, .txt, .prn) e gere um PDF pronto para impressao. Cada etiqueta (bloco ^XA ... ^XZ) vira uma pagina."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <div className="space-y-4">
            <Field
              label="Codigo ZPL"
              hint="Cole aqui o conteudo ZPL. Voce tambem pode enviar um arquivo abaixo."
            >
              <textarea
                value={zpl}
                onChange={(event) => {
                  setZpl(event.target.value);
                  setFileName(null);
                }}
                placeholder="^XA&#10;^FO50,50^A0N,40,40^FDExemplo^FS&#10;^XZ"
                rows={8}
                className="w-full rounded-md border border-input bg-card px-3 py-2 font-mono text-xs shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </Field>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zpl,.txt,.prn"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                }}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-secondary/70"
              />
              {fileName ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Arquivo carregado: {fileName}
                </p>
              ) : null}
            </div>

            <Field label="Densidade da impressora">
              <SelectField
                value={density}
                onChange={(value) => {
                  setDensity(value);
                  resetPdf();
                }}
                options={DENSITY_OPTIONS}
              />
            </Field>

            <Field
              label="Contraste da impressao"
              hint="'Alto contraste' escurece textos e codigos de barras para ficarem bem visiveis na impressora termica. Use 'Normal' apenas se a etiqueta ja estiver escura o suficiente."
            >
              <SelectField
                value={contrast}
                onChange={(value) => {
                  setContrast(value);
                  resetPdf();
                }}
                options={CONTRAST_OPTIONS}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Largura (pol)">
                <TextField
                  value={widthIn}
                  onChange={(value) => {
                    setWidthIn(value);
                    resetPdf();
                  }}
                  inputMode="decimal"
                  placeholder="4"
                />
              </Field>
              <Field label="Altura (pol)">
                <TextField
                  value={heightIn}
                  onChange={(value) => {
                    setHeightIn(value);
                    resetPdf();
                  }}
                  inputMode="decimal"
                  placeholder="6"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => applyPreset("4", "6")}>
                10x15 cm (4x6 pol)
              </Button>
              <Button variant="ghost" onClick={() => applyPreset("4.33", "5.91")}>
                11x15 cm (Brasil)
              </Button>
              <Button variant="ghost" onClick={() => applyPreset("4", "2.5")}>
                10x6 cm
              </Button>
              <Button variant="ghost" onClick={() => applyPreset("3", "2")}>
                7,5x5 cm
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={() => void generate()} disabled={loading}>
                {loading ? progress || "Convertendo..." : "Gerar PDF"}
              </Button>
              <Button
                variant="accent"
                onClick={downloadZpl}
                disabled={loading || zpl.trim() === ""}
              >
                Baixar ZPL
              </Button>
              <Button variant="ghost" onClick={clearAll} disabled={loading}>
                Limpar
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tem impressora Zebra/ZPL? O resultado mais fiel e enviar o arquivo
              ZPL direto para a impressora (botao "Baixar ZPL"), sem passar por
              PDF.
            </p>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="flex flex-col">
          {pdfUrl ? (
            <div className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {pdfLabels > 0
                    ? `${pdfLabels} etiqueta(s) gerada(s).`
                    : "PDF gerado."}
                </p>
                <a
                  href={pdfUrl}
                  download="etiquetas.pdf"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  Baixar PDF
                </a>
              </div>
              <iframe
                title="Pre-visualizacao das etiquetas"
                src={pdfUrl}
                className="h-[28rem] w-full rounded-md border border-border bg-surface"
              />
              <p className="text-xs text-muted-foreground">
                Ao imprimir, escolha "Tamanho real" / 100% e o papel 10x15 cm.
                Evite "Ajustar a pagina", que reduz a etiqueta e deixa o texto
                apagado.
              </p>
            </div>
          ) : (
            <EmptyState>
              Gere o PDF para visualizar e baixar as etiquetas aqui.
            </EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}

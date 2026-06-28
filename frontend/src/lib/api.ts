export type ResearchDimensions = {
  length: number | null;
  width: number | null;
  height: number | null;
};

export type ResearchResult = {
  productName: string;
  seoTitle: string;
  category: string | null;
  description: string;
  bulletPoints: string[];
  materials: string[];
  dimensionsCm: ResearchDimensions | null;
  weightKg: number | null;
  gtin: string | null;
  gtinNote: string;
  keywords: string[];
  imageSuggestions: string[];
  referenceImages: string[];
  sources: string[];
  warnings: string[];
  aiEnhanced: boolean;
};

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export async function researchProduct(
  productName: string,
  extraNotes?: string,
): Promise<ResearchResult> {
  const response = await fetch(`${API_BASE_URL}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName,
      extraNotes: extraNotes && extraNotes.trim() !== "" ? extraNotes : null,
    }),
  });

  if (!response.ok) {
    let message = "Não foi possível concluir a pesquisa. Tente novamente.";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data.detail) message = data.detail;
    } catch {
      // mantém a mensagem padrão
    }
    throw new Error(message);
  }

  return (await response.json()) as ResearchResult;
}

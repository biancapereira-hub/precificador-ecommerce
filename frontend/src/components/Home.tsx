import { Button, Card, PageHeader } from "./common";

export type ToolId =
  | "amazon"
  | "shopee"
  | "mercado-livre"
  | "tiktok"
  | "simplificada"
  | "pesquisa"
  | "etiquetas"
  | "como-precificar";

type Tool = {
  id: ToolId;
  title: string;
  description: string;
  badge?: string;
  available: boolean;
};

const TOOLS: Tool[] = [
  {
    id: "amazon",
    title: "Calculadora Amazon",
    description:
      "Comissão por categoria e frete por faixa de preço e peso. Calcula valor líquido e proporção sobre o custo.",
    available: true,
  },
  {
    id: "shopee",
    title: "Calculadora Shopee",
    description:
      "Tarifa por faixa de preço (percentual + valor fixo). Mostra valor líquido e proporção sobre o custo.",
    available: true,
  },
  {
    id: "mercado-livre",
    title: "Calculadora Mercado Livre",
    description:
      "Anúncio Clássico ou Premium, com comissão, custo fixo e frete editáveis por categoria.",
    available: true,
  },
  {
    id: "tiktok",
    title: "Calculadora Tik Tok",
    description:
      "Comissão do TikTok Shop por faixa (abaixo de R$ 50 ou acima), Programa de Frete e outros custos. Sugere o preço para a proporção alvo.",
    available: true,
  },
  {
    id: "simplificada",
    title: "Calculadora simplificada",
    description:
      "Já descontou as taxas? Informe só o custo e o valor que vai receber para ver a proporção líquido / custo.",
    available: true,
  },
  {
    id: "etiquetas",
    title: "Etiquetas (ZPL para PDF)",
    description:
      "Converta o código ZPL ou um arquivo em PDF pronto para impressão das etiquetas de envio.",
    available: true,
  },
  {
    id: "como-precificar",
    title: "Como Precificar?",
    description:
      "Guia completo sobre o que considerar ao definir preços: custos, taxas por plataforma, margem de lucro e dicas práticas.",
    available: true,
  },
  {
    id: "pesquisa",
    title: "Pesquisa de produto",
    description:
      "A partir do nome do produto, busca dados para o cadastro: título com SEO, medidas, peso, descrição e materiais.",
    badge: "em breve",
    available: false,
  },
];

export function Home({ onNavigate }: { onNavigate: (id: ToolId) => void }) {
  return (
    <div>
      <PageHeader
        eyebrow="Precifica"
        title="Ferramentas da equipe"
        description="Escolha uma ferramenta para começar. As calculadoras seguem as regras de cada marketplace e a conversão de etiquetas gera PDFs prontos para impressão."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Card key={tool.id} className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl">{tool.title}</h2>
                {tool.badge ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {tool.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {tool.description}
              </p>
            </div>
            <div>
              <Button
                variant={tool.available ? "primary" : "ghost"}
                onClick={() => onNavigate(tool.id)}
              >
                {tool.available ? "Abrir" : "Ver detalhes"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

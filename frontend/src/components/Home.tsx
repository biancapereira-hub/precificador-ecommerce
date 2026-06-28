import { Button, Card, PageHeader } from "./common";

export type ToolId =
  | "amazon"
  | "shopee"
  | "mercado-livre"
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
      "Comissao por categoria e frete por faixa de preco e peso. Calcula valor liquido e proporcao sobre o custo.",
    available: true,
  },
  {
    id: "shopee",
    title: "Calculadora Shopee",
    description:
      "Tarifa por faixa de preco (percentual + valor fixo). Mostra valor liquido e proporcao sobre o custo.",
    available: true,
  },
  {
    id: "mercado-livre",
    title: "Calculadora Mercado Livre",
    description:
      "Anuncio Classico ou Premium, com comissao, custo fixo e frete editaveis por categoria.",
    available: true,
  },
  {
    id: "etiquetas",
    title: "Etiquetas (ZPL para PDF)",
    description:
      "Converta o codigo ZPL ou um arquivo em PDF pronto para impressao das etiquetas de envio.",
    available: true,
  },
  {
    id: "como-precificar",
    title: "Como Precificar?",
    description:
      "Guia completo sobre o que considerar ao definir precos: custos, taxas por plataforma, margem de lucro e dicas praticas.",
    available: true,
  },
  {
    id: "pesquisa",
    title: "Pesquisa de produto",
    description:
      "A partir do nome do produto, busca dados para o cadastro: titulo com SEO, medidas, peso, descricao e materiais.",
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
        description="Escolha uma ferramenta para comecar. As calculadoras seguem as regras de cada marketplace e a conversao de etiquetas gera PDFs prontos para impressao."
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

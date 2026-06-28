import { Card, PageHeader } from "./common";

const PLANNED_FIELDS = [
  "Título sugerido com foco em SEO",
  "Descrição completa do produto",
  "GTIN / EAN",
  "Medidas (altura, largura, comprimento)",
  "Peso",
  "Composição / materiais",
  "Imagens de referência",
];

export function ProductResearchSoon() {
  return (
    <div>
      <PageHeader
        eyebrow="Pesquisa de produto"
        title="Em breve"
        description="A pesquisa automática a partir do nome do produto está sendo preparada. As calculadoras (Amazon, Shopee e Mercado Livre) já estão disponíveis e prontas para uso."
      />

      <Card>
        <p className="text-sm text-muted-foreground">
          Quando estiver no ar, você informará o nome do produto e receberá os
          dados prontos para o cadastro na loja:
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {PLANNED_FIELDS.map((field) => (
            <li
              key={field}
              className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
              />
              {field}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

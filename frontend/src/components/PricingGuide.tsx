import { Card, PageHeader } from "./common";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </Card>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

export function PricingGuide() {
  return (
    <div>
      <PageHeader
        eyebrow="Guia"
        title="Como Precificar?"
        description="Entenda o que considerar na hora de definir o preço dos seus produtos para vender em marketplaces com lucro real."
      />

      <div className="space-y-6">
        <Section title="O que considerar ao definir o preço">
          <p className="text-sm text-muted-foreground">
            O preço de venda precisa cobrir todos os custos envolvidos e ainda
            deixar uma margem de lucro. Muitos vendedores iniciantes cometem o
            erro de olhar apenas o custo do produto e esquecem das taxas da
            plataforma, frete e embalagem.
          </p>
          <p className="text-sm font-medium text-foreground">
            Fórmula básica:
          </p>
          <div className="rounded-md border border-border bg-secondary/50 px-4 py-3 text-sm font-mono text-foreground">
            Preço de Venda = (Custo Total) / (1 - % Margem Desejada)
          </div>
          <p className="text-sm text-muted-foreground">
            Onde o Custo Total inclui: custo do produto + frete de entrada +
            embalagem + taxas da plataforma + impostos + custo de devolução
            estimado.
          </p>
        </Section>

        <Section title="Custos envolvidos no e-commerce">
          <p className="text-sm text-muted-foreground">
            Antes de definir o preço, levante todos os custos abaixo. Ignorar
            qualquer um deles pode transformar uma venda aparentemente lucrativa
            em prejuízo.
          </p>
          <ul className="space-y-2">
            <ListItem>
              <strong>Custo do produto:</strong> valor pago ao fornecedor,
              incluindo frete até seu estoque.
            </ListItem>
            <ListItem>
              <strong>Embalagem:</strong> caixa, fita, enchimento, etiqueta.
              Parece pouco, mas acumula.
            </ListItem>
            <ListItem>
              <strong>Frete de envio ao cliente:</strong> pode ser grátis para o
              comprador, mas alguém paga. Verifique se a plataforma subsidia ou
              se sai do seu bolso.
            </ListItem>
            <ListItem>
              <strong>Comissão da plataforma:</strong> percentual cobrado sobre
              cada venda (varia por marketplace e categoria).
            </ListItem>
            <ListItem>
              <strong>Tarifa fixa:</strong> algumas plataformas cobram um valor
              fixo por venda além da comissão.
            </ListItem>
            <ListItem>
              <strong>Custo de anúncio/publicidade:</strong> se você investe em
              ads dentro da plataforma para ganhar visibilidade.
            </ListItem>
            <ListItem>
              <strong>Impostos:</strong> ICMS, Simples Nacional, nota fiscal —
              depende do seu regime tributário.
            </ListItem>
            <ListItem>
              <strong>Devoluções e trocas:</strong> reserve uma margem para
              cobrir pedidos devolvidos (frete de retorno + produto danificado).
            </ListItem>
            <ListItem>
              <strong>Taxa de antecipação:</strong> se você antecipa recebíveis
              (Mercado Pago, por exemplo), há um custo adicional.
            </ListItem>
          </ul>
        </Section>

        <Section title="Taxas por plataforma">
          <p className="text-sm text-muted-foreground">
            Cada marketplace tem sua própria estrutura de tarifas. Conheça as
            principais diferenças:
          </p>

          <div className="space-y-4">
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Amazon
              </h3>
              <ul className="mt-2 space-y-1.5">
                <ListItem>
                  Comissão por categoria: entre 8% e 15% (maioria 15%).
                </ListItem>
                <ListItem>
                  Frete FBA (Fulfillment by Amazon): varia por peso e dimensão
                  do produto.
                </ListItem>
                <ListItem>
                  Taxa de armazenamento mensal se usar o estoque da Amazon (FBA).
                </ListItem>
                <ListItem>
                  Sem tarifa fixa por venda no plano Profissional.
                </ListItem>
              </ul>
            </div>

            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Shopee
              </h3>
              <ul className="mt-2 space-y-1.5">
                <ListItem>
                  Comissão: percentual que varia por faixa de preço (ex.: 14% +
                  R$2 até R$8 para produtos na faixa mais comum).
                </ListItem>
                <ListItem>
                  Taxa fixa por transação cobrada junto com a comissão.
                </ListItem>
                <ListItem>
                  Frete grátis subsidiado pela Shopee em muitos casos (mas nem
                  sempre cobre 100%).
                </ListItem>
                <ListItem>
                  Programa de Frete Grátis Extra: você paga uma taxa para
                  participar.
                </ListItem>
              </ul>
            </div>

            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Mercado Livre
              </h3>
              <ul className="mt-2 space-y-1.5">
                <ListItem>
                  Anúncio Clássico: comissão entre 11% e 14% (sem parcelamento).
                </ListItem>
                <ListItem>
                  Anúncio Premium: comissão entre 16% e 19% (com até 12x sem
                  juros).
                </ListItem>
                <ListItem>
                  A comissão exata depende da categoria do produto. Premium paga
                  ~5% a mais em troca de parcelamento e maior visibilidade.
                </ListItem>
                <ListItem>
                  Custo fixo por unidade vendida: R$6,25 (R$12,50-R$29), R$6,50
                  (R$29-R$50), R$6,75 (R$50-R$79). Acima de R$79: sem custo
                  fixo.
                </ListItem>
                <ListItem>
                  Produtos abaixo de R$12,50 pagam 50% do valor como tarifa por
                  unidade.
                </ListItem>
                <ListItem>
                  Frete: acima de R$79, o Mercado Livre subsidia parte do frete
                  grátis. Abaixo disso, pode ficar com o vendedor.
                </ListItem>
                <ListItem>
                  Taxa de antecipação: se você recebe antes do prazo padrão,
                  paga uma taxa sobre o valor antecipado.
                </ListItem>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="Dicas práticas de precificação">
          <ul className="space-y-2">
            <ListItem>
              <strong>Use a proporção custo x preço:</strong> uma proporção de
              3x ou mais (preço = 3 vezes o custo) costuma garantir margem
              saudável após todas as taxas. Abaixo de 2x, fique atento.
            </ListItem>
            <ListItem>
              <strong>Pesquise a concorrência:</strong> veja quanto os outros
              vendedores cobram pelo mesmo produto. Se seu preço ficar muito
              acima, perde vendas; muito abaixo, perde margem.
            </ListItem>
            <ListItem>
              <strong>Considere o frete grátis:</strong> ofertas com frete grátis
              vendem mais, mas o custo do frete precisa estar embutido no preço.
              Faça a conta antes.
            </ListItem>
            <ListItem>
              <strong>Revise periodicamente:</strong> taxas de marketplace mudam,
              custos de fornecedor variam, o dólar sobe e desce. Revise seus
              preços pelo menos uma vez por mês.
            </ListItem>
            <ListItem>
              <strong>Calcule por SKU:</strong> cada produto tem custos
              diferentes (peso, fragilidade, categoria). Não use uma margem única
              para tudo.
            </ListItem>
            <ListItem>
              <strong>Teste preços:</strong> faça variações pequenas (R$2 a R$5)
              e observe o impacto nas vendas durante uma semana. Marketplace
              favorece quem tem bom giro.
            </ListItem>
            <ListItem>
              <strong>Não esqueça dos impostos:</strong> dependendo do seu regime
              (MEI, Simples, Lucro Presumido), o imposto pode representar de 4%
              a 15%+ do faturamento.
            </ListItem>
          </ul>
        </Section>

        <Section title="Resumo">
          <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm text-foreground">
              <strong>Preço de venda</strong> = Custo do produto + Embalagem +
              Frete + Comissão da plataforma + Tarifa fixa + Impostos + Margem de
              lucro + Reserva para devoluções.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use as calculadoras deste site para simular rapidamente o valor
              líquido de cada venda em cada plataforma e garantir que você está
              lucrando de verdade.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

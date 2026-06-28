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
        description="Entenda o que considerar na hora de definir o preco dos seus produtos para vender em marketplaces com lucro real."
      />

      <div className="space-y-6">
        <Section title="O que considerar ao definir o preco">
          <p className="text-sm text-muted-foreground">
            O preco de venda precisa cobrir todos os custos envolvidos e ainda
            deixar uma margem de lucro. Muitos vendedores iniciantes cometem o
            erro de olhar apenas o custo do produto e esquecem das taxas da
            plataforma, frete e embalagem.
          </p>
          <p className="text-sm font-medium text-foreground">
            Formula basica:
          </p>
          <div className="rounded-md border border-border bg-secondary/50 px-4 py-3 text-sm font-mono text-foreground">
            Preco de Venda = (Custo Total) / (1 - % Margem Desejada)
          </div>
          <p className="text-sm text-muted-foreground">
            Onde o Custo Total inclui: custo do produto + frete de entrada +
            embalagem + taxas da plataforma + impostos + custo de devolucao
            estimado.
          </p>
        </Section>

        <Section title="Custos envolvidos no e-commerce">
          <p className="text-sm text-muted-foreground">
            Antes de definir o preco, levante todos os custos abaixo. Ignorar
            qualquer um deles pode transformar uma venda aparentemente lucrativa
            em prejuizo.
          </p>
          <ul className="space-y-2">
            <ListItem>
              <strong>Custo do produto:</strong> valor pago ao fornecedor,
              incluindo frete ate seu estoque.
            </ListItem>
            <ListItem>
              <strong>Embalagem:</strong> caixa, fita, enchimento, etiqueta.
              Parece pouco, mas acumula.
            </ListItem>
            <ListItem>
              <strong>Frete de envio ao cliente:</strong> pode ser gratis para o
              comprador, mas alguem paga. Verifique se a plataforma subsidia ou
              se sai do seu bolso.
            </ListItem>
            <ListItem>
              <strong>Comissao da plataforma:</strong> percentual cobrado sobre
              cada venda (varia por marketplace e categoria).
            </ListItem>
            <ListItem>
              <strong>Tarifa fixa:</strong> algumas plataformas cobram um valor
              fixo por venda alem da comissao.
            </ListItem>
            <ListItem>
              <strong>Custo de anuncio/publicidade:</strong> se voce investe em
              ads dentro da plataforma para ganhar visibilidade.
            </ListItem>
            <ListItem>
              <strong>Impostos:</strong> ICMS, Simples Nacional, nota fiscal —
              depende do seu regime tributario.
            </ListItem>
            <ListItem>
              <strong>Devolucoes e trocas:</strong> reserve uma margem para
              cobrir pedidos devolvidos (frete de retorno + produto danificado).
            </ListItem>
            <ListItem>
              <strong>Taxa de antecipacao:</strong> se voce antecipa recebiveis
              (Mercado Pago, por exemplo), ha um custo adicional.
            </ListItem>
          </ul>
        </Section>

        <Section title="Taxas por plataforma">
          <p className="text-sm text-muted-foreground">
            Cada marketplace tem sua propria estrutura de tarifas. Conheca as
            principais diferencias:
          </p>

          <div className="space-y-4">
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Amazon
              </h3>
              <ul className="mt-2 space-y-1.5">
                <ListItem>
                  Comissao por categoria: entre 8% e 15% (maioria 15%).
                </ListItem>
                <ListItem>
                  Frete FBA (Fulfillment by Amazon): varia por peso e dimensao
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
                  Comissao: percentual que varia por faixa de preco (ex.: 14% +
                  R$2 ate R$8 para produtos na faixa mais comum).
                </ListItem>
                <ListItem>
                  Taxa fixa por transacao cobrada junto com a comissao.
                </ListItem>
                <ListItem>
                  Frete gratis subsidiado pela Shopee em muitos casos (mas nem
                  sempre cobre 100%).
                </ListItem>
                <ListItem>
                  Programa de Frete Gratis Extra: voce paga uma taxa para
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
                  Anuncio Classico: comissao entre 11% e 14% (sem parcelamento).
                </ListItem>
                <ListItem>
                  Anuncio Premium: comissao entre 16% e 19% (com ate 12x sem
                  juros).
                </ListItem>
                <ListItem>
                  A comissao exata depende da categoria do produto. Premium paga
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
                  gratis. Abaixo disso, pode ficar com o vendedor.
                </ListItem>
                <ListItem>
                  Taxa de antecipacao: se voce recebe antes do prazo padrao,
                  paga uma taxa sobre o valor antecipado.
                </ListItem>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="Dicas praticas de precificacao">
          <ul className="space-y-2">
            <ListItem>
              <strong>Use a proporcao custo x preco:</strong> uma proporcao de
              3x ou mais (preco = 3 vezes o custo) costuma garantir margem
              saudavel apos todas as taxas. Abaixo de 2x, fique atento.
            </ListItem>
            <ListItem>
              <strong>Pesquise a concorrencia:</strong> veja quanto os outros
              vendedores cobram pelo mesmo produto. Se seu preco ficar muito
              acima, perde vendas; muito abaixo, perde margem.
            </ListItem>
            <ListItem>
              <strong>Considere o frete gratis:</strong> ofertas com frete gratis
              vendem mais, mas o custo do frete precisa estar embutido no preco.
              Faca a conta antes.
            </ListItem>
            <ListItem>
              <strong>Revise periodicamente:</strong> taxas de marketplace mudam,
              custos de fornecedor variam, o dolar sobe e desce. Revise seus
              precos pelo menos uma vez por mes.
            </ListItem>
            <ListItem>
              <strong>Calcule por SKU:</strong> cada produto tem custos
              diferentes (peso, fragilidade, categoria). Nao use uma margem unica
              para tudo.
            </ListItem>
            <ListItem>
              <strong>Teste precos:</strong> faca variacoes pequenas (R$2 a R$5)
              e observe o impacto nas vendas durante uma semana. Marketplace
              favorece quem tem bom giro.
            </ListItem>
            <ListItem>
              <strong>Nao esqueca dos impostos:</strong> dependendo do seu regime
              (MEI, Simples, Lucro Presumido), o imposto pode representar de 4%
              a 15%+ do faturamento.
            </ListItem>
          </ul>
        </Section>

        <Section title="Resumo">
          <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm text-foreground">
              <strong>Preco de venda</strong> = Custo do produto + Embalagem +
              Frete + Comissao da plataforma + Tarifa fixa + Impostos + Margem de
              lucro + Reserva para devolucoes.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use as calculadoras deste site para simular rapidamente o valor
              liquido de cada venda em cada plataforma e garantir que voce esta
              lucrando de verdade.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

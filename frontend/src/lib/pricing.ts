// Lógica de precificação dos marketplaces.
// Portado fielmente das calculadoras originais (Amazon e Shopee).
// Funções puras, sem efeitos colaterais, para facilitar testes e reuso.

// ============================ AMAZON ============================

export const AMAZON_CATEGORIES = [
  "Comidas e bebidas",
  "Eletrodomésticos de linha branca",
  "Saúde e cuidados pessoais",
  "Bebidas alcoólicas",
  "Pneus e rodas",
  "Indústria e Ciência",
  "Produtos para bebês",
  "Produtos para animais de estimação",
  "Eletroportáteis de cuidado pessoal",
  "Cozinha",
  "Jardim e Piscina",
  "Brinquedos e jogos",
  "TV, áudio e cinema em casa",
  "PC",
  "Eletrônicos portáteis",
  "Peças e acessórios automotivos",
  "Casa",
  "Beleza",
  "Beleza de luxo",
  "Celulares",
  "Câmera e fotografia",
  "Videogames e consoles",
  "Esportes, aventura e lazer",
  "Ferramentas e Construção",
  "Papelaria e Escritório",
  "Bagagem e acessórios de viagem",
  "Roupas e acessórios",
  "Calçados, bolsas e óculos escuros",
  "Relógios",
  "Joias",
  "Livros",
  "Acessórios para eletrônicos e para PC",
  "Móveis",
  "Vídeo e DVD",
  "Música",
  "Instrumentos musicais e acessórios",
  "Demais categorias",
] as const;

export type AmazonCategory = (typeof AMAZON_CATEGORIES)[number];

const AMAZON_COMMISSIONS: Record<string, number> = {
  "Comidas e bebidas": 0.1,
  "Eletrodomésticos de linha branca": 0.11,
  "Saúde e cuidados pessoais": 0.12,
  "Bebidas alcoólicas": 0.11,
  "Pneus e rodas": 0.1,
  "Indústria e Ciência": 0.12,
  "Produtos para bebês": 0.12,
  "Produtos para animais de estimação": 0.12,
  "Eletroportáteis de cuidado pessoal": 0.12,
  Cozinha: 0.12,
  "Jardim e Piscina": 0.12,
  "Brinquedos e jogos": 0.12,
  "TV, áudio e cinema em casa": 0.1,
  PC: 0.12,
  "Eletrônicos portáteis": 0.13,
  "Peças e acessórios automotivos": 0.12,
  Casa: 0.12,
  Beleza: 0.13,
  "Beleza de luxo": 0.14,
  Celulares: 0.11,
  "Câmera e fotografia": 0.11,
  "Videogames e consoles": 0.11,
  "Esportes, aventura e lazer": 0.12,
  "Ferramentas e Construção": 0.11,
  "Papelaria e Escritório": 0.13,
  "Bagagem e acessórios de viagem": 0.14,
  "Roupas e acessórios": 0.14,
  "Calçados, bolsas e óculos escuros": 0.14,
  Relógios: 0.13,
  Joias: 0.14,
  Livros: 0.15,
  "Vídeo e DVD": 0.15,
  Música: 0.15,
  "Instrumentos musicais e acessórios": 0.12,
  "Demais categorias": 0.15,
};

export function amazonCommissionRate(category: string, price: number): number {
  if (category === "Acessórios para eletrônicos e para PC") {
    return price <= 100 ? 0.15 : 0.1;
  }
  if (category === "Móveis") {
    return price <= 200 ? 0.15 : 0.1;
  }
  return AMAZON_COMMISSIONS[category] ?? 0.15;
}

type FreightTable = { tiers: Array<[number, number]>; extra: number };

function amazonFreightTable(price: number): FreightTable {
  if (price <= 99.99) {
    return {
      tiers: [
        [0.25, 11.95], [0.5, 12.85], [1, 13.45], [2, 14.0],
        [3, 14.95], [4, 16.15], [5, 17.0], [6, 25.0],
        [7, 26.0], [8, 27.0], [9, 28.0], [10, 39.5],
      ],
      extra: 3.05,
    };
  }
  if (price <= 119.99) {
    return {
      tiers: [
        [0.25, 15.0], [0.5, 15.0], [1, 15.7], [2, 16.35],
        [3, 17.45], [4, 18.85], [5, 19.9], [6, 30.0],
        [7, 31.0], [8, 32.0], [9, 33.0], [10, 46.0],
      ],
      extra: 3.05,
    };
  }
  if (price <= 149.99) {
    return {
      tiers: [
        [0.25, 15.95], [0.5, 17.15], [1, 17.95], [2, 18.75],
        [3, 19.95], [4, 21.55], [5, 22.75], [6, 34.0],
        [7, 35.0], [8, 36.0], [9, 37.0], [10, 52.75],
      ],
      extra: 3.05,
    };
  }
  if (price <= 199.99) {
    return {
      tiers: [
        [0.25, 17.95], [0.5, 19.3], [1, 20.2], [2, 21.1],
        [3, 22.4], [4, 24.2], [5, 25.6], [6, 38.0],
        [7, 39.0], [8, 40.0], [9, 41.0], [10, 59.0],
      ],
      extra: 3.05,
    };
  }
  return {
    tiers: [
      [0.25, 20.45], [0.5, 20.95], [1, 21.95], [2, 23.45],
      [3, 24.45], [4, 25.95], [5, 27.95], [6, 36.95],
      [7, 39.45], [8, 40.45], [9, 46.95], [10, 65.95],
    ],
    extra: 4.0,
  };
}

export type AmazonFreightResult =
  | { needsWeight: true }
  | { needsWeight: false; freight: number };

export function amazonFreight(
  price: number,
  weightKg?: number | null,
): AmazonFreightResult {
  if (price <= 30) return { needsWeight: false, freight: 4.5 };
  if (price <= 49.99) return { needsWeight: false, freight: 6.5 };
  if (price <= 78.99) return { needsWeight: false, freight: 6.75 };
  if (weightKg == null) return { needsWeight: true };

  const { tiers, extra } = amazonFreightTable(price);
  for (const [limit, value] of tiers) {
    if (weightKg <= limit + 0.0001) return { needsWeight: false, freight: value };
  }
  const last = tiers[tiers.length - 1];
  return { needsWeight: false, freight: last[1] + (weightKg - last[0]) * extra };
}

export type AmazonResult =
  | { needsWeight: true }
  | {
      needsWeight: false;
      cost: number;
      price: number;
      weightKg: number | null;
      freight: number;
      commissionRate: number;
      commissionValue: number;
      netValue: number;
      ratio: number;
    };

export function amazonResult(
  cost: number,
  price: number,
  category: string,
  weightKg?: number | null,
): AmazonResult {
  const freightResult = amazonFreight(price, weightKg);
  if (freightResult.needsWeight) return { needsWeight: true };

  const commissionRate = amazonCommissionRate(category, price);
  const commissionValue = price * commissionRate;
  const netValue = price - freightResult.freight - commissionValue;
  const ratio = cost > 0 ? netValue / cost : 0;

  return {
    needsWeight: false,
    cost,
    price,
    weightKg: weightKg ?? null,
    freight: freightResult.freight,
    commissionRate,
    commissionValue,
    netValue,
    ratio,
  };
}

// ============================ SHOPEE ============================

export type ShopeeFee = {
  rate: number;
  fixed: number;
  total: number;
};

export function shopeeFee(price: number): ShopeeFee {
  let rate: number;
  let fixed: number;
  if (price <= 79.99) {
    rate = 0.2;
    fixed = 4.0;
  } else if (price <= 99.99) {
    rate = 0.14;
    fixed = 16.0;
  } else if (price <= 199.99) {
    rate = 0.14;
    fixed = 20.0;
  } else if (price <= 499.99) {
    rate = 0.14;
    fixed = 26.0;
  } else {
    rate = 0.14;
    fixed = 26.0;
  }
  const total = price * rate + fixed;
  return { rate, fixed, total };
}

export type ShopeeResult = {
  cost: number;
  price: number;
  fee: ShopeeFee;
  netValue: number;
  ratio: number;
};

export function shopeeResult(cost: number, price: number): ShopeeResult {
  const fee = shopeeFee(price);
  const netValue = price - fee.total;
  const ratio = cost > 0 ? netValue / cost : 0;
  return { cost, price, fee, netValue, ratio };
}

// ========================= MERCADO LIVRE =========================

// Faixas de comissão do Mercado Livre por tipo de anúncio. A porcentagem exata
// varia por categoria, por isso o valor fica editável na tela. Use a faixa como
// referência e confirme a comissão da sua categoria no painel do Mercado Livre.
export const MERCADO_LIVRE_LISTING_TYPES = [
  {
    id: "classico",
    label: "Clássico",
    minRate: 0.11,
    maxRate: 0.14,
    suggestedRate: 0.14,
    rangeLabel: "11% a 14%",
  },
  {
    id: "premium",
    label: "Premium",
    minRate: 0.16,
    maxRate: 0.19,
    suggestedRate: 0.19,
    rangeLabel: "16% a 19%",
  },
] as const;

/**
 * Calcula o custo fixo do Mercado Livre com base no preço de venda (2026).
 * Produtos abaixo de R$12,50 pagam 50% do valor como tarifa.
 * Acima de R$79, não há custo fixo (frete grátis subsidiado compensa).
 */
export function mercadoLivreFixedFee(price: number): number {
  if (price < 12.5) return price * 0.5;
  if (price <= 29) return 6.25;
  if (price <= 50) return 6.5;
  if (price < 79) return 6.75;
  return 0;
}

export type MercadoLivreListingType =
  (typeof MERCADO_LIVRE_LISTING_TYPES)[number]["id"];

export type MercadoLivreFee = {
  commissionRate: number;
  commissionValue: number;
  fixedFee: number;
  shipping: number;
  total: number;
};

export type MercadoLivreResult = {
  cost: number;
  price: number;
  fee: MercadoLivreFee;
  netValue: number;
  ratio: number;
};

export function mercadoLivreResult(
  cost: number,
  price: number,
  commissionRate: number,
  fixedFee: number,
  shipping: number,
): MercadoLivreResult {
  const commissionValue = price * commissionRate;
  const total = commissionValue + fixedFee + shipping;
  const netValue = price - total;
  const ratio = cost > 0 ? netValue / cost : 0;
  return {
    cost,
    price,
    fee: { commissionRate, commissionValue, fixedFee, shipping, total },
    netValue,
    ratio,
  };
}

// ====================== ANÁLISE DA PROPORÇÃO ======================

export type RatioTone = "loss" | "warning" | "ok" | "good" | "great" | "excellent";

export type RatioAnalysis = {
  tone: RatioTone;
  title: string;
  detail: string;
};

export function analyzeRatio(
  ratio: number,
  cost: number,
  netValue: number,
): RatioAnalysis {
  const profit = netValue - cost;
  if (ratio < 1.0) {
    return {
      tone: "loss",
      title: "Prejuízo: o valor líquido é menor que o custo",
      detail: `Perda de ${formatCurrency(cost - netValue)} por unidade.`,
    };
  }
  if (ratio < 1.2) {
    return {
      tone: "warning",
      title: "Muito apertado (menos de 20% de retorno sobre o custo)",
      detail: `Lucro de apenas ${formatCurrency(profit)} por unidade.`,
    };
  }
  if (ratio < 1.5) {
    return {
      tone: "ok",
      title: "Razoável, mas ainda apertado (20% a 50% de retorno sobre o custo)",
      detail: `Lucro de ${formatCurrency(profit)} por unidade.`,
    };
  }
  if (ratio < 2.0) {
    return {
      tone: "good",
      title: "Bom (50% a 100% de retorno sobre o custo)",
      detail: `Lucro de ${formatCurrency(profit)} por unidade.`,
    };
  }
  if (ratio < 2.5) {
    return {
      tone: "great",
      title: "Muito bom (100% a 150% de retorno sobre o custo)",
      detail: `Lucro de ${formatCurrency(profit)} por unidade.`,
    };
  }
  return {
    tone: "excellent",
    title: "Excelente (mais de 150% de retorno sobre o custo)",
    detail: `Lucro de ${formatCurrency(profit)} por unidade.`,
  };
}

// ===================== SUGESTÃO DE PREÇO ALVO =====================
// Dado um custo e uma proporção alvo (líquido / custo), sugere o preço de venda.

function roundUpCents(value: number): number {
  return Math.ceil(value * 100) / 100;
}

export function suggestShopeePrice(
  cost: number,
  target = 1.2,
): number | null {
  if (!Number.isFinite(cost) || cost <= 0) return null;
  const bands = [
    { rate: 0.2, fixed: 4.0, max: 79.99 },
    { rate: 0.14, fixed: 16.0, max: 99.99 },
    { rate: 0.14, fixed: 20.0, max: 199.99 },
    { rate: 0.14, fixed: 26.0, max: Infinity },
  ];
  for (const band of bands) {
    const price = (target * cost + band.fixed) / (1 - band.rate);
    if (price <= band.max + 0.0001) return roundUpCents(price);
  }
  return null;
}

export function suggestMercadoLivrePrice(
  cost: number,
  commissionRate: number,
  fixedFee: number,
  shipping = 0,
  target = 1.2,
): number | null {
  if (!Number.isFinite(cost) || cost <= 0) return null;
  if (!Number.isFinite(commissionRate) || commissionRate >= 1) return null;
  const price = (target * cost + fixedFee + shipping) / (1 - commissionRate);
  if (!Number.isFinite(price) || price <= 0) return null;
  return roundUpCents(price);
}

export type AmazonSuggestion =
  | { needsWeight: true }
  | { needsWeight: false; price: number };

export function suggestAmazonPrice(
  cost: number,
  category: string,
  weightKg: number | null,
  target = 1.2,
): AmazonSuggestion | null {
  if (!Number.isFinite(cost) || cost <= 0) return null;
  const goal = target * cost;
  let lo = 0.5;
  let hi = Math.max(cost * 10, 1000);
  let needsWeight = false;

  const netAt = (price: number): number | null => {
    const freight = amazonFreight(price, weightKg);
    if (freight.needsWeight) {
      needsWeight = true;
      return null;
    }
    const rate = amazonCommissionRate(category, price);
    return price - freight.freight - price * rate;
  };

  let netHi = netAt(hi);
  for (let i = 0; i < 5 && (netHi == null || netHi < goal); i++) {
    hi *= 2;
    netHi = netAt(hi);
  }
  if (netHi == null) return { needsWeight: true };
  if (netHi < goal) return null;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const net = netAt(mid);
    if (net == null) return { needsWeight: true };
    if (net >= goal) hi = mid;
    else lo = mid;
    if (hi - lo < 0.005) break;
  }
  return { needsWeight, price: roundUpCents(hi) };
}

// ============================ FORMATO ============================

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(3)}x`;
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

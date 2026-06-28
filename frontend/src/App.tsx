import { useState } from "react";
import { Home } from "./components/Home";
import { AmazonCalculator } from "./components/AmazonCalculator";
import { ShopeeCalculator } from "./components/ShopeeCalculator";
import { MercadoLivreCalculator } from "./components/MercadoLivreCalculator";
import { LabelConverter } from "./components/LabelConverter";
import { ProductResearchSoon } from "./components/ProductResearchSoon";
import { PricingGuide } from "./components/PricingGuide";

type TabId =
  | "inicio"
  | "amazon"
  | "shopee"
  | "mercado-livre"
  | "etiquetas"
  | "como-precificar"
  | "pesquisa";

type Tab = {
  id: TabId;
  label: string;
  badge?: string;
};

const TABS: Tab[] = [
  { id: "inicio", label: "Inicio" },
  { id: "amazon", label: "Amazon" },
  { id: "shopee", label: "Shopee" },
  { id: "mercado-livre", label: "Mercado Livre" },
  { id: "etiquetas", label: "Etiquetas" },
  { id: "como-precificar", label: "Como Precificar?" },
  { id: "pesquisa", label: "Pesquisa de produto", badge: "em breve" },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("inicio");

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <button
            type="button"
            onClick={() => setActiveTab("inicio")}
            className="flex items-baseline gap-2"
          >
            <span className="font-display text-2xl leading-none">Precifica</span>
            <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              marketplace toolkit
            </span>
          </button>
          <nav className="flex flex-wrap justify-end gap-1">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.badge ? (
                    <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {activeTab === "inicio" ? (
          <Home onNavigate={(id) => setActiveTab(id)} />
        ) : null}
        {activeTab === "amazon" ? <AmazonCalculator /> : null}
        {activeTab === "shopee" ? <ShopeeCalculator /> : null}
        {activeTab === "mercado-livre" ? <MercadoLivreCalculator /> : null}
        {activeTab === "etiquetas" ? <LabelConverter /> : null}
        {activeTab === "como-precificar" ? <PricingGuide /> : null}
        {activeTab === "pesquisa" ? <ProductResearchSoon /> : null}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          Precifica — uso interno da equipe. Confirme as tarifas vigentes nos
          painéis dos marketplaces antes de publicar preços.
        </div>
      </footer>
    </div>
  );
}

export default App;

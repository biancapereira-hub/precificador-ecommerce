# Precificador E-commerce

Site para calcular a margem (proporção líquido/custo) de produtos na Amazon e na
Shopee e para pesquisar dados de cadastro de produtos a partir do nome.

O projeto reúne, em um único site, duas ferramentas que antes eram feitas na
calculadora e à mão:

- **Calculadora Amazon**: preço − frete − comissão, com as tabelas de frete e as
  comissões por categoria.
- **Calculadora Shopee**: preço − tarifa, com as faixas de tarifação.
- **Pesquisa de produto**: a partir do nome, busca em páginas públicas e sugere
  título com SEO, GTIN/EAN, medidas, peso, descrição completa, materiais e
  imagens de referência para o cadastro.

## Estrutura

```
frontend/   Aplicação web (React + Vite + TypeScript + Tailwind)
backend/    API de pesquisa de produto (FastAPI + httpx + BeautifulSoup)
```

As calculadoras rodam inteiramente no navegador (apenas matemática). A pesquisa
de produto usa o backend, que busca e lê páginas públicas da web.

## Rodando localmente

### Backend

```bash
cd backend
uv venv
uv pip install -e .
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Aponta o frontend para o backend local:
echo 'VITE_API_URL=http://localhost:8000' > .env.local
npm run dev
```

## Observações

- A pesquisa de produto funciona sem chave de API, lendo páginas públicas. A
  precisão de campos como GTIN, peso e medidas depende do que as páginas
  publicam; sempre confira antes de cadastrar.
- A aba Mercado Livre está reservada para inclusão futura.

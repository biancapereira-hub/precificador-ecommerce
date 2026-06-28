"""Busca de páginas de referência na web sem necessidade de chave de API.

Tenta o endpoint HTML do DuckDuckGo e, se falhar, recorre ao Bing.
Retorna apenas as URLs dos resultados orgânicos.
"""

from __future__ import annotations

import re
from urllib.parse import parse_qs, unquote, urlparse

import httpx
from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

# Domínios preferidos para extrair dados de produto.
PREFERRED_DOMAINS = (
    "mercadolivre.com.br",
    "produto.mercadolivre.com.br",
    "amazon.com.br",
    "magazineluiza.com.br",
    "americanas.com.br",
    "shopee.com.br",
    "casasbahia.com.br",
)


def _clean_duckduckgo_url(href: str) -> str | None:
    if href.startswith("//duckduckgo.com/l/"):
        href = "https:" + href
    if "duckduckgo.com/l/" in href:
        query = parse_qs(urlparse(href).query)
        target = query.get("uddg", [None])[0]
        return unquote(target) if target else None
    if href.startswith("http"):
        return href
    return None


async def _search_duckduckgo(client: httpx.AsyncClient, query: str) -> list[str]:
    response = await client.post(
        "https://html.duckduckgo.com/html/",
        data={"q": query},
        headers={"User-Agent": USER_AGENT},
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    urls: list[str] = []
    for anchor in soup.select("a.result__a"):
        href = anchor.get("href")
        if not href:
            continue
        cleaned = _clean_duckduckgo_url(href)
        if cleaned:
            urls.append(cleaned)
    return urls


async def _search_bing(client: httpx.AsyncClient, query: str) -> list[str]:
    response = await client.get(
        "https://www.bing.com/search",
        params={"q": query, "setlang": "pt-br", "cc": "br"},
        headers={"User-Agent": USER_AGENT},
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    urls: list[str] = []
    for heading in soup.select("li.b_algo h2 a"):
        href = heading.get("href")
        if href and href.startswith("http"):
            urls.append(href)
    return urls


# Padrões típicos de páginas de listagem/busca (não têm dados de produto).
_LISTING_PATTERNS = re.compile(
    r"(lista\.|/busca|/list/|/search|/c/|/categoria|/s\?|/ofertas)",
    re.IGNORECASE,
)
# Padrões típicos de páginas de produto individuais.
_PRODUCT_PATTERNS = re.compile(
    r"(/p/|/produto|/MLB-?\d|/dp/|/item|-p-\d|/pd/)",
    re.IGNORECASE,
)


def _score_url(url: str) -> int:
    host = urlparse(url).netloc.lower()
    score = 0
    if any(domain in host for domain in PREFERRED_DOMAINS):
        score += 2
    if _PRODUCT_PATTERNS.search(url):
        score += 3
    if _LISTING_PATTERNS.search(url):
        score -= 3
    return score


def _dedupe_and_rank(urls: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for url in urls:
        normalized = url.split("#")[0]
        if normalized in seen:
            continue
        seen.add(normalized)
        unique.append(normalized)
    # Ordena por relevância mantendo a ordem original como desempate.
    return sorted(unique, key=lambda u: -_score_url(u))


async def search_product_pages(
    client: httpx.AsyncClient, product_name: str, limit: int = 6
) -> list[str]:
    query = f"{product_name} comprar"
    urls: list[str] = []
    for engine in (_search_duckduckgo, _search_bing):
        try:
            results = await engine(client, query)
            urls.extend(results)
        except (httpx.HTTPError, ValueError):
            continue
        if len(_dedupe_and_rank(urls)) >= limit:
            break

    ranked = _dedupe_and_rank(urls)
    # Remove resultados claramente irrelevantes (vídeos, buscas, etc.).
    filtered = [
        url
        for url in ranked
        if not re.search(r"(youtube\.com|google\.com|bing\.com|/search)", url)
    ]
    return (filtered or ranked)[:limit]

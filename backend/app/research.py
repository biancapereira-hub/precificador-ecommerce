"""Orquestra a pesquisa de produto: busca, extração e montagem da ficha."""

from __future__ import annotations

import asyncio
import re

import httpx

from .extract import PageData, fetch_page_data
from .search import search_product_pages

STOPWORDS = {
    "de", "da", "do", "para", "com", "sem", "em", "e", "a", "o", "os", "as",
    "um", "uma", "no", "na", "comprar", "kit",
}


def _title_case(text: str) -> str:
    return " ".join(
        word if word.isupper() else word.capitalize()
        for word in text.strip().split()
    )


def _build_seo_title(product_name: str, brand: str | None, materials: list[str]) -> str:
    base = _title_case(product_name)
    extras: list[str] = []
    if brand and brand.lower() not in base.lower():
        extras.append(brand)
    if materials:
        material = materials[0]
        if material.lower() not in base.lower():
            extras.append(material)
    extras.append("Original")
    extras.append("Pronta Entrega")

    title = base
    for extra in extras:
        candidate = f"{title} {extra}"
        if len(candidate) <= 100:
            title = candidate
        else:
            break
    return title[:100].strip()


def _build_keywords(product_name: str, brand: str | None) -> list[str]:
    tokens = [
        token.lower()
        for token in re.findall(r"[A-Za-zÀ-ÿ0-9]+", product_name)
        if token.lower() not in STOPWORDS and len(token) > 2
    ]
    keywords: list[str] = []
    seen: set[str] = set()

    def add(value: str) -> None:
        value = value.strip().lower()
        if value and value not in seen:
            seen.add(value)
            keywords.append(value)

    add(product_name.lower())
    base = " ".join(tokens)
    if base:
        add(base)
    for prefix in ("comprar", "melhor", "barato", "promoção"):
        add(f"{prefix} {base}".strip())
    for suffix in ("original", "atacado", "frete grátis", "qualidade"):
        add(f"{base} {suffix}".strip())
    if brand and brand.lower() not in base.lower():
        add(f"{base} {brand}".strip())
    for token in tokens:
        add(token)
    return keywords[:15]


def _build_description(
    product_name: str,
    brand: str | None,
    materials: list[str],
    weight_kg: float | None,
    dimensions_cm: dict[str, float],
) -> str:
    name = _title_case(product_name)
    paragraphs: list[str] = []

    intro = (
        f"O {name} foi pensado para unir qualidade e praticidade no dia a dia. "
        "Produto ideal para quem busca um item durável, funcional e com bom "
        "custo-benefício."
    )
    if brand:
        intro = (
            f"O {name} da marca {brand} foi pensado para unir qualidade e "
            "praticidade no dia a dia. Produto ideal para quem busca um item "
            "durável, funcional e com bom custo-benefício."
        )
    paragraphs.append(intro)

    specs: list[str] = []
    if materials:
        specs.append(f"Composição/materiais: {', '.join(materials)}.")
    if dimensions_cm:
        partes = []
        if dimensions_cm.get("length") is not None:
            partes.append(f"comprimento {dimensions_cm['length']} cm")
        if dimensions_cm.get("width") is not None:
            partes.append(f"largura {dimensions_cm['width']} cm")
        if dimensions_cm.get("height") is not None:
            partes.append(f"altura {dimensions_cm['height']} cm")
        if partes:
            specs.append(f"Medidas aproximadas: {', '.join(partes)}.")
    if weight_kg is not None:
        specs.append(f"Peso aproximado: {weight_kg} kg.")
    if specs:
        paragraphs.append("Especificações: " + " ".join(specs))

    paragraphs.append(
        "Confira as fotos e as informações antes de finalizar a compra. Em caso "
        "de dúvida sobre medidas, cores ou compatibilidade, entre em contato "
        "pelo chat da loja."
    )
    return "\n\n".join(paragraphs)


def _build_bullets(
    materials: list[str],
    weight_kg: float | None,
    dimensions_cm: dict[str, float],
) -> list[str]:
    bullets = [
        "Produto de qualidade, ideal para uso diário",
        "Bom custo-benefício e ótimo acabamento",
    ]
    if materials:
        bullets.append(f"Feito em {', '.join(materials)}")
    if dimensions_cm:
        partes = [f"{k} {v} cm" for k, v in dimensions_cm.items()]
        bullets.append("Medidas aproximadas: " + ", ".join(partes))
    if weight_kg is not None:
        bullets.append(f"Peso aproximado de {weight_kg} kg")
    bullets.append("Envio rápido e bem embalado")
    return bullets


IMAGE_SUGGESTIONS = [
    "Foto de capa do produto em fundo branco, bem iluminada",
    "Imagem do produto em uso ou em um ambiente real",
    "Foto destacando detalhes e acabamento",
    "Imagem com as dimensões/medidas do produto",
    "Foto da embalagem e do que acompanha o produto",
    "Imagem mostrando variações de cor ou tamanho, se houver",
]


def _aggregate_pages(pages: list[PageData]) -> dict:
    gtin: str | None = None
    weight_kg: float | None = None
    dimensions: dict[str, float] = {}
    materials: list[str] = []
    brand: str | None = None
    category: str | None = None
    images: list[str] = []
    sources: list[str] = []

    for page in pages:
        if page is None:
            continue
        sources.append(page.url)
        if not gtin and page.gtin:
            gtin = page.gtin
        if weight_kg is None and page.weight_kg is not None:
            weight_kg = page.weight_kg
        if not dimensions and page.dimensions_cm:
            dimensions = page.dimensions_cm
        if not brand and page.brand:
            brand = page.brand
        if not category and page.category:
            category = page.category
        for material in page.materials:
            if material not in materials:
                materials.append(material)
        for image in page.images:
            if image not in images:
                images.append(image)

    return {
        "gtin": gtin,
        "weight_kg": weight_kg,
        "dimensions": dimensions,
        "materials": materials[:6],
        "brand": brand,
        "category": category,
        "images": images[:6],
        "sources": sources,
    }


async def research_product(product_name: str, extra_notes: str | None) -> dict:
    query = product_name if not extra_notes else f"{product_name} {extra_notes}"

    async with httpx.AsyncClient(timeout=12.0) as client:
        urls = await search_product_pages(client, query, limit=6)
        pages = await asyncio.gather(
            *(fetch_page_data(client, url) for url in urls),
            return_exceptions=False,
        )

    valid_pages = [page for page in pages if page is not None]
    data = _aggregate_pages(valid_pages)

    seo_title = _build_seo_title(product_name, data["brand"], data["materials"])
    description = _build_description(
        product_name,
        data["brand"],
        data["materials"],
        data["weight_kg"],
        data["dimensions"],
    )
    bullets = _build_bullets(data["materials"], data["weight_kg"], data["dimensions"])
    keywords = _build_keywords(product_name, data["brand"])

    warnings: list[str] = []
    if not data["gtin"]:
        warnings.append(
            "GTIN/EAN não encontrado nas páginas pesquisadas. Confirme com o "
            "fornecedor ou cadastre na GS1 Brasil."
        )
    if not data["dimensions"] or not data["weight_kg"]:
        warnings.append(
            "Medidas e peso são estimativas ou não foram encontrados. Confirme "
            "antes de cadastrar para evitar erros no frete."
        )
    if not valid_pages:
        warnings.append(
            "Não foi possível obter dados das páginas. Tente um nome mais "
            "específico ou pesquise novamente."
        )

    gtin_note = (
        "GTIN encontrado em páginas públicas; confirme antes de cadastrar."
        if data["gtin"]
        else "Solicite o GTIN/EAN ao fornecedor ou gere um código na GS1 Brasil."
    )

    dimensions_payload = None
    if data["dimensions"]:
        dimensions_payload = {
            "length": data["dimensions"].get("length"),
            "width": data["dimensions"].get("width"),
            "height": data["dimensions"].get("height"),
        }

    return {
        "productName": product_name,
        "seoTitle": seo_title,
        "category": data["category"],
        "description": description,
        "bulletPoints": bullets,
        "materials": data["materials"],
        "dimensionsCm": dimensions_payload,
        "weightKg": data["weight_kg"],
        "gtin": data["gtin"],
        "gtinNote": gtin_note,
        "keywords": keywords,
        "imageSuggestions": IMAGE_SUGGESTIONS,
        "referenceImages": data["images"],
        "sources": data["sources"],
        "warnings": warnings,
        "aiEnhanced": False,
    }

"""Extração de dados de produto a partir do HTML de uma página.

Usa, prioritariamente, dados estruturados (JSON-LD schema.org/Product) e,
como complemento, expressões regulares sobre o texto visível.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from .search import USER_AGENT


@dataclass
class PageData:
    url: str
    title: str | None = None
    brand: str | None = None
    category: str | None = None
    gtin: str | None = None
    weight_kg: float | None = None
    dimensions_cm: dict[str, float] = field(default_factory=dict)
    materials: list[str] = field(default_factory=list)
    images: list[str] = field(default_factory=list)
    text: str = ""


def _to_float(raw: str) -> float | None:
    try:
        return float(raw.replace(".", "").replace(",", ".")) if raw.count(",") else float(raw)
    except ValueError:
        return None


def _valid_gtin(value: str) -> str | None:
    digits = re.sub(r"\D", "", value)
    if len(digits) in (8, 12, 13, 14):
        return digits
    return None


def _iter_jsonld(soup: BeautifulSoup):
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        if not script.string:
            continue
        try:
            data = json.loads(script.string)
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(data, list):
            yield from data
        elif isinstance(data, dict):
            if "@graph" in data and isinstance(data["@graph"], list):
                yield from data["@graph"]
            else:
                yield data


def _extract_from_jsonld(soup: BeautifulSoup, page: PageData) -> None:
    for node in _iter_jsonld(soup):
        if not isinstance(node, dict):
            continue
        node_type = node.get("@type", "")
        types = node_type if isinstance(node_type, list) else [node_type]
        if "Product" not in types:
            continue

        if not page.title and isinstance(node.get("name"), str):
            page.title = node["name"].strip()

        brand = node.get("brand")
        if isinstance(brand, dict):
            brand = brand.get("name")
        if not page.brand and isinstance(brand, str):
            page.brand = brand.strip()

        if not page.category and isinstance(node.get("category"), str):
            page.category = node["category"].strip()

        for key in ("gtin13", "gtin14", "gtin12", "gtin8", "gtin", "ean"):
            value = node.get(key)
            if value and not page.gtin:
                valid = _valid_gtin(str(value))
                if valid:
                    page.gtin = valid

        image = node.get("image")
        if isinstance(image, str):
            page.images.append(image)
        elif isinstance(image, list):
            page.images.extend(img for img in image if isinstance(img, str))
        elif isinstance(image, dict) and isinstance(image.get("url"), str):
            page.images.append(image["url"])

        weight = node.get("weight")
        if isinstance(weight, dict):
            value = _to_float(str(weight.get("value", "")))
            unit = str(weight.get("unitCode", "")).upper()
            if value is not None:
                page.weight_kg = value / 1000 if unit in ("GRM", "G") else value


_GTIN_TEXT = re.compile(
    r"(?:EAN|GTIN|c[óo]digo de barras)\s*[:\-]?\s*(\d[\d\s.\-]{7,16}\d)",
    re.IGNORECASE,
)
_WEIGHT_TEXT = re.compile(
    r"peso[^:\n]{0,25}?(\d+(?:[.,]\d+)?)\s*(kg|quilos?|g\b|gramas?)",
    re.IGNORECASE,
)
_DIM_TRIPLE = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm",
    re.IGNORECASE,
)
_DIM_SINGLE = {
    "length": re.compile(r"(?:comprimento|profundidade)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*cm", re.IGNORECASE),
    "width": re.compile(r"(?:largura)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*cm", re.IGNORECASE),
    "height": re.compile(r"(?:altura)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*cm", re.IGNORECASE),
}
_MATERIAL_TEXT = re.compile(
    r"(?:material|composi[çc][ãa]o)\s*[:\-]\s*([A-Za-zÀ-ÿ0-9 ,/\-]{3,60})",
    re.IGNORECASE,
)


def _extract_from_text(text: str, page: PageData) -> None:
    if not page.gtin:
        match = _GTIN_TEXT.search(text)
        if match:
            valid = _valid_gtin(match.group(1))
            if valid:
                page.gtin = valid

    if page.weight_kg is None:
        match = _WEIGHT_TEXT.search(text)
        if match:
            value = _to_float(match.group(1))
            unit = match.group(2).lower()
            if value is not None:
                page.weight_kg = value / 1000 if unit.startswith("g") else value

    if not page.dimensions_cm:
        triple = _DIM_TRIPLE.search(text)
        if triple:
            length = _to_float(triple.group(1))
            width = _to_float(triple.group(2))
            height = _to_float(triple.group(3))
            page.dimensions_cm = {
                key: value
                for key, value in (
                    ("length", length),
                    ("width", width),
                    ("height", height),
                )
                if value is not None
            }
        else:
            for key, pattern in _DIM_SINGLE.items():
                found = pattern.search(text)
                if found:
                    value = _to_float(found.group(1))
                    if value is not None:
                        page.dimensions_cm[key] = value

    if not page.materials:
        match = _MATERIAL_TEXT.search(text)
        if match:
            raw = match.group(1).strip(" .,-")
            parts = re.split(r"[,/]| e ", raw)
            page.materials = [
                part.strip().capitalize()
                for part in parts
                if 2 < len(part.strip()) < 30
            ][:5]


def _collect_images(soup: BeautifulSoup, base_url: str, page: PageData) -> None:
    og_image = soup.find("meta", attrs={"property": "og:image"})
    if og_image and og_image.get("content"):
        page.images.append(og_image["content"])

    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src or src.startswith("data:"):
            continue
        if re.search(
            r"(sprite|logo|icon|placeholder|banner|header|footer|"
            r"_next/static|static/media|/assets/|\.svg|\.gif)",
            src,
            re.IGNORECASE,
        ):
            continue
        page.images.append(urljoin(base_url, src))

    cleaned: list[str] = []
    seen: set[str] = set()
    for url in page.images:
        absolute = urljoin(base_url, url)
        if absolute.startswith("http") and absolute not in seen:
            seen.add(absolute)
            cleaned.append(absolute)
    page.images = cleaned[:6]


async def fetch_page_data(client: httpx.AsyncClient, url: str) -> PageData | None:
    page = PageData(url=url)
    try:
        response = await client.get(
            url, headers={"User-Agent": USER_AGENT}, follow_redirects=True
        )
        response.raise_for_status()
    except httpx.HTTPError:
        return None

    content_type = response.headers.get("content-type", "")
    if "html" not in content_type:
        return None

    soup = BeautifulSoup(response.text, "html.parser")

    if soup.title and soup.title.string:
        page.title = soup.title.string.strip()

    _extract_from_jsonld(soup, page)

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text = re.sub(r"\s+", " ", soup.get_text(" "))
    page.text = text[:20000]

    _extract_from_text(page.text, page)
    _collect_images(soup, url, page)

    if not page.category:
        host = urlparse(url).netloc
        page.category = None if host else None

    return page

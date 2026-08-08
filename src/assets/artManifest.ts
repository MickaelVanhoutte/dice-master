// Maps art keys to optional raster files under /public/art/. If a file is absent,
// the UI falls back to procedural SVG (see AssetRegistry.RasterOrSvg). Drop painted
// PNG/JPGs here later (see /art/PROMPTS.md) with zero code change.

// Base-aware so it works under a subpath (GitHub Pages /dice-master/).
const B = import.meta.env.BASE_URL

export function monsterArtUrl(id: string): string {
  return `${B}art/mon-${id}.jpg`
}

export function heroArtUrl(id: string): string {
  return `${B}art/hero-${id}.jpg`
}

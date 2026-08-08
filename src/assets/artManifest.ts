// Maps art keys to optional raster files under /public/art/. If a file is absent,
// the UI falls back to procedural SVG (see AssetRegistry.RasterOrSvg). Drop painted
// PNG/JPGs here later (see /art/PROMPTS.md) with zero code change.

export function monsterArtUrl(id: string): string {
  return `/art/mon-${id}.png`
}

export function heroArtUrl(id: string): string {
  return `/art/hero-${id}.png`
}

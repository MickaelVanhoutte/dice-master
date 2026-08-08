# Art drop-in guide

The game renders painted raster art if present, else falls back to procedural SVG/CSS.
Generate the images below (Midjourney / DALL·E / SDXL), export as described, and drop them
into `public/art/`. No code change needed — refresh and they appear.

Consistent style prompt suffix for everything:
> painted fantasy game art, warm candlelit tabletop RPG aesthetic, brass and emerald accents,
> parchment and dark wood tones, soft rim light, high detail, no text, no watermark

## Background (biggest visual win)

- **`bg-desk.jpg`** — 1080×2160 (portrait). Referenced by `body` in `global.css`.
  > top-down cozy adventurer's desk: dark oak wood table, scattered gold coins, a leather
  > pouch, an open spellbook, a lit candle, dried lavender, a wooden tankard, faint map;
  > moody vignette, empty space in the center for UI; {suffix}

## Monster portraits → `public/art/mon-<id>.png` (512×512, transparent PNG)

ids: `slime`, `goblin`, `turtle`, `wraith`, `golem`, `vampire`, `hydra`, `direbeast`,
`thornbeast`, `lich`. Example:
> `mon-golem.png` — a hulking iron golem with glowing runes, front view, centered,
> transparent background, ornate; {suffix}

## Hero portraits → `public/art/hero-<id>.png` (512×512, transparent PNG)

ids: `wanderer`, `gambler`, `bloodpact`, `duelist`, `berserker`, `hoarder`. Example:
> `hero-gambler.png` — a roguish gambler holding dice, confident smirk, bust portrait,
> centered, transparent background; {suffix}

## Optional textures (improve panels)

- **`parchment.jpg`** — 512×512 seamless aged parchment.
- **`wood.jpg`** — 512×512 seamless dark oak plank.
  (Wire these into `--parch-tex` / `--wood-tex` in `tokens.css` if desired.)

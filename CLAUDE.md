# CLAUDE.md - Project Instructions for AI Agents

## Quick Start

```bash
npm run dev    # Start Vite dev server (localhost:5173)
npm run build  # TypeScript check + Vite production build
```

## Project Overview

2D RPG prototype with Don't Starve-style 3/4 top-down perspective. Built with **Phaser 3** + **TypeScript** + **Vite**.

- Bart: keyboard-controlled player (WASD/arrows to move, Space to jump)
- Kieu: NPC standing in the world (same Player class, `controllable=false`)

## Architecture

```
src/
  main.ts              # Phaser game bootstrap (RESIZE scale, arcade physics)
  config.ts            # All constants, CharacterConfig/JumpConfig interfaces, sprite configs
  scenes/
    BootScene.ts       # Asset loading (spritesheets) + procedural grass texture generation
    GameScene.ts       # Main gameplay: world setup, character spawning, camera, Y-sort depth
  entities/
    Player.ts          # Character entity: movement, animations, jump mechanic, physics body
public/assets/sprites/ # Processed sprite sheets (served statically by Vite)
assets/                # Original unprocessed source sprites (not served)
```

## Key Files

- **`src/config.ts`** - Single source of truth for all game constants (`WORLD_WIDTH`, `PLAYER_SPEED`, `SPRITE_SCALE`, etc.) and sprite sheet configurations. Always update configs here, not in scene/entity files.
- **`src/entities/Player.ts`** - Handles both controllable and NPC characters. Constructor: `new Player(scene, x, y, config, controllable, jumpConfig?)`. Jump uses a separate spritesheet + tween-based Y arc.
- **`src/scenes/GameScene.ts`** - World is 3200x3200 with TileSprite grass. Camera follows player with lerp 0.08. Y-sort depth runs every frame.

## Sprite Sheets

Sprites were reprocessed from irregular source sheets into clean uniform grids:

| Sheet | File | Grid | Cell Size | Rows |
|-------|------|------|-----------|------|
| Bart walk | `bart_sprites.png` (960x1120) | 6x4 | 160x280 | down, up, left, right |
| Bart jump | `bart_jump.png` (900x300) | 5x1 | 180x300 | jump sequence |
| Kieu walk | `kieu_sprites.png` (800x1280) | 4x4 | 200x320 | down, up, left, right |

**Important**: If adding new sprite sheets, ensure uniform cell sizes. Phaser's `spritesheet` loader requires exact frameWidth/frameHeight. Non-uniform grids cause frame bleeding artifacts.

## Game Design Patterns

- **Y-sort depth**: Characters with higher Y rendered in front (`sprite.setDepth(sprite.y)` each frame)
- **Physics body at feet**: Body is offset to bottom 30% of sprite for accurate depth sorting and collision
- **Diagonal normalization**: Movement uses `Math.SQRT1_2` factor for consistent speed in all directions
- **Jump mechanic**: Visual-only Y tween (Sine.easeOut + yoyo), swaps to jump spritesheet during animation, shadow ellipse scales with height
- **Procedural grass**: Generated at runtime in BootScene via HTML Canvas (no external ground asset needed)

## Common Tasks

### Adding a new character
1. Process sprite sheet to uniform grid (use Python/Pillow if source is irregular)
2. Place in `public/assets/sprites/`
3. Add `CharacterConfig` in `config.ts` with correct frameWidth/frameHeight and animation frame ranges
4. Load in `BootScene.preload()`
5. Instantiate `new Player(scene, x, y, config, controllable)` in `GameScene.create()`

### Adding jump to a character
1. Extract jump frames to separate spritesheet with uniform cells
2. Add `JumpConfig` in `config.ts`
3. Load in `BootScene.preload()`
4. Pass jumpConfig as last arg to `Player` constructor

### Changing world size
Update `WORLD_WIDTH` and `WORLD_HEIGHT` in `config.ts`. Physics bounds, camera bounds, and ground tile all derive from these.

## Conventions

- All magic numbers go in `config.ts` as named constants
- Phaser scenes use the class name as scene key (e.g., `super({ key: 'GameScene' })`)
- Entity classes own their sprite and animations; scenes handle spawning and inter-entity logic
- `pixelArt: true` is enabled globally for crisp sprite rendering

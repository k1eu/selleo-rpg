# AGENTS.md - Selleo RPG Project Guide

## What Is This Project?

A 2D RPG game prototype built for a Selleo hackathon. It uses a Don't Starve-inspired 3/4 top-down perspective with hand-drawn character sprites on a procedurally generated grass world.

**Tech stack**: Phaser 3 (game engine) + TypeScript + Vite (dev server/bundler)

**Current state**: Playable prototype with one controllable character (Bart) who can walk in 4 directions and jump, plus one NPC (Kieu) standing in the world. The world is a 3200x3200 grass field with camera smoothly following the player.

## How to Run

```bash
npm install
npm run dev     # Opens at http://localhost:5173
```

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrow keys | Move Bart in 4 directions |
| Space | Jump |

## Project Structure

```
hackathon-selleo-rpg/
├── index.html                  # Entry point (loads src/main.ts as ES module)
├── package.json                # phaser, vite, typescript
├── tsconfig.json               # ESNext, bundler resolution, strict
├── vite.config.ts              # base './', outDir 'dist'
├── public/
│   └── assets/sprites/         # Processed sprite sheets (served by Vite)
│       ├── bart_sprites.png    # 960x1120, 6x4 grid, 160x280 cells
│       ├── bart_jump.png       # 900x300, 5x1 grid, 180x300 cells
│       └── kieu_sprites.png    # 800x1280, 4x4 grid, 200x320 cells
├── assets/                     # Original unprocessed source sprites (not served)
│   └── bart_sprite_jump.png    # Original Bart sheet with jump frames in row 4
└── src/
    ├── main.ts                 # Phaser.Game init (RESIZE scale, arcade physics, pixelArt)
    ├── config.ts               # Constants + CharacterConfig/JumpConfig + all sprite configs
    ├── scenes/
    │   ├── BootScene.ts        # Loads all spritesheets + generates grass texture
    │   └── GameScene.ts        # Main scene: world, characters, camera, depth sorting
    └── entities/
        └── Player.ts           # Character class: movement, animation, jump, physics
```

## Architecture Details

### Scene Flow
`BootScene` (preload assets, generate textures) → `GameScene` (gameplay loop)

### Config System (`src/config.ts`)
All game constants and sprite configurations live here. This is the single source of truth for:
- World dimensions: `WORLD_WIDTH=3200`, `WORLD_HEIGHT=3200`
- Player mechanics: `PLAYER_SPEED=160`, `JUMP_DURATION=500`, `JUMP_HEIGHT=80`
- Visual settings: `SPRITE_SCALE=0.5`, `CAMERA_LERP=0.08`, `TILE_SIZE=64`
- `CharacterConfig` interface: key, path, frame dimensions, animation frame ranges, idle frame
- `JumpConfig` interface: key, path, frame dimensions, start/end frames

### Player Entity (`src/entities/Player.ts`)
Single class for both player and NPC characters:
- `controllable=true`: Registers keyboard input, processes movement in `update()`
- `controllable=false`: Static NPC, no input handling
- `jumpConfig` (optional): Enables space-to-jump with separate spritesheet, tween arc, shadow

### Rendering
- **Ground**: TileSprite using procedurally generated 64x64 'grass' canvas texture
- **Depth**: Y-sort each frame (`sprite.setDepth(sprite.y)`) — higher Y = rendered in front
- **Physics body**: Offset to bottom 30% of sprite for proper depth/collision at feet
- **Camera**: Follows player sprite with lerp 0.08 for smooth lag

## Sprite Sheet Notes

Sprite sheets were reprocessed from irregular hand-drawn source images into clean uniform grids using Python/Pillow. The originals had non-uniform spacing that caused Phaser frame bleeding.

**Animation layout** (all sheets use row-based organization):
- Row 0: Walk down
- Row 1: Walk up
- Row 2: Walk left
- Row 3: Walk right

**Bart walk** — 6 frames per direction, **Kieu walk** — 4 frames per direction, **Bart jump** — 5 frames in single row.

If you need to add or modify sprites, always verify frameWidth/frameHeight match the actual cell size in the PNG. Mismatched dimensions cause visible artifacts (frame bleeding, cut-off limbs).

## Known Limitations / Future Work

- No collision between characters
- No map/tilemap — just flat grass
- No NPCs with behavior (Kieu just stands still)
- No UI/HUD
- No sound
- Only Bart has jump capability
- No game state management beyond the scene system

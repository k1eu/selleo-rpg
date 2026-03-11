export const WORLD_WIDTH = 3840;
export const WORLD_HEIGHT = 2880;
export const TILE_SIZE = 64;
export const PLAYER_SPEED = 160;
export const SPRITE_SCALE = 0.5;
export const CAMERA_LERP = 0.08;
export const JUMP_DURATION = 500;
export const JUMP_HEIGHT = 80;

export interface CharacterConfig {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  animations: {
    walkDown: { start: number; end: number };
    walkUp: { start: number; end: number };
    walkLeft: { start: number; end: number };
    walkRight: { start: number; end: number };
  };
  idleFrame: number;
}

export interface JumpConfig {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  start: number;
  end: number;
}

export const BART_CONFIG: CharacterConfig = {
  key: 'bart',
  path: 'assets/sprites/bart_sprites.png',
  frameWidth: 160,
  frameHeight: 280,
  animations: {
    walkDown: { start: 0, end: 5 },
    walkUp: { start: 6, end: 11 },
    walkLeft: { start: 12, end: 17 },
    walkRight: { start: 18, end: 23 },
  },
  idleFrame: 0,
};

export const BART_JUMP_CONFIG: JumpConfig = {
  key: 'bart-jump',
  path: 'assets/sprites/bart_jump.png',
  frameWidth: 180,
  frameHeight: 300,
  start: 0,
  end: 4,
};

// Dialog system
export const DIALOG_FONT_SIZE = 20;
export const DIALOG_PADDING = 20;
export const DIALOG_TYPEWRITER_SPEED = 30; // ms per character
export const DIALOG_BOX_COLOR = 0x000000;
export const DIALOG_BOX_ALPHA = 0.85;
export const DIALOG_BOX_HEIGHT_RATIO = 0.2; // 20% of screen height
export const DIALOG_INTERACTION_DISTANCE = 150;
export const DIALOG_NAME_FONT_SIZE = 22;
export const DIALOG_PORTRAIT_HEIGHT_RATIO = 0.5; // show top 50% of chibi image

export const KIEU_CONFIG: CharacterConfig = {
  key: 'kieu',
  path: 'assets/sprites/kieu_sprites.png',
  frameWidth: 200,
  frameHeight: 320,
  animations: {
    walkDown: { start: 0, end: 3 },
    walkUp: { start: 4, end: 7 },
    walkLeft: { start: 8, end: 11 },
    walkRight: { start: 12, end: 15 },
  },
  idleFrame: 0,
};

import Phaser from 'phaser';
import { BART_CONFIG, BART_JUMP_CONFIG, KIEU_CONFIG, TILE_SIZE, type CharacterConfig } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.loadSpritesheet(BART_CONFIG);
    this.loadSpritesheet(KIEU_CONFIG);
    this.load.spritesheet(BART_JUMP_CONFIG.key, BART_JUMP_CONFIG.path, {
      frameWidth: BART_JUMP_CONFIG.frameWidth,
      frameHeight: BART_JUMP_CONFIG.frameHeight,
    });
  }

  create(): void {
    this.generateGrassTexture();
    this.scene.start('GameScene');
  }

  private loadSpritesheet(config: CharacterConfig): void {
    this.load.spritesheet(config.key, config.path, {
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
    });
  }

  private generateGrassTexture(): void {
    const size = TILE_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base green
    ctx.fillStyle = '#3a7d2c';
    ctx.fillRect(0, 0, size, size);

    // Add noise for natural look
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const brightness = Math.random() * 30 - 15;
        const r = 58 + brightness;
        const g = 125 + brightness;
        const b = 44 + brightness;
        ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Add a few darker patches
    for (let i = 0; i < 8; i++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const pr = 2 + Math.random() * 4;
      ctx.fillStyle = 'rgba(30,80,20,0.3)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    this.textures.addCanvas('grass', canvas);
  }
}

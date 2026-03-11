import Phaser from 'phaser';
import { BART_CONFIG, BART_JUMP_CONFIG, KIEU_CONFIG, type CharacterConfig } from '../config';

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
    this.load.image('map', 'assets/map.jpg');
    this.load.image('chibi-bart', 'assets/chibi-bart.png');
    this.load.image('chibi-kieu', 'assets/chibi-kieu.png');
  }

  create(): void {
    this.scene.start('GameScene');
  }

  private loadSpritesheet(config: CharacterConfig): void {
    this.load.spritesheet(config.key, config.path, {
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
    });
  }
}

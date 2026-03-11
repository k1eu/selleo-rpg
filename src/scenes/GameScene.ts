import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { BART_CONFIG, BART_JUMP_CONFIG, KIEU_CONFIG, WORLD_WIDTH, WORLD_HEIGHT, CAMERA_LERP } from '../config';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npc!: Player;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Grass ground
    this.add.tileSprite(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      'grass'
    );

    // Scatter some darker grass patches as decoration
    this.addGrassDecorations();

    // World bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Spawn characters near center
    const centerX = WORLD_WIDTH / 2;
    const centerY = WORLD_HEIGHT / 2;

    this.player = new Player(this, centerX, centerY, BART_CONFIG, true, BART_JUMP_CONFIG);
    this.player.sprite.setCollideWorldBounds(true);

    this.npc = new Player(this, centerX + 200, centerY - 100, KIEU_CONFIG, false);

    // Camera setup
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, CAMERA_LERP, CAMERA_LERP);
  }

  update(): void {
    this.player.update();

    // Y-sort depth: higher Y = rendered in front
    this.player.sprite.setDepth(this.player.sprite.y);
    this.npc.sprite.setDepth(this.npc.sprite.y);
  }

  private addGrassDecorations(): void {
    const graphics = this.add.graphics();

    for (let i = 0; i < 200; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const shade = Phaser.Math.Between(30, 60);

      graphics.fillStyle(Phaser.Display.Color.GetColor(shade, 100 + Phaser.Math.Between(0, 40), shade), 0.6);

      // Small grass blade clusters
      for (let j = 0; j < 3; j++) {
        const bx = x + Phaser.Math.Between(-4, 4);
        const by = y + Phaser.Math.Between(-4, 4);
        graphics.fillRect(bx, by, 2, Phaser.Math.Between(4, 8));
      }
    }

    graphics.setDepth(-1);
  }
}

import { Player } from '../entities/Player';
import { BART_CONFIG, BART_JUMP_CONFIG, KIEU_CONFIG, WORLD_WIDTH, WORLD_HEIGHT, CAMERA_LERP } from '../config';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npc!: Player;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Map background
    const map = this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'map');
    map.setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT);
    map.setDepth(-1);

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
}

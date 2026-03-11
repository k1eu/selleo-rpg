import { Player } from '../entities/Player';
import { DialogBox } from '../ui/DialogBox';
import { KIEU_DIALOG } from '../data/dialogs';
import { BART_CONFIG, BART_JUMP_CONFIG, KIEU_CONFIG, WORLD_WIDTH, WORLD_HEIGHT, CAMERA_LERP, DIALOG_INTERACTION_DISTANCE } from '../config';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npc!: Player;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private dialogBox?: DialogBox;
  private interactionPrompt?: Phaser.GameObjects.Text;
  private inDialog = false;

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
    this.npc.sprite.setImmovable(true);

    // Collision between player and NPC
    this.physics.add.collider(this.player.sprite, this.npc.sprite);

    // Camera setup
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, CAMERA_LERP, CAMERA_LERP);

    // Input
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Floating interaction prompt above NPC
    this.interactionPrompt = this.add.text(0, 0, 'Enter', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 3 },
    });
    this.interactionPrompt.setOrigin(0.5, 1);
    this.interactionPrompt.setVisible(false);
  }

  update(): void {
    this.player.update();

    // Y-sort depth: higher Y = rendered in front
    this.player.sprite.setDepth(this.player.sprite.y);
    this.npc.sprite.setDepth(this.npc.sprite.y);

    const dist = Phaser.Math.Distance.Between(
      this.player.sprite.x, this.player.sprite.y,
      this.npc.sprite.x, this.npc.sprite.y
    );

    const inRange = dist < DIALOG_INTERACTION_DISTANCE;

    // Show/hide floating prompt
    if (inRange && !this.inDialog) {
      this.interactionPrompt!.setPosition(
        this.npc.sprite.x,
        this.npc.sprite.y - this.npc.sprite.displayHeight * 0.5 - 8
      );
      this.interactionPrompt!.setDepth(this.npc.sprite.y + 1);
      this.interactionPrompt!.setVisible(true);
    } else {
      this.interactionPrompt!.setVisible(false);
    }

    // Escape to close dialog
    if (this.inDialog && this.dialogBox && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.dialogBox.handleEscape();
      return;
    }

    // Start dialog on Enter press
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.inDialog && this.dialogBox) {
        this.dialogBox.handleEnter();
      } else if (inRange && !this.inDialog) {
        this.startDialog();
      }
    }
  }

  private startDialog(): void {
    this.inDialog = true;
    this.player.frozen = true;

    this.dialogBox = new DialogBox(this, KIEU_DIALOG, () => {
      this.endDialog();
    });
  }

  private endDialog(): void {
    this.inDialog = false;
    this.player.frozen = false;
    this.dialogBox = undefined;
  }
}

import Phaser from 'phaser';
import { type CharacterConfig, type JumpConfig, SPRITE_SCALE, PLAYER_SPEED, JUMP_DURATION, JUMP_HEIGHT } from '../config';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private config: CharacterConfig;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isControllable: boolean;
  private isJumping = false;
  private jumpConfig?: JumpConfig;
  private jumpShadow?: Phaser.GameObjects.Ellipse;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, config: CharacterConfig, controllable = false, jumpConfig?: JumpConfig) {
    this.config = config;
    this.isControllable = controllable;
    this.jumpConfig = jumpConfig;
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, config.key, config.idleFrame);
    this.sprite.setScale(SPRITE_SCALE);

    // Physics body at feet for depth sorting
    const bodyHeight = config.frameHeight * SPRITE_SCALE * 0.3;
    const bodyWidth = config.frameWidth * SPRITE_SCALE * 0.5;
    this.sprite.body!.setSize(
      bodyWidth / SPRITE_SCALE,
      bodyHeight / SPRITE_SCALE
    );
    this.sprite.body!.setOffset(
      (config.frameWidth - bodyWidth / SPRITE_SCALE) / 2,
      config.frameHeight - bodyHeight / SPRITE_SCALE
    );

    this.createAnimations(scene);

    if (controllable && scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    if (jumpConfig) {
      this.createJumpAnimation(scene, jumpConfig);
    }
  }

  private createAnimations(scene: Phaser.Scene): void {
    const key = this.config.key;
    const anims = this.config.animations;
    const frameRate = 10;

    scene.anims.create({
      key: `${key}-walk-down`,
      frames: scene.anims.generateFrameNumbers(key, { start: anims.walkDown.start, end: anims.walkDown.end }),
      frameRate,
      repeat: -1,
    });

    scene.anims.create({
      key: `${key}-walk-up`,
      frames: scene.anims.generateFrameNumbers(key, { start: anims.walkUp.start, end: anims.walkUp.end }),
      frameRate,
      repeat: -1,
    });

    scene.anims.create({
      key: `${key}-walk-left`,
      frames: scene.anims.generateFrameNumbers(key, { start: anims.walkLeft.start, end: anims.walkLeft.end }),
      frameRate,
      repeat: -1,
    });

    scene.anims.create({
      key: `${key}-walk-right`,
      frames: scene.anims.generateFrameNumbers(key, { start: anims.walkRight.start, end: anims.walkRight.end }),
      frameRate,
      repeat: -1,
    });
  }

  private createJumpAnimation(scene: Phaser.Scene, jumpConfig: JumpConfig): void {
    scene.anims.create({
      key: `${this.config.key}-jump`,
      frames: scene.anims.generateFrameNumbers(jumpConfig.key, {
        start: jumpConfig.start,
        end: jumpConfig.end,
      }),
      frameRate: (jumpConfig.end - jumpConfig.start + 1) / (JUMP_DURATION / 1000),
      repeat: 0,
    });
  }

  private jump(): void {
    if (this.isJumping || !this.jumpConfig) return;
    this.isJumping = true;

    const groundY = this.sprite.y;

    // Shadow under the character
    this.jumpShadow = this.scene.add.ellipse(
      this.sprite.x, groundY + this.config.frameHeight * SPRITE_SCALE * 0.45,
      40, 12, 0x000000, 0.3
    );
    this.jumpShadow.setDepth(groundY - 1);

    // Switch to jump spritesheet
    this.sprite.setTexture(this.jumpConfig.key, 0);
    this.sprite.setScale(SPRITE_SCALE);
    this.sprite.anims.play(`${this.config.key}-jump`, true);

    // Tween the sprite upward and back down (visual only)
    this.scene.tweens.add({
      targets: this.sprite,
      y: groundY - JUMP_HEIGHT,
      duration: JUMP_DURATION / 2,
      ease: 'Sine.easeOut',
      yoyo: true,
      onUpdate: () => {
        // Keep shadow on the ground
        if (this.jumpShadow) {
          this.jumpShadow.setPosition(
            this.sprite.x,
            groundY + this.config.frameHeight * SPRITE_SCALE * 0.45
          );
          // Shrink shadow as character goes higher
          const dist = Math.abs(this.sprite.y - groundY) / JUMP_HEIGHT;
          this.jumpShadow.setScale(1 - dist * 0.4);
          this.jumpShadow.setAlpha(0.3 * (1 - dist * 0.5));
        }
      },
      onComplete: () => {
        this.sprite.y = groundY;
        this.isJumping = false;
        // Switch back to walk spritesheet
        this.sprite.setTexture(this.config.key, this.config.idleFrame);
        this.sprite.setScale(SPRITE_SCALE);
        if (this.jumpShadow) {
          this.jumpShadow.destroy();
          this.jumpShadow = undefined;
        }
      },
    });
  }

  update(): void {
    if (!this.isControllable) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) vx = -1;
    else if (right) vx = 1;
    if (up) vy = -1;
    else if (down) vy = 1;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);

    // Jump on space
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.jump();
    }

    // Don't change animation while jumping
    if (this.isJumping) return;

    const key = this.config.key;

    if (vx !== 0 || vy !== 0) {
      // Pick animation based on dominant direction
      if (Math.abs(vy) >= Math.abs(vx)) {
        this.sprite.anims.play(vy < 0 ? `${key}-walk-up` : `${key}-walk-down`, true);
      } else {
        this.sprite.anims.play(vx < 0 ? `${key}-walk-left` : `${key}-walk-right`, true);
      }
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(this.config.idleFrame);
    }
  }
}

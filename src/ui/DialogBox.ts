import Phaser from 'phaser';
import {
  DIALOG_FONT_SIZE,
  DIALOG_PADDING,
  DIALOG_TYPEWRITER_SPEED,
  DIALOG_BOX_COLOR,
  DIALOG_BOX_ALPHA,
  DIALOG_BOX_HEIGHT_RATIO,
  DIALOG_NAME_FONT_SIZE,
  DIALOG_PORTRAIT_HEIGHT_RATIO,
} from '../config';
import type { DialogLine } from '../data/dialogs';
import { SPEAKER_PORTRAITS } from '../data/dialogs';

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private nameText: Phaser.GameObjects.Text;
  private dialogText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private portrait?: Phaser.GameObjects.Image;

  private lines: DialogLine[];
  private currentLineIndex = 0;
  private displayedChars = 0;
  private fullText = '';
  private isTyping = false;
  private typeTimer?: Phaser.Time.TimerEvent;
  private promptTween?: Phaser.Tweens.Tween;
  private destroyed = false;

  private onComplete: () => void;

  private boxX: number;
  private boxY: number;
  private boxW: number;
  private boxH: number;

  constructor(scene: Phaser.Scene, lines: DialogLine[], onComplete: () => void) {
    this.scene = scene;
    this.lines = lines;
    this.onComplete = onComplete;

    const cam = scene.cameras.main;
    this.boxH = cam.height * DIALOG_BOX_HEIGHT_RATIO;
    this.boxY = cam.height - this.boxH;
    this.boxW = cam.width - DIALOG_PADDING * 2;
    this.boxX = cam.width / 2;

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    // Semi-transparent background
    const box = scene.add.rectangle(
      this.boxX,
      this.boxY + this.boxH / 2,
      this.boxW,
      this.boxH - DIALOG_PADDING,
      DIALOG_BOX_COLOR,
      DIALOG_BOX_ALPHA
    );
    box.setStrokeStyle(2, 0xffffff, 0.6);

    // Speaker name
    this.nameText = scene.add.text(
      DIALOG_PADDING * 2,
      this.boxY + DIALOG_PADDING,
      '',
      {
        fontSize: `${DIALOG_NAME_FONT_SIZE}px`,
        fontFamily: 'monospace',
        color: '#ffcc00',
        fontStyle: 'bold',
      }
    );

    // Dialog body text — leave room on the right for portrait
    const portraitAreaWidth = this.boxH;
    this.dialogText = scene.add.text(
      DIALOG_PADDING * 2,
      this.boxY + DIALOG_PADDING + DIALOG_NAME_FONT_SIZE + 8,
      '',
      {
        fontSize: `${DIALOG_FONT_SIZE}px`,
        fontFamily: 'monospace',
        color: '#ffffff',
        wordWrap: { width: this.boxW - DIALOG_PADDING * 6 - portraitAreaWidth },
        lineSpacing: 4,
      }
    );

    // "Press Enter / Esc" prompt (bottom-left of box)
    this.promptText = scene.add.text(
      DIALOG_PADDING * 2,
      this.boxY + this.boxH - DIALOG_PADDING * 2,
      '[ Enter ]   [ Esc to close ]',
      {
        fontSize: `${DIALOG_FONT_SIZE - 4}px`,
        fontFamily: 'monospace',
        color: '#aaaaaa',
      }
    );
    this.promptText.setOrigin(0, 1);
    this.promptText.setAlpha(0);

    this.container.add([box, this.nameText, this.dialogText, this.promptText]);

    this.showLine(0);
  }

  private showLine(index: number): void {
    if (this.destroyed) return;
    if (index >= this.lines.length) {
      this.destroy();
      this.onComplete();
      return;
    }

    this.currentLineIndex = index;
    const line = this.lines[index];
    this.fullText = line.text;
    this.displayedChars = 0;
    this.isTyping = true;

    this.nameText.setText(line.speaker);
    this.dialogText.setText('');
    this.hidePrompt();
    this.updatePortrait(line.speaker);

    this.typeTimer = this.scene.time.addEvent({
      delay: DIALOG_TYPEWRITER_SPEED,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.displayedChars++;
        this.dialogText.setText(this.fullText.substring(0, this.displayedChars));
        if (this.displayedChars >= this.fullText.length) {
          this.finishTyping();
        }
      },
    });
  }

  private updatePortrait(speaker: string): void {
    if (this.portrait) {
      this.portrait.destroy();
      this.portrait = undefined;
    }

    const textureKey = SPEAKER_PORTRAITS[speaker];
    if (!textureKey || !this.scene.textures.exists(textureKey)) return;

    const texture = this.scene.textures.get(textureKey);
    const srcFrame = texture.get();
    const imgW = srcFrame.width;
    const imgH = srcFrame.height;

    // Show only the top portion of the image (chestpiece)
    const cropH = imgH * DIALOG_PORTRAIT_HEIGHT_RATIO;

    // Scale portrait to fit dialog box height
    const innerBoxH = this.boxH - DIALOG_PADDING;
    const scale = innerBoxH / cropH;

    const displayW = imgW * scale;

    // Position on the right side inside the box
    const rightEdge = this.boxX + this.boxW / 2 - DIALOG_PADDING;
    const portraitX = rightEdge - displayW / 2;
    const portraitY = this.boxY + DIALOG_PADDING / 2 + innerBoxH / 2;

    this.portrait = this.scene.add.image(portraitX, portraitY, textureKey);
    this.portrait.setScale(scale);
    this.portrait.setCrop(0, 0, imgW, cropH);

    this.container.add(this.portrait);
  }

  private finishTyping(): void {
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = undefined;
    }
    this.isTyping = false;
    this.displayedChars = this.fullText.length;
    this.dialogText.setText(this.fullText);
    this.showPrompt();
  }

  private showPrompt(): void {
    this.promptText.setAlpha(1);
    this.promptTween = this.scene.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  private hidePrompt(): void {
    if (this.promptTween) {
      this.promptTween.destroy();
      this.promptTween = undefined;
    }
    this.promptText.setAlpha(0);
  }

  handleEnter(): void {
    if (this.destroyed) return;
    if (this.isTyping) {
      this.finishTyping();
    } else {
      this.showLine(this.currentLineIndex + 1);
    }
  }

  handleEscape(): void {
    if (this.destroyed) return;
    this.destroy();
    this.onComplete();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.typeTimer) {
      this.typeTimer.destroy();
    }
    if (this.promptTween) {
      this.promptTween.destroy();
    }
    this.container.destroy();
  }
}

class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");
}

create() {

this.createAdaptiveBackground();

/* codul tău existent pentru joc rămâne aici */

}

/* ---------------- BACKGROUND SYSTEM ---------------- */

createAdaptiveBackground() {

const palettes = {

very_easy: [
[0x1e3a8a, 0x60a5fa],
[0x065f46, 0x34d399],
[0x7c3aed, 0xa78bfa]
],

easy: [
[0x0f172a, 0x334155],
[0x111827, 0x374151],
[0x0b132b, 0x1c2541]
],

normal: [
[0x020617, 0x0f172a],
[0x030712, 0x111827],
[0x020617, 0x020617]
],

relaxed: [
[0x1c1917, 0x44403c],
[0x1f2933, 0x4b5563],
[0x1e293b, 0x475569]
]

};

const difficulty = window.playerDifficulty || "normal";
const palette = Phaser.Utils.Array.GetRandom(palettes[difficulty]);

this.drawGradient(palette[0], palette[1]);

}

drawGradient(topColor, bottomColor) {

const width = this.scale.width;
const height = this.scale.height;

const graphics = this.add.graphics();
graphics.setDepth(-1000);

const color1 = Phaser.Display.Color.ValueToColor(topColor);
const color2 = Phaser.Display.Color.ValueToColor(bottomColor);

for (let i = 0; i < height; i++) {

const t = i / height;

const r = Phaser.Math.Interpolation.Linear([color1.red, color2.red], t);
const g = Phaser.Math.Interpolation.Linear([color1.green, color2.green], t);
const b = Phaser.Math.Interpolation.Linear([color1.blue, color2.blue], t);

const color = Phaser.Display.Color.GetColor(r, g, b);

graphics.fillStyle(color, 1);
graphics.fillRect(0, i, width, 1);

}

}
}
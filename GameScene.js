class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");
}

create() {

this.createAdaptiveBackground();

this.nodes = [];
this.lines = [];
this.selectedNode = null;

this.createNodes();

this.input.on("pointerdown", this.onPointerDown, this);
this.input.on("pointerup", this.onPointerUp, this);

}

/* ---------- BACKGROUND ---------- */

createAdaptiveBackground() {

const palettes = {

very_easy: [
[0x1e3a8a, 0x60a5fa],
[0x065f46, 0x34d399]
],

easy: [
[0x0f172a, 0x334155],
[0x111827, 0x374151]
],

normal: [
[0x020617, 0x0f172a],
[0x030712, 0x111827]
],

relaxed: [
[0x1c1917, 0x44403c],
[0x1f2933, 0x4b5563]
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

/* ---------- GAME LOGIC ---------- */

createNodes() {

const width = this.scale.width;
const height = this.scale.height;

for (let i = 0; i < 5; i++) {

const x = Phaser.Math.Between(100, width - 100);
const y = Phaser.Math.Between(100, height - 100);

const node = this.add.circle(x, y, 15, 0xffffff)
.setInteractive();

this.nodes.push(node);

}

}

onPointerDown(pointer) {

this.nodes.forEach(node => {

const dist = Phaser.Math.Distance.Between(
pointer.x,
pointer.y,
node.x,
node.y
);

if (dist < 20) {
this.selectedNode = node;
}

});

}

onPointerUp(pointer) {

if (!this.selectedNode) return;

this.nodes.forEach(node => {

const dist = Phaser.Math.Distance.Between(
pointer.x,
pointer.y,
node.x,
node.y
);

if (dist < 20 && node !== this.selectedNode) {

const line = this.add.line(
0,0,
this.selectedNode.x,
this.selectedNode.y,
node.x,
node.y,
0xffffff
);

line.setOrigin(0,0);
this.lines.push(line);

}

});

this.selectedNode = null;

}

}
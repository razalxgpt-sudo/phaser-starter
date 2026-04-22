class BootScene extends Phaser.Scene {
constructor() {
super("BootScene");
}

create() {

const palettes = {

very_easy: [
[0x1e3a8a, 0x0ea5e9],
[0x065f46, 0x10b981],
[0x7c3aed, 0x6366f1]
],

easy: [
[0x0f172a, 0x1e293b],
[0x111827, 0x1f2937],
[0x0b132b, 0x1c2541]
],

normal: [
[0x020617, 0x0f172a],
[0x030712, 0x111827],
[0x020617, 0x020617]
],

relaxed: [
[0x1c1917, 0x292524],
[0x1f2933, 0x374151],
[0x1e293b, 0x334155]
]

};

const difficulty = window.playerDifficulty || "normal";
const palette = Phaser.Utils.Array.GetRandom(palettes[difficulty]);

this.createGradient(palette[0], palette[1]);

const width = this.scale.gameSize.width;
const height = this.scale.gameSize.height;

this.add.text(width / 2, height * 0.15, "MindFlow", {
fontSize: Math.round(width * 0.08) + "px",
color: "#e5e7eb"
}).setOrigin(0.5);

this.add.text(width / 2, height * 0.25, "Select Age Group", {
fontSize: Math.round(width * 0.04) + "px",
color: "#9ca3af"
}).setOrigin(0.5);

const options = [
{ label: "6 - 10", difficulty: "very_easy" },
{ label: "11 - 16", difficulty: "easy" },
{ label: "17 - 40", difficulty: "normal" },
{ label: "40+", difficulty: "relaxed" }
];

options.forEach((opt, index) => {

const y = height * (0.4 + index * 0.12);

const btn = this.add.text(width / 2, y, opt.label, {
fontSize: Math.round(width * 0.05) + "px",
backgroundColor: "#1f2933",
padding: { x: 20, y: 10 },
color: "#f9fafb"
})
.setOrigin(0.5)
.setInteractive({ useHandCursor: true });

btn.on("pointerdown", () => {
window.playerDifficulty = opt.difficulty;
this.scene.start("GameScene");
});

btn.on("pointerover", () => {
btn.setStyle({ backgroundColor: "#374151" });
});

btn.on("pointerout", () => {
btn.setStyle({ backgroundColor: "#1f2933" });
});

});

}

createGradient(topColor, bottomColor) {

const width = this.scale.width;
const height = this.scale.height;

const graphics = this.add.graphics();

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
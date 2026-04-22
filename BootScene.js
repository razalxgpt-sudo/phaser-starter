class BootScene extends Phaser.Scene {
constructor() {
super("BootScene");
}

create() {

const width = this.scale.gameSize.width;
const height = this.scale.gameSize.height;

this.cameras.main.setBackgroundColor("#000000");

this.add.text(width / 2, height * 0.15, "MindFlow", {
fontSize: Math.round(width * 0.08) + "px",
color: "#ffffff"
}).setOrigin(0.5);

this.add.text(width / 2, height * 0.25, "Select Age Group", {
fontSize: Math.round(width * 0.04) + "px",
color: "#aaaaaa"
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
backgroundColor: "#222222",
padding: { x: 20, y: 10 },
color: "#ffffff"
})
.setOrigin(0.5)
.setInteractive({ useHandCursor: true });

btn.on("pointerdown", () => {
window.playerDifficulty = opt.difficulty;
this.scene.start("GameScene");
});

btn.on("pointerover", () => {
btn.setStyle({ backgroundColor: "#444444" });
});

btn.on("pointerout", () => {
btn.setStyle({ backgroundColor: "#222222" });
});

});

}
}
class BootScene extends Phaser.Scene {
constructor() {
super("BootScene");
}

create() {

const width = this.scale.width;
const height = this.scale.height;

this.add.text(width/2, 80, "MindFlow", {
fontSize: "32px",
color: "#ffffff"
}).setOrigin(0.5);

this.add.text(width/2, 140, "Select Age Group", {
fontSize: "20px",
color: "#aaaaaa"
}).setOrigin(0.5);

const options = [
{ label: "6 - 10", difficulty: "very_easy" },
{ label: "11 - 16", difficulty: "easy" },
{ label: "17 - 40", difficulty: "normal" },
{ label: "40+", difficulty: "relaxed" }
];

options.forEach((opt, index) => {

const y = 220 + index * 60;

const btn = this.add.text(width/2, y, opt.label, {
fontSize: "24px",
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
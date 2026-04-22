// boot scene placeholder
window.onload = function () {

const config = {
type: Phaser.AUTO,
width: 800,
height: 600,
backgroundColor: "#000000",
scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);

};

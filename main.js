const config = {
    type: Phaser.AUTO,
    parent: "game-container",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 480,
        height: 800
    },

    backgroundColor: "#000000",

    scene: [GameScene] // 🔥 DOAR asta, fără BootScene dacă nu există
};

window.onload = () => {
    new Phaser.Game(config);
};

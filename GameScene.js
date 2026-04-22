class GameScene extends Phaser.Scene {

constructor() {
    super("GameScene");
}

create() {

    this.drawGrid();

    this.add.text(400, 300, "MindFlow Running", {
        fontSize: "32px",
        fill: "#ffffff"
    }).setOrigin(0.5);

}

drawGrid() {

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222222, 1);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const size = 40;

    for (let x = 0; x < width; x += size) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, height);
    }

    for (let y = 0; y < height; y += size) {
        graphics.moveTo(0, y);
        graphics.lineTo(width, y);
    }

    graphics.strokePath();
}

update() {
}

}

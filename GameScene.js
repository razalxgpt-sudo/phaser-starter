class GameScene extends Phaser.Scene {

constructor() {
    super("GameScene");
}

create() {

    this.drawGrid();

    this.nodes = [];

    this.input.on("pointerdown", (pointer) => {

        // nu crea nod dacă dai click pe unul existent
        if (pointer.wasTouch) return;

        this.createNode(pointer.x, pointer.y);
    });

    this.add.text(10, 10, "Click to create nodes | Drag to move", {
        fontSize: "16px",
        fill: "#888888"
    });

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

createNode(x, y) {

    const circle = this.add.circle(x, y, 12, 0x00ffcc);
    circle.setStrokeStyle(2, 0xffffff);

    circle.setInteractive({ draggable: true });

    this.input.setDraggable(circle);

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.nodes.push(circle);
}

update() {
}

}

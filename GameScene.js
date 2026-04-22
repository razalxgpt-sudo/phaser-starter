class GameScene extends Phaser.Scene {

constructor() {
    super("GameScene");
}

create() {

    this.drawGrid();

    this.nodes = [];
    this.links = [];
    this.selectedNode = null;

    // drag global
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        this.redrawLinks();
    });

    this.add.text(10, 10, "Click empty = node | Drag = move | Click node->node = connect", {
        fontSize: "14px",
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

    circle.setInteractive();
    this.input.setDraggable(circle);

    circle.on("pointerdown", () => {
        this.handleNodeClick(circle);
    });

    this.nodes.push(circle);
}

handleNodeClick(node) {

    if (this.selectedNode === null) {
        this.selectedNode = node;
        node.setFillStyle(0xffff00);
        return;
    }

    if (this.selectedNode === node) {
        node.setFillStyle(0x00ffcc);
        this.selectedNode = null;
        return;
    }

    this.createLink(this.selectedNode, node);

    this.selectedNode.setFillStyle(0x00ffcc);
    this.selectedNode = null;
}

createLink(a, b) {

    const line = this.add.line(0, 0, a.x, a.y, b.x, b.y, 0x8888ff)
        .setOrigin(0, 0)
        .setLineWidth(2);

    this.links.push({ a, b, line });
}

redrawLinks() {

    this.links.forEach(link => {
        link.line.setTo(
            link.a.x,
            link.a.y,
            link.b.x,
            link.b.y
        );
    });
}

update() {

    // click pe empty space -> create node
    if (this.input.activePointer.justDown) {

        const pointer = this.input.activePointer;
        const objects = this.input.hitTestPointer(pointer);

        if (objects.length === 0) {
            this.createNode(pointer.x, pointer.y);
        }
    }

}

}
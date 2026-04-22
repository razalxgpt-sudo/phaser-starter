class GameScene extends Phaser.Scene {

constructor() {
    super("GameScene");
}

create() {

    this.isMobile = this.sys.game.device.input.touch;

    this.drawGrid();

    this.nodes = [];
    this.links = [];
    this.selectedNode = null;

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        this.redrawLinks();
    });

    this.input.on("pointerdown", (pointer, currentlyOver) => {

        if (currentlyOver.length > 0) return;

        this.createNode(pointer.x, pointer.y);
    });

    this.add.text(10, 10,
        this.isMobile ?
        "Tap = node | Hold+drag = move" :
        "Click = node | Drag = move | Click node->node = connect",
    {
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

    const radius = this.isMobile ? 22 : 12;

    const circle = this.add.circle(x, y, radius, 0x00ffcc);
    circle.setStrokeStyle(2, 0xffffff);

    circle.setInteractive(
        new Phaser.Geom.Circle(0, 0, radius + 10),
        Phaser.Geom.Circle.Contains
    );

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

update() {}

}
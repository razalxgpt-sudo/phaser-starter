class GameScene extends Phaser.Scene {

constructor() {
    super("GameScene");
}

create() {

    this.isMobile = this.sys.game.device.input.touch;

    this.nodes = [];
    this.links = [];
    this.selectedNode = null;

    this.drawGrid();

    // CAMERA PAN
    this.isPanning = false;

    this.input.on("pointerdown", (pointer, currentlyOver) => {

        if (currentlyOver.length === 0) {
            this.isPanning = true;
            this.panStartX = pointer.x;
            this.panStartY = pointer.y;
            this.camStartX = this.cameras.main.scrollX;
            this.camStartY = this.cameras.main.scrollY;

            this.createNode(pointer.worldX, pointer.worldY);
        }
    });

    this.input.on("pointerup", () => {
        this.isPanning = false;
    });

    this.input.on("pointermove", (pointer) => {

        if (!this.isPanning) return;

        const cam = this.cameras.main;

        cam.scrollX = this.camStartX - (pointer.x - this.panStartX) / cam.zoom;
        cam.scrollY = this.camStartY - (pointer.y - this.panStartY) / cam.zoom;
    });

    // ZOOM scroll desktop
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {

        const cam = this.cameras.main;
        cam.zoom -= deltaY * 0.001;

        cam.zoom = Phaser.Math.Clamp(cam.zoom, 0.3, 2);
    });

    // PINCH ZOOM mobile
    this.input.on('pointermove', (pointer) => {

        if (this.input.pointer1.isDown && this.input.pointer2.isDown) {

            const p1 = this.input.pointer1;
            const p2 = this.input.pointer2;

            const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);

            if (!this.prevDist) this.prevDist = dist;

            const diff = dist - this.prevDist;

            const cam = this.cameras.main;
            cam.zoom += diff * 0.005;

            cam.zoom = Phaser.Math.Clamp(cam.zoom, 0.3, 2);

            this.prevDist = dist;
        }
    });

    this.input.on('pointerup', () => {
        this.prevDist = null;
    });

    // DRAG NODES
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        this.redrawLinks();
    });

    this.add.text(10, 10,
        "Click/Tap = node | Drag node = move | Drag empty = pan | Scroll/Pinch = zoom",
    {
        fontSize: "14px",
        fill: "#888888"
    }).setScrollFactor(0);

}

drawGrid() {

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222222, 1);

    const size = 40;
    const range = 5000;

    for (let x = -range; x < range; x += size) {
        graphics.moveTo(x, -range);
        graphics.lineTo(x, range);
    }

    for (let y = -range; y < range; y += size) {
        graphics.moveTo(-range, y);
        graphics.lineTo(range, y);
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
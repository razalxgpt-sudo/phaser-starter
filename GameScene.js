class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {

        this.nodes = [];
        this.connections = [];
        this.activeNode = null;

        // 🔥 IMPORTANT pentru mobil
        this.input.addPointer(3);

        this.drawBackground();
        this.generateNodes(6);

        this.input.on("pointerdown", this.onPointerDown, this);
        this.input.on("pointermove", this.onPointerMove, this);
        this.input.on("pointerup", this.onPointerUp, this);
    }

    /* ---------------- BACKGROUND ---------------- */

    drawBackground() {
        const g = this.add.graphics();
        const w = this.scale.width;
        const h = this.scale.height;

        for (let i = 0; i < h; i++) {
            const t = i / h;
            const color = Phaser.Display.Color.GetColor(
                200 - 50 * t,
                210 - 60 * t,
                180 - 40 * t
            );
            g.fillStyle(color, 1);
            g.fillRect(0, i, w, 1);
        }
    }

    /* ---------------- NODES ---------------- */

    generateNodes(count) {

        const w = this.scale.width;
        const h = this.scale.height;

        // 🔥 MAI MARE pe mobil
        const radius = Math.max(60, Math.min(w, h) * 0.08);

        let attempts = 0;

        while (this.nodes.length < count && attempts < 500) {
            attempts++;

            let x = Phaser.Math.Between(radius, w - radius);
            let y = Phaser.Math.Between(radius, h - radius);

            let ok = true;

            for (let n of this.nodes) {
                let d = Phaser.Math.Distance.Between(x, y, n.x, n.y);
                if (d < radius * 2.5) {
                    ok = false;
                    break;
                }
            }

            if (!ok) continue;

            let circle = this.add.circle(x, y, radius, 0xffffff);
            circle.setStrokeStyle(5, 0x333333);

            // 🔥 HIT AREA REALĂ (CRITIC)
            circle.setInteractive(new Phaser.Geom.Circle(0, 0, radius + 20), Phaser.Geom.Circle.Contains);

            let symbol = this.getRandomSymbol();

            let text = this.add.text(x, y, symbol, {
                fontSize: (radius * 0.8) + "px",
                color: "#000"
            }).setOrigin(0.5);

            this.nodes.push({
                x,
                y,
                radius,
                circle,
                text
            });
        }
    }

    getRandomSymbol() {
        const symbols = ["●", "▲", "■"];
        return Phaser.Utils.Array.GetRandom(symbols);
    }

    /* ---------------- LOGIC ---------------- */

    getNodeAt(x, y) {
        for (let node of this.nodes) {

            let dist = Phaser.Math.Distance.Between(x, y, node.x, node.y);

            // 🔥 SNAP REAL (margine + toleranță)
            if (dist <= node.radius + 30) {
                return node;
            }
        }
        return null;
    }

    onPointerDown(pointer) {

        const node = this.getNodeAt(pointer.worldX, pointer.worldY);

        if (!node) return;

        this.activeNode = node;

        this.tempLine = this.add.graphics();
        this.tempLine.lineStyle(8, 0xff9900, 1);
    }

    onPointerMove(pointer) {

        if (!this.activeNode || !this.tempLine) return;

        this.tempLine.clear();
        this.tempLine.lineStyle(8, 0xff9900, 1);

        this.tempLine.beginPath();
        this.tempLine.moveTo(this.activeNode.x, this.activeNode.y);
        this.tempLine.lineTo(pointer.worldX, pointer.worldY);
        this.tempLine.strokePath();
    }

    onPointerUp(pointer) {

        if (!this.activeNode) return;

        const target = this.getNodeAt(pointer.worldX, pointer.worldY);

        if (target && target !== this.activeNode) {

            if (!this.connectionExists(this.activeNode, target)) {

                const angle = Phaser.Math.Angle.Between(
                    this.activeNode.x,
                    this.activeNode.y,
                    target.x,
                    target.y
                );

                const startX = this.activeNode.x + Math.cos(angle) * this.activeNode.radius;
                const startY = this.activeNode.y + Math.sin(angle) * this.activeNode.radius;

                const endX = target.x - Math.cos(angle) * target.radius;
                const endY = target.y - Math.sin(angle) * target.radius;

                const line = this.add.graphics();
                line.lineStyle(8, 0xff9900, 1);
                line.beginPath();
                line.moveTo(startX, startY);
                line.lineTo(endX, endY);
                line.strokePath();

                this.connections.push({
                    a: this.activeNode,
                    b: target,
                    line
                });
            }
        }

        if (this.tempLine) {
            this.tempLine.destroy();
            this.tempLine = null;
        }

        this.activeNode = null;
    }

    connectionExists(a, b) {
        return this.connections.some(c =>
            (c.a === a && c.b === b) ||
            (c.a === b && c.b === a)
        );
    }
}

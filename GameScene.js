class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {

        this.nodes = [];
        this.connections = [];
        this.lines = [];

        this.activeNode = null;

        this.drawBackground();

        this.generateNodes(6); // test

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

    /* ---------------- NODE GENERATION ---------------- */

    generateNodes(count) {

        const w = this.scale.width;
        const h = this.scale.height;

        const radius = Math.max(40, Math.min(w, h) * 0.06); // 🔥 FIX: mare pe mobil

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
            circle.setStrokeStyle(4, 0x333333);

            // simbol
            let symbol = this.getRandomSymbol();
            let text = this.add.text(x, y, symbol, {
                fontSize: radius + "px",
                color: "#000"
            }).setOrigin(0.5);

            this.nodes.push({
                x,
                y,
                radius,
                circle,
                text,
                connections: []
            });
        }
    }

    getRandomSymbol() {
        const symbols = ["●", "▲", "■"];
        return Phaser.Utils.Array.GetRandom(symbols);
    }

    /* ---------------- INPUT ---------------- */

    getPointerWorld(pointer) {
        // 🔥 FIX CRITIC: coordonate corecte mobil
        const rect = this.game.canvas.getBoundingClientRect();

        return {
            x: (pointer.clientX - rect.left) * (this.scale.width / rect.width),
            y: (pointer.clientY - rect.top) * (this.scale.height / rect.height)
        };
    }

    getNodeAt(x, y) {
        for (let node of this.nodes) {

            let dist = Phaser.Math.Distance.Between(x, y, node.x, node.y);

            // 🔥 SNAP PE MARGINE (nu centru)
            if (dist <= node.radius + 20) { // toleranță mare pt mobil
                return node;
            }
        }
        return null;
    }

    onPointerDown(pointer) {

        const pos = this.getPointerWorld(pointer);
        const node = this.getNodeAt(pos.x, pos.y);

        if (!node) return;

        this.activeNode = node;

        this.tempLine = this.add.graphics();
        this.tempLine.lineStyle(6, 0xff9900, 1);
    }

    onPointerMove(pointer) {

        if (!this.activeNode || !this.tempLine) return;

        const pos = this.getPointerWorld(pointer);

        this.tempLine.clear();
        this.tempLine.lineStyle(6, 0xff9900, 1);

        this.tempLine.beginPath();
        this.tempLine.moveTo(this.activeNode.x, this.activeNode.y);
        this.tempLine.lineTo(pos.x, pos.y);
        this.tempLine.strokePath();
    }

    onPointerUp(pointer) {

        if (!this.activeNode) return;

        const pos = this.getPointerWorld(pointer);
        const target = this.getNodeAt(pos.x, pos.y);

        if (target && target !== this.activeNode) {

            if (!this.connectionExists(this.activeNode, target)) {

                // 🔥 SNAP EXACT LA MARGINE (nu centru)
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
                line.lineStyle(6, 0xff9900, 1);
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

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {

        this.nodes = [];
        this.connections = [];
        this.activeNode = null;

        this.input.addPointer(3);

        this.cameras.main.setBackgroundColor("#243447");

        this.generateNodes(5);

        this.input.on("pointerdown", this.onDown, this);
        this.input.on("pointermove", this.onMove, this);
        this.input.on("pointerup", this.onUp, this);
    }

    /* ---------------- NODES ---------------- */

    generateNodes(count) {

        const w = this.scale.width;
        const h = this.scale.height;

        const radius = Math.max(60, Math.min(w, h) * 0.08);

        let attempts = 0;

        while (this.nodes.length < count && attempts < 1000) {

            attempts++;

            let x = Phaser.Math.Between(radius, w - radius);
            let y = Phaser.Math.Between(radius, h - radius);

            let valid = true;

            for (let n of this.nodes) {
                let d = Phaser.Math.Distance.Between(x, y, n.x, n.y);

                // 🔥 prevenim suprapunerea REALĂ
                if (d < radius * 2.2) {
                    valid = false;
                    break;
                }
            }

            if (!valid) continue;

            let circle = this.add.circle(x, y, radius, 0xffffff);
            circle.setStrokeStyle(5, 0x333333);

            this.nodes.push({
                x,
                y,
                radius,
                circle,
                connections: 0
            });
        }
    }

    /* ---------------- UTILS ---------------- */

    getNode(x, y) {
        for (let n of this.nodes) {
            let d = Phaser.Math.Distance.Between(x, y, n.x, n.y);

            // 🔥 SNAP PE MARGINE
            if (d <= n.radius + 35) return n;
        }
        return null;
    }

    connectionExists(a, b) {
        return this.connections.some(c =>
            (c.a === a && c.b === b) ||
            (c.a === b && c.b === a)
        );
    }

    /* ---------------- INPUT ---------------- */

    onDown(pointer) {

        const node = this.getNode(pointer.worldX, pointer.worldY);

        if (!node) return;

        this.activeNode = node;

        this.temp = this.add.graphics();
        this.temp.lineStyle(6, 0xff9900);
    }

    onMove(pointer) {

        if (!this.activeNode || !this.temp) return;

        this.temp.clear();
        this.temp.lineStyle(6, 0xff9900);

        this.temp.beginPath();
        this.temp.moveTo(this.activeNode.x, this.activeNode.y);
        this.temp.lineTo(pointer.worldX, pointer.worldY);
        this.temp.strokePath();
    }

    onUp(pointer) {

        if (!this.activeNode) return;

        const target = this.getNode(pointer.worldX, pointer.worldY);

        if (target && target !== this.activeNode) {

            // 🔴 NU duplicăm conexiuni
            if (this.connectionExists(this.activeNode, target)) {
                this.cleanupTemp();
                return;
            }

            // 🔴 limitare simplă (max 3 conexiuni per nod)
            if (this.activeNode.connections >= 3 || target.connections >= 3) {
                this.cleanupTemp();
                return;
            }

            const angle = Phaser.Math.Angle.Between(
                this.activeNode.x,
                this.activeNode.y,
                target.x,
                target.y
            );

            // 🔥 SNAP la margine REAL
            const startX = this.activeNode.x + Math.cos(angle) * this.activeNode.radius;
            const startY = this.activeNode.y + Math.sin(angle) * this.activeNode.radius;

            const endX = target.x - Math.cos(angle) * target.radius;
            const endY = target.y - Math.sin(angle) * target.radius;

            const line = this.add.graphics();
            line.lineStyle(6, 0xff9900);

            line.beginPath();
            line.moveTo(startX, startY);
            line.lineTo(endX, endY);
            line.strokePath();

            this.connections.push({
                a: this.activeNode,
                b: target,
                line
            });

            this.activeNode.connections++;
            target.connections++;
        }

        this.cleanupTemp();
    }

    cleanupTemp() {
        if (this.temp) {
            this.temp.destroy();
            this.temp = null;
        }
        this.activeNode = null;
    }
}

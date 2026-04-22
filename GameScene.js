class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {

        console.log("GAME STARTED"); // 🔥 DEBUG

        this.nodes = [];
        this.activeNode = null;
        this.connections = [];

        this.input.addPointer(3);

        this.drawBackground();
        this.generateNodes(5);

        this.input.on("pointerdown", this.onDown, this);
        this.input.on("pointermove", this.onMove, this);
        this.input.on("pointerup", this.onUp, this);
    }

    drawBackground() {
        this.cameras.main.setBackgroundColor("#1e293b");
    }

    generateNodes(count) {

        const w = this.scale.width;
        const h = this.scale.height;

        const radius = 60;

        for (let i = 0; i < count; i++) {

            let x = Phaser.Math.Between(radius, w - radius);
            let y = Phaser.Math.Between(radius, h - radius);

            let circle = this.add.circle(x, y, radius, 0xffffff);
            circle.setStrokeStyle(4, 0x333333);

            this.nodes.push({
                x,
                y,
                radius,
                circle
            });
        }
    }

    getNode(x, y) {
        for (let n of this.nodes) {
            let d = Phaser.Math.Distance.Between(x, y, n.x, n.y);
            if (d < n.radius + 30) return n;
        }
        return null;
    }

    onDown(pointer) {
        this.activeNode = this.getNode(pointer.worldX, pointer.worldY);

        if (this.activeNode) {
            this.temp = this.add.graphics();
            this.temp.lineStyle(6, 0xff9900);
        }
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

        let target = this.getNode(pointer.worldX, pointer.worldY);

        if (target && target !== this.activeNode) {

            let g = this.add.graphics();
            g.lineStyle(6, 0xff9900);

            g.beginPath();
            g.moveTo(this.activeNode.x, this.activeNode.y);
            g.lineTo(target.x, target.y);
            g.strokePath();
        }

        if (this.temp) this.temp.destroy();

        this.activeNode = null;
    }
}

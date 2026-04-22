class BootScene extends Phaser.Scene {

    constructor() {
        super("BootScene");
    }

    create() {

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.text(w / 2, h / 2, "MindFlow Running", {
            fontFamily: "Courier New",
            fontSize: "28px",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        this.time.delayedCall(1000, () => {
            this.scene.start("GameScene");
        });
    }
}

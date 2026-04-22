class GameScene extends Phaser.Scene {
constructor() {
super('GameScene');
}

create() {
this.add.text(200, 250, 'MindFlow Running', {
fontSize: '32px',
fill: '#ffffff'
});
}
}

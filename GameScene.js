class GameScene extends Phaser.Scene {

constructor() {
super("GameScene");
}

create() {

this.ageGroup = window.playerAgeGroup || "adult";
this.level = window.playerLevel || 1;

this.createAdaptiveBackground();
this.createNodes();

}

/* =================================================
AGE STYLE SYSTEM
================================================= */

getAgeStyle() {

const styles = {

child: {
nodeColor: 0xffcc66,
lineColor: 0x66ccff,
pulse: true,
radius: 22,
fontSize: "18px"
},

teen: {
nodeColor: 0x00e5ff,
lineColor: 0xff00ff,
pulse: true,
radius: 18,
fontSize: "16px"
},

adult: {
nodeColor: 0xffffff,
lineColor: 0x00bcd4,
pulse: false,
radius: 16,
fontSize: "14px"
},

senior: {
nodeColor: 0xfff176,
lineColor: 0xffffff,
pulse: false,
radius: 20,
fontSize: "18px"
}

};

return styles[this.ageGroup] || styles.adult;

}

/* =================================================
BACKGROUND
================================================= */

createAdaptiveBackground() {

const palettes = {

child: [[0xE3F2FD,0xBBDEFB],[0xE8F5E9,0xC8E6C9]],
teen: [[0x0f2027,0x203a43],[0x141e30,0x243b55]],
adult: [[0x020617,0x020617],[0x030712,0x020617]],
senior: [[0x1f2933,0x4b5563],[0x374151,0x6b7280]]

};

const palette = Phaser.Utils.Array.GetRandom(palettes[this.ageGroup]);

this.drawGradient(palette[0], palette[1]);

}

drawGradient(topColor, bottomColor) {

const width = this.scale.width;
const height = this.scale.height;

const graphics = this.add.graphics();
graphics.setDepth(-1000);

const c1 = Phaser.Display.Color.ValueToColor(topColor);
const c2 = Phaser.Display.Color.ValueToColor(bottomColor);

for (let i = 0; i < height; i++) {

const t = i / height;

const r = Phaser.Math.Linear(c1.red, c2.red, t);
const g = Phaser.Math.Linear(c1.green, c2.green, t);
const b = Phaser.Math.Linear(c1.blue, c2.blue, t);

const color = Phaser.Display.Color.GetColor(r,g,b);

graphics.fillStyle(color,1);
graphics.fillRect(0,i,width,1);

}

}

/* =================================================
NODE GENERATION
================================================= */

createNodes() {

const style = this.getAgeStyle();

const nodeCount = Phaser.Math.Clamp(3 + this.level, 4, 12);

this.nodes = [];

for(let i=0;i<nodeCount;i++){

const pos = this.getValidPosition();

const value = Phaser.Math.Between(1,5);

const circle = this.add.circle(
pos.x,
pos.y,
style.radius,
style.nodeColor
);

circle.setStrokeStyle(2,0xffffff);

circle.value = value;
circle.connected = false;

const label = this.add.text(
pos.x,
pos.y,
value,
{
fontSize: style.fontSize,
color:"#000"
}
).setOrigin(0.5);

circle.label = label;

this.nodes.push(circle);

if(style.pulse){
this.addPulse(circle);
}

}

}

/* =================================================
NO OVERLAP POSITION
================================================= */

getValidPosition(){

let valid = false;
let x,y;

while(!valid){

x = Phaser.Math.Between(80,this.scale.width-80);
y = Phaser.Math.Between(120,this.scale.height-80);

valid = true;

for(let node of this.nodes){

const dist = Phaser.Math.Distance.Between(x,y,node.x,node.y);

if(dist < 90){
valid = false;
break;
}

}

}

return {x,y};

}

/* =================================================
PULSE EFFECT
================================================= */

addPulse(node){

this.tweens.add({
targets: node,
scale: 1.15,
duration: 800,
yoyo: true,
repeat: -1,
ease: "sine.inout"
});

}
}
class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");
}

create() {

this.level = window.currentLevel || 1;

this.colors = this.createAdaptiveBackground();

this.nodes = [];
this.lines = [];
this.selectedNode = null;
this.totalCost = 0;

this.costText = this.add.text(20, 40, "Cost: 0", {
fontSize: Math.round(this.scale.width * 0.05) + "px",
color: "#ffffff",
backgroundColor: "#00000066",
padding: { x: 8, y: 4 }
})
.setDepth(2000);

this.createNodes();

this.input.on("pointerdown", this.onPointerDown, this);
this.input.on("pointerup", this.onPointerUp, this);

}

/* ---------- BACKGROUND ---------- */

createAdaptiveBackground() {

const palettes = {
very_easy:{bg:[[0x1e3a8a,0x60a5fa]],node:[0xffd166,0xffadad,0xcaffbf]},
easy:{bg:[[0x0f172a,0x334155]],node:[0x90dbf4,0xf1fa8c,0xffb703]},
normal:{bg:[[0x020617,0x0f172a]],node:[0x00f5d4,0xffbe0b,0xfb5607]},
relaxed:{bg:[[0x1c1917,0x44403c]],node:[0xa7c957,0xfcbf49,0x90dbf4]}
};

const difficulty = window.playerDifficulty || "normal";
const pack = Phaser.Utils.Array.GetRandom(palettes[difficulty].bg);

this.drawGradient(pack[0], pack[1]);

return palettes[difficulty].node;

}

drawGradient(topColor,bottomColor){

const width = this.scale.width;
const height = this.scale.height;

const graphics = this.add.graphics();
graphics.setDepth(-1000);

const c1 = Phaser.Display.Color.ValueToColor(topColor);
const c2 = Phaser.Display.Color.ValueToColor(bottomColor);

for(let i=0;i<height;i++){

const t=i/height;

const r=Phaser.Math.Interpolation.Linear([c1.red,c2.red],t);
const g=Phaser.Math.Interpolation.Linear([c1.green,c2.green],t);
const b=Phaser.Math.Interpolation.Linear([c1.blue,c2.blue],t);

const color=Phaser.Display.Color.GetColor(r,g,b);

graphics.fillStyle(color,1);
graphics.fillRect(0,i,width,1);

}

}

/* ---------- NODES ---------- */

createNodes(){

const width=this.scale.width;
const height=this.scale.height;

const nodeCount = Math.min(4 + this.level - 1, 12);
const minDistance = 80;

for(let i=0;i<nodeCount;i++){

let x,y,valid=false;

while(!valid){

x=Phaser.Math.Between(80,width-80);
y=Phaser.Math.Between(140,height-80);

valid=true;

this.nodes.forEach(n=>{
const d = Phaser.Math.Distance.Between(x,y,n.x,n.y);
if(d < minDistance) valid=false;
});

}

const color = Phaser.Utils.Array.GetRandom(this.colors);
const weight = Phaser.Math.Between(1,5);

const node = this.add.circle(x,y,20,color)
.setStrokeStyle(2,0xffffff)
.setInteractive();

node.weight = weight;
node.connected = false;

/* FIXED NODES */
node.fixed = (this.level > 5 && Phaser.Math.Between(0,100) < 30);

/* REQUIRED NODES */
node.required = (this.level > 3 && Phaser.Math.Between(0,100) < 40);

if(node.fixed){
node.setStrokeStyle(3,0xff0000);
}

if(node.required){
node.setStrokeStyle(3,0xffff00);
}

const label = this.add.text(x,y,weight,{
fontSize:"16px",
color:"#000000"
}).setOrigin(0.5);

node.label = label;

this.tweens.add({
targets: node,
scale: 1.15,
duration: 800,
yoyo: true,
repeat: -1
});

this.nodes.push(node);

}

}

/* ---------- INPUT ---------- */

onPointerDown(pointer){

this.nodes.forEach(node=>{

const dist=Phaser.Math.Distance.Between(pointer.x,pointer.y,node.x,node.y);

if(dist<24){
this.selectedNode=node;
}

});

}

onPointerUp(pointer){

if(!this.selectedNode) return;

this.nodes.forEach(node=>{

const dist=Phaser.Math.Distance.Between(pointer.x,pointer.y,node.x,node.y);

if(dist<24 && node!==this.selectedNode){

this.createConnection(this.selectedNode,node);

}

});

this.selectedNode=null;

}

/* ---------- CONNECTION ---------- */

createConnection(nodeA,nodeB){

if(nodeA.fixed && nodeA.connected) return;
if(nodeB.fixed && nodeB.connected) return;

const baseDistance = Phaser.Math.Distance.Between(
nodeA.x,nodeA.y,
nodeB.x,nodeB.y
);

const distance = Math.round(baseDistance * (nodeA.weight + nodeB.weight)/2);

const line=this.add.line(
0,0,
nodeA.x,nodeA.y,
nodeB.x,nodeB.y,
0xffffff
);

line.setOrigin(0,0);
line.setLineWidth(3);

nodeA.connected = true;
nodeB.connected = true;

this.stopPulse(nodeA);
this.stopPulse(nodeB);

const midX=(nodeA.x+nodeB.x)/2;
const midY=(nodeA.y+nodeB.y)/2;

const costLabel = this.add.text(midX, midY, distance, {
fontSize: Math.round(this.scale.width * 0.035) + "px",
color: "#ffffff",
backgroundColor: "#000000aa",
padding: { x: 6, y: 3 }
})
.setOrigin(0.5)
.setDepth(2000);

this.lines.push({line,costLabel});

this.totalCost+=distance;
this.costText.setText("Cost: "+this.totalCost);

}

stopPulse(node){
this.tweens.killTweensOf(node);
node.setScale(1);
}

}
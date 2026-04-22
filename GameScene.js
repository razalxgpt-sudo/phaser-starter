class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");
}

create() {

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
.setDepth(2000)
.setScrollFactor(0);

this.createNodes();

this.input.on("pointerdown", this.onPointerDown, this);
this.input.on("pointerup", this.onPointerUp, this);

}

/* ---------- BACKGROUND ---------- */

createAdaptiveBackground() {

const palettes = {

very_easy:{
bg:[[0x1e3a8a,0x60a5fa],[0x065f46,0x34d399]],
node:[0xffd166,0xffadad,0xcaffbf]
},

easy:{
bg:[[0x0f172a,0x334155],[0x111827,0x374151]],
node:[0x90dbf4,0xf1fa8c,0xffb703]
},

normal:{
bg:[[0x020617,0x0f172a],[0x030712,0x111827]],
node:[0x00f5d4,0xffbe0b,0xfb5607]
},

relaxed:{
bg:[[0x1c1917,0x44403c],[0x1f2933,0x4b5563]],
node:[0xa7c957,0xfcbf49,0x90dbf4]
}

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

const color1 = Phaser.Display.Color.ValueToColor(topColor);
const color2 = Phaser.Display.Color.ValueToColor(bottomColor);

for(let i=0;i<height;i++){

const t=i/height;

const r=Phaser.Math.Interpolation.Linear([color1.red,color2.red],t);
const g=Phaser.Math.Interpolation.Linear([color1.green,color2.green],t);
const b=Phaser.Math.Interpolation.Linear([color1.blue,color2.blue],t);

const color=Phaser.Display.Color.GetColor(r,g,b);

graphics.fillStyle(color,1);
graphics.fillRect(0,i,width,1);

}

}

/* ---------- GAME ---------- */

createNodes(){

const width=this.scale.width;
const height=this.scale.height;

for(let i=0;i<5;i++){

const x=Phaser.Math.Between(100,width-100);
const y=Phaser.Math.Between(120,height-120);

const color=Phaser.Utils.Array.GetRandom(this.colors);

const node=this.add.circle(x,y,18,color)
.setStrokeStyle(2,0xffffff)
.setInteractive();

this.nodes.push(node);

}

}

onPointerDown(pointer){

this.nodes.forEach(node=>{

const dist=Phaser.Math.Distance.Between(
pointer.x,
pointer.y,
node.x,
node.y
);

if(dist<22){
this.selectedNode=node;
}

});

}

onPointerUp(pointer){

if(!this.selectedNode) return;

this.nodes.forEach(node=>{

const dist=Phaser.Math.Distance.Between(
pointer.x,
pointer.y,
node.x,
node.y
);

if(dist<22 && node!==this.selectedNode){

this.createConnection(this.selectedNode,node);

}

});

this.selectedNode=null;

}

/* ---------- CONNECTION ---------- */

createConnection(nodeA,nodeB){

const distance=Math.round(
Phaser.Math.Distance.Between(
nodeA.x,nodeA.y,
nodeB.x,nodeB.y
)
);

const line=this.add.line(
0,0,
nodeA.x,nodeA.y,
nodeB.x,nodeB.y,
0xffffff
);

line.setOrigin(0,0);
line.setLineWidth(3);

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

}
class GameScene extends Phaser.Scene {

constructor(){
super("GameScene");
}

create(){

this.ageGroup = window.playerAgeGroup || "adult";
this.level = window.playerLevel || 1;

this.connections = [];
this.dragLine = null;
this.selectedNode = null;

this.createBackground();
this.createNodes();
this.enableInteraction();

}

/* ===================== BACKGROUND ===================== */

createBackground(){

const g = this.add.graphics();
g.fillGradientStyle(0x020617,0x020617,0x030712,0x030712,1);
g.fillRect(0,0,this.scale.width,this.scale.height);

}

/* ===================== NODES ===================== */

createNodes(){

const count = Phaser.Math.Clamp(3 + this.level,4,12);

this.nodes = [];

for(let i=0;i<count;i++){

const pos = this.getValidPosition();
const value = Phaser.Math.Between(1,5);

const node = this.add.circle(pos.x,pos.y,18,0xffffff);
node.setStrokeStyle(2,0x000000);

node.value = value;
node.connected = false;

const label = this.add.text(pos.x,pos.y,value,{
fontSize:"14px",
color:"#000"
}).setOrigin(0.5);

node.label = label;

node.setInteractive(new Phaser.Geom.Circle(0,0,18),Phaser.Geom.Circle.Contains);
node.input.alwaysEnabled = true;

this.nodes.push(node);

}

}

/* ===================== NO OVERLAP ===================== */

getValidPosition(){

let valid=false;
let x,y;

while(!valid){

x=Phaser.Math.Between(80,this.scale.width-80);
y=Phaser.Math.Between(120,this.scale.height-80);

valid=true;

for(let n of this.nodes){

if(Phaser.Math.Distance.Between(x,y,n.x,n.y)<90){
valid=false;
break;
}

}

}

return{x,y};

}

/* ===================== INTERACTION ===================== */

enableInteraction(){

this.input.on("pointerdown",(pointer)=>{

const x = pointer.worldX;
const y = pointer.worldY;

const node = this.getNodeAt(x,y);

if(node){

this.selectedNode = node;

this.dragLine = this.add.line(
0,0,
node.x,node.y,
x,y,
0xffffff
).setLineWidth(3);

}

});

this.input.on("pointermove",(pointer)=>{

if(!this.dragLine) return;

const x = pointer.worldX;
const y = pointer.worldY;

this.dragLine.setTo(
this.selectedNode.x,
this.selectedNode.y,
x,
y
);

});

this.input.on("pointerup",(pointer)=>{

if(!this.selectedNode) return;

const x = pointer.worldX;
const y = pointer.worldY;

const target = this.getNodeAt(x,y);

if(target && target !== this.selectedNode){
this.createConnection(this.selectedNode,target);
}

if(this.dragLine){
this.dragLine.destroy();
this.dragLine = null;
}

this.selectedNode = null;

});

}

/* ===================== GET NODE ===================== */

getNodeAt(x,y){

for(let node of this.nodes){

const d = Phaser.Math.Distance.Between(x,y,node.x,node.y);

if(d < 25){
return node;
}

}

return null;

}

/* ===================== CONNECTION ===================== */

createConnection(a,b){

const line = this.add.line(
0,0,
a.x,a.y,
b.x,b.y,
0x00bcd4
).setLineWidth(3);

this.connections.push({a,b,line});

a.connected = true;
b.connected = true;

}

/* ===================== UPDATE ===================== */

update(){

for(let node of this.nodes){

if(!node.connected){
node.alpha = 0.7 + Math.sin(this.time.now/300)*0.3;
}else{
node.alpha = 1;
}

}

}

}
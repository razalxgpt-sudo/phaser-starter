class GameScene extends Phaser.Scene {

constructor(){
super("GameScene");
}

create(){

this.connections = [];
this.selectedNode = null;

this.createBackground();
this.createNodes();

this.graphics = this.add.graphics();
this.tempGraphics = this.add.graphics();

this.enableInteraction();

}

/* BACKGROUND */

createBackground(){
this.cameras.main.setBackgroundColor("#020617");
}

/* NODES */

createNodes(){

this.nodes = [];
const count = 5;

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

this.nodes.push(node);

}

}

/* NO OVERLAP */

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

/* INTERACTION */

enableInteraction(){

this.input.on("pointerdown",(pointer)=>{

const p = pointer.positionToCamera(this.cameras.main);

const node = this.getNodeAt(p.x,p.y);

if(node){
this.selectedNode = node;
}

});

this.input.on("pointermove",(pointer)=>{

if(!this.selectedNode) return;

const p = pointer.positionToCamera(this.cameras.main);

this.tempGraphics.clear();
this.tempGraphics.lineStyle(3,0x00bcd4);

this.tempGraphics.beginPath();
this.tempGraphics.moveTo(this.selectedNode.x,this.selectedNode.y);
this.tempGraphics.lineTo(p.x,p.y);
this.tempGraphics.strokePath();

});

this.input.on("pointerup",(pointer)=>{

if(!this.selectedNode) return;

const p = pointer.positionToCamera(this.cameras.main);
const target = this.getNodeAt(p.x,p.y);

if(target && target !== this.selectedNode){
this.createConnection(this.selectedNode,target);
}

this.tempGraphics.clear();
this.selectedNode = null;

});

}

/* GET NODE */

getNodeAt(x,y){

for(let node of this.nodes){

const d = Phaser.Math.Distance.Between(x,y,node.x,node.y);

if(d < 22){
return node;
}

}

return null;

}

/* CONNECTION */

createConnection(a,b){

this.graphics.lineStyle(3,0x00bcd4);

this.graphics.beginPath();
this.graphics.moveTo(a.x,a.y);
this.graphics.lineTo(b.x,b.y);
this.graphics.strokePath();

this.connections.push({a,b});

a.connected=true;
b.connected=true;

}

/* UPDATE */

update(){

for(let node of this.nodes){

if(!node.connected){
node.alpha = 0.7 + Math.sin(this.time.now/300)*0.3;
}else{
node
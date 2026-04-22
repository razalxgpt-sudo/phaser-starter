class GameScene extends Phaser.Scene {

constructor(){
super("GameScene");
}

create(){

this.connections = [];
this.dragLine = null;
this.selectedNode = null;

this.createBackground();
this.createNodes();
this.enableInteraction();

}

/* BACKGROUND */

createBackground(){
this.cameras.main.setBackgroundColor("#020617");
}

/* NODES */

createNodes(){

const count = 5;
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

this.dragLine = this.add.line(
0,0,
node.x,node.y,
p.x,p.y,
0xffffff
).setLineWidth(3);

}

});

this.input.on("pointermove",(pointer)=>{

if(!this.dragLine) return;

const p = pointer.positionToCamera(this.cameras.main);

this.dragLine.setTo(
this.selectedNode.x,
this.selectedNode.y,
p.x,
p.y
);

});

this.input.on("pointerup",(pointer)=>{

if(!this.selectedNode) return;

const p = pointer.positionToCamera(this.cameras.main);

const target = this.getNodeAt(p.x,p.y);

if(target && target !== this.selectedNode){
this.createConnection(this.selectedNode,target);
}

if(this.dragLine){
this.dragLine.destroy();
this.dragLine=null;
}

this.selectedNode=null;

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

const line = this.add.line(
0,0,
a.x,a.y,
b.x,b.y,
0x00bcd4
).setLineWidth(3);

this.connections.push({a,b,line});

a.connected=true;
b.connected=true;

}

/* UPDATE */

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
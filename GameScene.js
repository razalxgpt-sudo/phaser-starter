class GameScene extends Phaser.Scene {

constructor(){
super("GameScene");
}

create(){

this.connections = [];
this.graphics = this.add.graphics();
this.tempGraphics = this.add.graphics();

this.createBackground();
this.createNodes();

this.input.on("pointermove", this.onPointerMove, this);
this.input.on("pointerup", this.onPointerUp, this);

}

createBackground(){
this.cameras.main.setBackgroundColor("#020617");
}

createNodes(){

this.nodes = [];
this.selectedNode = null;

const count = 5;

for(let i=0;i<count;i++){

const pos = this.getValidPosition();
const value = Phaser.Math.Between(1,4);

const node = this.add.circle(pos.x,pos.y,20,0xffffff);
node.setStrokeStyle(2,0x000000);

node.value = value;
node.connections = 0;

const label = this.add.text(pos.x,pos.y,value,{
fontSize:"16px",
color:"#000"
}).setOrigin(0.5);

node.label = label;

node.setInteractive();

node.on("pointerdown",()=>{
if(node.connections < node.value){
this.selectedNode = node;
}
});

this.nodes.push(node);

}

}

getValidPosition(){

let valid=false;
let x,y;

while(!valid){

x=Phaser.Math.Between(80,this.scale.width-80);
y=Phaser.Math.Between(120,this.scale.height-80);

valid=true;

for(let n of this.nodes){

if(Phaser.Math.Distance.Between(x,y,n.x,n.y)<100){
valid=false;
break;
}

}

}

return{x,y};

}

onPointerMove(pointer){

if(!this.selectedNode) return;

this.tempGraphics.clear();
this.tempGraphics.lineStyle(3,0x00bcd4);

this.tempGraphics.beginPath();
this.tempGraphics.moveTo(this.selectedNode.x,this.selectedNode.y);
this.tempGraphics.lineTo(pointer.x,pointer.y);
this.tempGraphics.strokePath();

}

onPointerUp(pointer){

if(!this.selectedNode) return;

const target = this.getNodeAt(pointer.x,pointer.y);

if(target && target !== this.selectedNode){
this.tryCreateConnection(this.selectedNode,target);
}

this.tempGraphics.clear();
this.selectedNode = null;

}

getNodeAt(x,y){

for(let node of this.nodes){

const d = Phaser.Math.Distance.Between(x,y,node.x,node.y);

if(d < 24){
return node;
}

}

return null;

}

tryCreateConnection(a,b){

if(a.connections >= a.value) return;
if(b.connections >= b.value) return;

if(this.connectionExists(a,b)) return;

if(this.wouldIntersect(a,b)) return;

this.createConnection(a,b);

}

connectionExists(a,b){

for(let c of this.connections){
if((c.a===a && c.b===b) || (c.a===b && c.b===a)){
return true;
}
}
return false;

}

wouldIntersect(a,b){

for(let c of this.connections){

if(this.linesIntersect(
a.x,a.y,
b.x,b.y,
c.a.x,c.a.y,
c.b.x,c.b.y
)){
return true;
}

}

return false;

}

linesIntersect(x1,y1,x2,y2,x3,y3,x4,y4){

function ccw(ax,ay,bx,by,cx,cy){
return (cy-ay)*(bx-ax) > (by-ay)*(cx-ax);
}

return (ccw(x1,y1,x3,y3,x4,y4) !== ccw(x2,y2,x3,y3,x4,y4)) &&
(ccw(x1,y1,x2,y2,x3,y3) !== ccw(x1,y1,x2,y2,x4,y4));

}

createConnection(a,b){

this.graphics.lineStyle(3,0x00bcd4);

this.graphics.beginPath();
this.graphics.moveTo(a.x,a.y);
this.graphics.lineTo(b.x,b.y);
this.graphics.strokePath();

this.connections.push({a,b});

a.connections++;
b.connections++;

this.updateNode(a);
this.updateNode(b);

this.checkWin();

}

updateNode(node){

if(node.connections === node.value){
node.setFillStyle(0x66bb6a);
}else{
node.setFillStyle(0xffffff);
}

}

checkWin(){

for(let node of this.nodes){
if(node.connections !== node.value){
return;
}
}

this.showWin();

}

showWin(){

this.add.text(
this.scale.width/2,
50,
"Puzzle complet!",
{
fontSize:"28px",
color:"#00ffcc"
}
).setOrigin(0.5);

}

}
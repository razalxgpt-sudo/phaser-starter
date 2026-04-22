
class GameScene extends Phaser.Scene {

constructor() {
super("GameScene");
}

create() {

this.ageGroup = window.playerAgeGroup || "adult";
this.level = window.playerLevel || 1;

this.connections = [];
this.dragLine = null;
this.selectedNode = null;

this.createAdaptiveBackground();
this.createNodes();
this.enableInteraction();

}

/* =========================
AGE STYLE
========================= */

getAgeStyle() {

const styles = {

child:{nodeColor:0xffcc66,lineColor:0x66ccff,pulse:true,radius:22,fontSize:"18px"},
teen:{nodeColor:0x00e5ff,lineColor:0xff00ff,pulse:true,radius:18,fontSize:"16px"},
adult:{nodeColor:0xffffff,lineColor:0x00bcd4,pulse:false,radius:16,fontSize:"14px"},
senior:{nodeColor:0xfff176,lineColor:0xffffff,pulse:false,radius:20,fontSize:"18px"}

};

return styles[this.ageGroup] || styles.adult;

}

/* =========================
BACKGROUND
========================= */

createAdaptiveBackground(){

const palettes={
child:[[0xE3F2FD,0xBBDEFB],[0xE8F5E9,0xC8E6C9]],
teen:[[0x0f2027,0x203a43],[0x141e30,0x243b55]],
adult:[[0x020617,0x020617],[0x030712,0x020617]],
senior:[[0x1f2933,0x4b5563],[0x374151,0x6b7280]]
};

const palette=Phaser.Utils.Array.GetRandom(palettes[this.ageGroup]);
this.drawGradient(palette[0],palette[1]);

}

drawGradient(top,bottom){

const w=this.scale.width;
const h=this.scale.height;

const g=this.add.graphics().setDepth(-1000);

const c1=Phaser.Display.Color.ValueToColor(top);
const c2=Phaser.Display.Color.ValueToColor(bottom);

for(let i=0;i<h;i++){

const t=i/h;

const r=Phaser.Math.Linear(c1.red,c2.red,t);
const gg=Phaser.Math.Linear(c1.green,c2.green,t);
const b=Phaser.Math.Linear(c1.blue,c2.blue,t);

g.fillStyle(Phaser.Display.Color.GetColor(r,gg,b),1);
g.fillRect(0,i,w,1);

}

}

/* =========================
NODES
========================= */

createNodes(){

const style=this.getAgeStyle();
const count=Phaser.Math.Clamp(3+this.level,4,12);

this.nodes=[];

for(let i=0;i<count;i++){

const pos=this.getValidPosition();
const value=Phaser.Math.Between(1,5);

const node=this.add.circle(pos.x,pos.y,style.radius,style.nodeColor);
node.setStrokeStyle(2,0xffffff);

node.value=value;
node.connected=false;

node.fixed=this.level>6 && Math.random()<0.3;
node.required=this.level>8 && Math.random()<0.2;

if(node.fixed) node.setStrokeStyle(3,0xff0000);
if(node.required) node.setStrokeStyle(3,0xffff00);

const label=this.add.text(pos.x,pos.y,value,{
fontSize:style.fontSize,
color:"#000"
}).setOrigin(0.5);

node.label=label;

this.nodes.push(node);

if(style.pulse) this.addPulse(node);

}

}

/* =========================
NO OVERLAP
========================= */

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

/* =========================
PULSE
========================= */

addPulse(node){

this.tweens.add({
targets:node,
scale:1.15,
duration:800,
yoyo:true,
repeat:-1
});

}

/* =========================
INTERACTION
========================= */

enableInteraction(){

this.input.on("pointerdown",pointer=>{

const node=this.getNodeAt(pointer.x,pointer.y);

if(node){
this.selectedNode=node;

this.dragLine=this.add.line(
0,0,
node.x,node.y,
pointer.x,pointer.y,
0xffffff
).setLineWidth(2);
}

});

this.input.on("pointermove",pointer=>{

if(this.dragLine){
this.dragLine.setTo(
this.selectedNode.x,
this.selectedNode.y,
pointer.x,
pointer.y
);
}

});

this.input.on("pointerup",pointer=>{

if(!this.selectedNode) return;

const target=this.getNodeAt(pointer.x,pointer.y);

if(target && target!==this.selectedNode){
this.createConnection(this.selectedNode,target);
}

if(this.dragLine){
this.dragLine.destroy();
this.dragLine=null;
}

this.selectedNode=null;

});

}

/* =========================
GET NODE
========================= */

getNodeAt(x,y){

for(let node of this.nodes){

const d=Phaser.Math.Distance.Between(x,y,node.x,node.y);

if(d<node.radius+5){
return node;
}

}

return null;

}

/* =========================
CREATE CONNECTION
========================= */

createConnection(a,b){

const style=this.getAgeStyle();

const line=this.add.line(
0,0,
a.x,a.y,
b.x,b.y,
style.lineColor
).setLineWidth(3);

this.connections.push({a,b,line});

a.connected=true;
b.connected=true;

}

/* =========================
UPDATE
========================= */

update(){

for(let node of this.nodes){

if(!node.connected){
node.alpha=0.7+Math.sin(this.time.now/300)*0.3;
}else{
node.alpha=1;
}

}

}

}
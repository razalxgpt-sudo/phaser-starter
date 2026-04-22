class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");

this.nodes = [];
this.edges = [];
this.history = [];

this.currentLine = null;
this.startNode = null;

this.level = 1;
this.maxNodes = 4;

this.nodeRadius = 0;
this.symbolSize = 0;

this.score = 0;
this.perfectCost = 0;

this.ageGroup = this.detectAge();

this.symbols = ["▲","●","■","◆","★","✚","⬟","⬢","⬣","✦","✿","☀"];
}

create() {

this.computeSizes();

this.createBackground();
this.lineGraphics = this.add.graphics().setDepth(2);

this.createNodes();
this.enableInput();
this.createUI();

this.computeMST();

}

/* ---------------- AGE ---------------- */

detectAge(){
return localStorage.getItem("ageGroup") || "child";
}

/* ---------------- SIZES ---------------- */

computeSizes(){

let w = window.innerWidth;
let h = window.innerHeight;

/* PE MOBIL creștem agresiv */
this.nodeRadius = Math.floor(Math.min(w,h) / 8);
this.nodeRadius = Phaser.Math.Clamp(this.nodeRadius, 40, 90);

this.symbolSize = Math.floor(this.nodeRadius * 0.8);

}

/* ---------------- BACKGROUND ---------------- */

createBackground(){

let g = this.add.graphics().setDepth(-1000);
let w=this.scale.width, h=this.scale.height;

for(let i=0;i<h;i++){
let t=i/h;
let r=200 - t*50;
let gcol=220 - t*80;
let b=255 - t*120;
let c = Phaser.Display.Color.GetColor(r,gcol,b);
g.fillStyle(c,1);
g.fillRect(0,i,w,1);
}

}

/* ---------------- NODES ---------------- */

createNodes(){

this.nodes=[];

let w=this.scale.width;
let h=this.scale.height;

this.maxNodes = Math.min(4 + this.level, 12);

let tries=0;

while(this.nodes.length < this.maxNodes && tries<2000){

tries++;

let x=Phaser.Math.Between(100,w-100);
let y=Phaser.Math.Between(150,h-100);

let ok=true;

for(let n of this.nodes){
let d=Phaser.Math.Distance.Between(x,y,n.x,n.y);
if(d < this.nodeRadius*2.5) ok=false;
}

if(!ok) continue;

/* fără aliniere */
let aligned = this.nodes.some(n =>
Math.abs(n.x-x)<this.nodeRadius ||
Math.abs(n.y-y)<this.nodeRadius
);

if(aligned) continue;

let node = this.add.circle(x,y,this.nodeRadius,0xffffff)
.setStrokeStyle(5,0x000000);

if(this.ageGroup==="child"){
let s = this.add.text(x,y,this.symbols[this.nodes.length],{
fontSize:this.symbolSize+"px",
color:"#000"
}).setOrigin(0.5);
node.label=s;
}else{
let value = Phaser.Math.Between(1,5);
node.value=value;
let s = this.add.text(x,y,value,{
fontSize:this.symbolSize+"px",
color:"#000"
}).setOrigin(0.5);
node.label=s;
}

node.connected=false;
this.nodes.push(node);

}

/* pulse */
this.tweens.add({
targets:this.nodes,
scale:1.1,
duration:700,
yoyo:true,
repeat:-1
});

}

/* ---------------- INPUT ---------------- */

enableInput(){

this.input.on("pointerdown",(p)=>{
let n=this.getNode(p.x,p.y);
if(!n) return;

this.startNode=n;
this.currentLine={x1:n.x,y1:n.y,x2:p.x,y2:p.y};
});

this.input.on("pointermove",(p)=>{
if(!this.currentLine) return;
this.currentLine.x2=p.x;
this.currentLine.y2=p.y;
this.draw();
});

this.input.on("pointerup",(p)=>{

if(!this.currentLine) return;

let t=this.getNode(p.x,p.y);

if(t && t!==this.startNode){

if(!this.edgeExists(this.startNode,t)){

let e=this.makeEdge(this.startNode,t);

if(!this.intersects(e)){
this.edges.push(e);
this.history.push(e);
}

}

}

this.currentLine=null;
this.startNode=null;

this.updateConnectivity();
this.draw();
this.checkWin();

});

this.input.keyboard.on("keydown-Z",()=>this.undo());

}

/* ---------------- EDGE ---------------- */

makeEdge(a,b){

let ang = Phaser.Math.Angle.Between(a.x,a.y,b.x,b.y);

let x1=a.x+Math.cos(ang)*this.nodeRadius;
let y1=a.y+Math.sin(ang)*this.nodeRadius;

let x2=b.x-Math.cos(ang)*this.nodeRadius;
let y2=b.y-Math.sin(ang)*this.nodeRadius;

let cost=Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);

return {a,b,x1,y1,x2,y2,cost};

}

edgeExists(a,b){
return this.edges.some(e =>
(e.a===a && e.b===b)||(e.a===b && e.b===a)
);
}

/* ---------------- MST ---------------- */

computeMST(){

let allEdges=[];

for(let i=0;i<this.nodes.length;i++){
for(let j=i+1;j<this.nodes.length;j++){

let a=this.nodes[i], b=this.nodes[j];
let cost=Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);

allEdges.push({a,b,cost});
}
}

/* sort */
allEdges.sort((a,b)=>a.cost-b.cost);

/* union-find simplu */
let parent=new Map();
this.nodes.forEach(n=>parent.set(n,n));

function find(x){
while(parent.get(x)!==x) x=parent.get(x);
return x;
}

function union(a,b){
parent.set(find(a),find(b));
}

let mst=[];
let total=0;

for(let e of allEdges){

let pa=find(e.a), pb=find(e.b);

if(pa!==pb){
union(pa,pb);
mst.push(e);
total+=e.cost;
}

}

this.perfectCost=total;

}

/* ---------------- CONNECTIVITY ---------------- */

updateConnectivity(){

this.nodes.forEach(n=>n.connected=false);

let stack=[this.nodes[0]];
let visited=new Set();

while(stack.length){
let n=stack.pop();
visited.add(n);

this.edges.forEach(e=>{
if(e.a===n && !visited.has(e.b)) stack.push(e.b);
if(e.b===n && !visited.has(e.a)) stack.push(e.a);
});
}

visited.forEach(n=>n.connected=true);

}

/* ---------------- WIN ---------------- */

checkWin(){

if(this.edges.length !== this.nodes.length-1) return;

let all = this.nodes.every(n=>n.connected);
if(!all) return;

/* scor */
let total = this.edges.reduce((s,e)=>s+e.cost,0);
let ratio = this.perfectCost / total;
this.score = Math.floor(ratio*100);

this.showWin();

}

showWin(){

this.add.text(
this.scale.width/2,
this.scale.height/2,
"✔ NIVEL COMPLET\nScor: "+this.score,
{
fontSize:"40px",
color:"#22c55e",
align:"center"
}
).setOrigin(0.5);

/* next level */
this.time.delayedCall(2000,()=>{
this.level++;
this.scene.restart();
});

}

/* ---------------- INTERSECTION ---------------- */

intersects(ne){

for(let e of this.edges){
if(this.cross(ne,e)) return true;
}
return false;

}

cross(a,b){

function ccw(A,B,C){
return (C.y-A.y)*(B.x-A.x) > (B.y-A.y)*(C.x-A.x);
}

let A={x:a.x1,y:a.y1}, B={x:a.x2,y:a.y2};
let C={x:b.x1,y:b.y1}, D={x:b.x2,y:b.y2};

return (ccw(A,C,D)!=ccw(B,C,D)) && (ccw(A,B,C)!=ccw(A,B,D));

}

/* ---------------- DRAW ---------------- */

draw(){

this.lineGraphics.clear();

this.edges.forEach(e=>{
this.lineGraphics.lineStyle(6,0x00e5ff);
this.lineGraphics.strokeLineShape(
new Phaser.Geom.Line(e.x1,e.y1,e.x2,e.y2)
);
});

if(this.currentLine){
this.lineGraphics.lineStyle(3,0xffffff,0.5);
this.lineGraphics.strokeLineShape(
new Phaser.Geom.Line(
this.currentLine.x1,
this.currentLine.y1,
this.currentLine.x2,
this.currentLine.y2
));
}

}

/* ---------------- HELPERS ---------------- */

getNode(x,y){

for(let n of this.nodes){
if(Phaser.Math.Distance.Between(x,y,n.x,n.y) < this.nodeRadius)
return n;
}

return null;

}

/* ---------------- UNDO ---------------- */

undo(){

let last=this.history.pop();
if(!last) return;

this.edges=this.edges.filter(e=>e!==last);
this.updateConnectivity();
this.draw();

}

/* ---------------- UI ---------------- */

createUI(){

this.add.text(10,10,
"Conectează toate nodurile\nfără intersecții\ncu linii minime",
{
fontSize:"18px",
color:"#000"
});

let btn=this.add.text(
this.scale.width-50,10,"↩",
{fontSize:"28px",backgroundColor:"#ccc"}
)
.setInteractive()
.on("pointerdown",()=>this.undo());

}

}

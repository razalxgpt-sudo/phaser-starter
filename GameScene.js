class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");

this.nodes = [];
this.edges = [];
this.history = [];

this.currentLine = null;
this.startNode = null;

this.maxNodes = 6;

this.nodeRadius = 0;
this.symbolSize = 0;

this.score = 0;
this.perfectScore = 0;

this.symbols = ["▲","●","■","◆","★","✚","⬟","⬢","⬣","✦","✿","☀"];

}

create() {

this.computeResponsiveSizes();

this.createBackground();

this.graphics = this.add.graphics().setDepth(1);
this.lineGraphics = this.add.graphics().setDepth(2);
this.uiLayer = this.add.container().setDepth(10);

this.createNodes();
this.enableInput();
this.createUI();

this.calculatePerfectScore();

}

/* ---------------- RESPONSIVE ---------------- */

computeResponsiveSizes(){

let minDim = Math.min(this.scale.width, this.scale.height);

/* max 12 noduri → trebuie lizibil */
this.nodeRadius = Math.floor(minDim / (this.maxNodes * 2.5));
this.nodeRadius = Phaser.Math.Clamp(this.nodeRadius, 28, 60);

this.symbolSize = Math.floor(this.nodeRadius * 0.9);

}

/* ---------------- BACKGROUND ---------------- */

createBackground(){

const g = this.add.graphics().setDepth(-1000);
const w = this.scale.width;
const h = this.scale.height;

const top = 0xfef3c7;
const bottom = 0xbfdbfe;

for (let i=0;i<h;i++){
let t=i/h;
let c=Phaser.Display.Color.Interpolate.ColorWithColor(
Phaser.Display.Color.ValueToColor(top),
Phaser.Display.Color.ValueToColor(bottom),
h,i
);
g.fillStyle(Phaser.Display.Color.GetColor(c.r,c.g,c.b),1);
g.fillRect(0,i,w,1);
}

}

/* ---------------- NODES ---------------- */

createNodes(){

const w = this.scale.width;
const h = this.scale.height;

let tries = 0;

while(this.nodes.length < this.maxNodes && tries < 1000){

tries++;

let x = Phaser.Math.Between(80, w-80);
let y = Phaser.Math.Between(140, h-80);

let ok = true;

for (let n of this.nodes){
let d = Phaser.Math.Distance.Between(x,y,n.x,n.y);
if (d < this.nodeRadius * 3) ok = false;
}

if (!ok) continue;

/* evită aliniere */
let aligned = this.nodes.some(n => Math.abs(n.x-x)<40 || Math.abs(n.y-y)<40);
if (aligned) continue;

let node = this.add.circle(x,y,this.nodeRadius,0xffffff);
node.setStrokeStyle(4,0x222222);

let symbol = this.add.text(x,y,this.symbols[this.nodes.length],{
fontSize: this.symbolSize + "px",
color:"#000"
}).setOrigin(0.5);

node.symbol = symbol;

this.nodes.push(node);

}

/* pulse doar dacă neconectat */
this.nodes.forEach(n=>{
n.connected = false;

this.tweens.add({
targets:n,
scale:1.08,
duration:800,
yoyo:true,
repeat:-1
});
});

}

/* ---------------- INPUT ---------------- */

enableInput(){

this.input.on("pointerdown",(p)=>{

let node = this.getNodeAt(p.x,p.y);
if (!node) return;

this.startNode = node;

this.currentLine = {
x1: node.x,
y1: node.y,
x2: p.x,
y2: p.y
};

});

this.input.on("pointermove",(p)=>{

if (!this.currentLine) return;

this.currentLine.x2 = p.x;
this.currentLine.y2 = p.y;

this.draw();

});

this.input.on("pointerup",(p)=>{

if (!this.currentLine) return;

let target = this.getNodeAt(p.x,p.y);

if (target && target !== this.startNode){

/* blocare duplicate */
let exists = this.edges.some(e =>
(e.a===this.startNode && e.b===target) ||
(e.a===target && e.b===this.startNode)
);

if (!exists){

let edge = this.createEdge(this.startNode,target);

if (!this.intersects(edge)){
this.edges.push(edge);
this.history.push(edge);
}

}

}

this.currentLine=null;
this.startNode=null;

this.updateConnectivity();
this.draw();
this.updateScore();
this.checkWin();

});

this.input.keyboard.on("keydown-Z",()=>this.undo());

}

/* ---------------- EDGE ---------------- */

createEdge(a,b){

let angle = Phaser.Math.Angle.Between(a.x,a.y,b.x,b.y);

let x1 = a.x + Math.cos(angle)*this.nodeRadius;
let y1 = a.y + Math.sin(angle)*this.nodeRadius;

let x2 = b.x - Math.cos(angle)*this.nodeRadius;
let y2 = b.y - Math.sin(angle)*this.nodeRadius;

let cost = Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);

return {x1,y1,x2,y2,a,b,cost};

}

/* ---------------- CONNECTIVITY ---------------- */

updateConnectivity(){

this.nodes.forEach(n=>n.connected=false);

if (this.nodes.length===0) return;

let visited = new Set();
let stack = [this.nodes[0]];

while(stack.length){

let node = stack.pop();
visited.add(node);

this.edges.forEach(e=>{
if (e.a===node && !visited.has(e.b)) stack.push(e.b);
if (e.b===node && !visited.has(e.a)) stack.push(e.a);
});

}

visited.forEach(n=>n.connected=true);

/* oprește pulse pentru conectate */
this.nodes.forEach(n=>{
if (n.connected){
n.setScale(1);
}
});

}

/* ---------------- WIN ---------------- */

checkWin(){

if (this.edges.length !== this.nodes.length -1) return;

let allConnected = this.nodes.every(n=>n.connected);

if (allConnected){

this.add.text(
this.scale.width/2,
this.scale.height/2,
"✔ COMPLET",
{
fontSize:"40px",
color:"#22c55e"
}
).setOrigin(0.5);

}

}

/* ---------------- INTERSECTION ---------------- */

intersects(newEdge){

for (let e of this.edges){
if (this.lineIntersect(newEdge,e)) return true;
}
return false;

}

lineIntersect(a,b){

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

for (let e of this.edges){
this.lineGraphics.lineStyle(5,0x06b6d4);
this.lineGraphics.strokeLineShape(new Phaser.Geom.Line(e.x1,e.y1,e.x2,e.y2));
}

if (this.currentLine){
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

getNodeAt(x,y){

for (let n of this.nodes){
let d = Phaser.Math.Distance.Between(x,y,n.x,n.y);
if (d < this.nodeRadius) return n;
}
return null;

}

/* ---------------- UNDO ---------------- */

undo(){

let last = this.history.pop();
if (!last) return;

this.edges = this.edges.filter(e=>e!==last);

this.updateConnectivity();
this.draw();
this.updateScore();

}

/* ---------------- SCORE ---------------- */

calculatePerfectScore(){

this.perfectScore = (this.nodes.length -1) * 100;

}

updateScore(){

let total = this.edges.reduce((s,e)=>s+e.cost,0);

this.score = Math.max(0, Math.floor(this.perfectScore - total/10));

this.scoreText.setText(
"Score: "+this.score+"\nPerfect: "+this.perfectScore
);

}

/* ---------------- UI ---------------- */

createUI(){

this.scoreText = this.add.text(10,10,"",{
fontSize:"18px",
color:"#000"
}).setDepth(10);

let btn = this.add.text(
this.scale.width-50,
10,
"↩",
{
fontSize:"26px",
backgroundColor:"#ccc",
padding:6
}
)
.setInteractive()
.on("pointerdown",()=>this.undo());

this.uiLayer.add(btn);

}

}

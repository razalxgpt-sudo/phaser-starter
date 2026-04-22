class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");

this.nodes = [];
this.edges = [];
this.history = [];

this.startNode = null;
this.currentLine = null;

this.level = 1;

this.nodeRadius = 60; // MARE pentru mobil
this.hitRadius = 90;  // EXTRA mare pentru touch

this.symbols = ["▲","●","■","◆","★","✚","⬟","⬢","⬣","✦","✿","☀"];
}

create() {

this.scale.refresh();

this.createBackground();

this.lineGraphics = this.add.graphics().setDepth(2);

this.createNodes();
this.enableInput();
this.createUI();

this.computeMST();

}

/* ---------------- BACKGROUND ---------------- */

createBackground(){

let g = this.add.graphics().setDepth(-1000);
let w=this.scale.width, h=this.scale.height;

for(let i=0;i<h;i++){
let t=i/h;
let c = Phaser.Display.Color.GetColor(
240 - t*60,
240 - t*40,
255 - t*80
);
g.fillStyle(c,1);
g.fillRect(0,i,w,1);
}

}

/* ---------------- NODES ---------------- */

createNodes(){

this.nodes=[];
this.edges=[];
this.history=[];

let count = Math.min(4 + this.level, 10);

let w=this.scale.width;
let h=this.scale.height;

let tries=0;

while(this.nodes.length < count && tries < 2000){

tries++;

let x = Phaser.Math.Between(120, w-120);
let y = Phaser.Math.Between(180, h-120);

let ok=true;

for(let n of this.nodes){
if(Phaser.Math.Distance.Between(x,y,n.x,n.y) < this.nodeRadius*2.2)
ok=false;
}

if(!ok) continue;

let node = this.add.circle(x,y,this.nodeRadius,0xffffff)
.setStrokeStyle(5,0x000000);

let txt = this.add.text(x,y,this.symbols[this.nodes.length],{
fontSize:(this.nodeRadius)+"px",
color:"#000"
}).setOrigin(0.5);

node.label = txt;

this.nodes.push(node);
}

/* pulse */
this.tweens.add({
targets:this.nodes,
scale:1.08,
duration:800,
yoyo:true,
repeat:-1
});

}

/* ---------------- INPUT FIX REAL ---------------- */

enableInput(){

this.input.on("pointerdown",(p)=>{

let {x,y} = p;

let n = this.getNode(x,y);
if(!n) return;

this.startNode = n;

this.currentLine = {
x1:n.x,
y1:n.y,
x2:x,
y2:y
};

});

this.input.on("pointermove",(p)=>{

if(!this.currentLine) return;

this.currentLine.x2 = p.x;
this.currentLine.y2 = p.y;

this.draw();

});

this.input.on("pointerup",(p)=>{

if(!this.currentLine) return;

let target = this.getNode(p.x,p.y);

if(target && target !== this.startNode){

if(!this.edgeExists(this.startNode,target)){

let edge = this.makeEdge(this.startNode,target);

/* IMPORTANT: NU blocăm decât intersecțiile reale */
if(!this.intersects(edge)){
this.edges.push(edge);
this.history.push(edge);
}

}

}

this.currentLine = null;
this.startNode = null;

this.draw();
this.checkWin();

});

this.input.keyboard.on("keydown-Z",()=>this.undo());

}

/* ---------------- EDGE ---------------- */

makeEdge(a,b){

let ang = Phaser.Math.Angle.Between(a.x,a.y,b.x,b.y);

return {
a,b,
x1:a.x + Math.cos(ang)*this.nodeRadius,
y1:a.y + Math.sin(ang)*this.nodeRadius,
x2:b.x - Math.cos(ang)*this.nodeRadius,
y2:b.y - Math.sin(ang)*this.nodeRadius,
cost:Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y)
};

}

edgeExists(a,b){
return this.edges.some(e =>
(e.a===a && e.b===b)||(e.a===b && e.b===a)
);
}

/* ---------------- HIT FIX ---------------- */

getNode(x,y){

for(let n of this.nodes){
if(Phaser.Math.Distance.Between(x,y,n.x,n.y) < this.hitRadius)
return n;
}
return null;

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

/* ---------------- MST ---------------- */

computeMST(){

let all=[];

for(let i=0;i<this.nodes.length;i++){
for(let j=i+1;j<this.nodes.length;j++){

let a=this.nodes[i], b=this.nodes[j];

all.push({
a,b,
cost:Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y)
});
}
}

all.sort((a,b)=>a.cost-b.cost);

let parent=new Map();
this.nodes.forEach(n=>parent.set(n,n));

function find(x){
while(parent.get(x)!==x) x=parent.get(x);
return x;
}

function union(a,b){
parent.set(find(a),find(b));
}

let total=0;

for(let e of all){

let pa=find(e.a), pb=find(e.b);

if(pa!==pb){
union(pa,pb);
total+=e.cost;
}
}

this.perfectCost = total;

}

/* ---------------- WIN ---------------- */

checkWin(){

if(this.edges.length !== this.nodes.length-1) return;

/* verific conectivitate */
let visited=new Set();
let stack=[this.nodes[0]];

while(stack.length){
let n=stack.pop();
visited.add(n);

this.edges.forEach(e=>{
if(e.a===n && !visited.has(e.b)) stack.push(e.b);
if(e.b===n && !visited.has(e.a)) stack.push(e.a);
});
}

if(visited.size !== this.nodes.length) return;

/* SCOR DOAR AICI */
let total = this.edges.reduce((s,e)=>s+e.cost,0);
let score = Math.floor((this.perfectCost/total)*100);

this.add.text(
this.scale.width/2,
this.scale.height/2,
"✔ NIVEL COMPLET\nScor: "+score,
{
fontSize:"42px",
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

/* ---------------- DRAW ---------------- */

draw(){

this.lineGraphics.clear();

this.edges.forEach(e=>{
this.lineGraphics.lineStyle(8,0x00e5ff);
this.lineGraphics.strokeLineShape(
new Phaser.Geom.Line(e.x1,e.y1,e.x2,e.y2)
);
});

if(this.currentLine){
this.lineGraphics.lineStyle(4,0xffffff,0.5);
this.lineGraphics.strokeLineShape(
new Phaser.Geom.Line(
this.currentLine.x1,
this.currentLine.y1,
this.currentLine.x2,
this.currentLine.y2
));
}

}

/* ---------------- UNDO ---------------- */

undo(){

let last=this.history.pop();
if(!last) return;

this.edges=this.edges.filter(e=>e!==last);
this.draw();

}

/* ---------------- UI ---------------- */

createUI(){

this.add.text(10,10,
"Leagă toate punctele\nfără linii care se intersectează",
{
fontSize:"20px",
color:"#000"
});

let btn=this.add.text(
this.scale.width-60,10,"↩",
{fontSize:"32px",backgroundColor:"#ccc"}
)
.setInteractive()
.on("pointerdown",()=>this.undo());

}

}

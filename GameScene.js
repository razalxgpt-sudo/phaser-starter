class GameScene extends Phaser.Scene {
constructor() {
super("GameScene");

this.nodes = [];
this.edges = [];
this.history = [];
this.currentLine = null;
this.startNode = null;

this.nodeRadius = 25;
this.maxNodes = 6;

this.score = 0;
this.perfectScore = 0;

this.symbols = ["▲","●","■","◆","★","✚","⬟","⬢"];

}

create() {

this.createBackground();

this.graphics = this.add.graphics();
this.graphics.setDepth(1);

this.lineGraphics = this.add.graphics();
this.lineGraphics.setDepth(2);

this.uiLayer = this.add.container().setDepth(10);

this.createNodes();

this.enableInput();

this.createUI();

this.calculatePerfectScore();

}

/* ---------------- BACKGROUND ---------------- */

createBackground() {

const w = this.scale.width;
const h = this.scale.height;

const g = this.add.graphics();
g.setDepth(-1000);

const top = 0xf0f4c3;
const bottom = 0xcfd8dc;

for (let i = 0; i < h; i++) {
let t = i / h;
let color = Phaser.Display.Color.Interpolate.ColorWithColor(
Phaser.Display.Color.ValueToColor(top),
Phaser.Display.Color.ValueToColor(bottom),
h, i
);
let c = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
g.fillStyle(c, 1);
g.fillRect(0, i, w, 1);
}

}

/* ---------------- NODES ---------------- */

createNodes() {

const w = this.scale.width;
const h = this.scale.height;

let tries = 0;

while (this.nodes.length < this.maxNodes && tries < 500) {

tries++;

let x = Phaser.Math.Between(80, w - 80);
let y = Phaser.Math.Between(120, h - 80);

let ok = true;

for (let n of this.nodes) {
let d = Phaser.Math.Distance.Between(x,y,n.x,n.y);
if (d < 120) ok = false;
}

if (!ok) continue;

/* anti-aliniere */
let aligned = this.nodes.some(n => Math.abs(n.x - x) < 30 || Math.abs(n.y - y) < 30);
if (aligned) continue;

let node = this.add.circle(x,y,this.nodeRadius,0xffffff);
node.setStrokeStyle(3,0x222222);

let symbol = this.add.text(x,y,this.symbols[this.nodes.length],{
fontSize: "20px",
color:"#000"
}).setOrigin(0.5);

node.symbol = symbol;

this.nodes.push(node);

}

/* pulse pentru noduri */
this.tweens.add({
targets: this.nodes,
scale: 1.1,
duration: 800,
yoyo: true,
repeat: -1
});

}

/* ---------------- INPUT ---------------- */

enableInput() {

this.input.on("pointerdown", (p) => {

let node = this.getNodeAt(p.x,p.y);
if (!node) return;

this.startNode = node;

this.currentLine = { x1: node.x, y1: node.y, x2: p.x, y2: p.y };

});

this.input.on("pointermove", (p) => {

if (!this.currentLine) return;

this.currentLine.x2 = p.x;
this.currentLine.y2 = p.y;

this.draw();

});

this.input.on("pointerup", (p) => {

if (!this.currentLine) return;

let target = this.getNodeAt(p.x,p.y);

if (target && target !== this.startNode) {

let edge = this.createEdge(this.startNode, target);

if (!this.intersects(edge)) {

this.edges.push(edge);
this.history.push(edge);

} 

}

this.currentLine = null;
this.startNode = null;

this.draw();
this.updateScore();

});

this.input.keyboard.on("keydown-Z", () => this.undo());

}

/* ---------------- EDGE ---------------- */

createEdge(a,b) {

/* snap la margine */
let angle = Phaser.Math.Angle.Between(a.x,a.y,b.x,b.y);

let x1 = a.x + Math.cos(angle)*this.nodeRadius;
let y1 = a.y + Math.sin(angle)*this.nodeRadius;

let x2 = b.x - Math.cos(angle)*this.nodeRadius;
let y2 = b.y - Math.sin(angle)*this.nodeRadius;

let cost = Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);

return {x1,y1,x2,y2,a,b,cost};

}

/* ---------------- INTERSECTION ---------------- */

intersects(newEdge) {

for (let e of this.edges) {

if (this.lineIntersect(newEdge,e)) return true;

}

return false;

}

lineIntersect(a,b) {

function ccw(A,B,C){
return (C.y-A.y)*(B.x-A.x) > (B.y-A.y)*(C.x-A.x);
}

let A={x:a.x1,y:a.y1}, B={x:a.x2,y:a.y2};
let C={x:b.x1,y:b.y1}, D={x:b.x2,y:b.y2};

return (ccw(A,C,D) != ccw(B,C,D)) && (ccw(A,B,C) != ccw(A,B,D));

}

/* ---------------- DRAW ---------------- */

draw() {

this.lineGraphics.clear();

for (let e of this.edges) {
this.lineGraphics.lineStyle(4,0x00e5ff);
this.lineGraphics.strokeLineShape(new Phaser.Geom.Line(e.x1,e.y1,e.x2,e.y2));
}

if (this.currentLine) {
this.lineGraphics.lineStyle(2,0xffffff,0.5);
this.lineGraphics.strokeLineShape(new Phaser.Geom.Line(
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

this.edges = this.edges.filter(e => e !== last);

this.draw();
this.updateScore();

}

/* ---------------- SCORE ---------------- */

calculatePerfectScore(){

this.perfectScore = (this.nodes.length - 1) * 100;

}

updateScore(){

let total = this.edges.reduce((s,e)=>s+e.cost,0);

this.score = Math.max(0, Math.floor(this.perfectScore - total/10));

this.scoreText.setText("Score: "+this.score+"\nPerfect: "+this.perfectScore);

}

/* ---------------- UI ---------------- */

createUI(){

this.scoreText = this.add.text(10,10,"",{
fontSize:"16px",
color:"#000"
}).setDepth(10);

let btn = this.add.text(this.scale.width-40,10,"↩",{
fontSize:"22px",
backgroundColor:"#ccc",
padding:6
})
.setInteractive()
.on("pointerdown",()=>this.undo());

this.uiLayer.add(btn);

}

}

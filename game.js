// ==========================================
// ISLAND BRIDGES - FINAL SINGLE FILE
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let connections = [];
let undoStack = [];

let startNode = null;
let currentLine = null;

let score = 0;
let perfectScore = 0;

let stats = { moves:0, undos:0, invalid:0 };

const symbols = ["●","▲","■","◆","★","♥"];

const shapes = ["circle","square","triangle","diamond","star"];

const settings = {
category:"kids_small", // kids_small / kids_medium / adult
nodeRadius:26,
nodeCount:5
};

const themes = {
kids_small:{
bg1:"#fef9c3",
bg2:"#e0f2fe",
node:"#ffffff",
line:"#f59e0b",
pulse:"#fde047"
},
kids_medium:{
bg1:"#ecfeff",
bg2:"#fef3c7",
node:"#ffffff",
line:"#3b82f6",
pulse:"#22c55e"
},
adult:{
bg1:"#020617",
bg2:"#000000",
node:"#e2e8f0",
line:"#06b6d4",
pulse:"#14b8a6"
}
};

function resize(){
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}
window.addEventListener("resize",resize);
resize();

function random(min,max){
return Math.floor(Math.random()*(max-min+1))+min;
}

function colinear(a,b,c){
return Math.abs(
a.x*(b.y-c.y)+
b.x*(c.y-a.y)+
c.x*(a.y-b.y)
) < 200;
}

function generateNodes(){

nodes=[];

let attempts=0;

while(nodes.length < settings.nodeCount && attempts<500){

let n={
x:random(80,canvas.width-80),
y:random(80,canvas.height-80),
value:random(1,4),
symbol:symbols[random(0,symbols.length-1)],
shape:shapes[random(0,shapes.length-1)],
connections:0,
pulse:0
};

let valid=true;

for(let p of nodes){
let dx=p.x-n.x;
let dy=p.y-n.y;
if(Math.sqrt(dx*dx+dy*dy)<120){
valid=false;
}
}

if(valid && nodes.length>=2){
for(let i=0;i<nodes.length-1;i++){
for(let j=i+1;j<nodes.length;j++){
if(colinear(nodes[i],nodes[j],n)){
valid=false;
}
}
}
}

if(valid) nodes.push(n);

attempts++;
}

perfectScore = (nodes.length-1)*10;
}

function drawBackground(){
let t=themes[settings.category];
let g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
g.addColorStop(0,t.bg1);
g.addColorStop(1,t.bg2);
ctx.fillStyle=g;
ctx.fillRect(0,0,canvas.width,canvas.height);
}

function snapEdge(a,b){
let dx=b.x-a.x;
let dy=b.y-a.y;
let len=Math.sqrt(dx*dx+dy*dy);
return {
x:a.x+dx/len*settings.nodeRadius,
y:a.y+dy/len*settings.nodeRadius
};
}

function getNode(x,y){
for(let n of nodes){
let dx=x-n.x;
let dy=y-n.y;
if(Math.sqrt(dx*dx+dy*dy)<=settings.nodeRadius){
return n;
}
}
return null;
}

function intersect(a,b,c,d){
function ccw(p1,p2,p3){
return (p3.y-p1.y)*(p2.x-p1.x)>(p2.y-p1.y)*(p3.x-p1.x);
}
return ccw(a,c,d)!=ccw(b,c,d) && ccw(a,b,c)!=ccw(a,b,d);
}

function connectionExists(a,b){
return connections.some(c =>
(c.a===a && c.b===b)||(c.a===b && c.b===a)
);
}

function updateScore(){
score = perfectScore;
score -= stats.moves;
score -= stats.undos*5;
score -= stats.invalid*3;
if(score<0) score=0;
}

function drawShape(node){

ctx.fillStyle = themes[settings.category].node;
ctx.strokeStyle = "#333";

let r = settings.nodeRadius + Math.sin(node.pulse)*1.5;

ctx.beginPath();

if
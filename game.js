// ==============================
// ISLAND BRIDGES CORE - SINGLE FILE
// ==============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let connections = [];
let undoStack = [];

let startNode = null;
let currentLine = null;

let stats = { moves:0, undos:0, invalid:0 };
let score = 0;
let perfectScore = 0;

const symbols = ["●","▲","■","◆","★","♥"];

const settings = {
    useNumbers:false,
    nodeRadius:26,
    nodeCount:5,
    category:"kids"
};

const themes = {
kids:{
bg1:"#e0f7fa",
bg2:"#fff3e0",
node:"#ffffff",
line:"#ff9800",
pulse:"#ffeb3b"
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

function drawConnections(){

let t=themes[settings.category];

ctx.lineWidth=4;
ctx.strokeStyle=t.line;

for(let c of connections){

let p1=snapEdge(c.a,c.b);
let p2=snapEdge(c.b,c.a);

ctx.beginPath();
ctx.moveTo(p1.x,p1.y);
ctx.lineTo(p2.x,p2.y);
ctx.stroke();
}

if(currentLine){
ctx.beginPath();
ctx.moveTo(currentLine.x1,currentLine.y1);
ctx.lineTo(currentLine.x2,currentLine.y2);
ctx.stroke();
}
}

function drawNodes(){

let t=themes[settings.category];

for(let n of nodes){

n.pulse +=0.05;
let r=settings.nodeRadius + Math.sin(n.pulse)*1.5;

ctx.beginPath();
ctx.arc(n.x,n.y,r,0,Math.PI*2);
ctx.fillStyle=t.node;
ctx.fill();
ctx.strokeStyle="#333";
ctx.stroke();

ctx.fillStyle="#000";
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.font="16px Arial";

if(settings.useNumbers){
ctx.fillText(n.value,n.x,n.y);
}else{
ctx.fillText(n.symbol,n.x,n.y);
}
}
}

function drawScore(){

ctx.fillStyle="rgba(0,0,0,0.4)";
ctx.fillRect(10,10,180,60);

ctx.fillStyle="#fff";
ctx.fillText("Scor: "+score,20,30);
ctx.fillText("Perfect: "+perfectScore,20,50);
}

function draw(){
drawBackground();
drawConnections();
drawNodes();
drawScore();
}

canvas.addEventListener("mousedown",start);
canvas.addEventListener("mousemove",move);
canvas.addEventListener("mouseup",end);

canvas.addEventListener("touchstart",e=>start(e.touches[0]));
canvas.addEventListener("touchmove",e=>move(e.touches[0]));
canvas.addEventListener("touchend",end);

function start(e){

let n=getNode(e.clientX,e.clientY);
if(n){
startNode=n;
currentLine={
x1:n.x,
y1:n.y,
x2:e.clientX,
y2:e.clientY
};
}
}

function move(e){
if(currentLine){
currentLine.x2=e.clientX;
currentLine.y2=e.clientY;
draw();
}
}

function end(e){

if(!currentLine) return;

let n=getNode(e.clientX,e.clientY);

if(n && n!==startNode){

stats.moves++;

if(!connectionExists(startNode,n)){

let valid=true;

for(let c of connections){
if(intersect(startNode,n,c.a,c.b)){
valid=false;
}
}

if(valid){
let conn={a:startNode,b:n};
connections.push(conn);
undoStack.push(conn);
}else{
stats.invalid++;
}
}
}

startNode=null;
currentLine=null;

updateScore();
draw();
}

function undo(){
let c=undoStack.pop();
if(!c) return;
connections = connections.filter(x=>x!==c);
stats.undos++;
updateScore();
draw();
}

window.addEventListener("keydown",e=>{
if(e.key==="z") undo();
});

generateNodes();
updateScore();
draw();
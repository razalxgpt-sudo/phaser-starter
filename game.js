const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* =========================
   CONFIG
========================= */

const AGE_GROUPS = {
    "3-5": { colors:["#F6E6FF","#E6F7FF","#FFFBE6"], symbols:["●","▲","■"], numbers:false },
    "6-10": { colors:["#E8F8F5","#FEF5E7","#EBF5FB"], symbols:["◆","⬟","⬢"], numbers:false },
    "11-16": { colors:["#F4ECF7","#E8F6F3","#FEF9E7"], symbols:null, numbers:true },
    "17-40": { colors:["#EBF5FB","#FDEDEC","#E8F8F5"], symbols:null, numbers:true },
    "40+": { colors:["#FDF2E9","#EBF5FB","#F4ECF7"], symbols:null, numbers:true }
};

let ageGroup = "3-5";

let level = 1;
let nodes = [];
let connections = [];
let undoStack = [];

let dragging = null;

/* =========================
   BACKGROUND
========================= */

function drawBackground() {
    let colors = AGE_GROUPS[ageGroup].colors;
    let gradient = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

/* =========================
   NODE GENERATION
========================= */

function generateNodes() {
    nodes = [];
    connections = [];
    undoStack = [];

    let count = Math.min(4 + level, 12);

    for(let i=0;i<count;i++){
        let x,y,ok;
        do{
            ok=true;
            x = 80 + Math.random()*(canvas.width-160);
            y = 80 + Math.random()*(canvas.height-160);

            for(let n of nodes){
                if(Math.hypot(n.x-x,n.y-y) < 120) ok=false;
            }
        }while(!ok);

        nodes.push({
            x,
            y,
            value:1+Math.floor(Math.random()*5),
            pulse:Math.random()*Math.PI
        });
    }
}

/* =========================
   DRAW NODES
========================= */

function drawNodes(){
    let cfg = AGE_GROUPS[ageGroup];

    nodes.forEach((n,i)=>{
        n.pulse += 0.05;
        let pulse = 1 + Math.sin(n.pulse)*0.05;

        ctx.beginPath();
        ctx.arc(n.x,n.y,22*pulse,0,Math.PI*2);
        ctx.fillStyle="#fff";
        ctx.fill();
        ctx.lineWidth=2;
        ctx.strokeStyle="#333";
        ctx.stroke();

        ctx.fillStyle="#111";
        ctx.font="16px Arial";
        ctx.textAlign="center";
        ctx.textBaseline="middle";

        if(cfg.numbers){
            ctx.fillText(n.value,n.x,n.y);
        }else{
            let s = cfg.symbols[i % cfg.symbols.length];
            ctx.fillText(s,n.x,n.y);
        }
    });
}

/* =========================
   DRAW CONNECTIONS
========================= */

function drawConnections(){
    ctx.lineWidth=4;
    ctx.strokeStyle="#2c3e50";

    connections.forEach(c=>{
        ctx.beginPath();
        ctx.moveTo(c.a.x,c.a.y);
        ctx.lineTo(c.b.x,c.b.y);
        ctx.stroke();
    });
}

/* =========================
   INTERSECTION CHECK
========================= */

function intersect(a,b,c,d){
    function ccw(A,B,C){
        return (C.y-A.y)*(B.x-A.x)>(B.y-A.y)*(C.x-A.x);
    }
    return (ccw(a,c,d)!=ccw(b,c,d))&&(ccw(a,b,c)!=ccw(a,b,d));
}

function canConnect(a,b){
    for(let c of connections){
        if(c.a===a || c.a===b || c.b===a || c.b===b) continue;
        if(intersect(a,b,c.a,c.b)) return false;
    }
    return true;
}

/* =========================
   INPUT
========================= */

canvas.addEventListener("pointerdown",e=>{
    let rect=canvas.getBoundingClientRect();
    let x=e.clientX-rect.left;
    let y=e.clientY-rect.top;

    for(let n of nodes){
        if(Math.hypot(n.x-x,n.y-y)<25){
            dragging=n;
        }
    }
});

canvas.addEventListener("pointerup",e=>{
    if(!dragging) return;

    let rect=canvas.getBoundingClientRect();
    let x=e.clientX-rect.left;
    let y=e.clientY-rect.top;

    for(let n of nodes){
        if(n!==dragging && Math.hypot(n.x-x,n.y-y)<25){
            if(canConnect(dragging,n)){
                connections.push({a:dragging,b:n});
                undoStack.push({a:dragging,b:n});
            }
        }
    }

    dragging=null;
});

window.addEventListener("keydown",e=>{
    if(e.key==="z" || e.key==="Z"){
        undo();
    }
});

/* =========================
   UNDO
========================= */

function undo(){
    if(undoStack.length>0){
        let last = undoStack.pop();
        connections = connections.filter(c=>c!==last);
    }
}

/* =========================
   SCORE
========================= */

function drawScore(){
    let perfect = nodes.length-1;
    let current = connections.length;

    ctx.fillStyle="rgba(0,0,0,0.3)";
    ctx.fillRect(10,10,150,50);

    ctx.fillStyle="#fff";
    ctx.font="14px Arial";
    ctx.fillText("Score: "+current,20,30);
    ctx.fillText("Perfect: "+perfect,20,50);
}

/* =========================
   LOOP
========================= */

function loop(){
    drawBackground();
    drawConnections();
    drawNodes();
    drawScore();
    requestAnimationFrame(loop);
}

/* =========================
   START
========================= */

generateNodes();
loop();
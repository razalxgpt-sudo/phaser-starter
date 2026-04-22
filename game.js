const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =======================
   RESIZE
======================= */
function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* =======================
   AGE CONFIG
======================= */
const AGE = {
    "3-5": {colors:["#F7F3FF","#EAF7FF","#FFF9E6"], symbols:["●","▲","■"], numbers:false},
    "6-10": {colors:["#EAFBF3","#FFF3E8","#EEF5FF"], symbols:["◆","⬟","⬢"], numbers:false},
    "11+": {colors:["#EDF6FF","#FFF0F0","#F2FFF5"], numbers:true}
};

let age = "3-5";

/* =======================
   STATE
======================= */
let nodes=[];
let lines=[];
let undoStack=[];
let dragNode=null;

/* =======================
   BACKGROUND
======================= */
function drawBG(){
    const c = AGE[age].colors;
    const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0,c[0]);
    g.addColorStop(.5,c[1]);
    g.addColorStop(1,c[2]);
    ctx.fillStyle=g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

/* =======================
   NODE GEN
======================= */
function generate(){
    nodes=[];
    lines=[];
    undoStack=[];

    const count=5;

    for(let i=0;i<count;i++){
        let x,y,ok;
        do{
            ok=true;
            x=80+Math.random()*(canvas.width-160);
            y=120+Math.random()*(canvas.height-200);

            for(let n of nodes){
                if(Math.hypot(n.x-x,n.y-y)<110) ok=false;
            }
        }while(!ok);

        nodes.push({
            x,y,
            value:1+Math.floor(Math.random()*5),
            pulse:Math.random()*6
        });
    }
}

/* =======================
   DRAW NODES
======================= */
function drawNodes(){
    nodes.forEach((n,i)=>{
        n.pulse+=0.05;
        const r=20+(Math.sin(n.pulse)*2);

        ctx.beginPath();
        ctx.arc(n.x,n.y,r,0,Math.PI*2);
        ctx.fillStyle="#fff";
        ctx.fill();
        ctx.strokeStyle="#333";
        ctx.lineWidth=2;
        ctx.stroke();

        ctx.fillStyle="#111";
        ctx.font="14px Arial";
        ctx.textAlign="center";
        ctx.textBaseline="middle";

        if(AGE[age].numbers){
            ctx.fillText(n.value,n.x,n.y);
        }else{
            const s=AGE[age].symbols[i%AGE[age].symbols.length];
            ctx.fillText(s,n.x,n.y);
        }
    });
}

/* =======================
   DRAW LINES
======================= */
function drawLines(){
    ctx.lineWidth=4;
    ctx.strokeStyle="#2c3e50";

    for(let l of lines){
        ctx.beginPath();
        ctx.moveTo(l.a.x,l.a.y);
        ctx.lineTo(l.b.x,l.b.y);
        ctx.stroke();
    }
}

/* =======================
   INTERSECTION
======================= */
function intersect(a,b,c,d){
    function ccw(A,B,C){
        return (C.y-A.y)*(B.x-A.x)>(B.y-A.y)*(C.x-A.x);
    }
    return (ccw(a,c,d)!=ccw(b,c,d)) && (ccw(a,b,c)!=ccw(a,b,d));
}

function canConnect(a,b){
    for(let l of lines){
        if(l.a===a||l.a===b||l.b===a||l.b===b) continue;
        if(intersect(a,b,l.a,l.b)) return false;
    }
    return true;
}

/* =======================
   INPUT
======================= */
canvas.addEventListener("pointerdown",e=>{
    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left;
    const y=e.clientY-rect.top;

    nodes.forEach(n=>{
        if(Math.hypot(n.x-x,n.y-y)<25){
            dragNode=n;
        }
    });
});

canvas.addEventListener("pointerup",e=>{
    if(!dragNode) return;

    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left;
    const y=e.clientY-rect.top;

    nodes.forEach(n=>{
        if(n!==dragNode && Math.hypot(n.x-x,n.y-y)<25){
            if(canConnect(dragNode,n)){
                const line={a:dragNode,b:n};
                lines.push(line);
                undoStack.push(line);
            }
        }
    });

    dragNode=null;
});

/* =======================
   UNDO
======================= */
window.addEventListener("keydown",e=>{
    if(e.key==="z"||e.key==="Z"){
        if(undoStack.length){
            const last=undoStack.pop();
            lines=lines.filter(l=>l!==last);
        }
    }
});

/* =======================
   SCORE
======================= */
function drawScore(){
    const perfect=nodes.length-1;
    const current=lines.length;

    ctx.fillStyle="rgba(0,0,0,0.3)";
    ctx.fillRect(10,10,150,45);

    ctx.fillStyle="#fff";
    ctx.font="14px Arial";
    ctx.fillText("Score: "+current,20,28);
    ctx.fillText("Perfect: "+perfect,20,45);
}

/* =======================
   LOOP
======================= */
function loop(){
    drawBG();
    drawLines();
    drawNodes();
    drawScore();
    requestAnimationFrame(loop);
}

/* =======================
   START
======================= */
generate();
loop();
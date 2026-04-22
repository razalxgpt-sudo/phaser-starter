// ============================
// GLOBAL STATE
// ============================

let nodes = [];
let connections = [];
let undoStack = [];

let currentLine = null;
let startNode = null;

let gameSettings = {
    nodeCount: 5,
    useNumbers: true,
    nodeRadius: 24
};

const symbols = ["●","▲","■","◆","★","♥"];

// ============================
// CANVAS
// ============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

// ============================
// NODE GENERATION (NO ALIGN)
// ============================

function generateNodes(){

    nodes = [];

    let attempts = 0;

    while(nodes.length < gameSettings.nodeCount && attempts < 500){

        let x = random(80, canvas.width-80);
        let y = random(80, canvas.height-80);

        let valid = true;

        for(let n of nodes){
            let dx = n.x - x;
            let dy = n.y - y;
            if(Math.sqrt(dx*dx + dy*dy) < 120){
                valid = false;
                break;
            }
        }

        // prevent 3 in line
        if(valid && nodes.length >= 2){
            for(let i=0;i<nodes.length-1;i++){
                for(let j=i+1;j<nodes.length;j++){
                    let a = nodes[i];
                    let b = nodes[j];

                    let area = Math.abs(
                        a.x*(b.y-y) +
                        b.x*(y-a.y) +
                        x*(a.y-b.y)
                    );

                    if(area < 200){
                        valid = false;
                        break;
                    }
                }
            }
        }

        if(valid){
            nodes.push({
                x:x,
                y:y,
                value: random(1,5),
                symbol: symbols[random(0,symbols.length-1)]
            });
        }

        attempts++;
    }
}

// ============================
// DRAW
// ============================

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawConnections();
    drawNodes();
}

function drawNodes(){

    for(let n of nodes){

        ctx.beginPath();
        ctx.arc(n.x,n.y,gameSettings.nodeRadius,0,Math.PI*2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.font="16px Arial";

        if(gameSettings.useNumbers){
            ctx.fillText(n.value,n.x,n.y);
        }else{
            ctx.fillText(n.symbol,n.x,n.y);
        }
    }
}

function drawConnections(){

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00d0ff";

    for(let c of connections){
        ctx.beginPath();
        ctx.moveTo(c.a.x,c.a.y);
        ctx.lineTo(c.b.x,c.b.y);
        ctx.stroke();
    }

    if(currentLine){
        ctx.beginPath();
        ctx.moveTo(currentLine.x1,currentLine.y1);
        ctx.lineTo(currentLine.x2,currentLine.y2);
        ctx.stroke();
    }
}

// ============================
// SNAP TO NODE EDGE
// ============================

function getNodeAt(x,y){

    for(let n of nodes){

        let dx = x - n.x;
        let dy = y - n.y;

        if(Math.sqrt(dx*dx + dy*dy) <= gameSettings.nodeRadius){
            return n;
        }
    }
    return null;
}

// ============================
// INTERSECTION CHECK
// ============================

function intersects(a,b,c,d){

    function ccw(p1,p2,p3){
        return (p3.y-p1.y)*(p2.x-p1.x) > (p2.y-p1.y)*(p3.x-p1.x);
    }

    return (
        ccw(a,c,d) != ccw(b,c,d) &&
        ccw(a,b,c) != ccw(a,b,d)
    );
}

function connectionExists(a,b){
    return connections.some(c =>
        (c.a===a && c.b===b) ||
        (c.a===b && c.b===a)
    );
}

// ============================
// MOUSE / TOUCH
// ============================

canvas.addEventListener("mousedown",startDraw);
canvas.addEventListener("mousemove",moveDraw);
canvas.addEventListener("mouseup",endDraw);

canvas.addEventListener("touchstart", e=>{
    startDraw(e.touches[0]);
});

canvas.addEventListener("touchmove", e=>{
    moveDraw(e.touches[0]);
});

canvas.addEventListener("touchend", endDraw);

function startDraw(e){

    let node = getNodeAt(e.clientX,e.clientY);

    if(node){
        startNode = node;

        currentLine = {
            x1:node.x,
            y1:node.y,
            x2:e.clientX,
            y2:e.clientY
        };
    }
}

function moveDraw(e){

    if(currentLine){
        currentLine.x2 = e.clientX;
        currentLine.y2 = e.clientY;
        draw();
    }
}

function endDraw(e){

    if(!currentLine) return;

    let node = getNodeAt(e.clientX,e.clientY);

    if(node && node !== startNode){

        if(!connectionExists(startNode,node)){

            let valid = true;

            for(let c of connections){
                if(intersects(startNode,node,c.a,c.b)){
                    valid = false;
                    break;
                }
            }

            if(valid){

                let conn = {a:startNode,b:node};

                connections.push(conn);
                undoStack.push(conn);
            }
        }
    }

    currentLine = null;
    startNode = null;
    draw();
}

// ============================
// UNDO LAST CONNECTION
// ============================

window.addEventListener("keydown",e=>{
    if(e.key === "z"){
        undoLast();
    }
});

function undoLast(){
    let last = undoStack.pop();
    if(!last) return;

    connections = connections.filter(c => c !== last);
    draw();
}

// ============================
// UTIL
// ============================

function random(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

// ============================
// START GAME
// ============================

generateNodes();
draw();
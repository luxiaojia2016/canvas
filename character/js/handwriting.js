var canvasWidth = Math.min(800, $(window).width()-20);
var canvasHeight = canvasWidth;
var strokeColor = "black";
var isMouseDown = false;
var lastLoc = {x:0, y:0};
var lastTimestamp = 0;
var lastLineWidth = -1;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = canvasWidth;
canvas.height = canvasHeight;

$("#controller").css("width",canvasWidth+"px");

drawGrid();

$("#clear_btn").click(
    function(e){
        context.clearRect(0,0,canvasWidth,canvasHeight);
        drawGrid();
    }
);

$(".color_btn").click(
    function(e){
        $(".color_btn").removeClass("color_btn_selected");
        $(this).addClass("color_btn_selected");
        strokeColor = $(this).css("background-color");
    }
);

canvas.onmousedown = function(e){
    e.preventDefault();
    beginStroke({x: e.clientX, y: e.clientY});
};
canvas.onmouseup = function(e){
    e.preventDefault();
    endStroke();
};
canvas.onmouseout = function(e){
    e.preventDefault();
    endStroke();
};
canvas.onmousemove = function(e){
    e.preventDefault();
    if(isMouseDown){
        moveStroke({x: e.clientX, y: e.clientY});
    }
};
canvas.addEventListener("touchstart",function(e){
    e.preventDefault();
    var touch = e.touches[0];
    beginStroke({x: touch.pageX, y: touch.pageY});
});
canvas.addEventListener("touchend",function(e){
    e.preventDefault();
    endStroke();
});
canvas.addEventListener("touchmove",function(e){
    e.preventDefault();
    if(isMouseDown){
        var touch = e.touches[0];
        moveStroke({x: touch.pageX, y: touch.pageY});
    }
});


function beginStroke(point){
    isMouseDown = true;
    lastLoc = window2canvas(point.x,point.y);
    lastTimestamp = new Date().getTime();
}
function endStroke(){
    isMouseDown = false;
}
function moveStroke(point){
    var curLoc= window2canvas(point.x, point.y);
    var curTimestamp = new Date().getTime();
    var s = calcDistance(lastLoc, curLoc);
    var t = curTimestamp - lastTimestamp;
    var lineWidth = calcLineWidth(t, s);

    write(lastLoc, curLoc, lineWidth);

    lastLoc = curLoc;
    lastTimestamp = curTimestamp;
    lastLineWidth = lineWidth;
}
function window2canvas(x, y){
    var bbox = canvas.getBoundingClientRect();
    var loc = {x: Math.round(x-bbox.left), y: Math.round(y-bbox.top)};
    return loc;
}

// 米字格
function drawGrid(){
    context.save();

    context.strokeStyle = "red";

    context.beginPath();
    context.moveTo(3, 3);
    context.lineTo(canvasWidth - 3, 3);
    context.lineTo(canvasWidth - 3, canvasHeight - 3);
    context.lineTo(3, canvasHeight - 3);
    context.closePath();

    context.lineWidth = 6;
    context.stroke();

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvasWidth, canvasHeight);

    context.moveTo(canvasWidth, 0);
    context.lineTo(0, canvasHeight);

    context.moveTo(canvasWidth/2, 0);
    context.lineTo(canvasWidth/2, canvasHeight);

    context.moveTo(0, canvasHeight/2);
    context.lineTo(canvasWidth, canvasHeight/2);

    context.lineWidth = 1;
    context.stroke();

    context.restore();
}

function write(last, cur, width){
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(cur.x, cur.y);
    context.strokeStyle = strokeColor;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    context.closePath();
}

function calcDistance(loc1, loc2){
    var d = Math.sqrt((loc1.x - loc2.x)*(loc1.x - loc2.x) + (loc1.y - loc2.y)*(loc1.y - loc2.y));

    return Math.round(d);
}

var maxLineWidth = isPC()?30:15;
var minLineWidth = 1;
var maxStrokeV = 10;
var minStrokeV = 0.1;
function calcLineWidth(t, s){
    var v = s/t;
    var resultLineWidth;

    if(v <= minStrokeV){
        resultLineWidth = maxLineWidth;
    }else if(v >= maxStrokeV){
        resultLineWidth = minLineWidth;
    }else{
        resultLineWidth = maxLineWidth - (v-minStrokeV)/(maxStrokeV-minStrokeV)*(maxLineWidth-minLineWidth);
    }

    if(lastLineWidth == -1){
        return resultLineWidth;
    }

    var width = 0;
    if (isPC()) {
        width = lastLineWidth*2/3 + resultLineWidth*1/3;
    }else{
        width = lastLineWidth*1/3 + resultLineWidth*2/3;
    }
    return width;
}

function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
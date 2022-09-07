var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var map = new Image();
var shape = [];
map.src = 'map.png';

var offsetX,offsetY;

var answer = ""
var showanswer = false;
var correct = 0;
var mapsize = locate.size;

function draw() {
    ctx.beginPath() 
    const key = getRandomItem(locate);
    answer = key;
    showanswer = false;
    var answerinput = document.getElementById("answer-input");
    answerinput.value = "";
    // ctx.fillRect(locate.get(key)[0], locate.get(key)[1], 10, 10); // 도형
    ctx.arc(locate.get(key)[0], locate.get(key)[1], 4, 0, 2*Math.PI);
    ctx.fillStyle = "#cc0000"; // 색상
    // ctx.fillStyle = "#cc0000"; // 색상
    ctx.fill()

    function getRandomItem(collection) {
        let keys = Array.from(collection.keys());
        var random = Math.floor(Math.random() * keys.length)
        return keys[random];
    }
}

var moosang = false;

function endAlert() {
    if (!moosang) {
        moosang = true;
        clearInterval(timer)
        var input = prompt("이름 : ");
        if (input == null) return;
        else if(input.length == 0) input = "Anonymous"
        fetch(`https://gdbackend.r-e.kr:3000/ranking?name=${input}&score=${correct}&time=${time}`, {
            referrerPolicy: "unsafe-url",
            method: "POST"
        })
    }
}

function next() {
    if (!isStart) return;
    if (locate.size > 1) {
        wrong()
        newQuestion()
    } else {
        repeatCheck = false;
        shape.push({points:[locate.get(answer)[0],locate.get(answer)[1]],
                country:answer})
        wrong()
        endAlert()
    }
}

var repeatCheck = true;

function check() {
    if (!isStart) return;
    var answerinput = document.getElementById("answer-input");
    if (answerinput.value.trim() == answer) {
        if (!showanswer && repeatCheck) {
            correctAnswer()
            correct++;
        } else {
            wrong()
        }
        if (locate.size > 1) {
            newQuestion()
        } else {
            var score = document.getElementById("score");
            score.innerText = correct + " / " + mapsize;
            repeatCheck = false;
            shape.push({points:[locate.get(answer)[0],locate.get(answer)[1]],
                country:answer})
            endAlert()
        }
    } else {
        Swal.fire({
            title: '오답',
            showClass: {
                popup: ''
            },
            hideClass: {
                popup: ''
            },
            confirmButtonColor: '#3085d6',
        })
    }
}

function newQuestion() {
    shape.push({points:[locate.get(answer)[0],locate.get(answer)[1]],
                country:answer})
    var score = document.getElementById("score");
    score.innerText = correct + " / " + mapsize;
    locate.delete(answer);
    draw()
}

function correctAnswer() {
    ctx.beginPath() 
    ctx.arc(locate.get(answer)[0],locate.get(answer)[1], 4, 0, 2*Math.PI);
    ctx.fillStyle = "#000"; // 색상
    ctx.fill()
}

function wrong() {
    ctx.beginPath() 
    ctx.arc(locate.get(answer)[0],locate.get(answer)[1], 4, 0, 2*Math.PI);
    ctx.fillStyle = "#FFF"; // 색상
    ctx.fill()
    ctx.stroke()
}

function showAnswer() {
    if(!isStart) return;
    var answerinput = document.getElementById("answer-input");
    answerinput.value = answer;
    showanswer = true;
}

function getRandomKey(collection) {
    let keys = Array.from(collection.keys());
    return keys[Math.floor(Math.random() * keys.length)];
}

map.onload = function() {
    var score = document.getElementById("score");
    score.innerText = correct + " / " + mapsize;
    canvas.width = map.width
    canvas.height = map.height
    ctx.lineWidth = 2;
    ctx.drawImage(map, 0, 0);
    draw()
    var BB=canvas.getBoundingClientRect();
    offsetX=BB.left;
    offsetY=BB.top; 
}

function getKey(value) {
    return [...locate].find(([key, val]) => JSON.stringify(val) === JSON.stringify(value))[0]
}

function define(shape) {
    ctx.beginPath() 
    ctx.arc(shape.points[0], shape.points[1], 4, 0, 2*Math.PI);
}

canvas.onmousemove = function(e) {
    hoverItem(e)
}

canvas.onmousedown = function(e) {
    hoverItem(e)
}

window.addEventListener('resize', function(e) {
    reOffset()
}, true);

window.onscroll=function(e){ reOffset(); }

function reOffset() {
    var BB=canvas.getBoundingClientRect();
    offsetX=BB.left;
    offsetY=BB.top;
}

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

var layer =  document.createElement('div');

function hoverItem(e) {
    e.preventDefault();
    e.stopPropagation();

    mouseX = getMousePos(canvas, e).x
    mouseY = getMousePos(canvas, e).y

    // mouseX=parseInt(e.pageX-offsetX);
    // mouseY=parseInt(e.pageY-offsetY);
    for(var i = 0; i<shape.length; i++) {
        define(shape[i])
        if(ctx.isPointInPath(mouseX,mouseY)){
            console.log(e.pageX, e.pageY)
            layer.innerHTML = `            
            <div id="divLayer" class="overLayer">
                <div>
                    <span >${shape[i].country}</span>
                </div>
            </div>`;
            layer.style.cssText = `left:${e.pageX+8}px;
                                top:${e.pageY-5}px;
                                position:absolute`;
            document.body.append(layer);
            break; //없으면 반복문이 실행되어서 위치안함으로 처리됨
        } else {
            layer.remove()
        }
    }

}
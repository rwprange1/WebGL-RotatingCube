/**
 * This will be the main file for a 3D-Cube and a camera
 * @author Richard Prange
 * @version 10/6/2025
 */

var program;
var canvas;
var gl;


var cubeData = [];

var dataBuffer;

var worldToNDC;



const BYTES_IN_VERTEX = 16; // 4 floats with 4 bytes each
const BYTES_IN_COLOR = 16;
const VERTICES_IN_CUBE = 36; // 6 sides 6 vertices


const TOTAL_BYTES = (BYTES_IN_VERTEX + BYTES_IN_COLOR) * VERTICES_IN_CUBE; 

const BYTES_IN_CUBE = BYTES_IN_VERTEX * VERTICES_IN_CUBE;



const CAMERA_POS = new Float32Array([1.0, 1.0,0,1]);
const LOOK_AT_POINT = new Float32Array([0.0, 0.0,0.0, 1.0]);
const LOOK_AT_DIRECTION = new Float32Array(LOOK_AT_POINT - CAMERA_POS);
const UP = new Float32Array([0.0, 1.0, 0.0, 0.0]);


var yAngleInDeg = 0;
var xAngleInDeg = 0;
var zAngleInDeg = 0;


var rotateX = false;
var rotateY = false;
var rotateZ = false;

var vXMatrix;
var vYMatrix;
var vZMatrix;

window.onload = function init(){
    canvas = document.getElementById("gl-canvas");



    let xButton = document.getElementById("angleX");
    let yButton = document.getElementById("angleY");
    let zButton = document.getElementById("angleZ");
    
    xButton.addEventListener("click", (e)=>{
        rotateX = !rotateX;
        rotateY = false;
        rotateZ = false;
    });

    yButton.addEventListener("click", (e)=>{
        rotateY = !rotateY;
        rotateX = false;
        rotateZ = false;
    });

    zButton.addEventListener("click", (e)=>{
        rotateZ = !rotateZ;
        rotateX = false;
        rotateY = false;
    })



    gl = initWebGL(canvas);

    if (!gl) {
        this.alert("WebGL isnt available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(.6,.6,.6,1.0);


    dataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, TOTAL_BYTES, gl.STATIC_DRAW);

    vXMatrix = gl.getUniformLocation(program, "vXMatrix");
    vYMatrix = gl.getUniformLocation(program, "vYMatrix");
    vZMatrix = gl.getUniformLocation(program, "vZMatrix");
    
    buildCube();
    bindCube();
    render();
}


function radToDeg(r) {
    return r * 180 / Math.PI;
  }



/**
 * This function will define our volcano and add it to the databuffer
 */
function buildCube(){
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    let colors = [
         [ 1.0, 0.0, 0.0, 1.0],
         [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [.5, .5, 0.0, 1.0],
        [0.0, .5, .5, 1.0],
       [.5, 0.0, .5, 1.0]
    ]

    let zMax = .5;
    let xMax = .5;
    let yMax = .5;

    let cube = [
     
    // face 1 (x/z- axis)
        xMax, 0.0, 0.0, 1.0,
        xMax, yMax, 0.0, 1.0,
        xMax, 0.0, zMax, 1.0,

        xMax, 0.0, zMax, 1.0,
        xMax, yMax, zMax, 1.0,
        xMax, yMax, 0.0, 1.0,
    
    
    // face 2 (x/y-axis)
        xMax, 0.0, 0.0, 1.0,
        xMax, yMax, 0.0, 1.0,
        0.0, 0.0,0.0,1.0,

        0.0, 0.0,0.0,1.0,
        0.0, yMax,0.0,1.0,
        xMax, yMax, 0.0, 1.0,


        // face 3 (y/z-axis)
        0.0, 0.0, zMax, 1.0,
        0.0, yMax, zMax, 1.0,
        0.0, 0.0,0.0,1.0,

        0.0, 0.0,0.0,1.0,
        0.0, yMax,0.0,1.0,
        0.0, yMax, zMax, 1.0,


        // face 4 (z/x- axis)
        0.0, 0.0, zMax, 1.0,
        0.0, yMax, zMax, 1.0,
        xMax, 0.0, zMax, 1.0,

        xMax, 0.0, zMax, 1.0,
        xMax, yMax, zMax, 1.0,
        0.0, yMax, zMax, 1.0,

        // face 5 (top)
        xMax, yMax, 0.0, 1.0,
        xMax, yMax, zMax, 1.0,
        0.0, yMax, 0.0, 1.0,

        0.0, yMax, 0.0, 1.0,
        0.0, yMax, zMax, 1.0,
        xMax, yMax, zMax, 1.0,

        // face 6 (bottom)
        xMax, 0.0, 0.0, 1.0,
        xMax, 0.0, zMax, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, zMax, 1.0,
        xMax, 0.0, zMax, 1.0,
    ];
    
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(cube));

    let data =[];
    for (let i = 0; i < 6; i++){
        for( let j = 0; j < 6; j++){
            data.push(...colors[i])
        }
    }
   
    let ar = new Float32Array(data);
    console.log(ar);

    gl.bufferSubData(gl.ARRAY_BUFFER, BYTES_IN_CUBE , new Float32Array(data));
}

/**
 * Aligns the pointers in the databuffer to allow us to display the volcano's base
 */
function bindCube(){
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);

    let vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4,gl.FLOAT, false, 0, BYTES_IN_CUBE);
    gl.enableVertexAttribArray(vColor);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    let mat = mat4();
    rotationMat = new Float32Array(16);
        for (let c = 0; c < 4; c++) { 
            for (let r = 0; r < 4; r++) {  
                rotationMat[c * 4 + r] = mat[r][c];
            }
        }

        
    gl.uniformMatrix4fv(vXMatrix, false, rotationMat);
    gl.uniformMatrix4fv(vYMatrix, false, rotationMat);
    gl.uniformMatrix4fv(vZMatrix, false, rotationMat);
}


function updateCube(){
    let mat = identity4();
    let matLocation;
    if (rotateX){
        mat = rotate4x4(xAngleInDeg, "x");   
        xAngleInDeg += .1;
        matLocation = vXMatrix;
    } else if (rotateY) {
        mat = rotate4x4(yAngleInDeg, "y");
        yAngleInDeg += .1;
        matLocation = vYMatrix;
    } else if (rotateZ){
        mat = rotate4x4(zAngleInDeg, "z");
        zAngleInDeg += .1;
        matLocation = vZMatrix;
    } 

    if (matLocation){
        rotationMat = new Float32Array(16);
        for (let c = 0; c < 4; c++) { 
            for (let r = 0; r < 4; r++) {  
                rotationMat[c * 4 + r] = mat[r][c];
            }
        }

        
        gl.uniformMatrix4fv(matLocation, false, rotationMat);
    }

    
}






// this is the render loop
function render() {
    // clear the display with the background color
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    updateCube()
    gl.drawArrays(gl.TRIANGLES, 0, 36);


    

    //fpsCounter.update();
    //document.getElementById('fpsDisplay').innerHTML = fpsCounter.fps + " FPS";
    
    //frames++;
    setTimeout(
		function (){requestAnimFrame(render);}, 40
    );
    
}

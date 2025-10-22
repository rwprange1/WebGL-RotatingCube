

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
var indexBuffer;

var camera; 

const CAMERA_SPEED = .25;
const BYTES_IN_VERTEX = 16; // 4 floats with 4 bytes each
const BYTES_IN_COLOR = 16;
const VERTICES_IN_CUBE = 8; // 6 sides 6 vertices
const VERTICES_IN_LINES = 6;

const BYTES_IN_CUBE =  (BYTES_IN_VERTEX ) * VERTICES_IN_CUBE;
const BYTES_IN_LINE =  (BYTES_IN_VERTEX +  BYTES_IN_COLOR) * VERTICES_IN_LINES;

const LINE_COL_START = BYTES_IN_CUBE + VERTICES_IN_LINES * BYTES_IN_VERTEX;

const TOTAL_BYTES = BYTES_IN_CUBE + BYTES_IN_LINE; 



var cameraPos = [2.0, 2.0, 2.0 ,1.0]; 
var lookAtPoint = [0.0, 0.0,0.0, 1.0]; 
var up = [0.0, 1.0, 0.0, 1.0];


var yAngleInDeg = 0;
var xAngleInDeg = 0;
var zAngleInDeg = 0;


var rotateX = false;
var rotateY = false;
var rotateZ = false;

var vXMatrix;
var vYMatrix;
var vZMatrix;

var theta = .1;

window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    gl = initWebGL(canvas);

    

    if (!gl) {
        this.alert("WebGL isnt available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(.6,.6,.6,1.0);


    dataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, TOTAL_BYTES, gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer(); 

    vXMatrix = gl.getUniformLocation(program, "vXMatrix");
    vYMatrix = gl.getUniformLocation(program, "vYMatrix");
    vZMatrix = gl.getUniformLocation(program, "vZMatrix");
    
    initHTMLEventListeners();
    buildCamera();
    buildCube();
    initRotationMatrices();
    buildAxis();

    
    render();
}

function buildAxis(){
    let axisLength =3;

    let points = [
        0.0, 0.0, 0.0, 1.0,
        axisLength, 0.0, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, axisLength, 0.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, axisLength, 1.0,

        axisLength, 0.0, 0.0 , 1.0,
        axisLength, 0.0, 0.0 , 1.0,

        0.0, 1.0, 0.0 , 1.0,
        0.0, 1.0, 0.0 , 1.0,
        0.0, 0.0, 1.0 , 1.0,
        0.0, 0.0, 1.0 , 1.0,
    ];

    gl.bufferSubData(gl.ARRAY_BUFFER, TOTAL_BYTES - BYTES_IN_LINE, new Float32Array(points));
}

/**
 * This function will define our volcano and add it to the databuffer
 */
function buildCube(){
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    
    let zMax = 1;
    let xMax = 1;
    let yMax = 1;

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(  [
        0.0, 0.0,0.0,1.0, // 1
        0.0, 0.0, zMax, 1.0,// 2
        xMax, 0.0, 0.0, 1.0,// 3
        0.0, yMax,0.0,1.0,// 4
        0.0, yMax, zMax, 1.0, //5
         
        xMax, yMax, 0.0, 1.0, // 6
        xMax, yMax, zMax, 1.0, // 7
        xMax, 0.0, zMax, 1.0, //8 
    ]));


    let indices = [
        5 , 6 , 7,
        7, 2 ,5 ,
        
        5, 3, 4,
        4, 6, 5,
        
        5, 3, 0, 
        0 , 2, 5,

        3 , 4, 1, 
        1,0, 3,

        6,4,1,
        1, 7, 6,

        0, 1 ,2, 
        2, 7 , 1
    ];

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );


}

/**
 * Aligns the pointers in the databuffer to allow us to display the cube
 */
function bindCube(){
    let vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4,gl.FLOAT, false, 0, BYTES_IN_VERTEX * VERTICES_IN_CUBE);
    gl.enableVertexAttribArray(vColor);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    let isCube = gl.getUniformLocation(program, "isCube");
    gl.uniform1i(isCube, 1);
}

function bindAxis(){
    let vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4,gl.FLOAT, false, 0, LINE_COL_START);
    gl.enableVertexAttribArray(vColor);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, BYTES_IN_CUBE);
    gl.enableVertexAttribArray(vPosition);

    let isCube = gl.getUniformLocation(program, "isCube");
    gl.uniform1i(isCube, 0);
}


function updateCube(){
    let mat = identity4();
    let matLocation;
    if (rotateX){
        mat = rotate4x4(xAngleInDeg, "x");   
        xAngleInDeg += theta;
        matLocation = vXMatrix;
    } else if (rotateY) {
        mat = rotate4x4(yAngleInDeg, "y");
        yAngleInDeg += theta;
        matLocation = vYMatrix;
    } else if (rotateZ){
        mat = rotate4x4(zAngleInDeg, "z");
        zAngleInDeg += theta;
        matLocation = vZMatrix;
    } 

    if (matLocation){
        gl.uniformMatrix4fv(matLocation, false, matToFloat32Array(mat));
    }

    
}






// this is the render loop
function render() {
    // clear the display with the background color
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   

    bindCube();
    updateCube();
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    

    bindAxis();
    gl.drawArrays(gl.LINES, 0, 6 )

    

    //fpsCounter.update();
    //document.getElementById('fpsDisplay').innerHTML = fpsCounter.fps + " FPS";
    
    //frames++;
    setTimeout(
		function (){requestAnimFrame(render);}, 40
    );
    
}

function buildCamera(){
    camera = new Camera(cameraPos, lookAtPoint, up);
    let modelMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    let perspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");

    let modelMat = new Float32Array(16);
    let perspMat = new Float32Array(16);
    for (let c = 0; c < 4; c++) { 
        for (let r = 0; r < 4; r++) {  
            modelMat[c * 4 + r] = camera.modelViewMatrix[r][c];
  
            perspMat[c*4 + r] = camera.perspectiveMatrix[r][c];
        }
    }
    gl.uniformMatrix4fv(modelMatrix, false, modelMat);
    gl.uniformMatrix4fv(perspectiveMatrix, false, perspMat)
}

function initRotationMatrices(){
    let test = matToFloat32Array(mat4());
    gl.uniformMatrix4fv(vXMatrix, false, test);
    gl.uniformMatrix4fv(vYMatrix, false, test);
    gl.uniformMatrix4fv(vZMatrix, false, test); 
}

function initHTMLEventListeners(){
    let valueHolder = this.document.getElementById("value-box");
    valueHolder.innerHTML = ("Theta: " + theta);
    let slider = this.document.getElementById("rotSpeed");
    
    slider.addEventListener("input", ()=> {
        //console.log(slider.value)
        theta = Number(slider.value);
        valueHolder.innerHTML = ("Theta: " + theta);
    })

    this.document.addEventListener("keydown", (event) =>{
            switch (event.code) {
                case "KeyW":
                    console.log(cameraPos);
                    cameraPos = vector_add(cameraPos, vector_scale(camera.lookAtDirection, CAMERA_SPEED));
                    console.log(cameraPos);
                    break;
                case "KeyA":
                    
                    cameraPos = vector_sub(cameraPos ,camera.U);
                    
                    break;
                case "KeyD":
                    cameraPos = vector_add(cameraPos ,camera.U);
                    break;
                case "KeyS":
                    console.log(cameraPos);
                    cameraPos = vector_sub(cameraPos, vector_scale(camera.lookAtDirection, CAMERA_SPEED));
                    console.log(cameraPos);
                    break;  
                case "KeyR":
                    cameraPos = [2.0, 2.0, 2.0 ,1.0]; 
                    lookAtPoint = [0.0, 0.0, 0.0, 1.0]; 
                    up = [0.0, 1.0, 0.0, 1.0]; 
                    break;
                case "Space":
                    cameraPos = vector_add(cameraPos, camera.V);
                    break;
                case "ShiftLeft":
                    cameraPos = vector_sub(cameraPos, camera.V);
                    break; 
                default:
                    return;       

            }
            buildCamera();

        });

    
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
}
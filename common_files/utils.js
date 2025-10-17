
// ************************************************************
// this file has  a set of utility functions useful in WebGL programs
//
// Creator: Kalpathi Subramanian
// Sources : various
// Date: 12/23/21
//
// ************************************************************
function initWebGL (canvas) {
	// Initialize the WebGL context
	// returns the context 
	const gl = canvas.getContext("webgl");

	// Only continue if WebGL is available and working
	if (gl === null) {
		alert("Unable to initialize WebGL\n"+ 
			+ "Your browser or machine may not support it.");
  	}

    return gl;
}

//
// Provides requestAnimationFrame in a cross browser way.
//
// Source Angel/Shreiner book tools
// 
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

//
//	initialize vertex and fragment shaders
//  Source: Angel/Shreiner book tools
//

// this function initializes the vertex and fragment shaders
function initShaders(gl, vertexShaderId, fragmentShaderId ) {
	let vertShdr, fragShdr;

	let vertElem = document.getElementById( vertexShaderId );
	if (!vertElem) {
		alert( "Unable to load vertex shader " + vertexShaderId );
		return -1;
	}
	else {
		// create the vertex shader  
		vertShdr = gl.createShader(gl.VERTEX_SHADER);

		// read it as a string
		gl.shaderSource(vertShdr, vertElem.text);

		// compile it
		gl.compileShader(vertShdr);

		// print error logs if compilation failed
		if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
			let msg = "Vertex shader failed to compile.  The error log is:"
				+ gl.getShaderInfoLog( vertShdr );
			alert( msg );
			return -1;
		}
	}

	// get the fragment shader source (string) and then compile it
	let fragElem = document.getElementById( fragmentShaderId );
	if (!fragElem) {
		alert( "Unable to load vertex shader " + fragmentShaderId );
		return -1;
	}
	else {
		// create a fragment shader
		fragShdr = gl.createShader(gl.FRAGMENT_SHADER);

		// read it as a string
		gl.shaderSource(fragShdr, fragElem.text);

		// compile it
		gl.compileShader( fragShdr );

		// print error logs if compilation failed
		if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
			let msg = "Fragment shader failed to compile.  The error log is:"
				+ gl.getShaderInfoLog( fragShdr );
			alert( msg );
			return -1;
		}
	}

	// create  a shader program 
	let program = gl.createProgram();

	// attach the two shaders to the program
	gl.attachShader(program, vertShdr);
	gl.attachShader(program, fragShdr);

	// link the program
	gl.linkProgram(program);

	// if linking failed, print error log
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		let msg = "Shader program failed to link.  The error log is:"
			+ "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
		alert( msg );
		return -1;
	}
	return program;
}

function flatten( v ) {

	// This function takes Javascript arrays and flattens it into 
	// a set of floating point values; this is required since Javascript
	// arrays, being objects, cannot be passed to GL buffers directly,
	// buffers expect raw float (or whatever type chose)  values

	// For matrices, column major is expected by it, so this function 
	// transposes them for convenience and then flattens it

	if (v.matrix === true) {
		v = transpose(v);
	}

	var n = v.length;
	var elemsAreArrays = false;

	if (Array.isArray(v[0])) {
		elemsAreArrays = true;
		n *= v[0].length;
	}

	var float_vals = new Float32Array(n);

	if (elemsAreArrays) {
		var idx = 0;
		for ( var i = 0; i < v.length; ++i ) {
			for ( var j = 0; j < v[i].length; ++j ) {
				float_vals[idx++] = v[i][j];
			}
		}
	}
	else {
		for ( var i = 0; i < v.length; ++i ) {
			float_vals[i] = v[i];
		}
	}

	return float_vals;
}

/**
 * Removed the if statement as we will only call this function if the mouse is held
 * @param {*} event  a mouse event
 * @returns the location of the mouse where x,y localized for WebGL
 */
function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left, y = event.clientY - rect.top;

    // convert to -1 to 1 range for webgl canvas coords with 
    // (-1, -1) as the lower left of the window
    x =  -1 + (x/canvas.width)*2;
    y =   1 - (y/canvas.height)*2;

    return [x, y];
    
}

function toNDC(arr){
	const rect = canvas.getBoundingClientRect();
	let x = arr[0] - rect.left;
	let y = arr[1] - rect.top;

	x = -1 + (x/canvas.width) *2;
	y =   1 - (y/canvas.height)*2;

    return [x, y];
}

/**
 * This function will take in two vectors with two volues each, 
 * index 0 is left most, index 1 is right most.
 *  
 * @param {*} worldFrom 
 * @param {*} worldTo 
 */
function changeCoords(worldFrom, worldTo){
    let translateToOrigin = translate4x4(-worldFrom[0], -worldFrom[0], 0);
    let scaleToUnit = scale4x4(
        1 / (worldFrom[1] - worldFrom[0]),
        1 / (worldFrom[1] - worldFrom[0]),
        1);
    
   
    let scaleToTarget = scale4x4(
        worldTo[1] - worldTo[0],
        worldTo[1] - worldTo[0],
        1);
   
    let translateToTarget = translate4x4(worldTo[0], worldTo[0], 0);
    
    
    let m1 = matMult(scaleToUnit, translateToOrigin);
    let m2 = matMult(translateToTarget, scaleToTarget);
    let finalMat = matMult(m2, m1);
    return transpose(finalMat); 
}
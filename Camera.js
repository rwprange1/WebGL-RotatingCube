






function Camera(location, lookAtPoint, up){
    this.modelViewMatrix = mat4();
    this.projectionMatrix = mat4();
    this.perspectiveMatrix = mat4();


    this.cameraPos = location;
    this.lookAtPoint = lookAtPoint;
   

    this.lookAtDirection = [];
    this.up = [];
   
    for (let i = 0; i < this.lookAtPoint.length; i++){
        this.lookAtDirection[i] = this.lookAtPoint[i] - this.cameraPos[i];
        this.up[i] = up[i] - this.cameraPos[i];
    }
    
    this.lookAtDirection[3] = 0.0;
    this.up[3] = 0.0;

    this.up = normalize(this.up);
    this.lookAtDirection = normalize(this.lookAtDirection);

    this.calculateU();
    this.calculateV();
    this.calculateN();

    this.worldToCam();
    //this.ortho(-1, 1, -1, 1, .1,1 );
    this.perspective(-1, 1, -1, 1, 1, 10 );

}


/**
 * This method will allow us to translate a a geometric object
 * in model coords to camera coords
 */
Camera.prototype.worldToCam = function(){
    let MoveCamToOg = translate4x4(-this.cameraPos[0], -this.cameraPos[1], -this.cameraPos[2]);
    let rotationMat = mat4();

    rotationMat[0][0] = this.U[0];
    rotationMat[0][1] = this.U[1];
    rotationMat[0][2] = this.U[2];

    rotationMat[1][0] = this.V[0];
    rotationMat[1][1] = this.V[1];
    rotationMat[1][2] = this.V[2];

    rotationMat[2][0] = this.N[0];
    rotationMat[2][1] = this.N[1];
    rotationMat[2][2] = this.N[2];

    this.modelViewMatrix = matMult(rotationMat, MoveCamToOg); 
}


Camera.prototype.calculateU = function(){
    this.U = normalize(cross_product(this.lookAtDirection, this.up));
    this.U.push(0.0);
}

Camera.prototype.calculateV = function(){
    this.V = cross_product(this.U, this.lookAtDirection);
    this.V.push(0.0);
}

Camera.prototype.calculateN = function(){
    this.N = negate(this.lookAtDirection);
    this.N.push(0.0);
}




Camera.prototype.ortho = function(left, right, bottom, top, near, far){
    let mat = mat4();

    mat[0][0] = 2/(right - left);
    mat[0][3] = -1 * ((left + right)/ (right - left));

    mat[1][1] = 2/ (top-bottom);
    mat[1][3] = -1 * ((top+bottom)/ (top-bottom));

    mat[2][2] = -2 /(far - near);
    mat[2][3] = -1 * ((far + near) / (far- near))

    mat = transpose(mat);
    console.log(mat);

    this.projectionMatrix = mat;
}

Camera.prototype.perspective = function(left, right, bottom, top, near, far){
    let mat = mat4();

  

    mat[0][0] = near/(right-left);
    mat[0][2] = (right+left)/(right - left);

    mat[1][1] = near/(top-bottom);
    mat[1][2] = (top + bottom)/(top - bottom);

    mat[2][2] = -1 * (far + near) / (far- near);
    mat[2][3] = -2* far * near / (far- near);

    mat[3][2] = -1;
    mat[3][3] = 0;

    mat = transpose(mat);
    this.perspectiveMatrix = mat;
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//



//----------------------------------------------------------------------------

function perspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan( radians(fovy) / 2 );
    var d = far - near;

    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}
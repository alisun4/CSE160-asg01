// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform変数
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl', { preserveDrawingBuffer: true });

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablestoGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PICTURE = 3;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;

// Set up actions for the HTML UI elements
function addActionsforHTMLUI() {

    // Button elements
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };

    // Clear
    document.getElementById('clear').onclick = function() { g_shapesList = []; renderAllShapes() };

    // Shapes
    document.getElementById('point').onclick = function() { g_selectedType = POINT };
    document.getElementById('triangle').onclick = function() { g_selectedType = TRIANGLE };
    document.getElementById('circle').onclick = function() { g_selectedType = CIRCLE };

    // Picture
    document.getElementById('picture').onclick = function() { drawPicture() };

    // Color slider events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

    // Size slider
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
    document.getElementById('segments').addEventListener('mouseup', function () { g_segment = this.value; });

}

function main() {
    setupWebGL();
    
    connectVariablestoGLSL();

    addActionsforHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    }
    else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    }
    else {
        point = new Circle();
        point.segments = g_segment;
    }

    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
}

function drawPicture() {
    gl.clearColor(0.557, 0.750, 0.487, 1.0); // new background color
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // brown body
    let v2 = new Triangle();
    v2.position[0.0, 0.0];
    v2.color = [0.217, 0.220, 0.0528, 1]; // brown
    v2.size = 0.0;
    v2.render();

    var vertices = new Float32Array([-0.2, 0.0, 0.0, 0.2, 0.0, -0.8]);  // 1
    drawTriangle(vertices);

    var vertices = new Float32Array([0.0, 0.1, 0.2, 0.0, 0.0, -0.5]);   // 2
    drawTriangle(vertices);

    var vertices = new Float32Array([0.2, 0.0, 0.4, -0.1, 0.18, -0.8]); // 3
    drawTriangle(vertices);

    var vertices = new Float32Array([0.4, -0.1, 0.18, -0.8, 0.4, -0.8]);    // 4
    drawTriangle(vertices);

    var vertices = new Float32Array([0.4, -0.7, 0.4, -0.8, 0.5, -0.8]); // 5
    drawTriangle(vertices);

    var vertices = new Float32Array([0.47, -0.8, 0.7, -0.7, 0.78, -0.3]);   // 6
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.2, 0.0, 0.0, 0.2, -0.19, 0.25]);    // 7
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.15, 0.3, 0.1, 0.25, 0.11, 0.43]);    // 8
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.15, 0.3, 0.11, 0.43, -0.11, 0.55]);    // 9
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.15, 0.3, -0.35, 0.3, -0.35, 0.5]);    // 10
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.15, 0.3, -0.35, 0.5, -0.11, 0.55]);    // 11
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.11, 0.55, 0.11, 0.43, 0.15, 0.68]);    // 12 ear 1
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.11, 0.55, -0.35, 0.5, -0.37, 0.7]);    // 13 ear 2
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.2, 0.0, 0.0, 0.2, -0.2, -0.8]);  // 1
    drawTriangle(vertices);

    // white body

    let v3 = new Triangle();
    v3.position[0.0, 0.0];
    v3.color = [1.0, 1.0, 1.0, 1.0]; // white
    v3.size = 0.0;
    v3.render();

    var vertices = new Float32Array([0.2, 0.0, 0.0, -0.5, 0.19, -0.55]);
    drawTriangle(vertices);

    var vertices = new Float32Array([0.4, -0.7, 0.58, -0.63, 0.5, -0.8]);
    drawTriangle(vertices);

    var vertices = new Float32Array([0.78, -0.3, 0.6, -0.1, 0.65, -0.5]);
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.15, 0.18, -0.15, 0.3, 0.1, 0.25]);
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.15, 0.18, -0.15, 0.3, -0.35, 0.3]);
    drawTriangle(vertices);

    var vertices = new Float32Array([-0.2, 0.1, -0.24, -0.15, -0.07, -0.5]);
    drawTriangle(vertices);

    var vertices = new Float32Array([0.18, -0.7, 0.18, -0.8, 0.1, -0.8]);
    drawTriangle(vertices);


    // pink nose

    let v4 = new Triangle();
    v4.position[0.0, 0.0];
    v4.color = [0.950, 0.551, 0.790, 1.0]; // pink
    v4.size = 0.0;
    v4.render();

    var vertices = new Float32Array([-0.15, 0.24, -0.2, 0.32, -0.1, 0.31]);
    drawTriangle(vertices);

}
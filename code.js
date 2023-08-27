var rows = 38;
var cols = 100;

var playing = false;

var grid = new Array(rows);
var nextGrid = new Array(rows);

var timer;
var reproductionTime = 100;

function initializeGrids() {
    for (var i = 0; i < rows; i++) {
        grid[i]     = new Array(cols);
        nextGrid[i] = new Array(cols);
    }
}

function resetGrids() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j]     = 0;
            nextGrid[i][j] = 0;
        }
    }
}

function copyAndResetGrid() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j]     = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}

// Initialize
function initialize() {
    createTable();
    initializeGrids();
    resetGrids();
    setupControlButtons();
}

d_val2str = {
    0 : "dead" , 
    1 : "s4" , 
    2 : "s3" , 
    3 : "s2" , 
    4 : "s1"
}

// Lay out the board
function createTable() {
    var gridContainer = document.getElementById('gridContainer');
    if (!gridContainer) {
        // Throw error
        console.error("Problem: No div for the drid table!");
    }
    var table = document.createElement("table");
    
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < cols; j++) {//
            var cell = document.createElement("td");
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("class", "dead");
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
    }

function cellClickHandler() {
    var rowcol = this.id.split("_");
    var row = rowcol[0];
    var col = rowcol[1];
    
    var classes = this.getAttribute("class");
    if(classes.indexOf("s1") > -1) {
        this.setAttribute("class", "dead");
        grid[row][col] = 0;
    } else {
        this.setAttribute("class", "s1");
        grid[row][col] = 4;
    }
    
}

function updateView() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i + "_" + j);
            cell.setAttribute( "class" , d_val2str[grid[i][j]] );
        }
    }
}

function setupControlButtons() {
    // button to start
    var startButton = document.getElementById('start');
    startButton.onclick = startButtonHandler;
    
    // button to clear
    var clearButton = document.getElementById('clear');
    clearButton.onclick = clearButtonHandler;
    
    // button to set random initial state
    var randomButton = document.getElementById("random");
    randomButton.onclick = randomButtonHandler;
}

function randomButtonHandler() {
    if (playing) return;
    clearButtonHandler();
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var randstate = Math.round( 4 * Math.random() );
            var cell = document.getElementById(i + "_" + j);
            cell.setAttribute("class", d_val2str[randstate] );
            grid[i][j] = randstate;
        }
    }
}

// clear the grid
function clearButtonHandler() {
    console.log("Clear the game: stop playing, clear the grid");
    
    playing = false;
    var startButton = document.getElementById('start');
    startButton.innerHTML = "Start";    
    clearTimeout(timer);
    
    var cellsList = document.querySelectorAll('.s1,.s2,.s3,.s4');

    // convert to array first, otherwise, you're working on a live node list
    // and the update doesn't work!
    var cells = [];
    for (var i = 0; i < cellsList.length; i++) {
        cells.push(cellsList[i]);
    }
    
    for (var i = 0; i < cells.length; i++) {
        cells[i].setAttribute("class", "dead");
    }

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i + "_" + j);
            cell.setAttribute("class", "dead");
            grid[i][j] = 0;
        }
    }

    resetGrids;
}

// start/pause/continue the game
function startButtonHandler() {
    if (playing) {
        console.log("Pause the game");
        playing = false;
        this.innerHTML = "Continue";
        clearTimeout(timer);
    } else {
        console.log("Continue the game");
        playing = true;
        this.innerHTML = "Pause";
        play();
    }
}

// run the life game
function play() {
    computeNextGen();
    
    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

function computeNextGen() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            applyRules_5stateGOL(i, j);
        }
    }
    
    // copy NextGrid to grid, and reset nextGrid
    copyAndResetGrid();
    // copy all 1 values to "live" in the table
    updateView();
}    

function applyRules_5stateGOL( row , col ) {
    var numNeighbors = countNeighbors(row, col);
    if ( grid[row][col] != 0 ) {
        if ( numNeighbors == 0 ) {
            nextGrid[row][col] = 0;
        } 
        else if ( numNeighbors == 1 ) {
            nextGrid[row][col] = 3;
        } 
        else if ( numNeighbors == 2 ) {
            nextGrid[row][col] = 1;
        }
        else if ( numNeighbors == 3 ) {
            nextGrid[row][col] = 2;
        }
        else if ( numNeighbors == 4 ) {
            nextGrid[row][col] = 0;
        }
        else {
            nextGrid[row][col] = 4;
        }
    }
    else {
        if (numNeighbors == 3) {
            nextGrid[row][col] = 1;
        }
    }
}
    
function countNeighbors(row, col) {
    var count = 0;
    
    if (row-1 >= 0) {
        if (grid[row-1][col] != 0) count++;
    }
    if (row-1 >= 0 && col-1 >= 0) {
        if (grid[row-1][col-1] != 0) count++;
    }
    if (row-1 >= 0 && col+1 < cols) {
        if (grid[row-1][col+1] != 0) count++;
    }
    if (col-1 >= 0) {
        if (grid[row][col-1] != 0) count++;
    }
    if (col+1 < cols) {
        if (grid[row][col+1] != 0) count++;
    }
    if (row+1 < rows) {
        if (grid[row+1][col] != 0) count++;
    }
    if (row+1 < rows && col-1 >= 0) {
        if (grid[row+1][col-1] != 0) count++;
    }
    if (row+1 < rows && col+1 < cols) {
        if (grid[row+1][col+1] != 0) count++;
    }
    return count;
}

// Start everything
window.onload = initialize;
// Handles to canvases
var boardCtx
var nextCtx

var ROWS = 20
var COLUMNS = 10
var WIDTH = 20

// "Dead" pieces (null means not filled)
var prevPieces

// Current piece information (refer to tetrominoes for interpretation)
var currentPiece

// Tetromino definitions
var tetrominos 

function init() {
    // Tetromino definitions
    tetrominoes = {
        I: {configs: [[[-1,0],[0,0],[1,0],[2,0]],
                      [[0,-1],[0,0],[0,1],[0,2]]],
            start: [Math.floor((COLUMNS-1)/2),0],
            color: "red" },
        O: {configs: [[[0,0],[1,0],[0,1],[1,1]]],
            start: [Math.floor((COLUMNS-1)/2),0],
            color: "orange"},
        J: {configs: [[[1,1],[1,0],[0,0],[-1,0]],
                      [[-1,1],[0,1],[0,0],[0,-1]],
                      [[-1,-1],[-1,0],[0,0],[1,0]],
                      [[1,-1],[0,-1],[0,0],[0,1]]],
            start: [Math.floor(COLUMNS/2), 0],
            color: "yellow"},
        L: {configs: [[[-1,1],[-1,0],[0,0],[1,0]],
                      [[-1,-1],[0,-1],[0,0],[0,1]],
                      [[1,-1],[1,0],[0,0],[-1,0]],
                      [[1,1],[0,1],[0,0],[0,-1]]],
            start: [Math.floor(COLUMNS/2), 0],
            color: "green"},
        S: {configs: [[[-1,1],[0,1],[0,0],[1,0]],
                      [[0,-1],[0,0],[1,0],[1,1]]],
            start: [Math.floor(COLUMNS/2), 0],
            color: "blue"},
        Z: {configs: [[[1,1],[0,1],[0,0],[-1,0]],
                      [[-1,1],[-1,0],[0,0],[0,-1]]],
            start: [Math.floor(COLUMNS/2), 0],
            color: "purple"},
        T: {configs: [[[-1,0],[0,0],[1,0],[0,1]],
                      [[0,-1],[0,0],[0,1],[-1,0]],
                      [[1,0],[0,0],[-1,0],[0,-1]],
                      [[0,1],[0,0],[0,-1],[1,0]]],
            start: [Math.floor(COLUMNS/2), 0],
            color: "magenta"}
    }
    
    // Initialize canvas handles
    boardCtx = document.getElementById("boardCanvas").getContext("2d")
    nextCtx = document.getElementById("nextCanvas").getContext("2d")
    
    // Initialize board
    prevPieces = []
    for(x = 0; x < COLUMNS; x++) {
        prevPieces[x] = []
        for(y = 0; y < ROWS; y++) {
            prevPieces[x][y] = null
        }
    }

    // Initialize current piece
    currentPiece = newPiece()
    
    setInterval(gameLoop,500)
}

// Logic functions
var isNewPiece = false
var gameOver = false
function gameLoop() {
    drawBoard()
    
    if(gameOver) {
        
    }
    else {
        if(!isNewPiece) {
            if(validPos(nextPos(currentPiece))) {
                currentPiece = nextPos(currentPiece)
            }
            else {
                destroyCurrent()
                clearRows()
                isNewPiece = true
            }
        }
        else {
            currentPiece = newPiece()
            if(validPos(currentPiece)) {
                isNewPiece = false
            }
            else {
                gameOver = true
            }
        }
    }
}

function newPiece() {
    tetros = [tetrominoes.I, tetrominoes.O, tetrominoes.J, tetrominoes.L,
              tetrominoes.S, tetrominoes.Z, tetrominoes.T]
    selection = tetros[Math.floor(Math.random()*tetros.length)];
    piece = {location: selection.start, config: 0, type: selection}
    return piece
}

function destroyCurrent() {
    for(i = 0; i < currentPiece.type.configs[currentPiece.config].length; i++) {
        pt = addPt(currentPiece.location, currentPiece.type.configs[currentPiece.config][i])
        prevPieces[pt[0]][pt[1]] = currentPiece.type.color
    }
}

function validPos(piece) {
    for(i = 0; i < piece.type.configs[piece.config].length; i++) {
        pt = addPt(piece.location, piece.type.configs[piece.config][i])
        if(pt[0] < 0 || pt[0] >= COLUMNS || pt[1] < 0 || pt[1] >= WIDTH)
            return false
        if(prevPieces[pt[0]][pt[1]] != null)
            return false
    }
    return true
}

function nextPos(piece) {
    return {location: addPt(piece.location,[0,1]), config: piece.config, type: piece.type}
}

function addPt(p1, p2) {
    return [p1[0] + p2[0], p1[1] + p2[1]]
}

function clearRows() {
    rows = []
    for(y = 0; y < ROWS; y++) {
        fullRow = true
        for(x = 0; x < COLUMNS; x++) {
            if(prevPieces[x][y] == null)
                fullRow = false
        }
        if(fullRow)
            rows.push(y)
    }
    for(i = 0; i < rows.length; i++)
        clearRow(rows[i])
}

function clearRow(row) {
    // Initialize new array
    newPrevPieces = []
    for(x = 0; x < COLUMNS; x++) {
        newPrevPieces[x] = []
    }

    // Fill everything above the deleted row
    for(y = 0; y < row+1; y++) {
        for(x = 0; x < COLUMNS; x++) {
            newPrevPieces[x][y+1] = prevPieces[x][y]
        }
    }
    // Fill everything below the deleted row
    for(y = row+1; y < ROWS; y++) {
        for(x = 0; x < COLUMNS; x++) {
            newPrevPieces[x][y] = prevPieces[x][y]
        }
    }
    for(x = 0; x < COLUMNS; x++) {
        newPrevPieces[x][0] = null
    }

    prevPieces = newPrevPieces
}

// Control functions
document.addEventListener('keydown', function(event) {
    if(event.code == "ArrowLeft")
        go([-1,0])
    else if(event.code == "ArrowRight")
        go([1,0])
    else if(event.code == "ArrowDown")
        go([0,1])
    else if(event.code == "ArrowUp")
        rotate()
});

function go(delta) {
    next = {location: addPt(currentPiece.location,delta), config: currentPiece.config, type: currentPiece.type}
    if(validPos(next))
        currentPiece = next
    drawBoard()
}

function rotate() {
    next = {location: currentPiece.location,
            config: (currentPiece.config + 1) % currentPiece.type.configs.length,
            type: currentPiece.type}
    if(validPos(next))
        currentPiece = next
    drawBoard()
}

// UI functions
function drawBoard() {
    // Clear canvas and draw border
    boardCtx.clearRect(0, 0, WIDTH * COLUMNS, WIDTH * ROWS)
    
    // Draw dead pieces
    for(x = 0; x < COLUMNS; x++) {
        for(y = 0; y < ROWS; y++) {
            if(prevPieces[x][y])
                fillTile(x, y, WIDTH, prevPieces[x][y])
        }
    }

    // Draw active pieces
    if(!gameOver) {
        for(i = 0; i < currentPiece.type.configs[currentPiece.config].length; i++) {
            newPt = addPt(currentPiece.location, currentPiece.type.configs[currentPiece.config][i])
            fillTile(newPt[0], newPt[1], WIDTH, currentPiece.type.color)
        }
    }

    // Draw border
    boardCtx.strokeStyle = "black"
    boardCtx.strokeRect(0, 0,  WIDTH * COLUMNS, WIDTH * ROWS)
}

function fillTile(x, y, width, color) {
    boardCtx.fillStyle = color
    boardCtx.fillRect(width * x, width * y, width, width)

    boardCtx.strokeStyle = "white"
    boardCtx.strokeRect(width * x, width * y, width, width)
}
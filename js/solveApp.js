// import { startGame } from "./model";

//Export simple 5-bit binary count as alphanumeric

const decodeValues = {
    a: [false, false, false, false, false],
    b: [false, false, false, false, true],
    c: [false, false, false, true, false],
    d: [false, false, false, true, true],
    e: [false, false, true, false, false],
    f: [false, false, true, false, true],
    g: [false, false, true, true, false],
    h: [false, false, true, true, true],
    i: [false, true, false, false, false],
    j: [false, true, false, false, true],
    k: [false, true, false, true, false],
    l: [false, true, false, true, true],
    m: [false, true, true, false, false],
    n: [false, true, true, false, true],
    o: [false, true, true, true, false],
    p: [false, true, true, true, true],
    q: [true, false, false, false, false],
    r: [true, false, false, false, true],
    s: [true, false, false, true, false],
    t: [true, false, false, true, true],
    u: [true, false, true, false, false],
    v: [true, false, true, false, true],
    w: [true, false, true, true, false],
    x: [true, false, true, true, true],
    y: [true, true, false, false, false],
    z: [true, true, false, false, true],
    0: [true, true, false, true, false],
    1: [true, true, false, true, true],
    2: [true, true, true, false, false],
    3: [true, true, true, false, true],
    4: [true, true, true, true, false],
    5: [true, true, true, true, true],
}

const decodeSize = {
    a: 5,
    b: 10,
    c: 15,
    d: 20,
    e: 25,
    f: 30,
    g: 35,
    h: 40,
    i: 45,
    j: 50,
    k: 55,
    l: 60,
    m: 65,
    n: 70,
    o: 75,
    p: 80,
    q: 85,
    r: 90,
    s: 95,
    t: 100,
    u: 105,
    v: 110,
    w: 115,
    x: 120,
    y: 125,
    z: 130,
    0: 135,
    1: 140,
    2: 145,
    3: 150,
    4: 155,
    5: 160,
    6: 165,
    7: 170,
    8: 175,
    9: 180,
}

const encodeValues = {
    "00000": "a",
    "00001": "b",
    "00010": "c",
    "00011": "d",
    "00100": "e",
    "00101": "f",
    "00110": "g",
    "00111": "h",
    "01000": "i",
    "01001": "j",
    "01010": "k",
    "01011": "l",
    "01100": "m",
    "01101": "n",
    "01110": "o",
    "01111": "p",
    "10000": "q",
    "10001": "r",
    "10010": "s",
    "10011": "t",
    "10100": "u",
    "10101": "v",
    "10110": "w",
    "10111": "x",
    "11000": "y",
    "11001": "z",
    "11010": "0",
    "11011": "1",
    "11100": "2",
    "11101": "3",
    "11110": "4",
    "11111": "5"
}

const sizeEncode = {
    5: "a",
    10: "b",
    15: "c",
    20: "d",
    25: "e",
    30: "f",
    35: "g",
    40: "h",
    45: "i",
    50: "j",
    55: "k",
    60: "l",
    65: "m",
    70: "n",
    75: "o",
    80: "p",
    85: "q",
    90: "r",
    95: "s",
    100: "t",
    105: "u",
    110: "v",
    115: "w",
    120: "x",
    125: "y",
    130: "z",
    135: "0",
    140: "1",
    145: "2",
    150: "3",
    155: "4",
    160: "5",
    165: "6",
    170: "7",
    175: "8",
    180: "9"
}

const table = document.querySelector("table");
const picrossWidth = document.getElementById("picrossWidth");
const picrossHeight = document.getElementById("picrossHeight");
const clickMode = document.getElementById("clickMode");

var gridSize = [];
var cells = [];
var rows = [];
var columns = [];
var trueCount = 0;
var correctCount = 0;
var encode = "";
var isMouseDown = false;
var dragMode = null;
var mobileModif = "solve";
var dragCells = new Set();
var startIndex = null;
var lockedAxis = null;
var lastHoveredCol = null;
var dragStartState = new Map();

window.onload = function() {
    startGame();
};

picrossWidth.addEventListener("change", startGame);
picrossHeight.addEventListener("change", startGame);

document.addEventListener("mousedown", () => {
    isMouseDown = true;
    dragCells.clear();
    dragStartState.clear();
});

document.addEventListener("mouseup", () => {
    isMouseDown = false;
    dragMode = null;
    dragCells.clear();
    dragStartState.clear();

    startIndex = null;
    lockedAxis = null;
});

clickMode.addEventListener("click", () => {
    mobileModif = mobileModif === "solve" ? "flag" : "solve";
    clickMode.innerText = `Current Solving Mode: ${mobileModif}`;
});

function startGame() {
    trueCount = 0;
    correctCount = 0;
    cells = [];
    rows = [];
    columns = [];

    gridSize = [parseInt(picrossWidth.value), parseInt(picrossHeight.value)];

    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (gridSize[0] === decodeSize[urlParams[0]] && gridSize[1] === decodeSize[urlParams[1]]) {
            encode = urlParams.get("picrossSeed").toLowerCase();
            gridSize = [decodeSize[encode[0]], decodeSize[encode[1]]];
        } else {
            throw new Error("Failed to find URLParams: loading new seed.")
        }
    } catch {
        var characters = "abcdefghijklmnopqrstuvwxyz012345";

        const blocksWide = gridSize[0] / 5;
        const blocksHigh = gridSize[1];

        let body = "";

        for (let i = 0; i < blocksWide * blocksHigh; i++) {
            body += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        encode = sizeEncode[gridSize[0]] + sizeEncode[gridSize[1]] + body;
    }

    document.getElementById("picrossSeed").value = encode;

    initializeTable(table, gridSize, encode.slice(2));
};

function initializeTable(table, gridSize, values) {
    var tableInput ="<thead><tr><th></th>";

    for (let h = 0; h < gridSize[0]; h++) {
        tableInput += `<th id="colHead${h}" class="colHead"></th>`
    }

    tableInput += "</tr></thead><tbody>"
   
    for (let i = 0; i < gridSize[1]; i++) {
        var thisRow = `<tr><td id="rowHead${i}" class="rowHead"></td>`;

        var necLoops = Math.floor(gridSize[0] / 5);

        for (let j = 0; j < necLoops; j++) {
            const key = values[(i * necLoops) + j];
            if (!decodeValues[key]) {
                throw new Error(`Invalid key "${key}" in seed`);
            }

            var newVals = decodeValues[key];

            for (let z = 0; z < 5; z++) {
                var thisVal = newVals[z];
                cells.push([thisVal, "none"]);

                thisRow += `<td id="cell${(i * gridSize[0]) + (j * 5) + z}"></td>`;
            }
        }

        thisRow += "</tr>";
        tableInput += thisRow;
    }

    tableInput += "</tbody>";
    table.innerHTML = tableInput;

    table.addEventListener("mouseleave", () => {
    if (lastHoveredCol !== null) {
        for (let r = 0; r < gridSize[1]; r++) {
            const index = r * gridSize[0] + lastHoveredCol;
            document.getElementById(`cell${index}`).classList.remove("hoverCol");
        }
        lastHoveredCol = null;
    }
});

    //initialize row/col groups
    rows = Array.from({ length: gridSize[1] }, () => []);
    columns = Array.from({ length: gridSize[0] }, () => []);

    for (let m = 0; m < gridSize[0] * gridSize[1]; m++) {

        var thisRow = Math.floor(m / gridSize[0]);
        var thisCol = m % gridSize[0];

        if (cells[m][0] === true) {
            rows[thisRow].push(1);
            columns[thisCol].push(1);
            trueCount += 1;
        } else {
            rows[thisRow].push(0);
            columns[thisCol].push(0);
        }
    }

    for (let n = 0; n < rows.length; n++) {
        const thisRow = rows[n];
        var rowCount = 0;
        var finalRow = [];

        for (let o = 0; o < thisRow.length + 1; o++) {
            if (thisRow[o] === 1) {
                rowCount++;
            } else {
                if (rowCount > 0) {
                    finalRow.push(rowCount);
                    document.getElementById(`rowHead${n}`).innerHTML += `<p>${rowCount}</p>`;
                    rowCount = 0;
                }
            }
        }

        if (rowCount > 0) {
            finalRow.push(rowCount);
        }

        if (finalRow.length === 0) {
            finalRow.push(0);
        }

        rows[n] = finalRow;
    }

    for (let p = 0; p < columns.length; p++) {
        const thisCol = columns[p];
        var colCount = 0;
        var finalCol = [];

        for (let q = 0; q < thisCol.length + 1; q++) {
            if (thisCol[q] === 1) {
                colCount++;
            } else if (colCount > 0) {
                finalCol.push(colCount);
                document.getElementById(`colHead${p}`).innerHTML += `<p>${colCount}</p>`;
                colCount = 0;
            }
           
        }

        if (colCount > 0) {
            finalCol.push(colCount);
        }

        if (finalCol.length === 0) {
            finalCol.push(0);
        }

        columns[p] = finalCol;
    }

    console.log(rows);
    console.log(columns);

    initializeCells(cells);
}

function initializeCells(values) {
    for (let k = 0; k < values.length; k++) {
        var element = document.getElementById(`cell${k}`);

        element.addEventListener("mousedown", (e) => {
            e.preventDefault();

            if (e.button === 0) dragMode = "fill";
            if (e.button === 2) dragMode = "flag";

            startIndex = k;
            lockedAxis = null;

            addToDrag(k);
        });

        element.addEventListener("mouseenter", () => {
            const currentCol = getCol(k);
            highlightColumn(currentCol);

            if (!isMouseDown || !dragMode) return;

            if (lockedAxis === null && startIndex !== null) {
                const startRow = getRow(startIndex);
                const startCol = getCol(startIndex);
                const currentRow = getRow(k);

                const dx = Math.abs(currentCol - startCol);
                const dy = Math.abs(currentRow - startRow);

                if (lockedAxis === null) {
                    if (dx > dy) lockedAxis = "row";
                    else if (dy > dx) lockedAxis = "col";
                }
            }

            if (lockedAxis === "row" && getRow(k) !== getRow(startIndex)) return;
            if (lockedAxis === "col" && getCol(k) !== getCol(startIndex)) return;

            addToDrag(k);
        });

        element.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    }
}

function handleCellAction(cell, value) {
    if (value[1] === "none") {
        if (dragMode === "fill" && mobileModif === "solve") {
            evalCell(cell, value);
        }

        if (dragMode === "flag" || mobileModif === "flag") {
            if (value[1] !== "final") {
                flagCell(cell, value);
            }
        }
    }
}

function addToDrag(index) {
    var element = document.getElementById(`cell${index}`);
    var value = cells[index];

    if (value[1] === "final") return;

    // First time touching this cell in this drag
    if (!dragStartState.has(index)) {
        dragStartState.set(index, value[1]);

        // Apply action
        if (dragMode === "fill") {
            evalCell(element, value);
        }

        if (dragMode === "flag") {
            flagCell(element, value);
        }

        dragCells.add(index);
        return;
    }

    // If we revisit the same cell → revert it
    var originalState = dragStartState.get(index);

    // Restore original visual + state
    value[1] = originalState;

    if (originalState === "none") {
        element.style.backgroundColor = "";
    } else if (originalState === "flag") {
        element.style.backgroundColor = "#808080";
    }

    dragStartState.delete(index);
    dragCells.delete(index);
}

function evalCell(cell, value) {
    if (value[1] === "flag") {
        flagCell(cell, value);
        return;
    } else if (value[1] === "final") return;

    if (value[0]) {
        cell.style.backgroundColor = "#000";
        correctCount += 1;
        checkWin(correctCount);
    } else {
        cell.style.backgroundColor = "#b44";
    }
    value[1] = "final";
}

function flagCell(cell, value) {
    if (value[1] === "none") {
        cell.style.backgroundColor = "#808080";
        value[1] = "flag";
    } else if (value[1] === "flag") {
        cell.style.backgroundColor = "";
        value[1] = "none";
    } else {
        console.error("Unable to flag/unflag", cell.id, "as it has been evaluated.")
    }
}

function checkWin(count) {
    if (count >= trueCount) {
        for (let r = 0; r < cells.length; r++) {
            if (cells[r][0] === true) {
                document.getElementById(`cell${r}`).style.backgroundColor = "#40b080";
            }
        }
        console.log(`Block ${count}: You win!`)
    } else {
        console.log(`Block ${count}: No win.`)
    }
}

function highlightColumn(colIndex) {
    if (lastHoveredCol !== null) {
        for (let r = 0; r < gridSize[1]; r++) {
            const oldIndex = r * gridSize[0] + lastHoveredCol;
            document.getElementById(`cell${oldIndex}`).classList.remove("hoverCol");
        }

        document.getElementById(`colHead${lastHoveredCol}`).classList.remove("hoverCol");
    }

    for (let r = 0; r < gridSize[1]; r++) {
        const index = r * gridSize[0] + colIndex;
        document.getElementById(`cell${index}`).classList.add("hoverCol");
    }

    document.getElementById(`colHead${colIndex}`).classList.add("hoverCol");

    lastHoveredCol = colIndex;
}

function getRow(index) {
    return Math.floor(index / gridSize[0]);
}

function getCol(index) {
    return index % gridSize[0];
}
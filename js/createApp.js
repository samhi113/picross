var isMouseDown = false;
var dragMode = null;
var dragCells = new Set();
var startIndex = null;
var lockedAxis = null;
var dragStartState = new Map();

window.onload = function() {
    startGame();
};

document.addEventListener("mousedown", () => {
    isMouseDown = true;
    dragCells.clear();
    dragStartState.clear();
});

document.addEventListener("mouseup", () => {
    isMouseDown = false;
    dragMode = null;
    dragCells.clear();
    dragStartState.clear(); startIndex = null;
    lockedAxis = null;
});

function startGame() {
    trueCount = 0;
    correctCount = 0;
    cells = [];
    rows = [];
    columns = [];

    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams) {
            encode = urlParams.get("picrossSeed").toLowerCase();
        }
    } catch {
        var characters = "abcdefghijklmnopqrstuvwxyz012345"

        for (let s = 0; s < 20; s++) {
            encode += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        encode = "bb" + encode;
    }

    document.getElementById("picrossSeed").value = encode;

    gridSize = [decodeSize[encode[0]], decodeSize[encode[1]]];

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
            if (!decodeValues[key]) continue;

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
            if (!isMouseDown || !dragMode) return;

            if (lockedAxis === null && startIndex !== null) {
                const startRow = getRow(startIndex);
                const startCol = getCol(startIndex);
                const currentRow = getRow(k);
                const currentCol = getCol(k);

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
  if (value[1] === "none" && dragMode === "flag") {
        flagCell(cell, value);
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
            fillCell(element, value);
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

function applyDrag() {
    dragCells.forEach((index) => {
        var element = document.getElementById(`cell${index}`);
        var value = cells[index];

        if (dragMode === "fill") {
            if (value[1] === "none") {
                fillCell(element, value);
            }
        } else if (dragMode === "flag") {
            flagCell(element, value);
        }
    });
}

function fillCell(cell, value) {
   
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

function getRow(index) {
    return Math.floor(index / gridSize[0]);
}

function getCol(index) {
    return index % gridSize[0];
}
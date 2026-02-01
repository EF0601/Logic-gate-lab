let draggables = document.querySelectorAll('.draggable');
let inout = document.querySelectorAll('.inout');
let blocksObject;

let listenInput = true;

let activeDraggable = null;
let offsetX = 0, offsetY = 0;

let favoriteBlocks = [];
let blocklist;
fetch('./blocks.json')
    .then(response => response.json())
    .then(data => {
        blocklist = data;
        loadingComplete();
    })
    .catch(error => {
        console.error('Failed to fetch data:', error)
    });

let simrate = 250;

//display alert box
const alertBox = document.getElementById('alertBox');
const alertText = document.getElementById('alertText');
function displayAlert(text) {
    alertBox.style.display = 'block';
    alertText.textContent = text;
}

// sidebar
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */

onmousemove = function (e) {
    if (e.clientX < 70) {
        document.getElementById("sidebar").style.width = "250px";
    }
    else if (e.clientX > 300) {
        document.getElementById("sidebar").style.width = "0";
    }
};

function loadingComplete() {
    populateMenu();
    displayAlert('Welcome to this little sandbox! A reminder that this is still in Alpha testing. If you find an issue, please report it on the GitHub page. Enjoy!');
}

//create buttons for each block in the blocklist in menu
const createBlockBtnTemplate = document.getElementById('createBlockBtnTemplate');
function populateMenu() {
    const gridContainer = document.getElementById('gridContainer');

    for (const key in blocklist) {
        const newBlockBtn = createBlockBtnTemplate.cloneNode(true);
        newBlockBtn.style.display = 'flex';
        newBlockBtn.id = "";
        newBlockBtn.querySelector('.gridItemButton').textContent = blocklist[key].title;
        newBlockBtn.querySelector('.gridItemButton').title = `Represents a ${blocklist[key].title}`;
        newBlockBtn.querySelector('.gridItemButton').onclick = () => {
            createNewElement(key);
        }
        newBlockBtn.querySelector('.iconButton').onclick = (e) => {
            addShortcut(key, e.target);
        };
        gridContainer.appendChild(newBlockBtn);
    }
}

//sandbox saver and loader
function saveSandbox() {
    const information = document.createElement('div');
    information.setAttribute('id', 'information');
    information.textContent = `${connections.join('||')}`;
    document.getElementById('screen').appendChild(information);
    const innerHTML = document.getElementById('screen').innerHTML;

    displayAlert('Information saved. Paste the code into the loader: ' + innerHTML);

    document.getElementById('screen').removeChild(information);
}

function loadSandbox() {
    clearAllDraggables();
    clearAllConnections();

    document.getElementById('screen').innerHTML = document.getElementById('loadSandboxInput').value;
    if (!document.querySelector('#information')) {
        displayAlert('Load file corrupted. Do not use.');
        document.getElementById('screen').innerHTML = '';
        return;
    }

    counter = document.querySelectorAll('.draggable').length;

    const information = document.querySelector('#information').textContent;

    const loadedConnections = information.split("||");

    for (let i = 0; i < loadedConnections.length; i++) {
        const connection = loadedConnections[i].split(',');
        document.getElementById(connection[0]).classList.add('connecting');
        document.getElementById(connection[1]).classList.add('connecting');

        connectorTool();
    }

    draggables = document.querySelectorAll('.draggable');
    inout = document.querySelectorAll('.inout');

    for (let i = 0; i < draggables.length; i++) {
        if (draggables[i].classList.contains('switch')) {
            draggables[i].querySelector('.touchSensor').addEventListener('click', (e) => {
                const parent = draggables[i];
                const output1 = document.getElementById(`${parent.id}-output-1`);
                const output2 = document.getElementById(`${parent.id}-output-2`);

                if (output1.textContent == '1') {
                    draggables[i].querySelector('.touchSensor').style.backgroundColor = "black";
                    output1.textContent = '0';
                    output2.textContent = '0';
                }
                else if (output1.textContent == '0') {
                    draggables[i].querySelector('.touchSensor').style.backgroundColor = "yellow";
                    output1.textContent = '1';
                    output2.textContent = '1';
                }
            });
        }
        if (draggables[i].classList.contains('button')) {
            const parent = draggables[i];
            const pushSensor = parent.querySelector('.pushSensor');
            const output1 = parent.querySelector(`#${parent.id}-output-1`);
            const output2 = parent.querySelector(`#${parent.id}-output-2`);
            pushSensor.addEventListener('mousedown', (e) => {
                pushSensor.style.backgroundColor = "yellow";
                output1.textContent = '1';
                output2.textContent = '1';
            });
            pushSensor.addEventListener('mouseup', (e) => {
                pushSensor.style.backgroundColor = "black";
                output1.textContent = '0';
                output2.textContent = '0';
            });
        }
        if (draggables[i].classList.contains('decimalValue')) {
            const inout3 = document.getElementById(`${draggables[i].id}-output-1`);
            const inout4 = document.getElementById(`${draggables[i].id}-output-2`);
            const inputBlock = draggables[i].querySelector('input');

            inputBlock.addEventListener('input', (e) => {
                inout3.textContent = e.target.value;
                inout4.textContent = e.target.value;
                syncConnections();
            });
        }
    }

    document.querySelector('#information').remove();

    counter++;
}
// current element hovered
let currentHoveredElement = "";

function addListeners() {
    draggables.forEach(draggable => {
        draggable.addEventListener('mousedown', (e) => {
            if (draggable.classList.contains('nondraggable')) return;
            else {
                activeDraggable = draggable;
                offsetX = Math.round((e.clientX - draggable.offsetLeft) / 10) * 10;
                offsetY = Math.round((e.clientY - draggable.offsetTop) / 10) * 10;
                draggable.style.cursor = 'grabbing';
            }
        });

        draggable.addEventListener('touchstart', (e) => {
            if (draggable.classList.contains('nondraggable')) return;
            else {
                activeDraggable = draggable;
                const touch = e.touches[0];
                offsetX = Math.round((touch.clientX - draggable.offsetLeft) / 10) * 10;
                offsetY = Math.round((touch.clientY - draggable.offsetTop) / 10) * 10;
                draggable.style.cursor = 'grabbing';
            }
        });

        draggable.addEventListener('mouseover', () => {
            currentHoveredElement = draggable.classList;

            document.getElementById('currentElementDisplay').textContent = `Current element: ${currentHoveredElement}`;
        });
        draggable.addEventListener('mouseout', () => {
            currentHoveredElement = "";

            document.getElementById('currentElementDisplay').textContent = `Current element: ${currentHoveredElement}`;
        });
    });

    inout.forEach(inout => {
        inout.addEventListener('mousedown', (e) => {
            if (isConnecting && !inout.classList.contains('connecting') && !inout.classList.contains('title')) {
                inout.classList.add('connecting');
            }
        });

        inout.addEventListener('touchstart', (e) => {
            if (isConnecting && !inout.classList.contains('connecting') && !inout.classList.contains('title')) {
                inout.classList.add('connecting');
            }
        });
    });
}

//moving blocks
document.addEventListener('mousemove', (e) => {
    if (!activeDraggable) return;
    activeDraggable.style.left = `${Math.round((e.clientX - offsetX) / 10) * 10}px`;
    activeDraggable.style.top = `${Math.round((e.clientY - offsetY) / 10) * 10}px`;

    // Check collisions with all other draggables
    draggables.forEach(draggable => {
        if (draggable !== activeDraggable) {
            if (isColliding(activeDraggable, draggable)) {
                draggable.classList.add('collided');
                activeDraggable.classList.add('collided');
                if (draggable.classList.contains('trash')) {
                    activeDraggable.remove();
                }
            } else {
                draggable.classList.remove('collided');
                activeDraggable.classList.remove('collided');
            }
        }
    });
});
// mobile support
document.addEventListener('touchmove', (e) => {
    if (!activeDraggable) return;
    const touch = e.touches[0];
    activeDraggable.style.left = `${Math.round((touch.clientX - offsetX) / 10) * 10}px`;
    activeDraggable.style.top = `${Math.round((touch.clientY - offsetY) / 10) * 10}px`;

    // Check collisions with all other draggables
    draggables.forEach(draggable => {
        if (draggable !== activeDraggable) {
            if (isColliding(activeDraggable, draggable)) {
                draggable.classList.add('collided');
                activeDraggable.classList.add('collided');
                if (draggable.classList.contains('trash')) {
                    activeDraggable.remove();
                }
            } else {
                draggable.classList.remove('collided');
                activeDraggable.classList.remove('collided');
            }
        }
    });
});

function toggleMobileConnectorBtn() {
    const button = document.getElementById('mobileConnectorBtn');
    if (button.style.backgroundColor === 'green') {
        button.style.backgroundColor = 'red';
        isConnecting = false;
        connectorTool();
    }
    else {
        button.style.backgroundColor = 'green';
        isConnecting = true;
    }
}

document.addEventListener('touchend', () => {
    if (activeDraggable) {
        activeDraggable.style.cursor = 'grab';
        activeDraggable = null;
    }
});

const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
if (regex.test(navigator.userAgent)) {
    document.getElementById('mobileConnectorBtn').style.display = 'block';
} else {
    document.getElementById('mobileConnectorBtn').style.display = 'none';
}


//end moving blocks
document.addEventListener('mouseup', () => {
    if (activeDraggable) {
        activeDraggable.style.cursor = 'grab';
        activeDraggable = null;
    }
});

function isColliding(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right ||
        rect1.right < rect2.left
    );
}

let counter = 0;

// all key listeners
document.addEventListener('keydown', (e) => {
    if (listenInput) {
        //input display
        document.getElementById('inputDisplay').textContent = `Input: ${e.key}`;

        // shortcut tool
        createNewElement(e.key);

        //connector tool
        if (e.key === ' ') {
            isConnecting = true;
        }
        //menu
        if (e.key === 'm') {
            if (document.getElementById('menu').style.display === 'block') {
                document.getElementById('menu').style.display = 'none';
            }
            else {
                document.getElementById('menu').style.display = 'block';
            }
        }

        setTimeout(() => {
            document.getElementById('inputDisplay').textContent = `Awaiting input...`;
        }, 500);
    }


});

document.addEventListener('keyup', (e) => {
    if (e.key === ' ' && listenInput) {
        connectorTool();
    }
});

// shortcuts
function addShortcut(block, caller) {
    if (caller.style.backgroundColor != "green") {
        caller.style.backgroundColor = "green";
        favoriteBlocks.push(block);

        if (favoriteBlocks.length > 10) {
            favoriteBlocks.shift();

            displayAlert('The favorites list has been shifted down!');
        }
    }
    else {
        caller.style.backgroundColor = "white";
        favoriteBlocks.splice(favoriteBlocks.indexOf(block), 1);
    }
    setTimeout(updateToolbar, 10);
}
//update toolbar

const template = document.getElementById('toolDisplayTemplate');
function updateToolbar() {
    const toolbar = document.getElementById('toolbar');
    toolbar.innerHTML = '';

    favoriteBlocks.forEach(favBlock => {
        const newTool = template.cloneNode(true);
        newTool.querySelector('#toolDisplayTemplateName').textContent = blocklist[favBlock].title;
        newTool.querySelector('#toolDisplayTemplateButton').onclick = () => {
            createNewElement(favBlock);
        };
        newTool.querySelector('#toolDisplayTemplateTrash').onclick = (e) => {
            favoriteBlocks.splice(favoriteBlocks.indexOf(favBlock), 1);
            e.target.parentElement.parentElement.remove();
        };
        newTool.style.display = 'block';
        newTool.id = `toolDisplay-${favBlock}`;
        newTool.querySelector('#toolDisplayTemplateName').id = `toolDisplayName-${favBlock}`;
        newTool.querySelector('#toolDisplayTemplateButton').id = `toolDisplayButton-${favBlock}`;
        newTool.querySelector('#toolDisplayTemplateTrash').id = `toolDisplayTrash-${favBlock}`;
        toolbar.appendChild(newTool);
    });
};

//create blocks

function createNewElement(key) {
    if (blocklist[key] === undefined) { return; }

    let newElement = document.createElement('div');

    newElement.insertAdjacentHTML('beforeend', blocklist[key].structure.replace(/draggable-default/g, `draggable-${counter}`));
    newElement = newElement.children[0];

    const parent = newElement;

    //final processing

    //touch sensors
    if (newElement.querySelector('.touchSensor')) {
        const touchSensor = newElement.querySelector('.touchSensor');
        newElement.querySelector('.touchSensor').addEventListener('click', (e) => {
            const parent = touchSensor.parentElement;
            const output1 = document.getElementById(`${parent.id}-output-1`);
            const output2 = document.getElementById(`${parent.id}-output-2`);

            if (output1.textContent == '1') {
                touchSensor.style.backgroundColor = "black";
                output1.textContent = '0';
                output2.textContent = '0';
            }
            else if (output1.textContent == '0') {
                touchSensor.style.backgroundColor = "yellow";
                output1.textContent = '1';
                output2.textContent = '1';
            }
            syncConnections();
        });
    }

    //decimal value
    if (newElement.classList.contains('decimalValue')) {
        console.log(newElement);
        newElement.querySelector('input').addEventListener('input', (e) => {
            parent.querySelector(`#${parent.id}-output-1`).textContent = e.target.value;
            parent.querySelector(`#${parent.id}-output-2`).textContent = e.target.value;
            syncConnections();
        });
    }

    //push sensors
    if (newElement.querySelector('.pushSensor')) {
        const pushSensor = newElement.querySelector('.pushSensor');
        const output1 = parent.querySelector(`#${parent.id}-output-1`);
        const output2 = parent.querySelector(`#${parent.id}-output-2`);
        pushSensor.addEventListener('mousedown', (e) => {
            pushSensor.style.backgroundColor = "yellow";
            output1.textContent = '1';
            output2.textContent = '1';
        });
        pushSensor.addEventListener('mouseup', (e) => {
            pushSensor.style.backgroundColor = "black";
            output1.textContent = '0';
            output2.textContent = '0';
        });
        syncConnections();
    }

    document.getElementById('screen').appendChild(newElement);

    draggables = document.querySelectorAll('.draggable');
    inout = document.querySelectorAll('.inout');

    addListeners();
    counter++;
}

function clearAllDraggables() {
    draggables.forEach(draggable => {
        draggable.remove();
    });

    const trashcan = document.createElement('div');
    trashcan.setAttribute('id', 'trash');
    trashcan.classList.add('draggable', 'nondraggable', 'trash');
    trashcan.textContent = "Trash";
    document.querySelector('body').appendChild(trashcan);

    draggables = document.querySelectorAll('.draggable');
}

//on start

addListeners();

let isConnecting = false;
let startElement = null;
let connections = [];

function alreadyExists(newConnections) {
    for (let i = 0; i < connections.length; i++) {
        if (connections[i][0] === newConnections[0] && connections[i][1] === newConnections[1]) {
            return i;
        }
        else if (connections[i][0] === newConnections[1] && connections[i][1] === newConnections[0]) {
            return i;
        }
    }
}

function connectorTool() {
    isConnecting = false;
    startElement = null;

    let newConnections = [];
    const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

    document.querySelectorAll('.connecting').forEach(inout => {
        inout.classList.remove('connecting');
        newConnections.push(inout.id);
    });

    const index = alreadyExists(newConnections);


    if (index !== undefined) {
        newConnections.forEach(element => {
            document.getElementById(element).style.backgroundColor = 'lightblue';

        });
        connections.splice(index, 1);

    }
    else {
        if (newConnections.length === 2) {
            connections.push(newConnections);

            //validate connection compatibility
            const [ele1, ele2] = newConnections;
            const inout1 = document.getElementById(ele1);
            const inout2 = document.getElementById(ele2);

            if (inout1.classList.contains('binary') && inout2.classList.contains('binary')) {
                // Both are binary, so they are compatible
            } else if (inout1.classList.contains('decimal') && inout2.classList.contains('decimal')) {
                // Both are decimal, so they are compatible
            } else if (inout1.classList.contains('any') || inout2.classList.contains('any')) {
                // One is any, so they are compatible
            }
            else{
                displayAlert("Incompatible connection types.");
                connections.pop(); // Remove the invalid connection
                return;
            }

            newConnections.forEach(connection => {
                document.getElementById(connection).style.backgroundColor = color;
            });
            syncConnections();
        }
        else {
            displayAlert(`Invalid connection. Please connect two elements. Not sure how to use the connection tool? Check the menu.`);
        }
    }
}
//how to pass values between connected elements
function syncConnections() {
    connections.forEach(connection => {
        const [ele1, ele2] = connection;

        if (document.getElementById(ele1) == undefined || document.getElementById(ele2) == undefined) {
            if (document.getElementById(ele1) != undefined) {
                document.getElementById(ele1).style.backgroundColor = 'lightblue';
            }
            else if (document.getElementById(ele2) != undefined) {
                document.getElementById(ele2).style.backgroundColor = 'lightblue';
            }
            connections.splice(connections.indexOf(connection), 1);
        }
        else {

            let input;
            let output;

            //which is input?
            if (ele1.split("-")[2] === "input") {
                output = document.getElementById(ele2);
                input = document.getElementById(ele1);
            }
            else if (ele2.split("-")[2] === "input") {
                output = document.getElementById(ele1);
                input = document.getElementById(ele2);
            }
            else {
                displayAlert('Invalid connection. Please check your connections. The first element must be an input, the second must be an output.');
                document.getElementById(ele1).style.backgroundColor = 'lightblue';
                document.getElementById(ele2).style.backgroundColor = 'lightblue';

                connections.splice(connections.indexOf(connection), 1);
                return;
            }
            input.textContent = output.textContent;
        }
    });
}

function clearAllConnections() {
    counter = 0;
    connections = [];
    const inouts = document.querySelectorAll('.inout');
    inouts.forEach(inout => {
        inout.style.backgroundColor = 'lightblue';
    });
}

//end connection craziness

//Gate logic
function updateBlocks() {
    let gates = document.querySelectorAll('.gate');
    gates.forEach(gate => {
        const input1 = document.getElementById(`${gate.id}-input-1`);
        const input2 = document.getElementById(`${gate.id}-input-2`);

        const output1 = document.getElementById(`${gate.id}-output-1`);
        const output2 = document.getElementById(`${gate.id}-output-2`);
        switch (gate.classList[2]) {
            case "not":
                output1.textContent = input1.textContent === '1' ? '0' : '1';
                output2.textContent = input1.textContent === '1' ? '0' : '1';

                break;
            case "and":
                output1.textContent = input1.textContent === '1' && input2.textContent === '1' ? '1' : '0';
                output2.textContent = input1.textContent === '1' && input2.textContent === '1' ? '1' : '0';
                break;

            case "or":
                output1.textContent = input1.textContent === '1' || input2.textContent === '1' ? '1' : '0';
                output2.textContent = input1.textContent === '1' || input2.textContent === '1' ? '1' : '0';
                break;

            case "xor":
                output1.textContent = input1.textContent !== input2.textContent ? '1' : '0';
                output2.textContent = input1.textContent !== input2.textContent ? '1' : '0';
                break;

            default:
                break;
        }
    });

    let relays = document.querySelectorAll('.relay');
    relays.forEach(relay => {
        const input1 = document.getElementById(`${relay.id}-input-1`);
        const input2 = document.getElementById(`${relay.id}-input-2`);
        const output1 = document.getElementById(`${relay.id}-output-1`);
        const output2 = document.getElementById(`${relay.id}-output-2`);

        if (input1.textContent === '1' || input1.textContent === '0') {
            if (input1.textContent === '1') {
                output1.textContent = input2.textContent;
                output2.textContent = input2.textContent;
            }
            else if (input1.textContent === '0' && !relay.classList.contains('memoryRelay')) {
                output1.textContent = '0';
                output2.textContent = '0';
            }
        }
        else {
            displayAlert('Relay input is not binary. Please check your connections. The first input must be binary, the second should be the value to be relayed.');
        }
    });

    let decimalOutputs = document.querySelectorAll('.decimalOutput');
    decimalOutputs.forEach(decimalOutput => {
        let binaryInputs = decimalOutput.parentElement.querySelectorAll('.binaryInput');
        let binaryString = '';
        binaryInputs.forEach(binaryInput => {
            binaryString += binaryInput.textContent;
        });

        decimalOutput.textContent = parseInt(binaryString, 2);
    });

    let binaryOutputs = document.querySelectorAll('.binaryOutputContainer');
    binaryOutputs.forEach(binaryOutput => {
        const decimalInput = binaryOutput.querySelector('.decimalInput');
        const binaryOutputCells = Array.from(binaryOutput.querySelectorAll('.binaryOutput')).reverse();
        const binaryString = (decimalInput.textContent >>> 0).toString(2).padStart(8, '0').split('').reverse();

        for (let i = 0; i < binaryString.length; i++) {
            if (binaryOutputCells[i]) {
                binaryOutputCells[i].textContent = binaryString[i];
            }
            else {
                displayAlert('There was an error. Perhaps the decimal value is too high? The maximum value is 255. Some digits might have not been displayed properly! For your convenience, the input cleared. Softlocked? Edit > Clear all connections. Here was the binary value: ' + binaryString.reverse().join(''));
                binaryOutputCells.forEach(cell => {
                    cell.textContent = '0';
                });
                decimalInput.textContent = '0';
            }
        }
    });

    let pulsers = document.querySelectorAll('.pulser');
    pulsers.forEach(pulser => {
        if (document.getElementById(`${pulser.id}-input-1`).textContent === '1') {
            const output1 = document.getElementById(`${pulser.id}-output-1`);
            const output2 = document.getElementById(`${pulser.id}-output-2`);

            output1.textContent = output1.textContent === '1' ? '0' : '1';
            output2.textContent = output2.textContent === '1' ? '0' : '1';

            document.getElementById(`${pulser.id}-input-1`).textContent = '0';
        }
    });

    let counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const input1 = document.getElementById(`${counter.id}-input-1`);
        const input2 = document.getElementById(`${counter.id}-input-2`);
        const output1 = document.getElementById(`${counter.id}-output-1`);
        const output2 = document.getElementById(`${counter.id}-output-2`);

        if (counter.dataset.lastInput === undefined || counter.dataset.lastInput !== input1.textContent) {
            counter.dataset.lastInput = input1.textContent;
            output1.textContent = parseInt(output1.textContent) + 1;
            output2.textContent = parseInt(output2.textContent) + 1;
        }

        if (input2.textContent === "1") {
            output1.textContent = 0;
            output2.textContent = 0;
            counter.dataset.lastInput = undefined;
            input2.textContent = 0;
        }
    });
}

//time loop

function runSimulation() {
    syncConnections();
    addListeners();
    updateBlocks();

    let lights = document.querySelectorAll('.lightPart');
    lights.forEach(light => {
        const input = document.getElementById(`${light.parentElement.id}-input-1`);
        light.style.backgroundColor = input.textContent === '1' ? 'yellow' : 'black';
    });
    setTimeout(clock, simrate);
}

function clock() {
    setTimeout(runSimulation, simrate);
}
clock();

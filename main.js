let draggables = document.querySelectorAll('.draggable');
let inout = document.querySelectorAll('.inout');

let listenInput = true;

let activeDraggable = null;
let offsetX = 0, offsetY = 0;

//display alert box
const alertBox = document.getElementById('alertBox');
const alertText = document.getElementById('alertText');
function displayAlert(text) {
    alertBox.style.display = 'block';
    alertText.textContent = text;
}

//default welcome box
displayAlert('Welcome to this little sandbox! A reminder that this is still in Alpha testing. If you find an issue, please report it on the GitHub page. Enjoy!');

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

document.addEventListener('mouseup', () => {
    if (activeDraggable) {
        activeDraggable.style.cursor = 'grab';
        activeDraggable = null;
    }
});

document.addEventListener('touchend', () => {
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

function toggleMobileConnectorBtn(){
    const button = document.getElementById('mobileConnectorBtn');
    if (button.style.backgroundColor === 'green'){
        button.style.backgroundColor = 'red';
        isConnecting = false;
        connectorTool();
    }
    else{
        button.style.backgroundColor = 'green';
        isConnecting = true;
    }
}

function createNewElement(key) {
    const fragment = document.createDocumentFragment();

    const newDraggable = document.createElement('div');
    newDraggable.classList.add('draggable');
    newDraggable.style.top = '200px';
    newDraggable.style.left = '200px';
    newDraggable.id = `draggable-${counter}`;

    const inout1 = document.createElement('div');
    inout1.classList.add('inout');
    inout1.id = (`draggable-${counter}-input-1`);
    inout1.textContent = '0';
    newDraggable.appendChild(inout1);


    const inout2 = document.createElement('div');
    inout2.classList.add('inout');
    inout2.id = (`draggable-${counter}-input-2`);
    inout2.textContent = '0';
    newDraggable.appendChild(inout2);

    const title = document.createElement('div');
    title.classList.add('inout');
    title.classList.add('title');
    title.textContent = 'title';
    newDraggable.appendChild(title);

    const inout3 = document.createElement('div');
    inout3.classList.add('inout');
    inout3.id = (`draggable-${counter}-output-1`);
    inout3.textContent = '0';
    newDraggable.appendChild(inout3);

    const inout4 = document.createElement('div');
    inout4.classList.add('inout');
    inout4.id = (`draggable-${counter}-output-2`);
    inout4.textContent = '0';
    inout4.style.border = "none";
    newDraggable.appendChild(inout4);


    switch (key) {
        case "a":
            newDraggable.classList.add('binary');
            title.textContent = 'value';
            inout3.textContent = '0';
            inout4.textContent = '0';
            break;
        case "s":
            newDraggable.classList.add('binary');
            title.textContent = 'value';
            inout3.textContent = '1';
            inout4.textContent = '1';
            break;
        case "d":
            newDraggable.classList.add('binary');
            newDraggable.classList.add('not');
            newDraggable.classList.add('gate');
            title.textContent = 'NOT gate';
            break;
        case "f":
            newDraggable.classList.add('binary');
            newDraggable.classList.add('and');
            newDraggable.classList.add('gate');
            title.textContent = 'AND gate';
            break;
        case "g":
            newDraggable.classList.add('binary');
            newDraggable.classList.add('or');
            newDraggable.classList.add('gate');
            title.textContent = 'OR gate';
            break;
        case "h":
            newDraggable.classList.add('binary');
            newDraggable.classList.add('xor');
            newDraggable.classList.add('gate');
            title.textContent = 'XOR gate';
            break;
        case "q":
            newDraggable.classList.add('binary');
            newDraggable.classList.add('switch');
            title.textContent = 'switch';
            inout3.textContent = '1';
            inout4.textContent = '1';
            inout1.remove();
            inout2.remove();

            const touchSensor = document.createElement('div');
            touchSensor.classList.add('touchSensor');
            touchSensor.id = (`draggable-${counter}-touchSensor`);
            newDraggable.appendChild(touchSensor);

            touchSensor.addEventListener('click', (e) => {
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
            break;
        case 'w':
            newDraggable.classList.add('binary');
            newDraggable.classList.add('light');
            title.textContent = 'lamp';
            inout2.remove();
            inout3.remove();
            inout4.remove();

            const light = document.createElement('div');
            light.style.height = '60px';
            light.style.backgroundColor = 'black';
            light.classList.add('lightPart');
            newDraggable.appendChild(light);

            break;
        case 'e':
            newDraggable.classList.add('binary');
            newDraggable.classList.add('button');
            title.textContent = 'button';
            inout1.remove();
            inout2.remove();
            inout3.textContent = '1';
            inout4.textContent = '1';

            const pushSensor = document.createElement('div');
            pushSensor.classList.add('pushSensor');
            pushSensor.id = (`draggable-${counter}-pushSensor`);
            newDraggable.appendChild(pushSensor);

            const parent = pushSensor.parentElement;
            console.log(parent.id);
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
            break;
        case 'r':
            newDraggable.classList.add('special');
            newDraggable.classList.add('relay');
            title.textContent = 'relay';

            break;
        case 't':
            newDraggable.classList.add('special');
            newDraggable.classList.add('relay');
            newDraggable.classList.add('memoryRelay');
            title.textContent = 'memory relay';

            break;
        case 'y':
            newDraggable.classList.add('decimal');
            newDraggable.classList.add('binaryToDecimal');

            newDraggable.style.width = '200px';
            newDraggable.height = '50px';

            title.textContent = 'Binary to Decimal';
            title.style.width = '200px';

            inout1.remove();
            inout2.remove();
            inout3.remove();
            inout4.remove();

            const binaryInputContainer = document.createElement('div');
            binaryInputContainer.classList.add('binaryInputContainer');
            binaryInputContainer.style.display = 'flex';
            binaryInputContainer.style.justifyContent = 'center';

            for(let i = 0; i < 8; i++){
                const binaryInput = document.createElement('div');
                binaryInput.classList.add('binaryInput');
                binaryInput.classList.add('inout');
                binaryInput.id = (`draggable-${counter}-input-${i}`);
                binaryInput.textContent = '0';
                binaryInputContainer.appendChild(binaryInput);
            }

            const equalsSign = document.createElement('div');
            equalsSign.textContent = '=';
            binaryInputContainer.appendChild(equalsSign);

            const decimalOutput = document.createElement('div');
            decimalOutput.textContent = '0';
            decimalOutput.style.width = '50px';
            decimalOutput.classList.add('decimalOutput');
            decimalOutput.classList.add('inout');
            decimalOutput.id = (`draggable-${counter}-output-1`);
            binaryInputContainer.appendChild(decimalOutput);

            newDraggable.appendChild(binaryInputContainer);

            break;
        case "c":
            newDraggable.classList.add('special');
            newDraggable.classList.add('comment');
            title.textContent = 'comment block';
            inout1.remove();
            inout2.remove();
            inout3.remove();
            inout4.remove();

            newDraggable.style.height = '200px';

            const textArea = document.createElement('textarea');
            textArea.style.width = '100px';
            textArea.style.height = '80%';
            textArea.style.resize = 'none';
            textArea.style.overflow = 'scroll';
            newDraggable.appendChild(textArea);

            textArea.addEventListener('focus', (e) => {
                listenInput = false;
            });
            textArea.addEventListener('blur', (e) => {
                listenInput = true;
            });

            break;

        default:
            newDraggable.remove();
            return;
    }

    // Append newDraggable to the fragment
    fragment.appendChild(newDraggable);

    document.getElementById("screen").appendChild(fragment);
    draggables = document.querySelectorAll('.draggable');
    inout = document.querySelectorAll('.inout');

    addListeners();
    counter++;
}

//on start

addListeners();

//mobile?
const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
return regex.test(navigator.userAgent) ? document.getElementById('mobileConnectorBtn').style.display = 'block' : null;


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

document.addEventListener('keyup', (e) => {
    if (e.key === ' ' && listenInput) {
        connectorTool();
    }
});

function connectorTool(){
    isConnecting = false;
        startElement = null;

        let newConnections = [];
        const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

        document.querySelectorAll('.connecting').forEach(draggable => {
            draggable.classList.remove('connecting');
            newConnections.push(draggable.id);
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
            if (document.getElementById(ele1) != undefined){
                document.getElementById(ele1).style.backgroundColor = 'lightblue';
            }
            else if (document.getElementById(ele2) != undefined){
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
            input.textContent = output.textContent;
        }
    });
}

//end connection craziness

//Gate logic
function gateLogic() {
    let gates = document.querySelectorAll('.gate');
    gates.forEach(gate => {
        const input1 = document.getElementById(`${gate.id}-input-1`);
        const input2 = document.getElementById(`${gate.id}-input-2`);

        const output1 = document.getElementById(`${gate.id}-output-1`);
        const output2 = document.getElementById(`${gate.id}-output-2`);
        switch (gate.classList[2]) {
            case "not":
                output1.textContent = notGate(input1.textContent);
                output2.textContent = notGate(input1.textContent);

                break;
            case "and":
                output1.textContent = andGate(input1.textContent, input2.textContent);
                output2.textContent = andGate(input1.textContent, input2.textContent);
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

        if(input1.textContent === '1' || input1.textContent === '0'){
            if (input1.textContent === '1'){
                output1.textContent = input2.textContent;
                output2.textContent = input2.textContent;
            }
            else if(input1.textContent === '0' && !relay.classList.contains('memoryRelay')){
                output1.textContent = '0';
                output2.textContent = '0';
            }
        }
        else{
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
}

function notGate(input) {
    return input === '0' ? '1' : '0';
}

function andGate(input1, input2) {
    return input1 === '1' && input2 === '1' ? '1' : '0';
}

//time loop

setInterval(() => {
    syncConnections();
    addListeners();
    gateLogic();

    let lights = document.querySelectorAll('.lightPart');
    lights.forEach(light => {
        const input = document.getElementById(`${light.parentElement.id}-input-1`);
        light.style.backgroundColor = input.textContent === '1' ? 'yellow' : 'black';
    });
}, 500);

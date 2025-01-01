let draggables = document.querySelectorAll('.draggable');
let inout = document.querySelectorAll('.inout');
let activeDraggable = null;
let offsetX = 0, offsetY = 0;

function addListeners() {
    draggables.forEach(draggable => {
        draggable.addEventListener('mousedown', (e) => {
            activeDraggable = draggable;
            offsetX = Math.round((e.clientX - draggable.offsetLeft) / 10) * 10;
            offsetY = Math.round((e.clientY - draggable.offsetTop) / 10) * 10;
            offsetY = e.clientY - draggable.offsetTop;
            draggable.style.cursor = 'grabbing';
        });
    });

    inout.forEach(inout => {
        inout.addEventListener('mousedown', (e) => {
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

document.addEventListener('keydown', (e) => {
    const fragment = document.createDocumentFragment();

    const newDraggable = document.createElement('div');
    newDraggable.classList.add('draggable');
    newDraggable.style.top = '200px';
    newDraggable.style.left = '200px';
    newDraggable.id = `draggable-${counter}`;

    const inout1 = document.createElement('div');
    inout1.classList.add('inout');
    inout1.id = (`draggable-${counter}-input-1`);
    inout1.textContent = 'in';
    newDraggable.appendChild(inout1);


    const inout2 = document.createElement('div');
    inout2.classList.add('inout');
    inout2.id = (`draggable-${counter}-input-2`);
    inout2.textContent = 'in';
    newDraggable.appendChild(inout2);

    const title = document.createElement('div');
    title.classList.add('inout');
    title.classList.add('title');
    title.textContent = 'title';
    newDraggable.appendChild(title);

    const inout3 = document.createElement('div');
    inout3.classList.add('inout');
    inout3.id = (`draggable-${counter}-output-1`);
    inout3.textContent = 'out';
    newDraggable.appendChild(inout3);

    const inout4 = document.createElement('div');
    inout4.classList.add('inout');
    inout4.id = (`draggable-${counter}-output-2`);
    inout4.textContent = 'out';
    inout4.style.border = "none";
    newDraggable.appendChild(inout4);


    switch (e.key) {
        case "a":
            newDraggable.classList.add('value');
            title.textContent = 'value';
            inout3.textContent = '0';
            inout4.textContent = '0';
            break;
        case "s":
            newDraggable.classList.add('value');
            title.textContent = 'value';
            inout3.textContent = '1';
            inout4.textContent = '1';
            break;
        case "d":
            newDraggable.classList.add('gate');
            newDraggable.classList.add('not');
            title.textContent = 'NOT gate';
            break;
        case "f":
            newDraggable.classList.add('gate');
            newDraggable.classList.add('and');
            title.textContent = 'AND gate';
            break;
        case "g":
            newDraggable.classList.add('gate');
            newDraggable.classList.add('or');
            title.textContent = 'OR gate';
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

    // if (newDraggable) {

    // }
});

addListeners();

let isConnecting = false;
let startElement = null;
let connections = [];

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        isConnecting = true;
    }
    if (e.key === 'm') {
        if (document.getElementById('menu').style.display === 'block') {
            document.getElementById('menu').style.display = 'none';
        }
        else {
            document.getElementById('menu').style.display = 'block';
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        isConnecting = false;
        startElement = null;

        let newConnections = [];
        const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

        document.querySelectorAll('.connecting').forEach(draggable => {
            draggable.classList.remove('connecting');
            newConnections.push(draggable.id);
        });

        if (newConnections.length === 2) {
            connections.push(newConnections);
            newConnections.forEach(connection => {
                document.getElementById(connection).style.backgroundColor = color;
            });
            syncConnections();
            setTimeout(() => {
                syncConnections();
            }, 500);
        }
        else {
            alert('Invalid connection. Please connect two elements.');
        }
    }
});
//how to pass values between connected elements
function syncConnections() {
    connections.forEach(connection => {
        const [ele1, ele2] = connection;

        let input;
        let output;

        //which is input?
        if (ele1.split("-")[2] === "input") {
            output = document.getElementById(ele2);
            input = document.getElementById(ele1);

            input.textContent = output.textContent;
        }
        else if (ele2.split("-")[2] === "input") {
            output = document.getElementById(ele1);
            input = document.getElementById(ele2);

            input.textContent = output.textContent;
        }
    });
    gateLogic();
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

            default:
                break;
        }
    });
}

function notGate(input) {
    return input === '0' ? '1' : '0';
}

function andGate(input1, input2) {
    return input1 === '1' && input2 === '1' ? '1' : '0';
}

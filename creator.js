const screen = document.getElementById("screen");
const codespace = document.getElementById("codespace");

function displayAlert(input, header, message) {
    document.getElementById("inputDialog").style.display = "block";

    document.getElementById("inputDialogHeader").textContent = header;
    document.getElementById("inputDialogBody").textContent = message;

    const alertBoxCancel = document.getElementById("inputDialogCancel");
    const alertBoxSubmit = document.getElementById("inputDialogSubmit");
    const alertBoxInput = document.getElementById("inputDialogInput");

    if (!input) {
        alertBoxInput.style.display = "none";
    }

    return new Promise((resolve) => {
        const submitAlert = () => {
            document.getElementById("inputDialog").style.display = 'none';
            alertBoxSubmit.removeEventListener('click', submitAlert);
            alertBoxCancel.removeEventListener('click', cancelAlert);
            resolve(alertBoxInput.value);
            alertBoxInput.style.display = "block";
        };

        const cancelAlert = () => {
            document.getElementById("inputDialog").style.display = 'none';
            alertBoxSubmit.removeEventListener('click', submitAlert);
            alertBoxCancel.removeEventListener('click', cancelAlert);
            resolve(null);
            alertBoxInput.style.display = "block";
        };
        alertBoxSubmit.addEventListener('click', submitAlert);
        alertBoxCancel.addEventListener('click', cancelAlert);
    });
}

function updatePreview() {
    if (mode === "Design") {
        codespace.value = codespace.value.split("\u005C").join("");
        code.design = codespace.value;
        screen.innerHTML = code.design;
    }

    //ensure only one child and move the child to center
    const child = screen.children[0];
    if (child) {
        child.style.margin = "auto";
        child.style.position = "static";
    }

    //add ability to change inout text content
    const inouts = document.querySelectorAll('.inout').forEach(function (element) {
        if (element) {
            element.addEventListener('click', async e => {
                const response = await displayAlert(true, "Set value", "Set the value for the inout");
                if (response !== null) {
                    element.textContent = response;
                }
            })
        }
    })

    runUserCode(code.program);
}

// autocomplete
codespace.addEventListener("input", e => {
    if (e.data === null || e.data === undefined) {
        return;
    }
    if (e.data.length === 1 && (e.data === "(" || e.data === "{" || e.data === "[" || e.data === "`" || e.data === "'" || e.data === '"' || e.data === '<')) {
        // determine which symbol to use
        let symbol;
        switch (e.data) {
            case "(":
                symbol = ")";
                break;
            case "{":
                symbol = "}";
                break;
            case "[":
                symbol = "]";
                break;
            case "`":
                symbol = "`";
                break;
            case "'":
                symbol = "'";
                break;
            case '"':
                symbol = '"';
                break;
            case "<":
                symbol = ">";
                break;
            default:
                break;
        }
        const start = codespace.selectionStart;
        const end = codespace.selectionEnd;
        codespace.value = codespace.value.slice(0, start) + symbol + codespace.value.slice(start, codespace.value.length);
        codespace.selectionStart = start;
        codespace.selectionEnd = end;
    }
})

let mode = "Design"
let code = {
    design: "",
    program: ""
}

const codespaceSelect = document.getElementById("codespaceSelect");
codespaceSelect.addEventListener('input', e => {
    switch (mode) {
        case "Program":
            code.program = codespace.value;
            break;
        case "Design":
            code.design = codespace.value;
            break;
        default:
            break;
    }
    mode = codespaceSelect.value;

    switch (mode) {
        case 'Program':
            codespace.value = code.program;
            break;
        case 'Design':
            codespace.value = code.design;
            break;
        default:
            break;
    }
})

codespace.addEventListener('input', e => {
    switch (mode) {
        case "Program":
            code.program = codespace.value;
            break;
        case "Design":
            code.design = codespace.value;
            break;
        default:
            break;
    }
})

// program
function runUserCode(codeString) {
    try {
        // Setup a new function execution context
        const execute = new Function('gate', codeString);
        // default variables
        execute(screen.children[0]);
    } catch (err) {
        // TODO: add error handling
        displayAlert(false, "Runtime Error", `Runtime Error: ${err.message}`);
    }
}

// export
document.getElementById('exportBtn').addEventListener("click", async () => {
    const id = await displayAlert(true, "ID", "Choose a valid ID for your gate. This is unique to each gate type.");
    const title = await displayAlert(true, "Title", "Choose a title for your gate");
    const type = await displayAlert(true, "Type", "Choose a type for your gate. This determines what datatypes can be used with the gate.");
    let output = {
        id: id,
        title: title,
        type: type,
        structure: code.design,
        logic: code.program,
        time: new Date()
    }
    const jsonString = JSON.stringify(output, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.json`;

    // download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});

// On start
document.getElementById("codespaceSelect").value = "Design";

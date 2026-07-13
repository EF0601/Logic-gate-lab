//includes scripts to repair old save files by removing incompatible parts
let validBlocks;

fetch('./blocks.json')
    .then(response => response.json())
    .then(data => {
        validBlocks = data;
    })
    .catch(error => {
        console.error('Failed to fetch data:', error)
    });

function repairFile(filename) {
    if (!JSON.parse(localStorage.getItem(filename))) { return }
    let file = JSON.parse(localStorage.getItem(filename));

    const toolbar = file.specialData === "toolbar";

    let missingBlocks = [];
    file.blocks.forEach(element => {
        //detects for outdated blocks or IDs
        if (toolbar && (validBlocks[element] === undefined || validBlocks[element] === null) ) {
            missingBlocks.push(element);
            //toolbar item, so no need to check for comments or position data
        }
        else if ((validBlocks[element[0]] === undefined || validBlocks[element[0]] === null) && !toolbar) {
            missingBlocks.push(element);
        }
        else if (((element[0] === "j" || element[0] === "p") && element.length === 2) && !toolbar) {
            element.push(0);
        }
        else if ((element.length === 2 || ((element[0] === "j" || element[0] === "p") && element.length === 3)) && !toolbar) {
            element.push(0);
            element.push(0);
        }
    });

    missingBlocks.forEach(element => {
        file.blocks.splice(file.blocks.indexOf(element), 1)
    });

    if (!toolbar) { file.specialData = "repaired"; } //if it is a toolbar, the toolbar note must stay
    localStorage.removeItem(filename);
    localStorage.setItem(filename, JSON.stringify(file));
}

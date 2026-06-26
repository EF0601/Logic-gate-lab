//includes scripts to repair old save files by removing incompatible parts
fetch('./blocks.json')
    .then(response => response.json())
    .then(data => {
        const validBlocks = data;
    })
    .catch(error => {
        console.error('Failed to fetch data:', error)
    });

function repairFile(filename) {
    if (!JSON.parse(localStorage.getItem(filename))) { return }
    let file = JSON.parse(localStorage.getItem(filename));

    let missingBlocks = [];
    file.blocks.forEach(element => {
        //detects for outdated blocks or IDs
        if (validBlocks[element[0]] == null || validBlocks[element[0]] == undefined) {
            missingBlocks.push(element);
        }
        else if ((element[0] === "j" || element[0] === "p") && element.length === 2) {
            element.push(0);
        }
        else if (element.length === 2 || ((element[0] === "j" || element[0] === "p") && element.length === 3)) {
            element.push(0);
            element.push(0);
        }
    });

    missingBlocks.forEach(element => {
        file.blocks.splice(file.blocks.indexOf(element), 1)
    });

    file.specialData = "repaired";
    localStorage.removeItem(filename);
    localStorage.setItem(filename, JSON.stringify(file));
}

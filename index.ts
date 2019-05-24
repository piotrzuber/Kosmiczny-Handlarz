function printBests() {
    let resultsS: string = localStorage.results;
    let table: HTMLTableElement = <HTMLTableElement> document.getElementById('scores');
    let tableHead = table.createTHead();
    let rowHead = tableHead.insertRow();
    let th = document.createElement('th');
    let text = document.createTextNode('Gracz');
    th.appendChild(text);
    rowHead.appendChild(th);
    th = document.createElement('th');
    text = document.createTextNode('Wynik');
    th.appendChild(text);
    rowHead.appendChild(th);
    let results = JSON.parse(resultsS);
    if (results[0][1] === "-1") {
        let it = 5;
        while (it > 0) {
            let row = table.insertRow();
            let cell = row.insertCell();
            let text = document.createTextNode('brak wyników');
            cell.appendChild(text);
            cell = row.insertCell();
            text = document.createTextNode('0');
            cell.appendChild(text);
            it--;
        }
    } else {
        let results = JSON.parse(resultsS);

        for (let ord of results) {
            if (ord[1] != "-1") {
                let data: string[] = ord;
                let name: string = data[0];
                let score: string = data[1];
                let row = table.insertRow();
                let cell = row.insertCell();
                let text = document.createTextNode(name);
                cell.appendChild(text);
                cell = row.insertCell();
                text = document.createTextNode(score);
                cell.appendChild(text);
            }
        }
    }
}

function initScores() {
    if (localStorage.results == null) {
        let results = "[[\"No records\", \"-1\"]]";
        localStorage.results = results;
    }
}
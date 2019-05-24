function printBests() {
    var resultsS = localStorage.results;
    var table = document.getElementById('scores');
    var tableHead = table.createTHead();
    var rowHead = tableHead.insertRow();
    var th = document.createElement('th');
    var text = document.createTextNode('Gracz');
    th.appendChild(text);
    rowHead.appendChild(th);
    th = document.createElement('th');
    text = document.createTextNode('Wynik');
    th.appendChild(text);
    rowHead.appendChild(th);
    var results = JSON.parse(resultsS);
    if (results[0][1] === "-1") {
        var it_1 = 5;
        while (it_1 > 0) {
            var row = table.insertRow();
            var cell = row.insertCell();
            var text_1 = document.createTextNode('brak wyników');
            cell.appendChild(text_1);
            cell = row.insertCell();
            text_1 = document.createTextNode('0');
            cell.appendChild(text_1);
            it_1--;
        }
    }
    else {
        var results_2 = JSON.parse(resultsS);
        for (var _i = 0, results_1 = results_2; _i < results_1.length; _i++) {
            var ord = results_1[_i];
            if (ord[1] != "-1") {
                var data_1 = ord;
                var name_1 = data_1[0];
                var score = data_1[1];
                var row = table.insertRow();
                var cell = row.insertCell();
                var text_2 = document.createTextNode(name_1);
                cell.appendChild(text_2);
                cell = row.insertCell();
                text_2 = document.createTextNode(score);
                cell.appendChild(text_2);
            }
        }
    }
}
function initScores() {
    if (localStorage.results == null) {
        var results = "[[\"No records\", \"-1\"]]";
        localStorage.results = results;
    }
}

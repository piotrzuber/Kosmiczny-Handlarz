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
function authUser() {
    console.log('authUser()');
    var nickInput = document.getElementById('nick');
    var passwdInput = document.getElementById('pwd');
    var nick = nickInput.value;
    var passwd = passwdInput.value;
    var headers = {
        'nick': nick,
        'passwd': passwd
    };
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/v0/user_auth", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', function () {
        var req = xhr;
        if (req.readyState === 4) {
            console.log('STATUS: ' + req.status);
            console.log('BODY: ' + req.responseText);
            if (req.status == 401) {
                alert('401: ' + 'Błędna nazwa użytkownika i/lub hasło');
            }
            else if (req.status == 500) {
                alert('500: ' + 'Internal server error');
            }
            else if (req.status == 200) {
                alert('200: Zalogowano użytkownika ' + nick);
                sessionStorage.setItem('nick', nick);
            }
        }
        else {
            console.log(req);
            console.log(req.readyState);
        }
    });
    console.log('authUser(): sending request: ' + JSON.stringify(headers));
    xhr.send(JSON.stringify(headers));
}
function printGames() {
    var select = document.getElementById('games');
    select.innerHTML = "";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8080/api/v0/games", true);
    xhr.addEventListener('readystatechange', function () {
        var req = xhr;
        if (req.readyState === 4) {
            console.log("printGames(): Status: " + req.status);
            console.log('printGames(): Body: ' + req.responseText);
            for (var _i = 0, _a = JSON.parse(req.responseText); _i < _a.length; _i++) {
                var _b = _a[_i], game = _b.game, data_2 = _b.data;
                var option = document.createElement('option');
                option.value = game;
                var text = game + " - Czas: " + data_2.game_duration + " - Kredyty: " + data_2.initial_credits;
                option.text = text;
                select.add(option);
            }
        }
    });
    console.log('printGames(): Sending request');
    xhr.send();
}
function displayInfo() {
    var select = document.getElementById('games');
    var val = select.value;
    var options = select.options;
    for (var i in options) {
        if (options[+i].value === val)
            select.selectedIndex = +i;
        break;
    }
    var selected = select.options[select.selectedIndex].value;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8080/api/v0/games/" + encodeURIComponent(selected), true);
    xhr.addEventListener('readystatechange', function () {
        var req = xhr;
        if (req.readyState === 4) {
            console.log("printGames(): Status: " + req.status);
            if (req.status === 500) {
                alert("500: Internal server error");
            }
            else {
                console.log('printGames(): Body: ' + req.responseText);
                alert(req.responseText);
                sessionStorage.setItem('game_settings', req.responseText);
            }
        }
    });
    xhr.send();
}
function addGame() {
    console.log('addGame()');
    console.log(sessionStorage.getItem('nick'));
    console.log(!sessionStorage.getItem('nick'));
    if (!sessionStorage.getItem('nick')) {
        alert("Gry moga dodawać jedynie zalogowani użytkownicy");
        return;
    }
    var name = document.getElementById('game_name');
    var fileInput = document.getElementById('game_json');
    var files = fileInput.files;
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:8080/api/v0/games", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', function () {
        var req = xhr;
        if (req.readyState === 4) {
            console.log("addGame(): Status: " + req.status);
            if (req.status === 500) {
                alert("500: Internal server error");
            }
            else if (req.status === 403) {
                alert("403: Gra o podanej nazwie już istnieje");
            }
            else if (req.status === 200) {
                alert("200: Dodano nową grę");
                printGames();
            }
        }
    });
    reader.onload = function (e) {
        var target = e.target;
        var data = target.result;
        var content = data;
        var headers = {
            'game': name.value,
            'data': content
        };
        xhr.send(JSON.stringify(headers));
    };
    reader.readAsText(file);
}
function startGame() {
    if (!sessionStorage.getItem('nick')) {
        alert("Aby rozpocząć rozgrywkę należy się zalogować");
        return;
    }
    window.open('gameboard.html', '_self');
}

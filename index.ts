function printBests() {
    let resultsS: string = localStorage.results;
    let table: HTMLTableElement = <HTMLTableElement>document.getElementById('scores');
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

function authUser() {
    console.log('authUser()');
    let nickInput: HTMLInputElement = <HTMLInputElement>document.getElementById('nick');
    let passwdInput: HTMLInputElement = <HTMLInputElement>document.getElementById('pwd');
    let nick = nickInput.value;
    let passwd = passwdInput.value;

    let headers = {
        'nick': nick,
        'passwd': passwd
    };

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "http://localhost:8080/api/v0/user_auth", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('readystatechange', () => {
        const req = xhr;

        if (req.readyState === 4) {
            console.log('STATUS: ' + req.status);
            console.log('BODY: ' + req.responseText);

            if (req.status == 401) {
                alert('401: ' + 'Błędna nazwa użytkownika i/lub hasło');
            } else if (req.status == 500) {
                alert('500: ' + 'Internal server error');
            } else if (req.status == 200) {
                alert('200: Zalogowano użytkownika ' + nick);
                sessionStorage.setItem('nick', nick);
            }
        } else {
            console.log(req);
            console.log(req.readyState);
        }
    });

    console.log('authUser(): sending request: ' + JSON.stringify(headers));
    xhr.send(JSON.stringify(headers));
}

function printGames() {
    let select: HTMLSelectElement = <HTMLSelectElement>document.getElementById('games');
    select.innerHTML = "";
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "http://localhost:8080/api/v0/games", true);

    xhr.addEventListener('readystatechange', () => {
        const req = xhr;

        if (req.readyState === 4) {
            console.log("printGames(): Status: " + req.status);


            console.log('printGames(): Body: ' + req.responseText);
            for (let { game, data } of JSON.parse(req.responseText)) {
                let option = document.createElement('option');
                option.value = game;
                let text = game + " - Czas: " + data.game_duration + " - Kredyty: " + data.initial_credits;
                option.text = text;
                select.add(option);
            }
        }
    });

    console.log('printGames(): Sending request');
    xhr.send();
}

function displayInfo() {
    let select: HTMLSelectElement = <HTMLSelectElement>document.getElementById('games');
    let val: string = select.value;
    let options = select.options;

    for (let i in options) {
        if (options[+i].value === val) select.selectedIndex = +i; break;
    }

    let selected: string = select.options[select.selectedIndex].value;

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "http://localhost:8080/api/v0/games/" + encodeURIComponent(selected), true);

    xhr.addEventListener('readystatechange', () => {
        const req = xhr
        if (req.readyState === 4) {
            console.log("printGames(): Status: " + req.status);
            if (req.status === 500) {
                alert("500: Internal server error");
            } else {

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
    let name: HTMLInputElement = <HTMLInputElement>document.getElementById('game_name');
    let fileInput: HTMLInputElement = <HTMLInputElement>document.getElementById('game_json');
    let files = fileInput.files;
    let file: File = files[0];


    let reader = new FileReader();
    reader.readAsText(file);

    let xhr = new XMLHttpRequest();

    xhr.open("PUT", "http://localhost:8080/api/v0/games", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('readystatechange', () => {
        const req = xhr;

        if (req.readyState === 4) {
            console.log("addGame(): Status: " + req.status);
            if (req.status === 500) {
                alert("500: Internal server error");
            } else if (req.status === 403) {
                alert("403: Gra o podanej nazwie już istnieje");
            } else if (req.status === 200) {
                alert("200: Dodano nową grę");
                printGames();
            }
        }
    });

    reader.onload = function (e) {
        var target: any = e.target;
        var data = target.result;
        let content: string = data;

        let headers = {
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
var data = JSON.parse(sessionStorage.getItem('game_settings'));
var game_duration = data.game_duration;
var initial_credits = data.initial_credits;
var items = data.items;
var init_planets = data.planets;
var init_starships = data.starships;
var TIMEOUT = 1000;
var ITEMS_KEY = 'available_items';
var AVAILABLE_KEY = 'available';
var BUY_KEY = 'buy_price';
var SELL_KEY = 'sell_price';
var Planet = /** @class */ (function () {
    function Planet(name) {
        this.name = name;
        this.available_items = new Array();
        for (var item in init_planets[name][ITEMS_KEY]) {
            var price = { buy: init_planets[name][ITEMS_KEY][item][BUY_KEY], sell: init_planets[name][ITEMS_KEY][item][SELL_KEY] };
            var it_1 = { name: item, available: init_planets[name][ITEMS_KEY][item][AVAILABLE_KEY], price: price };
            this.available_items.push(it_1);
        }
        this.position = { x: init_planets[name]['x'], y: init_planets[name]['y'] };
    }
    return Planet;
}());
var planets = new Array();
for (var planet in init_planets) {
    planets.push(new Planet(planet));
}
var CARGO_KEY = 'cargo_hold_size';
var POSITION_KEY = 'position';
var Travel = /** @class */ (function () {
    function Travel(start) {
        this.start = start;
        this.destination = null;
        this.remaining_time = 0;
        this.alreadyFinished = false;
    }
    Travel.prototype.getTime = function () {
        var length_x = this.destination.position.x - this.start.position.x;
        var length_y = this.destination.position.y - this.start.position.y;
        var len_squared = length_x * length_x + length_y * length_y;
        var l = Math.ceil(Math.sqrt(len_squared));
        return l;
    };
    Travel.prototype.proceed = function () {
        if (this.alreadyFinished) {
            this.alreadyFinished = false;
        }
        if (this.remaining_time <= 0 && this.destination != null) {
            this.remaining_time = 0;
            this.start = this.destination;
            this.destination = null;
            this.alreadyFinished = true;
        }
        else {
            this.remaining_time--;
        }
    };
    return Travel;
}());
var Starship = /** @class */ (function () {
    function Starship(name) {
        this.name = name;
        this.cargo_max = init_starships[name][CARGO_KEY];
        var planet = planets.filter(function (planet) { return planet.name === init_starships[name][POSITION_KEY]; })[0];
        this.travel = new Travel(planet);
        this.cargo = { size: 0, stock: new Array() };
    }
    Starship.prototype.isTraveling = function () {
        return (this.travel.remaining_time != 0 && this.travel.destination != null);
    };
    return Starship;
}());
var starships = new Array();
for (var starship in init_starships) {
    starships.push(new Starship(starship));
}
var remaining_time = game_duration;
var credits = initial_credits;
var openPopup = null;
var openPopupObject = null;
function printPlayer() {
    document.getElementById('h1_nick').innerHTML = 'Gracz: ' + sessionStorage.nick;
}
function printCreditsAndTime() {
    document.getElementById('h1_credits_time').innerHTML = "Kredyty: " + credits + " Pozostały czas: " + remaining_time;
}
function printStarships() {
    var divShips = document.getElementById('div_ships');
    var content = "";
    starships.forEach(function (ship) {
        if (ship.isTraveling()) {
            content += "<div class=\"unity dropdown\"><a id=\"a_" + ship.name + "\" href=\"javascript:windowShip('" + ship.name + "')\">";
            content += "<div class=\"dropdown-content\"><p>W podróży do " + ship.travel.destination.name + "</p></div>";
        }
        else {
            content += "<div class=\"unity dropdown\"><a id=\"a_" + ship.name + "\" href=\"javascript:windowShip('" + ship.name + "')\">";
            content += "<div class=\"dropdown-content\"><p>Położenie:" + ship.travel.start.name + "</p></div>";
        }
        content += ship.name;
        content += "</a></div></br>";
    });
    divShips.innerHTML = content;
}
function windowShip(name) {
    document.getElementById('ship_name').innerHTML = name;
    printCargoInfo(name);
    printShipStock(name);
    if (!starships.filter(function (ship) { return ship.name === name; })[0].isTraveling()) {
        document.getElementById('p_travel').innerHTML = "";
        printBuyableItems(name);
        printSellableItems(name);
        printQuantityInput(name);
        printQuantityInputSell(name);
        setSellActivation();
        printDestinations(name);
        document.getElementById('trade_content').style.display = 'block';
    }
    else {
        printTravelInfo(name);
        document.getElementById('trade_content').style.display = 'none';
    }
    var popup = document.getElementById('popup_ship');
    var close = document.getElementById('close_ship');
    if (openPopup != null)
        closeWindow(openPopup);
    openPopup = popup;
    openPopupObject = name;
    popup.style.display = 'flex';
    close.onclick = function () {
        closeWindow(popup);
        openPopup = null;
        openPopupObject = null;
    };
}
function printPlanets() {
    var divPlanets = document.getElementById('div_planets');
    var content = "";
    planets.forEach(function (planet) {
        content += "<div class=\"unity\"><a id=\"a_" + planet.name + "\" href=\"javascript:windowPlanet('" + planet.name + "')\">";
        content += planet.name;
        content += "</a></div>";
    });
    divPlanets.innerHTML = content;
}
function windowPlanet(name) {
    document.getElementById('planet_name').innerHTML = name;
    printPlanetStock(name);
    printCurrentShips(name);
    var popup = document.getElementById('popup_planet');
    var close = document.getElementById('close_planet');
    if (openPopup != null)
        closeWindow(openPopup);
    openPopup = popup;
    openPopupObject = name;
    popup.style.display = 'flex';
    close.onclick = function () {
        closeWindow(popup);
        openPopup = null;
        openPopupObject = null;
    };
}
function closeWindow(popup) {
    popup.style.display = 'none';
}
function printPlanetStock(name) {
    var table = document.getElementById('table_stock_planet');
    table.innerHTML = "";
    var tableHead = table.createTHead();
    var rowHead = tableHead.insertRow();
    var th = document.createElement('th');
    var text = document.createTextNode('Towar');
    th.appendChild(text);
    rowHead.appendChild(th);
    th = document.createElement('th');
    text = document.createTextNode('Ilość');
    th.appendChild(text);
    rowHead.appendChild(th);
    th = document.createElement('th');
    text = document.createTextNode('Kupno');
    th.appendChild(text);
    rowHead.appendChild(th);
    th = document.createElement('th');
    text = document.createTextNode('Sprzedaż');
    th.appendChild(text);
    rowHead.appendChild(th);
    var stock = planets.filter(function (planet) { return planet.name === name; })[0].available_items;
    stock.forEach(function (item) {
        var row = table.insertRow();
        var cell = row.insertCell();
        var text = document.createTextNode(item.name);
        cell.appendChild(text);
        cell = row.insertCell();
        text = document.createTextNode(item.available.toString());
        cell.appendChild(text);
        cell = row.insertCell();
        text = document.createTextNode(item.price.buy.toString());
        cell.appendChild(text);
        cell = row.insertCell();
        text = document.createTextNode(item.price.sell.toString());
        cell.appendChild(text);
    });
}
function printCurrentShips(name) {
    var pShips = document.getElementById('p_present_ships');
    var content;
    var isShip = false;
    var present = starships.filter(function (ship) { return ship.travel.start.name === name && !ship.isTraveling(); });
    if (present.length === 0) {
        content = "Obecnie na " + name + " nie ma żadnych statków";
    }
    else {
        content = "Statki przebywające na " + name + ":";
        present.forEach(function (ship) {
            if (!isShip)
                content += " ";
            else
                content += ", ";
            content += ("<a href=\"javascript:windowShip('" + ship.name + "')\">" + ship.name + "</a>");
            isShip = true;
        });
    }
    pShips.innerHTML = content;
}
function printShipStock(name) {
    var stock = starships.filter(function (ship) { return ship.name === name; })[0].cargo.stock;
    var table = document.getElementById('table_stock_ship');
    table.innerHTML = "";
    var pStatus = document.getElementById('p_cargo_status');
    pStatus.innerHTML = "";
    if (stock.length === 0) {
        var content = "Statek nie transportuje żadnych przedmiotów";
        pStatus.innerHTML = content;
        return;
    }
    var tableHead = table.createTHead();
    var rowHead = tableHead.insertRow();
    var th = document.createElement('th');
    var text = document.createTextNode('Towar');
    th.appendChild(text);
    rowHead.appendChild(th);
    th = document.createElement('th');
    text = document.createTextNode('Ilość');
    th.appendChild(text);
    rowHead.appendChild(th);
    stock.forEach(function (item) {
        var row = table.insertRow();
        var cell = row.insertCell();
        var text = document.createTextNode(item.name);
        cell.appendChild(text);
        cell = row.insertCell();
        text = document.createTextNode(item.quantity.toString());
        cell.appendChild(text);
    });
}
function printCargoInfo(name) {
    var pMaxCargo = document.getElementById('p_max_cargo');
    var content = "Maksymalna ładowność statku: ";
    var ship = starships.filter(function (ship) { return ship.name === name; })[0];
    content += ship.cargo_max;
    content += ".</br>";
    content += "Dostępna ładowność: ";
    content += ship.cargo_max - ship.cargo.size;
    pMaxCargo.innerHTML = content;
}
function printTravelInfo(name) {
    var pTravel = document.getElementById('p_travel');
    var content = "Statek jest w podróży z ";
    var ship = starships.filter(function (ship) { return ship.name === name; })[0];
    content += "<a href=\"javascript:windowPlanet('" + ship.travel.start.name + "')\">" + ship.travel.start.name + "</a>";
    content += " do ";
    content += "<a href=\"javascript:windowPlanet('" + ship.travel.destination.name + "')\">" + ship.travel.destination.name + "</a>";
    content += "</br>";
    content += "Pozostało " + ship.travel.remaining_time + " sekund podróży";
    pTravel.innerHTML = content;
}
function printBuyableItems(name) {
    var select = document.getElementById('select_buyable');
    while (select.length > 0)
        select.remove(0);
    var location = starships.filter(function (ship) { return ship.name === name; })[0].travel.start.name;
    var planetItems = planets.filter(function (planet) { return planet.name === location; })[0].available_items;
    planetItems.forEach(function (item) {
        if (item.available != 0) {
            var option = document.createElement('option');
            option.value = item.name;
            option.text = item.name;
            select.add(option);
        }
    });
}
function getChosenItem(id1, id2) {
    var select = document.getElementById(id1);
    var val = select.value;
    var options = select.options;
    var planet = starships.filter(function (ship) { return ship.name === openPopupObject; })[0].travel.start;
    for (var i in options) {
        if (options[+i].value === val)
            select.selectedIndex = +i;
        break;
    }
    var selectedItem = select.options[select.selectedIndex].value;
    var input = document.getElementById(id2);
    if (id2 === 'input_quantity') {
        var maxQuantity = planet.available_items.filter(function (item) { return item.name === selectedItem; })[0].available;
        input.setAttribute('max', maxQuantity.toString());
    }
    else if (id2 === 'sell_quantity') {
        var maxQuantity = starships.filter(function (ship) { return ship.name === openPopupObject; })[0]
            .cargo.stock.filter(function (item) { return item.name === selectedItem; })[0]
            .quantity;
        input.setAttribute('max', maxQuantity.toString());
    }
}
function printQuantityInput(name) {
    var input = document.getElementById('input_quantity');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '1');
    var select = document.getElementById('select_buyable');
    var selectedItem = select.options[select.selectedIndex].value;
    var planet = starships.filter(function (ship) { return ship.name === name; })[0].travel.start;
    var maxQuantity = planet.available_items.filter(function (item) { return item.name === selectedItem; })[0].available;
    input.setAttribute('max', maxQuantity.toString());
}
function buy() {
    var itemSelect = document.getElementById('select_buyable');
    var quantityInput = document.getElementById('input_quantity');
    if (!quantityInput.checkValidity()) {
        alert(quantityInput.validationMessage);
        return;
    }
    var ship = starships.filter(function (ship) { return ship.name === openPopupObject; })[0];
    var planet = ship.travel.start;
    var item = planet.available_items.filter(function (item) { return item.name === itemSelect.options[itemSelect.selectedIndex].value; })[0];
    var quantity = +quantityInput.value;
    if (item.price.buy * quantity <= credits && quantity + ship.cargo.size <= ship.cargo_max) {
        credits -= item.price.buy * quantity;
        item.available -= quantity;
        ship.cargo.size += quantity;
        var itemShip = ship.cargo.stock.filter(function (item) { return item.name === itemSelect.options[itemSelect.selectedIndex].value; });
        if (itemShip.length === 0) {
            var it_2 = { name: item.name, quantity: quantity };
            ship.cargo.stock.push(it_2);
        }
        else {
            itemShip[0].quantity += quantity;
        }
        var h1CreditsAndTime = document.getElementById('h1_credits_time');
        h1CreditsAndTime.innerHTML = "Kredyty: " + credits + " Pozostały czas: " + remaining_time;
    }
    else if (item.price.buy * quantity > credits) {
        alert("Masz niewystarczającą liczbę kredytów.");
    }
    else {
        alert("Nie posiadasz wystarczająco miejsca w ładowni");
    }
    document.getElementById('table_stock_ship').innerHTML = "";
    printCargoInfo(openPopupObject);
    printShipStock(openPopupObject);
    printBuyableItems(openPopupObject);
    printQuantityInput(openPopupObject);
    printSellableItems(openPopupObject);
    printQuantityInputSell(openPopupObject);
    setSellActivation();
    printDestinations(openPopupObject);
}
function printSellableItems(name) {
    var select = document.getElementById('select_sellable');
    while (select.length > 0)
        select.remove(0);
    var location = starships.filter(function (ship) { return ship.name === name; })[0].travel.start.name;
    var planetItems = planets.filter(function (planet) { return planet.name === location; })[0].available_items;
    var ship = starships.filter(function (ship) { return ship.name === name; })[0];
    var empty = true;
    ship.cargo.stock.forEach(function (item) {
        if (planetItems.filter(function (itemP) { return itemP.name === item.name; }).length != 0) {
            var option = document.createElement('option');
            option.value = item.name;
            option.text = item.name;
            select.add(option);
            empty = false;
        }
    });
    select.disabled = empty;
}
function printQuantityInputSell(name) {
    var input = document.getElementById('sell_quantity');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '1');
    var select = document.getElementById('select_sellable');
    if (select.options.length === 0) {
        input.disabled = true;
        return;
    }
    input.disabled = false;
    var selectedItem = select.options[select.selectedIndex].value;
    var maxQuantity = starships.filter(function (ship) { return ship.name === name; })[0]
        .cargo.stock.filter(function (item) { return item.name === selectedItem; })[0]
        .quantity;
    input.setAttribute('max', maxQuantity.toString());
}
function sell() {
    var itemSelect = document.getElementById('select_sellable');
    var quantityInput = document.getElementById('sell_quantity');
    if (!quantityInput.checkValidity()) {
        alert(quantityInput.validationMessage);
        return;
    }
    var ship = starships.filter(function (ship) { return ship.name === openPopupObject; })[0];
    var planet = ship.travel.start;
    var item = planet.available_items.filter(function (item) { return item.name === itemSelect.options[itemSelect.selectedIndex].value; })[0];
    var quantity = +quantityInput.value;
    credits += item.price.sell * quantity;
    item.available += quantity;
    ship.cargo.size -= quantity;
    var itemShip = ship.cargo.stock.filter(function (item) { return item.name === itemSelect.options[itemSelect.selectedIndex].value; })[0];
    var itemIndex = ship.cargo.stock.indexOf(itemShip);
    if (quantity === itemShip.quantity) {
        ship.cargo.stock.splice(itemIndex, 1);
    }
    else {
        itemShip.quantity -= quantity;
    }
    var h1CreditsAndTime = document.getElementById('h1_credits_time');
    h1CreditsAndTime.innerHTML = "Kredyty: " + credits + " Pozostały czas: " + remaining_time;
    document.getElementById('table_stock_ship').innerHTML = "";
    printCargoInfo(openPopupObject);
    printShipStock(openPopupObject);
    printBuyableItems(openPopupObject);
    printQuantityInput(openPopupObject);
    printSellableItems(openPopupObject);
    printQuantityInputSell(openPopupObject);
    setSellActivation();
    printDestinations(openPopupObject);
}
function setSellActivation() {
    var select = document.getElementById('select_sellable');
    var buyButton = document.getElementById('button_sell');
    buyButton.disabled = select.disabled;
}
function printDestinations(name) {
    var ship = starships.filter(function (ship) { return ship.name === name; })[0];
    var select = document.getElementById('select_destination');
    while (select.length > 0)
        select.remove(0);
    planets.forEach(function (planet) {
        if (planet.name != ship.travel.start.name) {
            var option = document.createElement('option');
            option.value = planet.name;
            option.text = planet.name;
            select.add(option);
        }
    });
}
function startTravel() {
    var ship = starships.filter(function (ship) { return ship.name === openPopupObject; })[0];
    var select = document.getElementById('select_destination');
    var destination = planets.filter(function (planet) { return planet.name === select.value; })[0];
    ship.travel.destination = destination;
    ship.travel.remaining_time = ship.travel.getTime();
    windowShip(openPopupObject);
}
function displayBoard() {
    printPlayer();
    printCreditsAndTime();
    printStarships();
    printPlanets();
}
function displayEnding() {
    document.getElementById('game_over').innerHTML = "Koniec gry!";
    var msg = document.getElementById('ending_msg');
    var content = "";
    content += "Gratulacje " + sessionStorage.nick + "!";
    content += "</br>";
    content += "Twoja rozgrywka zostaje zakończona z wynikiem " + credits;
    var resultsS = localStorage.results;
    var results = JSON.parse(resultsS);
    for (var ord in results) {
        if (credits > Number(results[ord][1])) {
            var newScore = [sessionStorage.nick, credits];
            results.splice(+ord, 0, newScore);
            if (results.length > 10) {
                results.splice(10, 1);
            }
        }
    }
    localStorage.results = JSON.stringify(results);
    content += "</br>";
    content += "<a href=\"index.html\">Powrót</a>";
    var popup = document.getElementById('ending_popup');
    popup.style.display = 'flex';
    msg.innerHTML = content;
}
var interval;
function updateValues() {
    displayBoard();
    if (remaining_time <= 0) {
        displayEnding();
        clearInterval(interval);
        return;
    }
    remaining_time--;
    starships.forEach(function (ship) {
        ship.travel.proceed();
    });
    var ship = starships.filter(function (ship) { return ship.name === openPopupObject; });
    if (ship.length > 0 && ship[0].travel.alreadyFinished) {
        windowShip(openPopupObject);
    }
    else if (ship.length > 0 && ship[0].isTraveling()) {
        printTravelInfo(ship[0].name);
    }
    var planet = planets.filter(function (planet) { return planet.name === openPopupObject; });
    if (planet.length > 0) {
        printCurrentShips(planet[0].name);
    }
}
function updateBoard() {
    interval = window.setInterval(updateValues, TIMEOUT);
}

const data = JSON.parse(sessionStorage.getItem('game_settings'));

const game_duration: number = data.game_duration;
const initial_credits: number = data.initial_credits;
const items = data.items;
const init_planets = data.planets;
const init_starships = data.starships;

const TIMEOUT: number = 1000;
const ITEMS_KEY: string = 'available_items';
const AVAILABLE_KEY: string = 'available';
const BUY_KEY: string = 'buy_price';
const SELL_KEY: string = 'sell_price';

interface Price {
    buy: number;
    sell: number;
}

interface PlanetPosition {
    x: number;
    y: number;
}

interface ItemPlanet {
    name: string;
    available: number;
    price: Price;
}

class Planet {
    name: string;
    available_items: Array<ItemPlanet>;
    position: PlanetPosition;

    constructor(name: string) {
        this.name = name;
        this.available_items = new Array<ItemPlanet>();

        for (let item in init_planets[name][ITEMS_KEY]) {
            let price: Price = {buy: init_planets[name][ITEMS_KEY][item][BUY_KEY], sell: init_planets[name][ITEMS_KEY][item][SELL_KEY]};
            let it: ItemPlanet = {name: item, available: init_planets[name][ITEMS_KEY][item][AVAILABLE_KEY], price: price}
            this.available_items.push(it);
        }
        this.position = {x: init_planets[name]['x'], y: init_planets[name]['y']};
    }
}

let planets: Array<Planet> = new Array<Planet>();
for (let planet in init_planets) {
    planets.push(new Planet(planet));
}

const CARGO_KEY = 'cargo_hold_size';
const POSITION_KEY = 'position';

class Travel {
    start: Planet;
    destination: Planet;
    remaining_time: number;
    alreadyFinished: boolean;

    constructor(start: Planet) {
        this.start = start;
        this.destination = null;
        this.remaining_time = 0;
        this.alreadyFinished = false;
    }

    getTime(): number {
        let length_x = this.destination.position.x - this.start.position.x;
        let length_y = this.destination.position.y - this.start.position.y;
        let len_squared = length_x * length_x + length_y * length_y;

        let l = Math.ceil(Math.sqrt(len_squared));

        return l;
    }

    proceed() {
        if (this.alreadyFinished) {
            this.alreadyFinished = false;
        }
        if (this.remaining_time <= 0 && this.destination != null) {
            this.remaining_time = 0;
            this.start = this.destination;
            this.destination = null;
            this.alreadyFinished = true;
        } else {
            this.remaining_time--;
        }
    }
}

interface ItemShip {
    name: string;
    quantity: number;
}

interface Cargo {
    size: number;
    stock: Array<ItemShip>;
}

class Starship {
    name: string;
    cargo_max: number;
    travel: Travel;
    cargo: Cargo;

    constructor(name:string) {
        this.name = name;

        this.cargo_max = init_starships[name][CARGO_KEY];
        let planet = planets.filter((planet) => planet.name === init_starships[name][POSITION_KEY])[0];
        this.travel = new Travel(planet);
        this.cargo = {size: 0, stock: new Array<ItemShip>()};
    }

    isTraveling(): boolean {
        return (this.travel.remaining_time != 0 && this.travel.destination != null);
    }
}

let starships: Array<Starship> = new Array<Starship>();
for (let starship in init_starships) {
    starships.push(new Starship(starship));
}

let remaining_time: number = game_duration;
let credits: number = initial_credits;

let openPopup: HTMLElement = null;
let openPopupObject: string = null;

function printPlayer(): void {
    document.getElementById('h1_nick').innerHTML = 'Gracz: ' + sessionStorage.nick;
}

function printCreditsAndTime(): void {
    document.getElementById('h1_credits_time').innerHTML = "Kredyty: " + credits + " Pozostały czas: " + remaining_time;
}

function printStarships(): void {
    let divShips = document.getElementById('div_ships');
    let content: string = "";

    starships.forEach ((ship) => {
        if (ship.isTraveling()) {
            content += "<div class=\"unity dropdown\"><a id=\"a_" + ship.name + "\" href=\"javascript:windowShip('" + ship.name + "')\">";
            content += "<div class=\"dropdown-content\"><p>W podróży do " + ship.travel.destination.name + "</p></div>";
        } else {
            content += "<div class=\"unity dropdown\"><a id=\"a_" + ship.name +"\" href=\"javascript:windowShip('" + ship.name + "')\">";
            content += "<div class=\"dropdown-content\"><p>Położenie:" + ship.travel.start.name + "</p></div>";
        }

        content += ship.name;
        content += "</a></div></br>";
    });

    divShips.innerHTML = content;
}

function windowShip(name: string) {
    document.getElementById('ship_name').innerHTML = name;
    printCargoInfo(name);
    printShipStock(name);
    
    if (!starships.filter((ship) => ship.name === name)[0].isTraveling()) {
        document.getElementById('p_travel').innerHTML = "";
        printBuyableItems(name);
        printSellableItems(name);
        printQuantityInput(name);
        printQuantityInputSell(name);
        setSellActivation();
        printDestinations(name);
        document.getElementById('trade_content').style.display = 'block';
    } else {
        printTravelInfo(name);
        document.getElementById('trade_content').style.display = 'none';
    }

    let popup = document.getElementById('popup_ship');
    let close = document.getElementById('close_ship');

    if (openPopup != null) closeWindow(openPopup);
    openPopup = popup;
    openPopupObject = name;
    popup.style.display = 'flex';

    close.onclick = function() {
        closeWindow(popup);
        openPopup = null;
        openPopupObject = null;
    }
}

function printPlanets(): void {
    let divPlanets = document.getElementById('div_planets');
    let content: string = "";

    planets.forEach ((planet) => {
        content += "<div class=\"unity\"><a id=\"a_" + planet.name + "\" href=\"javascript:windowPlanet('" + planet.name + "')\">";
        content += planet.name;
        content += "</a></div>";
    });

    divPlanets.innerHTML = content;
}

function windowPlanet(name: string) {
    document.getElementById('planet_name').innerHTML = name;
    printPlanetStock(name);
    printCurrentShips(name);

    let popup = document.getElementById('popup_planet');
    let close = document.getElementById('close_planet');

    if (openPopup != null) closeWindow(openPopup);
    openPopup = popup;
    openPopupObject = name;
    popup.style.display = 'flex';

    close.onclick = function() {
        closeWindow(popup);
        openPopup = null;
        openPopupObject = null;
    }
}

function closeWindow(popup: HTMLElement) {
    popup.style.display = 'none';
}

function printPlanetStock(name: string): void {
    let table: HTMLTableElement = <HTMLTableElement> document.getElementById('table_stock_planet');
    table.innerHTML = "";
    let tableHead = table.createTHead();
    let rowHead = tableHead.insertRow();

    let th = document.createElement('th');
    let text = document.createTextNode('Towar');
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

    let stock = planets.filter((planet) => planet.name === name)[0].available_items;

    stock.forEach ((item) => {
        let row = table.insertRow();
        let cell = row.insertCell();
        let text = document.createTextNode(item.name);
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

function printCurrentShips(name: string): void {
    let pShips = document.getElementById('p_present_ships');
    let content: string;
    let isShip: boolean = false;

    let present = starships.filter((ship) => ship.travel.start.name === name && !ship.isTraveling());

    if (present.length === 0) {
        content = "Obecnie na " + name + " nie ma żadnych statków";
    } else {
        content = "Statki przebywające na " + name + ":";
        present.forEach ((ship) => {
            if (!isShip) content += " ";
            else content += ", ";
            content += ("<a href=\"javascript:windowShip('" + ship.name + "')\">" + ship.name + "</a>");
            isShip = true;
        });
    }

    pShips.innerHTML = content;
}

function printShipStock(name: string): void {
    let stock = starships.filter((ship) => ship.name === name)[0].cargo.stock;
    let table: HTMLTableElement = <HTMLTableElement> document.getElementById('table_stock_ship');
    table.innerHTML = "";
    let pStatus = document.getElementById('p_cargo_status');
    pStatus.innerHTML = "";
    if (stock.length === 0) {
        let content = "Statek nie transportuje żadnych przedmiotów";

        pStatus.innerHTML = content;
        return;
    }

    
    let tableHead = table.createTHead();
    let rowHead = tableHead.insertRow();

    let th = document.createElement('th');
    let text = document.createTextNode('Towar');
    th.appendChild(text);
    rowHead.appendChild(th);
    th = document.createElement('th');
    text = document.createTextNode('Ilość');
    th.appendChild(text);
    rowHead.appendChild(th);

    stock.forEach ((item) => {
        let row = table.insertRow();
        let cell = row.insertCell();
        let text = document.createTextNode(item.name);
        cell.appendChild(text);
        cell = row.insertCell();
        text = document.createTextNode(item.quantity.toString());
        cell.appendChild(text);
    })
}

function printCargoInfo(name: string): void {
    let pMaxCargo = document.getElementById('p_max_cargo');
    let content: string = "Maksymalna ładowność statku: ";

    let ship = starships.filter((ship) => ship.name === name)[0];
    content += ship.cargo_max;
    content += ".</br>";
    content += "Dostępna ładowność: ";
    content += ship.cargo_max - ship.cargo.size;

    pMaxCargo.innerHTML = content;
}

function printTravelInfo(name: string): void {
    let pTravel = document.getElementById('p_travel');
    let content: string = "Statek jest w podróży z ";

    let ship = starships.filter((ship) => ship.name === name)[0];
    content += "<a href=\"javascript:windowPlanet('" + ship.travel.start.name + "')\">" + ship.travel.start.name + "</a>";
    content += " do ";
    content += "<a href=\"javascript:windowPlanet('" + ship.travel.destination.name + "')\">" + ship.travel.destination.name + "</a>";
    content += "</br>";
    content += "Pozostało " + ship.travel.remaining_time + " sekund podróży";

    pTravel.innerHTML = content;
}

function printBuyableItems(name: string): void {
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_buyable');
    while (select.length > 0) select.remove(0);
    
    let location: string = starships.filter((ship) => ship.name === name)[0].travel.start.name;
    let planetItems = planets.filter((planet) => planet.name === location)[0].available_items;

    planetItems.forEach ((item) => {
        if (item.available != 0) {
            let option = document.createElement('option');
            option.value = item.name;
            option.text = item.name;
            select.add(option);
        }
    })
}

function getChosenItem(id1: string, id2: string) {
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById(id1);
    let val: string = select.value;
    let options = select.options;
    let planet: Planet = starships.filter((ship) => ship.name === openPopupObject)[0].travel.start;

    for (let i in options) {
        if (options[+i].value === val) select.selectedIndex = +i; break;
    }

    let selectedItem: string = select.options[select.selectedIndex].value;
    let input: HTMLInputElement = <HTMLInputElement> document.getElementById(id2);
    if (id2 === 'input_quantity') {
        let maxQuantity = planet.available_items.filter((item) => item.name === selectedItem)[0].available;
        input.setAttribute('max', maxQuantity.toString());
    } else if (id2 === 'sell_quantity') {
        let maxQuantity = starships.filter((ship) => ship.name === openPopupObject)[0]
        .cargo.stock.filter((item) => item.name === selectedItem)[0]
        .quantity;
    
        input.setAttribute('max', maxQuantity.toString());
    }
}

function printQuantityInput(name: string): void {
    let input: HTMLInputElement = <HTMLInputElement> document.getElementById('input_quantity');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '1');
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_buyable');

    let selectedItem: string = select.options[select.selectedIndex].value;

    let planet: Planet = starships.filter((ship) => ship.name === name)[0].travel.start;
    let maxQuantity = planet.available_items.filter((item) => item.name === selectedItem)[0].available;
    input.setAttribute('max', maxQuantity.toString());
}

function buy():void {
    let itemSelect: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_buyable');
    let quantityInput: HTMLInputElement = <HTMLInputElement> document.getElementById('input_quantity');
    if (!quantityInput.checkValidity()) {
        alert(quantityInput.validationMessage);
        return;
    }

    let ship: Starship = starships.filter((ship) => ship.name === openPopupObject)[0];
    let planet: Planet = ship.travel.start;
    let item: ItemPlanet = planet.available_items.filter((item) => item.name === itemSelect.options[itemSelect.selectedIndex].value)[0];
    let quantity: number = +quantityInput.value;
    
    if (item.price.buy * quantity <= credits && quantity + ship.cargo.size <= ship.cargo_max) {
        credits -= item.price.buy * quantity;
        item.available -= quantity;
        ship.cargo.size += quantity;
        let itemShip: ItemShip[] = ship.cargo.stock.filter((item) => item.name === itemSelect.options[itemSelect.selectedIndex].value);
        if (itemShip.length === 0) {
            let it: ItemShip = {name: item.name, quantity: quantity};
            ship.cargo.stock.push(it);
        } else {
            itemShip[0].quantity += quantity;
        }

        let h1CreditsAndTime = document.getElementById('h1_credits_time');
        h1CreditsAndTime.innerHTML = "Kredyty: " + credits + " Pozostały czas: " + remaining_time;

    } else if (item.price.buy * quantity > credits) {
        alert("Masz niewystarczającą liczbę kredytów.");
    } else {
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

function printSellableItems(name: string) {
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_sellable');
    while(select.length > 0) select.remove(0);

    let location: string = starships.filter((ship) => ship.name === name)[0].travel.start.name;
    let planetItems = planets.filter((planet) => planet.name === location)[0].available_items;
    let ship: Starship = starships.filter((ship) => ship.name === name)[0];
    let empty: boolean = true;
    ship.cargo.stock.forEach ((item) => {
        if (planetItems.filter((itemP) => itemP.name === item.name).length != 0) {
            let option = document.createElement('option');
            option.value = item.name;
            option.text = item.name;
            select.add(option);
            empty = false;
        }
    })

    select.disabled = empty;
}

function printQuantityInputSell(name: string) {
    let input: HTMLInputElement = <HTMLInputElement> document.getElementById('sell_quantity');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '1');
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_sellable');

    if (select.options.length === 0) {
        input.disabled = true;
        return;
    }
    input.disabled = false;
    let selectedItem: string = select.options[select.selectedIndex].value;

    let maxQuantity = starships.filter((ship) => ship.name === name)[0]
    .cargo.stock.filter((item) => item.name === selectedItem)[0]
    .quantity;

    input.setAttribute('max', maxQuantity.toString());
}

function sell(): void {
    let itemSelect: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_sellable');
    let quantityInput: HTMLInputElement = <HTMLInputElement> document.getElementById('sell_quantity');
    if (!quantityInput.checkValidity()) {
        alert(quantityInput.validationMessage);
        return;
    }

    let ship: Starship = starships.filter((ship) => ship.name === openPopupObject)[0];
    let planet: Planet = ship.travel.start;
    let item: ItemPlanet = planet.available_items.filter((item) => item.name === itemSelect.options[itemSelect.selectedIndex].value)[0];
    let quantity: number = +quantityInput.value;

    credits += item.price.sell * quantity;
    item.available += quantity;
    ship.cargo.size -= quantity;
    let itemShip: ItemShip = ship.cargo.stock.filter((item) => item.name === itemSelect.options[itemSelect.selectedIndex].value)[0];
    let itemIndex: number = ship.cargo.stock.indexOf(itemShip);
    if (quantity === itemShip.quantity) {
        ship.cargo.stock.splice(itemIndex, 1);
    } else {
        itemShip.quantity -= quantity;
    }

    let h1CreditsAndTime = document.getElementById('h1_credits_time');
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
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_sellable');
    let buyButton: HTMLButtonElement = <HTMLButtonElement> document.getElementById('button_sell');

    buyButton.disabled = select.disabled;
}

function printDestinations(name: string) {
    let ship: Starship = starships.filter((ship) => ship.name === name)[0];
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_destination');
    while (select.length > 0) select.remove(0);

    planets.forEach((planet) => {
        if (planet.name != ship.travel.start.name) {
            let option = document.createElement('option');
            option.value = planet.name;
            option.text = planet.name;
            select.add(option);
        }
    })
}

function startTravel() {
    let ship: Starship = starships.filter((ship) => ship.name === openPopupObject)[0];
    let select: HTMLSelectElement = <HTMLSelectElement> document.getElementById('select_destination');

    let destination = planets.filter((planet) => planet.name === select.value)[0];
    ship.travel.destination = destination;
    ship.travel.remaining_time = ship.travel.getTime();

    windowShip(openPopupObject);
}

function displayBoard(): void {
    printPlayer();
    printCreditsAndTime();
    printStarships();
    printPlanets();
}

function displayEnding(): void {
    document.getElementById('game_over').innerHTML = "Koniec gry!";
    let msg = document.getElementById('ending_msg');
    let content = "";

    content += "Gratulacje " + sessionStorage.nick + "!";
    content += "</br>";
    content += "Twoja rozgrywka zostaje zakończona z wynikiem " + credits;

    let resultsS: string = localStorage.results;

    let results = JSON.parse(resultsS);
    
    for (let ord in results) {
        if (credits > Number(results[ord][1])) {
            let newScore = [sessionStorage.nick, credits];
            results.splice(+ord, 0, newScore);
            if (results.length > 10) {
                results.splice(10, 1);
            }
        }
    }

    localStorage.results = JSON.stringify(results);

    content += "</br>";
    content += "<a href=\"index.html\">Powrót</a>";

    let popup = document.getElementById('ending_popup');

    popup.style.display = 'flex';

    msg.innerHTML = content;
}

let interval: number;
function updateValues(): void {
    displayBoard();
    if (remaining_time <= 0) {
        displayEnding();
        clearInterval(interval);
        return;
    }
    remaining_time--;
    starships.forEach((ship) => {
        ship.travel.proceed();
    });
    let ship = starships.filter((ship) => ship.name === openPopupObject);
    if (ship.length > 0 && ship[0].travel.alreadyFinished) {
        windowShip(openPopupObject);
    } else if (ship.length > 0 && ship[0].isTraveling()) {
        printTravelInfo(ship[0].name);
    }
    let planet = planets.filter((planet) => planet.name === openPopupObject);
    if (planet.length > 0) {
        printCurrentShips(planet[0].name);
    }
    
}

function updateBoard() {
    interval = window.setInterval(updateValues, TIMEOUT);
}

<?php
$json_string = file_get_contents("initial_data.json");
$json_decoded = json_decode($json_string, true, 512, JSON_BIGINT_AS_STRING);

$game_duration = $json_decoded['game_duration'];
$initial_credits = $json_decoded['initial_credits'];
$items = $json_decoded['items'];
$planets = $json_decoded['planets'];
$starships = $json_decoded['starships'];

function printNick() {
    echo "{$_GET['nick']}";
}

function printName() {
    echo "{$_GET['name']}";
}

function printCreditsAndTime() {
    global $initial_credits, $game_duration;
    echo "Kredyty: {$initial_credits} Pozostały czas: {$game_duration}";
}

function printShips() {
    global $starships;
    foreach ($starships as $ship => $desc) {
        if ($desc['traveling']) {
            echo "<div class=\"unity dropdown\"><a href=\"gameboard_ship_travel.php?nick={$_GET['nick']}&name={$ship}\">";
            echo "<div class=\"dropdown-content\"><p>W podróży do Destination</p></div>";
            } else {
                echo "<div class=\"unity dropdown\"><a href=\"gameboard_ship.php?nick={$_GET['nick']}&name={$ship}\">";
                echo "<div class=\"dropdown-content\"><p>Położenie: {$desc['position']}</p></div>";
            }
        echo "{$ship}";
        echo "</a></div>";
    }
}

function printPlanets() {
    global $planets;
    foreach ($planets as $planet => $desc) {
        echo "<div class=\"unity\"><a href=\"gameboard_planet.php?nick={$_GET['nick']}&name={$planet}\">";
        echo "{$planet}";
        echo "</a></div>";
    }
}

function printStore() {
    global $planets;
    $name = $_GET['name'];
    $items = $planets["{$name}"]["available_items"];
    foreach ($items as $item => $desc) {
        echo "<tr>";
        echo "<td>{$item}</td>";
        echo "<td>{$desc['available']}</td>";
        echo "<td>{$desc['buy_price']}</td>";
        echo "<td>{$desc['sell_price']}</td>";
        echo "</tr>";
    }
}

function printPresentShips() {
    global $starships;
    $name = $_GET['name'];
    $msg = "Statki przebywające na {$name}:";
    $isship = false;
        foreach ($starships as $ship => $desc) {
            if ($desc['position'] == $name) {
                if (!$isship) $msg .= " ";
                else $msg .= ", ";
                $msg .= "<a href=\"gameboard_ship.php?nick={$_GET['nick']}&name={$ship}\">{$ship}</a>";
                $isship = true;
            }
        }
                    
        if ($isship) echo "<p>{$msg}</p>";
        else echo "<p>Obecnie na {$name} nie ma żadnego statku</p>";
}

function printMaxCargo() {
    global $starships;
    echo "Maksymalny ładunek: {$starships[$_GET['name']]['cargo_hold_size']}";
}

function printBuyableItems() {
    global $planets, $starships;
    foreach ($planets[$starships[$_GET['name']]['position']]['available_items'] as $item => $desc) {
        echo "<option value=\"{$item}\">{$item}</option>";
    }
}

function printSellableItems() {
    global $planets, $starships;
    foreach ($planets[$starships[$_GET['name']]['position']]['available_items'] as $item => $desc) {
        if ($starships[$_GET['name']]['items'][$item]) {
            echo "<option value=\"{$item}\">{$item}</option>";
        }
    }
}

function printDestinations() {
    global $planets, $starships;
    foreach($planets as $planet => $desc) {
        if ($planet != $starships[$_GET['name']]['position']) {
            echo "<option value=\"{$planet}\">{$planet}</option>";
        }
    }
}
?>

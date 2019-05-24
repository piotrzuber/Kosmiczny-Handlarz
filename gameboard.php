<!DOCTYPE html>
<?php require_once("datadecoder.php"); ?>

<html>

<head>
    <meta charset='utf-8'>
    <title>Kosmiczny Handlarz</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel='stylesheet' type='text/css' media='screen' href='game.css'>
    <script type="text/javascript" src='game.js'></script>
</head>

<body>
    <header>
        <h1 id="h1_nick"></h1>
        <h1 id="h1_credits_time"></h1>
    </header>
    <div class="row">
        <div class="desccolumn">
            <div class="dropdown">
                <h1>Statki</h1>
                <div class="dropdown-content">
                    <p>Lista dostępnych statków</p>
                </div>
            </div>
            <div id="div_ships"></div>
            <div class="dropdown">
                <h1>Planety</h1>
                <div class="dropdown-content">
                    <p>Lista istniejących planet</p>
                </div>
            </div>
            <div id="div_planets"></div>
        </div>
        <div class="lightbox" id="popup_ship">
        <figure>
            <figcaption id="ship_content">
                <span class="close" id="close_ship">&times;</span>
                <div>
                <h2 id="ship_name"></h2>
                <p id="p_max_cargo"></p>
                <p id="p_cargo_status"></p>
                <p id="p_travel"></p>
                <table class="center" id="table_stock_ship"></table>
                </div>
                <div id="trade_content">
                <h3>Kupno</h3>
                <p>
                Towar: 
                <select id="select_buyable" onchange="getChosenItem('select_buyable', 'input_quantity');"></select>
                </p>
                <p>
                Ilość: <input id="input_quantity" required>
                <input type="button" value="Kup" onclick="buy();">
                </p>
                <h3>Sprzedaż</h3>
                <p>
                Towar:
                <select id="select_sellable" onchange="getChosenItem('select_sellable', 'sell_quantity');"></select>
                </p>
                <p>
                Ilość: <input id="sell_quantity" required>
                <input type="button" value="Sprzedaj" id="button_sell" onclick="sell();">
                </p>
                <h3>Podróż</h3>
                <p>
                Cel:
                <select id="select_destination"></select>
                <input type="button" id="button_travel" value="Leć!" onclick="startTravel();">
                </p>
                </div>
            </figcaption>
        </figure>
        </div>
        <div class="lightbox" id="popup_planet">
        <figure>
            <figcaption id="planet_content">
                <span class="close" id="close_planet">&times;</span>
                <h2 id="planet_name"></h2>
                <table class="center" id="table_stock_planet"></table>
                <p id="p_present_ships"></p>
            </figcaption>
        </figure>
        </div>
        <div class="lightbox" id="ending_popup">
        <figure>
            <figcaption>
                <h2 id="game_over"></h2>
                <p id="ending_msg"></p>
            </figcaption>
        </figure>
        </div>
    </div>
    <script>updateBoard();</script>
</body>

</html>

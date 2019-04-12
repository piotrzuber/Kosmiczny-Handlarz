<!DOCTYPE html>
<?php require_once("datadecoder.php"); ?>

<html>

<head>
    <meta charset='utf-8'>
    <title>Kosmiczny Handlarz</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel='stylesheet' type='text/css' media='screen' href='game.css'>
    <script type="text/javascript" src='main.js'></script>
</head>

<body>
    <header>
        <h1><?php printNick(); ?></h1>
        <h1><?php printCreditsAndTime(); ?></h1>
    </header>
    <div class="row">
        <div class="desccolumn">
            <div class="dropdown">
                <h1>Statki</h1>
                <div class="dropdown-content">
                    <p>Lista dostępnych statków</p>
                </div>
            </div>
            <?php printShips(); ?>
            <div class="dropdown">
                <h1>Planety</h1>
                <div class="dropdown-content">
                    <p>Lista istniejących planet</p>
                </div>
            </div>
            <?php printPlanets(); ?>
        </div>
    </div>
    <div class="lightbox">
        <figure>
            <a href=<?php echo "gameboard.php?nick={$_GET['nick']}"; ?> class="close"></a>
            <figcaption>
                <h2><?php printName(); ?></h2>
                <p> <?php printMaxCargo(); ?></p>
                <table class="center">
                    <tr>
                        <th>Towar</th>
                        <th>Ilość</th>
                    </tr>
                    <tr>
                        <td>Woda</td>
                        <td>1000000</td>
                    </tr>
                </table>
                <h3>Kupno</h3>
                <p>
                Towar: 
                <select>
                    <?php printBuyableItems(); ?>
                </select>
                </p>
                <p>
                Ilość: <input type="text" name="quantity">
                <input type="submit" value="Kup">
                </p>
                <h3>Sprzedaż</h3>
                <p>
                Towar:
                <select>
                    <?php printSellableItems(); ?>
                </select>
                </p>
                <p>
                Ilość: <input type="text" name="quantity">
                <input type="submit" value="Sprzedaj">
                </p>
                <h3>Podróż</h3>
                <p>
                Cel:
                <select>
                    <?php printDestinations(); ?>
                </select>
                <input type="submit" value="Leć!">
                </p>
            </figcaption>
        </figure>
    </div>
</body>

</html>

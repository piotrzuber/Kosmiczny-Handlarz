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
</body>

</html>

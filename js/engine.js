/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        leftDiv = doc.createElement('div'),
        rightDiv = doc.createElement('div'),
        lowDiv = doc.createElement('div'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // Increased the height and width of the matrix 
    canvas.width = 909;
    canvas.height = 670;

    leftDiv.classList.add('leftDiv');
    rightDiv.classList.add('rightDiv');

    rightDiv.innerHTML = '<div id="char-boy" class="icon"><img src="images/icon-boy.png" alt="boy icon"></div>'
    + '<div id="char-cat-girl" class="icon"><img src="images/icon-cat-girl.png" alt="cat girl icon"></div>'
    + '<div id="char-horn-girl" class="icon"><img src="images/icon-horn-girl.png" alt="horn girl icon"></div>'
    + '<div id="char-pink-girl" class="icon"><img src="images/icon-pink-girl.png" alt="pink girl icon"></div>'
    + '<div id="char-princess-girl" class="icon"><img src="images/icon-princess-girl.png" alt="princess girl icon"></div>';

    rightDiv.querySelectorAll('.icon').forEach((element) => {
        element.addEventListener('click', () => {
            player.changeImage(`images/${element.id}.png`);
        });
    });

    leftDiv.innerHTML = `
    <div class="score">
        <h1>Score</h1>
        <h1 id="score-value">00000</h1>
    </div>
    <div class="timer">
        <h2>Time Left</h2>
        <h2 id="timer-value">00:00:00</h2>
    </div>
    <div class="collectibles">
        <div class="item">
            <div class="key-icon item-icon">
                <img src="images/icon-key.png" alt="key icon">
            </div>
            <div class="item-number">
                <span id="key-number">0</span>
            </div>
        </div>
        <div class="item">
            <div class="heart-icon item-icon">
                <img src="images/icon-heart.png" alt="heart icon">
            </div>
            <div class="item-number">
                <span id="heart-number">0</span>
            </div>
        </div>
        <div class="item">
            <div class="star-icon item-icon">
                <img src="images/icon-star.png" alt="star icon">
            </div>
            <div class="item-number">
                <span id="star-number">0</span>
            </div>
        </div>
        <div class="item">
            <div class="gem-icon item-icon">
                <img src="images/icon-gem.png" alt="gemstone icon">
            </div>
            <div class="item-number">
                <span id="gem-number">0</span>
            </div>
        </div>
    </div>
    <div class="difficulty">
        <h3>difficulty:</h3>
        <div class="btn-list">
            <div class="diff-btn">
                <button id="up-diff" class="btn">+</button>
            </div>
            <div class="diff-btn">
                <button id="low-diff" class="btn">-</button>
            </div>
        </div>
    </div>
    <div class="bestScore">
        <h3>Best Score: <span class="best-score-value">12345</span></h3>
    </div>
    `;

    leftDiv.querySelector('#up-diff').addEventListener('click', () => {
        Enemy.IncreaseSpeed();
    });

    leftDiv.querySelector('#low-diff').addEventListener('click', () => {
        Enemy.lowerSpeed();
    });

    doc.body.appendChild(leftDiv);
    doc.body.appendChild(canvas);
    doc.body.appendChild(rightDiv);

    let done = false;

    function showLowDiv() {
        lowDiv.classList.add('stats-container');

        let gameOverDiv = document.createElement('div');
        let overallScoreDiv = document.createElement('div');
        let numDeathsDiv = document.createElement('div');
        let restartDiv = document.createElement('div');

        gameOverDiv.innerHTML = `
            <h1 class="bld">Game Over</h1>
        `;

        overallScoreDiv.innerHTML = `
            <span>Ovreall Score: <span id="over-score" class="bld"></span></span>
        `;

        numDeathsDiv.innerHTML = `
            <span>You died: <span id="num-deaths" class="bld"></span> times</span>
        `;

        restartDiv.innerHTML = `
            <button id="restart" class="btn bld">Restart</button>
        `;

        [gameOverDiv, overallScoreDiv, numDeathsDiv, restartDiv].forEach((ele) => {
            ele.classList.add('low-element');
            lowDiv.appendChild(ele);
        });

        lowDiv.querySelector('#restart').addEventListener('click', () => {
            doc.location.reload(true);
        });

        let temp = timeLeft - performance.now() + timeStart;

        if(player.getKeys() > 4) {
            scoreValue += Math.round(temp / 10);
            scoreValue += player.getHearts() * 1000;
        }

        scoreValue -= player.getDeaths() * 500;

        if(scoreValue < 0) {
            scoreValue = 0;
        }

        lowDiv.querySelector('#over-score').innerHTML = scoreValue;
        lowDiv.querySelector('#num-deaths').innerHTML = player.getDeaths();

        leftDiv.querySelector('#key-number').innerHTML = player.getKeys();
        leftDiv.querySelector('#heart-number').innerHTML = player.getHearts();
        leftDiv.querySelector('#star-number').innerHTML = player.getStars();
        leftDiv.querySelector('#gem-number').innerHTML = player.getGems();

        doc.body.appendChild(lowDiv);
    }

    function translateScore(value) {
        if(value <= 0) {
            return "00000";
        }
    
        let str = value.toString();
        let temp = "";
        
        for(i = 0; i < 5 - str.length; i++) {
            temp += "0";
        }

        return temp + str;
    }
    
    function translateTimer(ms) {
        let min,sec;
    
        ms = Math.floor(ms);
    
        min = (Math.floor(ms / 60000)).toString();
        if(min < 10) {
            min = '0' + min;
        }
    
        ms -= min * 60000;
    
        sec = (Math.floor(ms / 1000)).toString();
        if(sec < 10) {
            sec = '0' + sec;
        }
    
        ms -= (sec * 1000);
        ms = ms > 99 ? Math.floor(ms / 10) : ms;
        if(ms < 10) {
            ms = '0' + ms;
        }
    
        return `${min}:${sec}:${ms}`;
    }
    
    timerElement = document.querySelector("#timer-value");

    function updateTimer() {
        let temp = timeLeft - performance.now() + timeStart;

        if(player.gameHasEnded()) {
            remainingTime = temp;
            console.log(remainingTime);
            console.log(temp);

            return ;
        }

        if(temp >= 0) {
            timerElement.innerHTML = translateTimer(temp);
        }
        else{
            timerElement.innerHTML = translateTimer(0);
            player.endGame();
            return ;
        }
    
        setTimeout(() => {
            updateTimer();
        }, 33);
    }

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        leftDiv.querySelector('#score-value').innerHTML = translateScore(scoreValue);
        if(!player.gameHasEnded()) {
            updateEntities(dt);
            checkCollisions();
        }
        else {
            if(!done) {
                showLowDiv();
                done = true;
            }
        }
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        
        allCollectibles.forEach((col) => {
            col.update(dt);
        });

        selector.update(dt);

        player.update();

        leftDiv.querySelector('#key-number').innerHTML = player.getKeys();
        leftDiv.querySelector('#heart-number').innerHTML = player.getHearts();
        leftDiv.querySelector('#star-number').innerHTML = player.getStars();
        leftDiv.querySelector('#gem-number').innerHTML = player.getGems();
    }

    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            enemy.checkCollisions();
        });

        allCollectibles.forEach((col) => {
            col.checkCollisions();
        });

        selector.checkCollisions();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 4 of stone
                'images/stone-block.png',   // Row 2 of 4 of stone
                'images/stone-block.png',   // Row 3 of 4 of stone
                'images/stone-block.png',   // Row 4 of 4 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            // Increased the size of the matrix
            numRows = 7,
            numCols = 9,
            row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        allCollectibles.forEach((col) => {
            col.render();
        });

        selector.render();

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/enemy-bug-reversed.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Selector.png',
        'images/Key.png',
        'images/Star.png',
        'images/Heart.png',
        'images/Gem Orange.png',
        'images/Gem Green.png',
        'images/Gem Blue.png',
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    updateTimer();

})(this);

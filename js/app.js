// the array holding all enemies 
let allEnemies = [];

// a set of collectibles (in the map) instead of array 
let allCollectibles = new Set();

// the set of collected items by the player (only before getting
// back to base)
let playerCollectibles = new Set();

// this is to help set the speed of bugs
let difficulty = 1;

// the score earned 
let scoreValue = 0;

// record the right clock time at the start 
// of the game
let timeStart = 0;

// just declaring the remaining time variable
// the real value is set before the instantiation
// of the Player object
let timeLeft = 0;

// i could declare this variable in the 'engine.js' file 
// but i decided to leave it here 
let remainingTime;


// the mother class for all objects in the map 
class Unit {
    // every object has to be visible through its sprite
    constructor(img) {
        this.sprite = `images/${img}`;

        // every object has its coordinates
        this.x = 0;
        this.y = 0;
    }

    getSprite() {
        return this.sprite;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    update(dt) {
        
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.y, this.x);
    }
}

// the Enemey class 
class Enemy extends Unit {

    // 'bool' is a boolean parameter that decides the direction of the 
    // enemy bug (since they come from the left or right)
    constructor(bool) {
        if(bool) {
            super('enemy-bug.png');
        }
        else {
            super('enemy-bug-reversed.png');
        }

        // just some additional variables to calculate the speed 
        this.minSpeed = 2;
        this.maxSpeed = 3;
        
        // this is calculating which row the enemy bug should be in 
        // (first & second) or (third & fourth)
        // the '0.7' means that there is a higher chance that a bug 
        // might spawn in the upper rows than in the third & fourth 
        // rows
        let num = Math.random() < 0.7 ? 1 : 3;

        // the real row of the enemy bug (upper or lower)
        this.row = bool ? num : num + 1;

        // the starting position
        this.y = bool ? -101 : 1010;

        // saving the boolean value as an object variable 
        this.bool = bool;

        // calculating the speed 
        this.speed = Math.round(Math.random() * ((this.maxSpeed - this.minSpeed) + this.minSpeed) + Math.abs(this.row - 3)) * difficulty;
    }

    render() {
        // we use getX & getY methods instead of the variables 
        ctx.drawImage(Resources.get(this.sprite), this.getY(), this.getX());
    }

    update(dt) {

        // moving the enemy according to its direction 
        if(this.bool) {
            this.y += Math.round((dt * 5 * 1000) / 30) * this.speed;
        }
        else {
            this.y -= Math.round((dt * 5 * 1000) / 30) * this.speed;
        }

        // if the enemy bug gets off the map (more complicated than that) 
        // we destroy it (optimization issue)
        if(this.outOfBounds()) {
            this.destroy();
        }
    }

    // checks if the bug collides with the player
    checkCollisions() {
        if(this.row === player.getRow()) {
            let dist = player.getY() - this.y;
            if(dist > -60 && dist < 60) {
                this.collideWithPlayer();
            }
        }
    }

    // returning the X coordinate of the enemy object to help rendering it 
    getX() {
        return this.row * 83 - 20;
    }

    getSpeed() {
        return this.speed;
    }

    // changes speed (in case of increasing or decreasing the difficulty)
    setSpeed(speed) {
        this.speed = speed;
    }

    collideWithPlayer() {
        player.collideWithEnemy();
    }

    // checks if the enemy bug is out of the map 
    outOfBounds() {
        return this.y < -101 || this.y > 1010;
    }

    // i had issues with the last function so i used both of them
    outOfBoundsSoft() {
        return this.y < -90 || this.y > 1000;
    }

    // a static function that checks the array for loose enemies that 
    // couldn't be destroyed (it happened with me some times and this 
    // piece of code fixed it)
    // it launches up every 10 seconds 
    static checkForDestruction() {
        setTimeout(() => {
            allEnemies.forEach((enemy) => {
                if(enemy.outOfBoundsSoft()) {
                    enemy.destroy();
                }
            });
            Enemy.checkForDestruction();
        }, 10000);
    }

    // remove the enemy bug from the allEnemies array 
    destroy() {
        allEnemies.splice(allEnemies.indexOf(this), 1);
    }

    // keeps spawning enemies (there can't be more than 12 
    // bugs in the map)
    // it spawns an enemy, and then spawns another one in the 
    // opposite direction 
    static spawnInfinite(b_value) {
        setTimeout(() => {
            if(allEnemies.length < 12) {
                allEnemies.push(new Enemy(b_value));
            }
            Enemy.spawnInfinite(!b_value);
        }, 250);
    }

    // decreases the difficulty
    static lowerDifficulty() {
        if(difficulty > 0.3) {
            difficulty /= 2;

            return true;
        }

        return false;
    }

    // increases difficulty
    static increaseDifficulty() {
        if(difficulty < 3) {
            difficulty *= 2;

            return true;
        }

        return false;
    }

    // the function called upon when trying to lower the speed 
    static lowerSpeed() {
        if(Enemy.lowerDifficulty()) {
            allEnemies.forEach((enemy) => {
                enemy.setSpeed(enemy.getSpeed() / 2);
            });
        }
        else {
            console.log("Sorry, you can't lower the speed less than that");
        }
    }

    // the function called upon when trying to increase the speed 
    static IncreaseSpeed() {
        if(Enemy.increaseDifficulty()) {
            allEnemies.forEach((enemy) => {
                enemy.setSpeed(enemy.getSpeed() * 2);
            });
        }
        else {
            console.log("Sorry, you can't increase the speed more than that");
        }
    }
};

// the Player class (always extending Unit)
class Player extends Unit {
    constructor(avatar = 'char-boy.png') {
        super(avatar);

        // the coordinates by default 
        this.row = 6;
        this.col = 4;

        // the player starts with 3 hearts 
        // and nothing else
        this.hearts = 3;
        this.gemStones = 0;
        this.stars = 0;
        this.keys = 0;

        // tracks the end of the game 
        this.end = false;

        // it increases each time the player hits an enemy bug 
        this.numDeaths = 0;
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.getY(), this.getX());
    }

    getX() {
        return this.row * 83 - 20;
    }

    getY() {
        return this.col * 101;
    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }


    collideWithEnemy() {
        // after colliding, the player loses what was in his pocket 
        // (stars and keys)
        playerCollectibles.forEach(col => {
            if(col instanceof Key) {
                // a key must always be available to pick up 
                new Key();
            }
        });

        playerCollectibles.clear();

        // incrementing number of deaths 
        this.numDeaths += 1;

        // out of hearts ? GAME OVER :/ 
        if(this.hearts === 0) {
            this.endGame();
        }
        else {
            this.removeHeart();
            this.reset();
        }
    }

    addHeart() {
        this.hearts += 1;
    }

    getHearts() {
        return this.hearts;
    }

    removeHeart() {
        if(this.hearts > 0) {
            this.hearts -= 1;
        }
    }

    getKeys() {
        return this.keys;
    }

    addKey() {
        this.keys += 1;
        if(this.keys === 5) {
            this.endGame();
        }
    }

    addGem() {
        this.gemStones += 1;
    }

    getGems() {
        return this.gemStones;
    }

    addStar() {
        this.stars += 1;
    }

    getStars() {
        return this.stars;
    }

    // implementing moving code 
    moveRight() {
        if(this.col !== 8){
            this.col += 1;
        }
    }

    moveLeft() {
        if(this.col !== 0){
            this.col -= 1;
        }
    }

    moveDown() {
        if(this.row !== 6){
            this.row += 1;
        }
    }

    moveUp() {
        if(this.row !== 0) {
            this.row -= 1;
        }
    }

    // happens after dying or starting a new game 
    reset() {
        this.row = 6;
        this.col = 4;
    }

    // the player can change his avatar 
    changeImage(img) {
        if(!this.gameHasEnded()) {
            this.sprite = img;
        }
    }

    getDeaths() {
        return this.numDeaths;
    }

    move(direction) {
        if(this.gameHasEnded()){
            return ;
        }
        switch(direction) {
            case 'up':
                this.moveUp();
                break;

            case 'right':
                this.moveRight();
                break;

            case 'down':
                this.moveDown();
                break;

            case 'left':
                this.moveLeft();
                break;

            default:
                console.log("Movement: ", direction);
        }
    }

    handleInput(direction) {
        switch(direction) {
            case 'up':

            case 'right':

            case 'down':

            case 'left':
                this.move(direction);
                break;

            default:
                console.log("Key pressed: ", direction);
        }
    }

    gameHasEnded() {
        return this.end;
    }

    endGame() {
        this.end = true;
    }
}

// a class for Collectible items 
class Collectible extends Unit {
    constructor(img) {
        super(img);

        // the item spawns randomly in the block area 
        this.row = Math.round(Math.random() * (4 - 1) + 1);
        this.col = Math.round(Math.random() * (8 - 0) + 0);

        // the item is added to the allCollectibles Set 
        allCollectibles.add(this);
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.getY(), this.getX());
    }

    update(dt) {

    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }

    getX() {
        return this.row * 83 - 20;
    }

    getY() {
        return this.col * 101;
    }

    // checks for collision 
    collideWithPlayer() {
        return this.row === player.row && this.col === player.col;
    }

    // if collision happens, the player collects the item in his pocket
    checkCollisions() {
        if(this.collideWithPlayer()) {
            playerCollectibles.add(this);
        }
    }
}

// the Gemstone is just a special Collectible
class GemStone extends Collectible {
    // there are 3 colors of gems 
    constructor(num = 1) {
        switch(num) {
            case 1:
                super('Gem Blue.png');
                break;
            
            case 2:
                super('Gem Green.png');
                break;
            
            case 3:
                super('Gem Orange.png');
                break;
            
            default:
                console.log("GemStone Class: {num == ", num, "}");
        }
        
        // initial bonus 
        this.bonus = 100;

        // every gem has a special bonus
        // final bonus 
        this.bonus += num * 100;

        // the gemstones disappear after 5 seconds of spawning
        setTimeout(() => {
            allCollectibles.delete(this);
        }, 5000);
    }

    // on collision with the player, he gets the bonus immediately 
    checkCollisions() {
        if(this.collideWithPlayer()) {
            scoreValue += this.bonus;
            allCollectibles.delete(this);
            player.addGem();
        }
    }

    // the function responsible for spawning the gemstones, 
    // every 10 seconds, a gemstone with a random color appears 
    // on the map 
    static spawnGem() {
        if(player.gameHasEnded()) {
            return ;
        }
        new GemStone(Math.round(Math.random() * 3 + 0.5));
        setTimeout(() => {
            GemStone.spawnGem();
        }, 10000);
    }
}

// the Key is also a special Collectible 
class Key extends Collectible {
    constructor() {
        super('Key.png');

        // the key appears only in the first row 
        this.row = 0;
    }

    // on collision with the player, he gets in his pocket (playerCollectibles), 
    // a small bonus is added 
    checkCollisions() {
        if(this.collideWithPlayer()) {
            allCollectibles.delete(this);
            playerCollectibles.add(this);
            scoreValue += 250;
        }
    }
}

// the Heart is also a special Collectible 
class Heart extends Collectible {
    constructor() {
        super('Heart.png');

        // the heart disappears after 4 seconds of spawning 
        setTimeout(() => {
            allCollectibles.delete(this);
        }, 4000);
    }

    // on collision with the player, he gets an additional heart (life)
    checkCollisions() {
        if(this.collideWithPlayer()) {
            allCollectibles.delete(this);
            player.addHeart();
        }
    }

    // the function responsible for spawning the hearts 
    // every 12 seconds, a heart appears on the map 
    static spawnHeart() {
        if(player.gameHasEnded()) {
            return ;
        }

        new Heart();

        setTimeout(() => {
            Heart.spawnHeart();
        }, 12000);
    }
}

// the Star is also a special Collectible 
class Star extends Collectible {
    constructor() {
        super('Star.png');

        // the star only appears on dangerous areas (the edges 
        // where the enemy spawns)
        this.col = Math.random() < 0.5 ? 1 : 7;
        this.row = Math.random() < 0.5 ? 2 : 3;

        // the star disappears 4 seconds after spawning 
        setTimeout(() => {
            allCollectibles.delete(this);
        }, 4000);
    }

    // on collision with the player, he picks up the star, 
    // he has to get it back to base in order to get the bonus
    checkCollisions() {
        if(this.collideWithPlayer()) {
            allCollectibles.delete(this);
            playerCollectibles.add(this);
        }
    }

    // the function responsible for spawning stars, 
    // every 15 seconds, a star appear on the map
    static spawnStar() {
        if(player.gameHasEnded()) {
            return ;
        }
        
        new Star();
        setTimeout(() => {
            Star.spawnStar();
        }, 15000);
    }
}

// the Selector is where the player spawns and where he stores the items 
// he collected
class Selector extends Unit {
    constructor() {
        super('Selector.png');

        // static coordinates 
        this.row = 6;
        this.col = 4;
    }

    update(dt) {
        
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.getY(), this.getX());
    }

    getX() {
        return this.row * 83 - 40;
    }

    getY() {
        return this.col * 101;
    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }

    checkCollisions() {
        if(this.row === player.getRow()) {
            if(this.col === player.getCol()) {
                this.collideWithPlayer();
            }
        }
    }

    collideWithPlayer() {
        playerCollectibles.forEach(col => {
            // if the item collected is a key, 
            // the player gets a bonus and the engine 
            // respawns a new key (if the game is not 
            // finished)
            if(col instanceof Key) {
                player.addKey();
                scoreValue += 1000;
                if(!player.gameHasEnded()) {
                    new Key();
                }
            }
            // if the item collected is a star, the player 
            // gets a bonus
            else if(col instanceof Star) {
                player.addStar();
                scoreValue += 1500;
            }
        });

        // clearing the pocket
        playerCollectibles.clear();
    }
}

// saving the clock
timeStart = performance.now();

// I set the remamining time to 3 minutes 
timeLeft = 180000;

// instantiating the Player object 
let player = new Player();

// setting up the game (selector and key)
let selector = new Selector();
let key = new Key();

// spawns the first gem after 2 seconds
setTimeout(() => {
    GemStone.spawnGem();
}, 2000);

// spawns the first star after 4 seconds
setTimeout(() => {
    Star.spawnStar();
}, 4000);

// spawns the first heart after 6 seconds
setTimeout(() => {
    Heart.spawnHeart();
}, 6000);

// spawning enemies and checking for their misdemeanors
Enemy.spawnInfinite(true);
Enemy.checkForDestruction();

// event listener for key strokes 
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    
    player.handleInput(allowedKeys[e.keyCode]);
});

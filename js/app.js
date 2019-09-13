let allEnemies = [];
let allCollectibles = new Set();
let playerCollectibles = new Set();
let difficulty = 1;
let scoreValue = 0;
let timeStart = 0;
let timeLeft = 0;
let remainingTime;

class Unit {
    constructor(img) {
        this.sprite = `images/${img}`;
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

class Enemy extends Unit {
    constructor(bool) {
        if(bool) {
            super('enemy-bug.png');
        }
        else {
            super('enemy-bug-reversed.png');
        }

        this.minSpeed = 2;
        this.maxSpeed = 3;
        
        let num = Math.random() < 0.7 ? 1 : 3;
        this.row = bool ? num : num + 1;

        this.y = bool ? -101 : 1010;

        this.bool = bool;

        this.speed = Math.round(Math.random() * ((this.maxSpeed - this.minSpeed) + this.minSpeed) + Math.abs(this.row - 3)) * difficulty;
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.getY(), this.getX());
    }

    update(dt) {
        if(this.bool) {
            this.y += Math.round((dt * 5 * 1000) / 30) * this.speed;
        }
        else {
            this.y -= Math.round((dt * 5 * 1000) / 30) * this.speed;
        }

        if(this.outOfBounds()) {
            this.destroy();
        }
    }

    checkCollisions() {
        if(this.row === player.getRow()) {
            let dist = player.getY() - this.y;
            if(dist > -50 && dist < 50) {
                this.collideWithPlayer();
            }
        }
    }

    getX() {
        return this.row * 83 - 20;
    }

    getSpeed() {
        return this.speed;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    collideWithPlayer() {
        player.collideWithEnemy();
    }

    outOfBounds() {
        return this.y < -101 || this.y > 1010;
    }

    outOfBoundsSoft() {
        return this.y < -90 || this.y > 1000;
    }

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

    destroy() {
        allEnemies.splice(allEnemies.indexOf(this), 1);
    }

    static spawnInfinite(b_value) {
        setTimeout(() => {
            if(allEnemies.length < 12) {
                allEnemies.push(new Enemy(b_value));
            }
            Enemy.spawnInfinite(!b_value);
        }, 250);
    }

    static lowerDifficulty() {
        if(difficulty > 0.3) {
            difficulty /= 2;

            return true;
        }

        return false;
    }

    static increaseDifficulty() {
        if(difficulty < 3) {
            difficulty *= 2;

            return true;
        }

        return false;
    }

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

    static IncreaseSpeed() {
        Enemy.increaseDifficulty();

        allEnemies.forEach((enemy) => {
            enemy.setSpeed(enemy.getSpeed() * 2);
        });

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

class Player extends Unit {
    constructor(avatar = 'char-boy.png') {
        super(avatar);
        this.row = 6;
        this.col = 4;

        this.hearts = 3;
        this.gemStones = 0;
        this.stars = 0;
        this.keys = 0;

        this.end = false;
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
        playerCollectibles.forEach(col => {
            if(col instanceof Key) {
                new Key();
            }
            playerCollectibles.clear();
        });

        this.numDeaths += 1;

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

    reset() {
        this.row = 6;
        this.col = 4;
    }

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

class Collectible extends Unit {
    constructor(img) {
        super(img);
        this.row = Math.round(Math.random() * (4 - 1) + 1);
        this.col = Math.round(Math.random() * (8 - 0) + 0);

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

    collideWithPlayer() {
        return this.row === player.row && this.col === player.col;
    }

    checkCollisions() {
        if(this.collideWithPlayer()) {
            playerCollectibles.add(this);
        }
    }
}

class GemStone extends Collectible {
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

        this.bonus = 100;
        this.bonus += num * 100;

        setTimeout(() => {
            allCollectibles.delete(this);
        }, 5000);
    }

    checkCollisions() {
        if(this.collideWithPlayer()) {
            scoreValue += this.bonus;
            allCollectibles.delete(this);
            player.addGem();
        }
    }

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

class Key extends Collectible {
    constructor() {
        super('Key.png');

        this.row = 0;
    }

    checkCollisions() {
        if(this.collideWithPlayer()) {
            allCollectibles.delete(this);
            playerCollectibles.add(this);
            scoreValue += 250;
        }
    }
}

class Heart extends Collectible {
    constructor() {
        super('Heart.png');

        setTimeout(() => {
            allCollectibles.delete(this);
        }, 4000);
    }

    checkCollisions() {
        if(this.collideWithPlayer()) {
            allCollectibles.delete(this);
            player.addHeart();
        }
    }

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

class Star extends Collectible {
    constructor() {
        super('Star.png');

        this.col = Math.random() < 0.5 ? 1 : 7;
        this.row = Math.random() < 0.5 ? 2 : 3;

        setTimeout(() => {
            allCollectibles.delete(this);
        }, 4000);
    }

    checkCollisions() {
        if(this.collideWithPlayer()) {
            allCollectibles.delete(this);
            playerCollectibles.add(this);
        }
    }

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

class Selector extends Unit {
    constructor() {
        super('Selector.png');
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
            if(col instanceof Key) {
                player.addKey();
                scoreValue += 1000;
                if(!player.gameHasEnded()) {
                    new Key();
                }
            }
            else if(col instanceof Star) {
                player.addStar();
                scoreValue += 750;
            }
        });

        playerCollectibles.clear();
    }
}

timeStart = performance.now();
timeLeft = 180000;
let player = new Player();
let selector = new Selector();
let key = new Key();

setTimeout(() => {
    GemStone.spawnGem();
}, 2000);

setTimeout(() => {
    Star.spawnStar();
}, 4000);

setTimeout(() => {
    Heart.spawnHeart();
}, 6000);

Enemy.spawnInfinite(true);
Enemy.checkForDestruction();

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    
    player.handleInput(allowedKeys[e.keyCode]);
});

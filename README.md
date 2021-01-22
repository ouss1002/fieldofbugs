# Key Collector
*Key Collector* Release 1.0.  
Try the game on [Netlify](https://infallible-goldberg-5951ff.netlify.app/).  
Check the folder `\OOP` for more info on the game OOP structure.  

## How to Play!

  - Launch `index.html` in your favourite browser
  - Use **arrow keys** to move the player in the map
  - Enjoy !

## How to win!
The player has to move around the map, collects the keys, get them back safely to base while avoiding enemy bugs with a race against time.

The game ends under on of these conditions: 
1. The player is out of hearts (lives)
2. The player collects 5 keys (Winning the Game)
3. The clock reaches 00:00:00 

## Collectibles 

### 1. Keys
- **Spawn Interval:** *Conditional*, upon losing the Key or grabbing it safely back to base
- **Availability:** Until collected or lost
- **Score Bonus:** 
    - On Interaction: ***+250 points***
    - On Base: ***+1000 points***
- **Utility:** Collecting **5 Keys** will win you the game 

### 2. Hearts
- **Spawn Interval:** every 12 seconds
- **Availability:** 4 seconds
- **Score Bonus:** 0 points
- **Utility:** more lives = more opportunities

### 3. GemStones
- **Spawn Interval:** every 10 seconds
- **Availability:** 5 seconds
- **Score Bonus:** depends on the **color** of the gem
    - *Blue*: ***+200 points***
    - *Green*: ***+300 points***
    - *Orange*: ***+400 points***
- **Utility:** none

### 4. Stars
- **Spawn Interval:** every 15 seconds
- **Availability:** 4 seconds
- **Score Bonus:** 
    - On Interaction: ***+0 points***
    - On Base: ***+1500 points***
- **Utility:** none

## Score
The final score gets evaluated when the game ends and it involves these calculations:
- every ***death*** accounts for **-500 points** from the overall score
- every ***heart*** accounts for **+1000 points** to the overall score
- the ***faster*** you finish the game, the ***higher*** the final score will be

## Events 

### Death
- upon dying, the player loses the items he collected (Keys and Stars), one life (heart) and respawns back in the base

### Base
- upon reaching the base, the player empties his pocket (from Keys and Stars) and continues his loot

### Avatar 
- the player can change his avatar by clicking on one of the icons in the right container to the map

### Difficulty (Development purposes)
- you can change the speed of  enemy bugs by slowing them down or speeding them up (to an extent of course), i only made this to help Udacity's tutor to test the *Winning the Game* functionality by facilitating the gameplay
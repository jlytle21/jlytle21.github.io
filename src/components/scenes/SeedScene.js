import * as Dat from 'dat.gui';
import { Scene, Color, Clock, AudioLoader, AudioListener, Audio, ArrowHelper, Vector3, Vector2, DodecahedronBufferGeometry, RepeatWrapping, TextureLoader, PlaneBufferGeometry, AnimationMixer } from 'three';
import { Ice, Penguin, Shark, Mosasaur, Mountain, Island } from 'objects'; // import objects
import { Water } from 'three/examples/jsm/objects/Water.js'; // import water
import WaterNormals from './textures/waternormals.jpg'; // for water texture
import Flamingo from './birds/Flamingo.glb'; // flamingo object
import Stork from './birds/Stork.glb'; // stork object
import Parrot from './birds/Parrot.glb'; // parrot object
import Splash from './sounds/bigSplash.ogg'; // splash sound
import Squawk from './sounds/squawk.mp3'; // squawk sound
import { BasicLights } from 'lights'; // lights
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // GLTF loader

class Score { // class to create scoreboard
  constructor(remaining) { // constructor for scoreboard
    this.table = document.createElement("TABLE"); // create table
    this.table.setAttribute("id", "scoring");
    document.body.appendChild(this.table);
    this.row = document.createElement("TR"); // create row
    this.row.setAttribute("id", "headerRow");
    document.getElementById("scoring").appendChild(this.row);
    this.column = document.createElement("TH");
    let t = document.createTextNode("Round"); // round column
    this.column.appendChild(t);
    this.column.style = "color: pink;";
    document.getElementById("headerRow").appendChild(this.column);
    for (let r in remaining) { // put players in scoring table
      this.column = document.createElement("TH");
      let t = document.createTextNode("Player " + r);
      this.column.appendChild(t);
      if (r == 1) this.column.style = "color: grey;";
      if (r == 2) this.column.style = "color: red;";
      if (r == 3) this.column.style = "color: green;";
      if (r == 4) this.column.style = "color: blue;";

      document.getElementById("headerRow").appendChild(this.column);
    }
    this.row2 = document.createElement("TR"); // create row
    this.row2.setAttribute("id", "scoreRow");
    document.getElementById("scoring").appendChild(this.row2);
    this.column = document.createElement("TD");
    let t2 = document.createTextNode("1");
    this.column.appendChild(t2);
    this.column.setAttribute("id", "round");
    this.column.style = "color: pink;"
    document.getElementById("scoreRow").appendChild(this.column);
    for (let r in remaining) { // fill second row with scores for each player
      this.column = document.createElement("TD");
      let t2 = document.createTextNode(remaining[r]);
      this.column.appendChild(t2);
      this.column.setAttribute("id", "player" + r);
      this.column.style = "color: white;"
      document.getElementById("scoreRow").appendChild(this.column);
    }
    // table style
    this.table.style = "border-spacing: 0.5rem; border-radius: 10px; border: 1px solid black; text-align: center; width: 100%; background: black; position: fixed; font-family: 'Monaco';";
  }
  updateScore(remaining, round) { // update the scores in the table
    document.getElementById("round").textContent = round;
    for (let r in remaining) {
      document.getElementById("player" + r).textContent = remaining[r];
    }
  }
}

class Popup { // class for popup messages
  constructor(message) {
    this.modal = document.createElement("DIV");
    this.modal.setAttribute("id", "modal");
    document.body.appendChild(this.modal);
    this.modalcontent = document.createElement("DIV");
    this.modalcontent.setAttribute("id", "modalcontent");
    this.modal.appendChild(this.modalcontent);
    this.text1 = document.createElement("p");
    this.text1.setAttribute("id", "text1");
    this.text1.innerHTML = message;
    this.modalcontent.appendChild(this.text1);
    this.text2 = document.createElement("p");
    this.text2.setAttribute("id", "text2");
    this.text2.innerHTML = message;
    this.modalcontent.appendChild(this.text2);
    // style
    this.modal.style = "display: none: position: absolute; z-index: 1; left: 0; top: 0; width: 100%; min-height: 100vh; overflow: auto; background-color: blue;";
    this.modalcontent.style = "background-color: blue; margin: 15% auto; padding: 20px; border: 0px; width: 80%; font-family: 'Monaco';";
    this.text1.style = "text-align: center; font-size: 45px;";
    this.text2.style = "text-align: center;";
  }
  update(header, message) { // update the popup and make appear with given header and message
    if (header.includes("1")) {
      document.getElementById("modal").style['background-color'] = 'grey';
      document.getElementById("modalcontent").style['background-color'] = 'grey';
    }
    if (header.includes("2")) {
      document.getElementById("modal").style['background-color'] = 'red';
      document.getElementById("modalcontent").style['background-color'] = 'red';
    }
    if (header.includes("3")) {
      document.getElementById("modal").style['background-color'] = 'green';
      document.getElementById("modalcontent").style['background-color'] = 'green';
    }
    if (header.includes("4")) {
      document.getElementById("modal").style['background-color'] = 'blue';
      document.getElementById("modalcontent").style['background-color'] = 'blue';
    }
    if (header.includes("TIE")) {
      document.getElementById("modal").style['background-color'] = 'white';
      document.getElementById("modalcontent").style['background-color'] = 'white';
    }
    document.getElementById("text1").innerHTML = header;
    document.getElementById("text2").innerHTML = message;
    document.getElementById("modal").style.display = "block";
  }
  remove(instructions) { // hide the popup
    document.getElementById("modal").style.display = "none";
    instructions = true;
  }
}

class SeedScene extends Scene {
  constructor(numPlayers, camera) {
    // Call parent Scene() constructor
    super();

    // event listeners for mouse and keys
    window.addEventListener("click", (e) => this.onMouseClick(e), false );
    window.addEventListener("keydown", (e) => this.handleImpactEvents(e), false);

    this.lastPosition = new Vector3(0, .35, 0);
    this.clock = new Clock(); // clock for update function
    this.initial = true; // boolean for if start of game
    // TO be used to select
    this.selectionPlayer = 1;
    this.selectionPenguin = 1;
    // If game is not over this is true
    this.gameOn = true;
    this.isPopup = false; // true if a popup exists
    this.sendMessage = true; // if sent message
    this.camera = camera; // save camera

    // Set up audio listener and global audio source
    // create an AudioListener and add it to the camera
    this.listener = new AudioListener();
    this.camera.add( this.listener );

    // to determine if all selections were made
    this.selectionOver = true;

    // Set background to a nice color
    this.background = new Color('#87CEEB');

    // Scale of size of ice sheet
    // Is initially 1 and then decreases each round
    this.iceScale = 1.0;

    const lights = new BasicLights(); // load lights
    this.ice = new Ice(this.iceScale); // load ice
    // load water help from https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html
    var waterGeometry = new PlaneBufferGeometry( 10000, 10000 );
    this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new TextureLoader().load( WaterNormals, function ( texture ) {
          texture.wrapS = texture.wrapT = RepeatWrapping;
        } ),
        alpha: 1.0,
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
      }
    );
    this.water.rotation.x = - Math.PI / 2;
    this.water.position.y -= 10;
    // Flamingo, Parrot, Stork from https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html & Mirada: https://mirada.com/ from Rome: http://ro.me/
    this.mixers = []; // for bird animations
    this.birds = []; // birds array
    // Load Flamingo
    const loader1 = new GLTFLoader();
    loader1.load(Flamingo, ( gltf ) => {
      this.flamingo = gltf.scene.children[ 0 ];
      let s = 0.1;
      this.flamingo.scale.set( s, s, s );
      this.flamingo.position.y = 40;
      this.flamingo.rotation.y = - 1;
      this.flamingo.castShadow = true;
      this.flamingo.receiveShadow = true;
      let mixer1 = new AnimationMixer( this.flamingo );
      mixer1.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
      this.mixers.push(mixer1);
      this.add(this.flamingo);
      this.birds.push(this.flamingo);
    });
    // Load Parrot
    const loader2 = new GLTFLoader();
    loader2.load(Parrot, ( gltf ) => {
      this.parrot = gltf.scene.children[ 0 ];
      let s = 0.1;
      this.parrot.scale.set( s, s, s );
      this.parrot.position.y = 60;
      this.parrot.rotation.y = - 1;
      this.parrot.castShadow = true;
      this.parrot.receiveShadow = true;
      let mixer2 = new AnimationMixer( this.parrot );
      mixer2.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
      this.mixers.push(mixer2);
      this.add(this.parrot);
      this.birds.push(this.parrot);
    });
    // Load Stork
    const loader3 = new GLTFLoader();
    loader3.load(Stork, ( gltf ) => {
      this.stork= gltf.scene.children[ 0 ];
      let s = 0.1;
      this.stork.scale.set( s, s, s );
      this.stork.position.y = 80;
      this.stork.rotation.y = - 1;
      this.stork.castShadow = true;
      this.stork.receiveShadow = true;
      let mixer3 = new AnimationMixer( this.stork );
      mixer3.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
      this.mixers.push(mixer3);
      this.add(this.stork);
      this.birds.push(this.stork);
    });
    this.shark = new Shark(); // load shark
    this.mosasaur = new Mosasaur(); // load mosasaur
    this.mountain = new Mountain(); // load mountain
    this.island = new Island(); // load island
    this.add(this.ice, this.water, this.shark, this.mosasaur, this.mountain, this.island, lights); // add objects to scene
    // Array of penguins in scene
    this.penguinsArray = [];
    // Round number
    this.round = 1;
    this.numPlayers = numPlayers; // number of players in game
    const remaining = {}; // dictionairy: how many penguins for each player
    for (let i = 1; i <= numPlayers; i++) remaining[i] = 4; // initialize and fill dictionairy
    this.remaining = remaining;
    this.score = new Score(remaining) // initialize scoreboard
    // set number of players UP TO 4
    let minimum = -30; // cannot be outside max and min of ice block
    let maximum = 30;
    let increment = (maximum-minimum) / 5;
    for (let i = 0; i < this.numPlayers; i++) { // create penguins for each player + push to scene
      if (i == 0) {
        for (let j = 1; j <= 4; j++) {
          this.penguin = new Penguin(this, minimum+j*increment, minimum, 0);
          this.add(this.penguin);
          this.penguinsArray.push(this.penguin);
        }
      }
      if (i == 1) {
        for (let j = 1; j <= 4; j++) {
          this.penguin = new Penguin(this, minimum+j*increment, maximum, 180)
          this.add(this.penguin);
          this.penguinsArray.push(this.penguin);
        }
      }
      if (i == 2) {
        for (let j = 1; j <= 4; j++) {
          this.penguin = new Penguin(this, minimum, minimum+j*increment, 90)
          this.add(this.penguin);
          this.penguinsArray.push(this.penguin);
        }
      }
      if (i == 3) {
        for (let j = 1; j <= 4; j++) {
          this.penguin = new Penguin(this, maximum, minimum+j*increment, 270)
          this.add(this.penguin);
          this.penguinsArray.push(this.penguin);
        }
      }
    }

    this.popup = new Popup('message'); // initialize popup
    this.popup.remove(this.isPopup); // hide popup
    this.isPopup = false; // set popup exists to not true

  }


  // Check if penguin centers are within bounds of ice. If not, apply downward force on penguin. Else do nothing.
  handlePenguinsOffIce() {
    let edge = 34 * this.iceScale;
    for (let p of this.penguinsArray) {
      if ((Math.abs(p.coordinates.x) > edge || Math.abs(p.coordinates.z) > edge) && !p.isFalling) {
        p.isFalling = true;
        p.applyGravity();
      }
    }
  }

  // Check if penguins are currently within eps of one another, calls penguin launch method to update force of
  // colliding penguins
  handlePenguinCollisions() {
    for (let i = 0; i < this.penguinsArray.length - 1; i++) {
      let currentPenguin = this.penguinsArray[i];

      for (let j = i + 1; j < this.penguinsArray.length; j++) {
        let isColiision = currentPenguin.collide(this.penguinsArray[j]);

        // Play noise if there is a collision
        if (isColiision) {
          // load a sound and set it as the Audio object's buffer
          // Sound obtained from royalty free site https://sounddogs.com
          let audioLoader = new AudioLoader();
          let sound = new Audio(this.listener);
          audioLoader.load(Squawk, function( buffer )  {
            sound.setBuffer( buffer );
            sound.setLoop(false);
            sound.setVolume(0.4);
            sound.play();
          });
        }
      }
    }
  }

  // Apply friction to each penguin by decreasing acceleration
  handleFriction() {
    for (let p of this.penguinsArray) {
      p.applyFriction();
    }
  }

  // Update velocities of each penguin based on accerlations
  updateVelocities(deltaT) {
    for (let p of this.penguinsArray) {
      let acc = p.netForce.clone();
      p.velocity.add(acc.multiplyScalar(deltaT));
    }
  }

  // Update positions of each penguin based on displacement
  updatePenguinPositions(deltaT) {
    for (let p of this.penguinsArray) {
      // Store original y coordinate
      let originalY = p.coordinates.y;

      // d = d_initial + v * t
      let v = p.velocity.clone();
      v.multiplyScalar(deltaT);
      p.position.add(v);
      p.coordinates.add(v);

      // Make splash sound if penguins enter water
      // load a sound and set it as the Audio object's buffer
      // Sound obtained from royalty free site https://bigsoundbank.com
      if (p.coordinates.y < -7 && originalY >= -7) {
        let audioLoader = new AudioLoader();
        let sound = new Audio(this.listener);
        audioLoader.load(Splash, function( buffer )  {
          sound.setBuffer( buffer );
          sound.setLoop(false);
          sound.setVolume(0.6);
          sound.play();
        });
      }
    }
  }

  onMouseClick(event) {
    // Removes popup when user clicks enter
    if (event.type == "click" && this.isPopup && this.gameOn) {
      this.popup.remove(this.isPopup);
      this.isPopup = false;
      return;
    }

    // Reloads page if final pop up declaring winner is shown and user clicks enter
    if (event.type == "click" && this.isPopup && !this.gameOn) {
      this.isPopup = false;
      location.reload();
      return;
    }
}

handleImpactEvents(event) {
  if (event.key == "1") this.camera.position.set(0, 150, 0);

  // Removes popup when user clicks enter
  if (event.key == "Enter" && this.isPopup && this.gameOn) {
    this.popup.remove(this.isPopup);
    this.isPopup = false;
    return;
  }

  // Reloads page if final pop up declaring winner is shown and user clicks enter
  if (event.key == "Enter" && this.isPopup && !this.gameOn) {
    this.isPopup = false;
    location.reload();
    return;
  }

  if (event.key == "Enter" && this.selectionOver == false && !this.isPopup) {
    let oldSelection = this.selectionPlayer;
    this.lastPosition = new Vector3(0, .35, 0);
    // If there is another penguin left for the user to input an arrow, go to next penguin
    if (this.selectionPenguin + 1 <= this.remaining[this.selectionPlayer]) {
      this.selectionPenguin = this.selectionPenguin + 1;
      this.drawArrow(this.lastPosition);
      return;
    }
    // if all penguins are selected, and all players have selected penguins, shoot off the penguins
    if (this.selectionPlayer + 1 > this.numPlayers) {
      this.selectionOver = true;
      this.deleteArrow(oldSelection);
      this.performRoundEnding();
      return;
    } else {
      // Find next player to place penguins
      for (let i = this.selectionPlayer + 1; i <= this.numPlayers; i++) {
        if (this.remaining[i] > 0) {
          this.deleteArrow(oldSelection);
          this.selectionPlayer = i;
          this.selectionPenguin = 1;
          this.sendMessage = false;
          break;
        }
      }
      // If there are no more players to select, shoot off the penguins
      if (oldSelection == this.selectionPlayer) {
        this.selectionOver = true;
        this.deleteArrow(oldSelection);
        this.performRoundEnding();
      }
    }
  } else if (this.selectionOver == false) {
    let difference;
    // Determine the arrow to change
    if (event.key == "ArrowUp") {
      difference = new Vector3(0, 0, -1);
    } else if (event.key == "ArrowDown") {
      difference = new Vector3(0, 0, +1);
    } else if (event.key == "ArrowLeft") {
      difference = new Vector3(-1, 0, 0);
    } else if (event.key == "ArrowRight") {
      difference = new Vector3(+1, 0, 0);
    } else {
      return;
    }

    let currentClick = this.lastPosition.add(difference);
    this.drawArrow(currentClick);
  }
}

deleteArrow(playerId) {
  // Deletes all the arrows for the current player
  for (let p of this.penguinsArray) {
    if (p.player == playerId) {
      this.remove(p.arrow);
      p.arrow = null;
    }
  }
}

// Method for drawing a arrow given the position
drawArrow(currentClick) {
  let counter = 0;
  let currPenguin;
  // for loop finds the penguin that is the current penguin
  for (let p of this.penguinsArray) {
    if (p.player == this.selectionPlayer) {
      counter++;
      if (counter == this.selectionPenguin) {
        currPenguin = p;
        break;
      }
    }
  }
  let penguinPos = currPenguin.coordinates;
  let direction = currentClick.clone().sub(penguinPos).normalize();
  // colors correspond to the penguin that is currently selecting their arrows
  let colorArray = [];
  colorArray[1] = 0x808080;
  colorArray[2] = 0xFF4500;
  colorArray[3] = 0x00FF00;
  colorArray[4] = 0x0000FF;
  let length = penguinPos.distanceTo(currentClick)
  let arrow = new ArrowHelper(direction, penguinPos, length, colorArray[this.selectionPlayer]);
  let newForce = direction.clone().multiplyScalar(length * 2.0);
  currPenguin.nextVelocity = newForce;
  // If there is already an arrow for this penguin, remove the current one before adding a new one.
  if (currPenguin.arrow != null) {
    this.remove(currPenguin.arrow);
  }
  // Add the arrow using the Arrowhelper
  this.add(arrow);
  currPenguin.arrow = arrow;
}

// Function to check if all penguins on board have velocity of 0
// Also waits a second or two after penguins have fallen off edge
// Also removes penguins off ice
// Returns true if penguins are still, false if not
arePenguinsStill() {
  for (let p of this.penguinsArray) {
    if (p.coordinates.y < -20) { // removes penguins from scene and array and updates remaining number of penguins
      let copy = [];
      for (let x of this.penguinsArray) {
        if (x == p) continue;
        copy.push(x);
      }
      this.penguinsArray = copy;
      this.remaining[p.player] -= 1;
      p.alive = false;
      this.remove(p);
      return false;
    }
    // check if velocity is effectively 0
    if (Math.abs(p.velocity.x) > 0.3 || Math.abs(p.velocity.z) > 0.3) {
      return false;
    }
  }
  // set velocity to zero
  for (let p of this.penguinsArray) {
    p.velocity = new Vector3(0,0,0);
  }
  return true;
}




// Function that performs a single round of the game
performRound(camera) { // returns false if game is over

  // Presents player with message that it is their turn and gives directions
  if (this.sendMessage == false) {
    this.isPopup = true;
    let turnHeader = "Player " + this.selectionPlayer + "'s Turn!";
    let turnMessage = "Use the arrow keys to adjust the arrow. Click Enter to move to next Penguin! Press Enter or Click anywhere to begin your turn!";
    this.popup.update(turnHeader, turnMessage);
    this.drawArrow(this.lastPosition);
    this.sendMessage = true;
  }

  if (this.selectionOver == true) {
    let playersLeft = 0;
    let player = 1;
    for (let i = 1; i <= this.numPlayers; i++) {
      if (this.remaining[i] > 0) {
        playersLeft += 1;
        player = i;
      }
    }
    this.score.updateScore(this.remaining, this.round); // update scores
    // check if game is over
    if (playersLeft == 1) { // if 1 player left, announce winner
      this.isPopup = true;
      this.gameOn = false;
      let mesHeader = "Player " + player + " wins!";
      let message = "Press enter to play again!";
      this.popup.update(mesHeader, message);
      return false;
    }
    if (playersLeft == 0) { // if no players left, announce tie
      this.isPopup = true;
      this.gameOn = false;
      let mesHeader = "TIE!";
      let message = "Press enter to play again!";
      this.popup.update(mesHeader, message);
      return false;
    }

    // Rescales ice
    if (this.round <= 7) {
      this.iceScale = 1.0 - (0.1 * (this.round));
    }
    else {
      this.iceScale = 0.3;
    }

    // Removes current ice and Adds new scaled Ice
    this.remove(this.ice);
    this.ice = new Ice(this.iceScale);
    this.add(this.ice);


    // Also have to move penguins with ice proportionally
    if (this.round <= 7) {
      for (let p of this.penguinsArray) {
        let oldCoords = p.coordinates.clone();
        p.coordinates.multiplyScalar(this.iceScale);
        let difference = p.coordinates.clone().sub(oldCoords);
        p.position.add(difference);
      }
    }


    // Iterates through penguin selection to find the first player with penguins remaining
    for (let i = 1; i <= this.numPlayers; i++) {
      if (this.remaining[i] == 0) continue;
      this.selectionPlayer = i;
      this.selectionPenguin = 1;
      this.sendMessage = false;
      break;
    }
    this.selectionOver = false;
  }

  return true;
}


performRoundEnding() {
  // Launch all penguins at the same time
  for (let p of this.penguinsArray) {
    p.launch(p.nextVelocity);
  }
  // Sets round var to next round at end of round
  this.round += 1;

}

update(timeStamp, camera) {
  if (!this.gameOn) return; // return if game is over
  if (timeStamp < 10000) return;

  // Initial camera sweep to showcase scene
  if (this.initial) {
    if (timeStamp < 20000) {
      camera.position.x = -500*Math.cos((timeStamp -10000)/4000 - 0.93);
      camera.position.z = 500*Math.sin((timeStamp-10000)/4000 - 0.93);
      camera.position.y = 100;
    }
    else {
      camera.position.x += -camera.position.x/100;
      camera.position.z += -camera.position.z/100;
      camera.position.y += 0.25;
    }
  }
  if (Math.abs(camera.position.x) < 5 && Math.abs(camera.position.z) < 5 && this.initial) {
    this.initial = false;
  }

  let delta = this.clock.getDelta(); // for motion of birds
  for (let count = 0; count < this.birds.length; count++) { // update location of birds
    if (count == 0) { // flamingo movement
      let oldLocation = new Vector2(this.birds[count].position.x, this.birds[count].position.z);
      let newLocation = new Vector2(100*Math.cos((timeStamp-10000)/10000) + 40, 100*Math.sin((timeStamp-10000)/5000) + 10);
      let difference = oldLocation.clone().sub(newLocation);
      let ang = difference.angle();
      this.birds[count].rotation.y = -1 * (ang -  6 * Math.PI / 4);
      this.birds[count].position.x = 100*Math.cos((timeStamp-10000)/10000) + 40;
      this.birds[count].position.z = 100*Math.sin((timeStamp-10000)/5000) + 10 ;
    }
    if (count == 1) { // parrot movement
      let oldLocation = new Vector2(this.birds[count].position.x, this.birds[count].position.z);
      let newLocation = new Vector2(-100*Math.sin((timeStamp-10000)/5000), -100*Math.cos((timeStamp-10000)/10000) + 60);
      let difference = oldLocation.clone().sub(newLocation);
      let ang = difference.angle();
      this.birds[count].rotation.y = -1 * (ang -  6 * Math.PI / 4);
      this.birds[count].position.x = -100*Math.sin((timeStamp-10000)/5000);
      this.birds[count].position.z = -100*Math.cos((timeStamp-10000)/10000) + 60;
    }
    if (count == 2) { // stork movement
      let oldLocation = new Vector2(this.birds[count].position.x, this.birds[count].position.z);
      let newLocation = new Vector2(-100*Math.cos((timeStamp-10000)/10000), 100*Math.sin((timeStamp-10000)/5000));
      let difference = oldLocation.clone().sub(newLocation);
      let ang = difference.angle();
      this.birds[count].rotation.y = -1 * (ang -  6 * Math.PI / 4);
      this.birds[count].position.x = -100*Math.cos((timeStamp-10000)/10000);
      this.birds[count].position.z = 100*Math.sin((timeStamp-10000)/5000);
    }
  }
  for (let m of this.mixers) m.update( delta ); // update animation of birds

  // move Shark
  let oldSharkLocation = new Vector2(this.shark.position.x, this.shark.position.z);
  let newSharkLocation = new Vector2(100*Math.cos(timeStamp/2000), 100*Math.sin(timeStamp/2000));
  let sharkDifference = oldSharkLocation.clone().sub(newSharkLocation);
  let sharkAng = sharkDifference.angle();
  this.shark.rotation.y = -1 * (sharkAng -  6 * Math.PI / 4);
  this.shark.position.x = 100*Math.cos(timeStamp/2000);
  this.shark.position.z = 100*Math.sin(timeStamp/2000);

  // Cause the mosasaur to jump infrequently with varying height
  // max height of 40
  let jumpFactor = 70 * (this.round / 5.0) + 10;
  if (jumpFactor > 80) {
    jumpFactor = 80;
  }
  let newHeight = -1 * jumpFactor * Math.cos(((timeStamp-10000)) / 5000) + -60;
  this.mosasaur.position.y = newHeight;


  this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0; // animate water

  let still = this.arePenguinsStill(); // check if penguins are still

  // Only perform round if not in intro and penguins are still
  if (still && !this.initial) {
    this.gameOn = this.performRound(camera); // returns false if game is over
  }

  this.handlePenguinsOffIce(); // check if penguins off ice
  this.handlePenguinCollisions(); // handle collisions of penguins
  this.handleFriction(); // update friction force
  this.updateVelocities(0.01); // update velocities
  this.updatePenguinPositions(0.01); // update positions of penguns
}
}

export default SeedScene;

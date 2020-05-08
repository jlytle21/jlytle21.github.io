import * as Dat from 'dat.gui';
import { Scene, Color, Clock, ArrowHelper, Vector3, Vector2, DodecahedronBufferGeometry, RepeatWrapping, TextureLoader, PlaneBufferGeometry, AnimationMixer } from 'three';
import { Ice, Penguin } from 'objects';
import { Water } from 'three/examples/jsm/objects/Water.js';
import WaterNormals from './textures/waternormals.jpg';
import Flamingo from './flamingo/Flamingo.glb';
import { BasicLights } from 'lights';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Score { // class to create scoreboard
  constructor(remaining) {
    this.table = document.createElement("TABLE"); // create table
    this.table.setAttribute("id", "scoring");
    document.body.appendChild(this.table);
    this.row = document.createElement("TR"); // create row
    this.row.setAttribute("id", "headerRow");
    document.getElementById("scoring").appendChild(this.row);
    this.column = document.createElement("TH");
    let t = document.createTextNode("Round");
    this.column.appendChild(t);
    this.column.style = "color: pink;";
    document.getElementById("headerRow").appendChild(this.column);
    for (let r in remaining) {
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
    for (let r in remaining) {
      this.column = document.createElement("TD");
      let t2 = document.createTextNode(remaining[r]);
      this.column.appendChild(t2);
      this.column.setAttribute("id", "player" + r);
      this.column.style = "color: white;"
      document.getElementById("scoreRow").appendChild(this.column);
    }
    this.table.style = "border-spacing: 0.5rem; border: 1px solid black; text-align: center; width: 100%; background: black; position: fixed; font-family: 'Monaco'";
  }
  updateScore(remaining, round) {
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

    this.button = document.createElement("BTN");
    this.button.setAttribute("id", "close");
    this.button.appendChild(document.createTextNode("X"));
    this.modalcontent.appendChild(this.button);

    this.text = document.createElement("p");
    this.text.setAttribute("id", "text");
    this.text.innerHTML = message;
    this.modalcontent.appendChild(this.text);

    this.modal.style = "display: inline: position: fixed; z-index: -1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgb(0,0,0,0.4);";
    this.modalcontent.style = "background-color: blue; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%;";
    this.button.style = "color: red; float: right; font-size: 28px; font-weight: bold;";

  }
  update(message) {
    document.getElementById("text").innerHTML = message;
    document.getElementById("modal").style.display = "block";
  }
  remove(instructions) {
    document.getElementById("modal").style.display = "none";
    instructions = true;
  }
}


class SeedScene extends Scene {
  constructor(numPlayers, camera) {
    // Call parent Scene() constructor
    super();

    // Init state
    this.state = {
      //gui: new Dat.GUI(), // Create GUI for scene
      rotationSpeed: 0.0,
    };

    // event listeners for mouse and keys
    window.addEventListener("click", (e) => this.onMouseClick(e), false );
    window.addEventListener("keydown", (e) => this.handleImpactEvents(e), false);

    this.lastPosition = new Vector3(0, .35, 0);

    this.clock = new Clock();

    this.initial = true;
    // TO be used to select
    this.selectionPlayer = 1;
    this.selectionPenguin = 1;

    // If game is not over this is true
    this.gameOn = true;

    this.isPopup = false;

    this.sendMessage = true;

    this.camera = camera; // save camera

    // to determine if all selections were made
    this.selectionOver = true;

    // Set background to a nice color
    this.background = new Color('#87CEEB');

    // Scale of size of ice sheet
    // Is initially 1 and then decreases each round
    this.iceScale = 1.0;

    const lights = new BasicLights(); // load lights
    this.ice = new Ice(this.iceScale); // load ice
    // load water
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
        //sunDirection: lights[0].position.clone().normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        //fog: scene.fog !== undefined
      }
    );
    this.water.rotation.x = - Math.PI / 2;
    this.water.position.y -= 10;
    // flamingo from https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html
    this.mixers = [];
    this.flamingos = [];
    const loader1 = new GLTFLoader();
    loader1.load(Flamingo, ( gltf ) => {
      this.flamingo1 = gltf.scene.children[ 0 ];
      let s = 0.1;
      this.flamingo1.scale.set( s, s, s );
      this.flamingo1.position.y = 40;
      this.flamingo1.rotation.y = - 1;
      this.flamingo1.castShadow = true;
      this.flamingo1.receiveShadow = true;
      let mixer1 = new AnimationMixer( this.flamingo1 );
      mixer1.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
      this.mixers.push(mixer1);
      this.add(this.flamingo1);
      this.flamingos.push(this.flamingo1);
    });
    const loader2 = new GLTFLoader();
    loader2.load(Flamingo, ( gltf ) => {
      this.flamingo2 = gltf.scene.children[ 0 ];
      let s = 0.1;
      this.flamingo2.scale.set( s, s, s );
      this.flamingo2.position.y = 60;
      this.flamingo2.rotation.y = - 1;
      this.flamingo2.castShadow = true;
      this.flamingo2.receiveShadow = true;
      let mixer2 = new AnimationMixer( this.flamingo2 );
      mixer2.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
      this.mixers.push(mixer2);
      this.add(this.flamingo2);
      this.flamingos.push(this.flamingo2);
    });
    const loader3 = new GLTFLoader();
    loader3.load(Flamingo, ( gltf ) => {
      this.flamingo3 = gltf.scene.children[ 0 ];
      let s = 0.1;
      this.flamingo3.scale.set( s, s, s );
      this.flamingo3.position.y = 80;
      this.flamingo3.rotation.y = - 1;
      this.flamingo3.castShadow = true;
      this.flamingo3.receiveShadow = true;
      let mixer3 = new AnimationMixer( this.flamingo3 );
      mixer3.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
      this.mixers.push(mixer3);
      this.add(this.flamingo3);
      this.flamingos.push(this.flamingo3);
    });
    this.add(this.ice, this.water, lights);
    // Array of penguins in scene
    this.penguinsArray = [];
    // Round number
    this.round = 1;
    // Number of players + number of penguins remaining per player
    this.numPlayers = numPlayers;
    const remaining = {};
    for (let i = 1; i <= numPlayers; i++) remaining[i] = 4;
    this.remaining = remaining;
    // initialize scoreboard
    this.score = new Score(remaining)
    // set number of players UP TO 4
    let minimum = -30;
    let maximum = 30;
    let increment = (maximum-minimum) / 5;
    for (let i = 0; i < this.numPlayers; i++) {
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
    // Populate GUI
    //this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    this.popup = new Popup('message');

  }

  addToUpdateList(object) {
    this.state.updateList.push(object);
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
        currentPenguin.collide(this.penguinsArray[j]);
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
      //console.log(p);
      //console.log(p.position.x);
      let acc = p.netForce.clone();
      p.velocity.add(acc.multiplyScalar(deltaT));
    }
  }
  // Update positions of each penguin based on displacement
  updatePenguinPositions(deltaT) {
    //console.log(this.penguinsArray);
    for (let p of this.penguinsArray) {
      //console.log(p.position.x);
      let acc = p.netForce.clone();
      let v = p.velocity.clone();
      //let displacement = v.multiplyScalar(deltaT).add(acc.multiplyScalar(0.5 * deltaT * deltaT));
      // displacement.x = displacement.x + 0.03
      v.multiplyScalar(deltaT);
      p.position.add(v);
      p.coordinates.add(v);
      // console.log(displacement.y);
      //p.update(displacement.x, displacement.y, displacement.z);
    }
  }
  onMouseClick(event) {
    /*
    console.log("===========");
    console.log(this.selectionOver);
    console.log("-------------");
    if (this.selectionOver == false) {
      let translatex = window.innerWidth / 2;
      let translatey = window.innerHeight / 2;
      let x = event.screenX - translatex;
      let y = event.screenY - translatey;
      let currentClick = new Vector3(x, 0.35, y);
      let counter = 0;
      let currPenguin;
      for (let p of this.penguinsArray) {
        if (p.player == this.selectionPlayer) {
          counter++;
          if (counter == this.selectionPenguin) {
            currPenguin = p;
            break;
          }
        }
      }
      console.log(currPenguin.coordinates);
      console.log(event.screenX + ", " + event.screenY);
      console.log(currentClick);
      let penguinPos = currPenguin.coordinates;
      let direction = currentClick.clone().sub(penguinPos).normalize();
      var color = 0xFF0000;
      var arrow = new ArrowHelper(direction, penguinPos, penguinPos.distanceTo(currentClick), color);
      console.log(arrow);
      if (currPenguin.arrow != null) {
        this.remove(currPenguin.arrow);
      }
      this.add(arrow);
      currPenguin.arrow = arrow;
    } */
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
      if (this.selectionPenguin + 1 <= this.remaining[this.selectionPlayer]) {
        this.selectionPenguin = this.selectionPenguin + 1;
        this.drawArrow(this.lastPosition);
        return;
      }
      if (this.selectionPlayer + 1 > this.numPlayers) {
        this.selectionOver = true;
        this.deleteArrow(oldSelection);
        this.performRoundEnding();
        return;
      } else {
        for (let i = this.selectionPlayer + 1; i <= this.numPlayers; i++) {
          if (this.remaining[i] > 0) {
            this.deleteArrow(oldSelection);
            this.selectionPlayer = i;
            this.selectionPenguin = 1;
            this.sendMessage = false;
            break;
          }
        }
        if (oldSelection == this.selectionPlayer) {
          this.selectionOver = true;
          this.deleteArrow(oldSelection);
          this.performRoundEnding();
        }
      }
    } else if (this.selectionOver == false) {
      let difference;
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
    for (let p of this.penguinsArray) {
      if (p.player == playerId) {
        this.remove(p.arrow);
        p.arrow = null;
      }
    }
  }

  drawArrow(currentClick) {
    let counter = 0;
      let currPenguin;
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
      let colorArray = [];
      colorArray[1] = 0x808080;
      colorArray[2] = 0xFF4500;
      colorArray[3] = 0x00FF00;
      colorArray[4] = 0x0000FF;
      let length = penguinPos.distanceTo(currentClick)
      let arrow = new ArrowHelper(direction, penguinPos, length, colorArray[this.selectionPlayer]);
      let newForce = direction.clone().multiplyScalar(length * 2.0);
      currPenguin.nextVelocity = newForce;
      if (currPenguin.arrow != null) {
        this.remove(currPenguin.arrow);
      }
      this.add(arrow);
      currPenguin.arrow = arrow;
  }

  // Function to check if all penguins on board have velocity of 0
  // Also waits a second or two after penguins have fallen off edge
  // Also removes penguins off ice
  arePenguinsStill() {
    let still = true;
    let zero = new Vector3(0.0, 0.0, 0.0);
    for (let p of this.penguinsArray) {
      if (p.coordinates.y < -20) { // removes penguins from scene and array and updates remaining number of penguins
        console.log(p.coordinates.y);
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
    // Check if Game is over
    //console.log(this.remaining);
    if (this.sendMessage == false) {

      console.log(this);
      // window.alert("Player " + this.selectionPlayer + "'s Turn!\nUse the arrow keys to adjust the arrow\nClick Enter to move to next Penguin!");
      this.isPopup = true;
      let turn = "Player " + this.selectionPlayer + "'s Turn!\nUse the arrow keys to adjust the arrow\nClick Enter to move to next Penguin!\n\nPress enter to begin your turn!";
      this.popup.update(turn);
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
      // update scores

      this.score.updateScore(this.remaining, this.round);
      // check if game is over
      if (playersLeft == 1) {
        this.isPopup = true;
        this.gameOn = false;
        let mes = "Player " + player + " wins!\nPress enter to play again!";
        this.popup.update(mes);
        return false;
      }
      if (playersLeft == 0) {
        this.isPopup = true;
        this.gameOn = false;
        let mes = "TIE!\nPress enter to play again!";
        this.popup.update(mes);
        return false;
      }


      // Rescales ice
      if (this.round <= 7) {
        this.iceScale = 1.0 - (0.1 * (this.round));
      }
      else {
        this.iceScale = 0.3;
      }
      //console.log(selectedObject);
      // selectedObject.shrink(this.iceScale);
      this.remove(this.ice);
      //this.ice.destructor();
      this.ice = new Ice(this.iceScale);
      this.add(this.ice);
      // console.log(this.ice);


      // Also have to move penguins with ice
      if (this.round <= 7) {
        for (let p of this.penguinsArray) {
          let oldCoords = p.coordinates.clone();
          p.coordinates.multiplyScalar(this.iceScale);
          let difference = p.coordinates.clone().sub(oldCoords);
          p.position.add(difference);
        }
      }


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
    if (!this.gameOn) return;
    if (this.initial) {
      camera.position.set(0, 150, 0);
      this.initial = false
    }
    const { rotationSpeed, updateList } = this.state;
    this.rotation.y = (rotationSpeed * timeStamp) / 10000;

    let delta = this.clock.getDelta(); // motion of flamingos
    for (let count = 0; count < this.flamingos.length; count++) {
      if (count == 0) {
        let oldLocation = new Vector2(this.flamingos[count].position.x, this.flamingos[count].position.z);
        let newLocation = new Vector2(100*Math.cos(timeStamp/10000) + 40, 100*Math.sin(timeStamp/5000) + 10);
        let angle = oldLocation.angle() - newLocation.angle();
        //this.flamingos[count].rotation.y = angle;
        this.flamingos[count].position.x = 100*Math.cos(timeStamp/10000) + 40;
        this.flamingos[count].position.z = 100*Math.sin(timeStamp/5000) + 10 ;
      }
      if (count == 1) {
        this.flamingos[count].position.x = -100*Math.sin(timeStamp/5000);
        this.flamingos[count].position.z = -100*Math.cos(timeStamp/10000) + 60;
      }
      if (count == 2) {
        this.flamingos[count].position.x = -100*Math.cos(timeStamp/10000);
        this.flamingos[count].position.z = 100*Math.sin(timeStamp/5000);
      }
    }
    for (let m of this.mixers) {
      m.update( delta );
    }

    this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0; // animate water

    let still = this.arePenguinsStill();
    //console.log("Number of penguins left: " + this.penguinsArray.length);
    if (still) {
      this.gameOn = this.performRound(camera); // returns false if game is over
    }

    this.handlePenguinsOffIce();
    this.handlePenguinCollisions();
    this.handleFriction();
    this.updateVelocities(0.01);
    this.updatePenguinPositions(0.01);
  }
}

export default SeedScene;

import * as Dat from 'dat.gui';
import { Scene, Color, ArrowHelper, Vector3, DodecahedronBufferGeometry } from 'three';
import { Ice, Penguin, Water } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
  constructor(numPlayers) {
    // Call parent Scene() constructor
    super();

    // Init state
    this.state = {
      gui: new Dat.GUI(), // Create GUI for scene
      rotationSpeed: 0.0,
      updateList: [],
      sentInstructions: false,
    };

    // event listeners for mouse and keys
    window.addEventListener("click", (e) => this.onMouseClick(e), false );
    window.addEventListener("keydown", (e) => this.handleImpactEvents(e), false);

    this.lastPosition = new Vector3(0, .35, 0);

    // TO be used to select 
    this.selectionPlayer = 1; 
    this.selectionPenguin = 1; 


    // to determine if all selections were made
    this.selectionOver = true;

    // Set background to a nice color
    this.background = new Color('#87CEEB');

    // Scale of size of ice sheet
    // Is initially 1 and then decreases each round
    this.iceScale = 1.0;

    const lights = new BasicLights();
    this.ice = new Ice(this.iceScale);
    this.water = new Water();
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
          let initialVelocity = new Vector3(0, 0, 40);
          this.penguin.launch(initialVelocity);
        }
      }
      if (i == 1) {
        for (let j = 1; j <= 4; j++) {
          this.penguin = new Penguin(this, minimum+j*increment, maximum, 180)
          this.add(this.penguin);
          this.penguinsArray.push(this.penguin);
          let initialVelocity = new Vector3(0, 0, 0);
          this.penguin.launch(initialVelocity)
        }
      }
      if (i == 2) {
        for (let j = 1; j <= 4; j++) {
          this.penguin = new Penguin(this, minimum, minimum+j*increment, 90)
          this.add(this.penguin);
          this.penguinsArray.push(this.penguin);
          let initialVelocity = new Vector3(80, 0, 40);
          this.penguin.launch(initialVelocity);
        }
      }
      if (i == 3) {
        for (let j = 1; j <= 4; j++) {
          this.penguin = new Penguin(this, maximum, minimum+j*increment, 270)
          this.add(this.penguin);
          this.penguinsArray.push(this.penguin);
          let initialVelocity = new Vector3(-80, 0, 40);
          this.penguin.launch(initialVelocity);
        }
      }
    }
    /*
    for (let p of this.penguinsArray) {
      console.log(p.coordinates);
    }
    */



    // Populate GUI
    //this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
  }

  addToUpdateList(object) {
    this.state.updateList.push(object);
  }



  // Check if penguin centers are within bounds of ice. If not, apply downward force on penguin. Else do nothing.
  handlePenguinsOffIce() {
    let edge = 34;
    for (let p of this.penguinsArray) {
      // console.log(p.position.y);
      //console.log(p.coordinates.x);
      if ((Math.abs(p.coordinates.x) > edge || Math.abs(p.coordinates.z) > edge) && !p.isFalling) {
        //console.log(p.position.x);
        //console.log(p.position.z);
        //console.log(this.penguinsArray);
        p.isFalling = true;
        p.applyGravity();
        //console.log(Math.abs(p.location().x));
        //console.log(Math.abs(p.location().y));

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
    if (event.key == "Enter" && this.selectionOver == false) {
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
            window.alert("Player " + i + "'s Turn!");
            window.alert("Use the arrow keys to adjust the arrow");
            window.alert("Click Enter to move to next Penguin!");
            this.drawArrow(this.lastPosition);
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
      let color = 0xFF0000;
      let length = penguinPos.distanceTo(currentClick)
      let arrow = new ArrowHelper(direction, penguinPos, length, color);
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
      if (p.coordinates.y < 0) { // removes penguins from scene and array and updates remaining number of penguins
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
      if (Math.abs(p.velocity.x) > 0.001 || Math.abs(p.velocity.z) > 0.001) {
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
    if (this.selectionOver == true) {
      let playersLeft = 0;
      let player = 1;
      for (let i = 1; i <= this.numPlayers; i++) {
        if (this.remaining[i] > 0) {
          playersLeft += 1;
          player = i;
        }
      }
      if (playersLeft == 1) {
        window.alert("Player " + player + " wins!");
        return false;
      }
      if (playersLeft == 0) {
        window.alert("Game ends in a tie!");
        return false;
      }

      
      // Rescales ice
      if (this.round <= 5) {
        this.iceScale = 1.0 - (0.15 * (this.round));
      }
      else {
        this.iceScale = 0.25;
      }
      //console.log(selectedObject);
      // selectedObject.shrink(this.iceScale);
      this.remove(this.ice);
      //this.ice.destructor();
      this.ice = new Ice(this.iceScale);
      this.add(this.ice);
      // console.log(this.ice);

      
      // Also have to move penguins with ice
      for (let p of this.penguinsArray) {
        let oldCoords = p.coordinates.clone();
        p.coordinates.multiplyScalar(this.iceScale);
        let difference = p.coordinates.clone().sub(oldCoords);
        p.position.add(difference);
      }
      
    
      for (let i = 1; i <= this.numPlayers; i++) {
        if (this.remaining[i] == 0) continue;
        this.selectionPlayer = i;
        window.alert("Player " + i + "'s Turn!");
        window.alert("Use the arrow keys to adjust the arrow");
        window.alert("Click Enter to move to next Penguin!");
        this.drawArrow(this.lastPosition);
        break;
      }
      this.selectionOver = false;
    }    
     
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
    if (timeStamp < 5000) return; // wait for everything to load
    if (this.state.sentInstructions == false) {
      window.alert("INSTRUCTIONS: Be the last man standing!");
      this.state.sentInstructions = true;
      camera.position.set(0, 150, 0); // set camera position to above
    }
    const { rotationSpeed, updateList } = this.state;
    this.rotation.y = (rotationSpeed * timeStamp) / 10000;

    let still = this.arePenguinsStill();
    //console.log("Number of penguins left: " + this.penguinsArray.length);
    if (still) {
      let gameOver = this.performRound(camera); // returns false if game is over
    }

    this.handlePenguinsOffIce();
    this.handlePenguinCollisions();
    this.handleFriction();
    this.updateVelocities(0.01);
    this.updatePenguinPositions(0.01);


    // Call update for each object in the updateList
    //for (const obj of updateList) {
    //obj.update(0, 0); // moves penguins 0 in x and 0 in z direction
    //}
  }
}

export default SeedScene;

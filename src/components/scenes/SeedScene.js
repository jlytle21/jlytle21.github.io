import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
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
    window.addEventListener('click', this.onMouseClick, false );
    window.addEventListener("keydown", this.handleImpactEvents, false);

    //determine if selections are happening
    this.selections = false;

    // queue for click positions (Only will store if we are currently making selections)
    this.lastClick = [-1, -1];

    // to determine if all selections were made
    this.selectionOver = false;

    // Set background to a nice color
    this.background = new Color('#87CEEB');

    const lights = new BasicLights();
    this.ice = new Ice();
    this.water = new Water();
    this.add(this.ice, this.water, lights);

    // Array of penguins in scene
    this.penguinsArray = [];

    // Scale of size of ice sheet
    // Is initially 1 and then decreases each round
    this.iceScale = 1.0;

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
          let initialVelocity = new Vector3(0, 0, 80);
          this.penguin.launch(initialVelocity);
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
    //for (let p of this.penguinsArray) {
      //console.log(p.coordinates);
    //}




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
    if (this.selectionOver == false) {
      let x = ( event.clientX / window.innerWidth ) * 2 - 1;
      let y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.lastClick[0] = x;
      this.lastClick[1] = y;
    }
  }

  handleImpactEvents(event) {
    if (event.key == "Enter") {
      this.selectionOver = true;
    }
  }

  // Function to check if all penguins on board have velocity of 0
  // Also waits a second or two after penguins have fallen off edge
  // Also removes penguins off ice
  arePenguinsStill() {
    let still = true;
    let zero = new Vector3(0.0, 0.0, 0.0);
    for (let p of this.penguinsArray) {
      if (p.coordinates.y < -50) { // removes penguins from scene and array and updates remaining number of penguins
        this.remove(p);
        this.remaining[p.player] -= 1;
        let copy = [];
        for (let x of this.penguinsArray) {
          if (x == p) continue;
          else copy.push(x);
        }
        this.penguinsArray = copy;
      }
      // check if velocity is effectively 0
      if (Math.abs(p.velocity.x) > 0.001 || Math.abs(p.velocity.z) > 0.001) {
        still = false;
      }
    }
    return still;
  }



  // Function that performs a single round of the game
  performRound(camera) {
    // Queue for launching penguins
    let launchQueue = [];

    // Rescales ice
    console.log(this.ice);
    this.iceScale = 1.0 - (0.15 * (this.round - 1));
    this.ice.scale.multiplyScalar(this.iceScale);

    // Also have to move penguins with ice
    for (let p of this.penguinsArray) {
      let oldCoords = p.coordinates.clone();
      p.coordinates.multiplyScalar(this.iceScale);
      let difference = p.coordinates.clone().sub(oldCoords);
      p.position.add(difference);
    }

    // allow each player to launch four penguins
    for (let i = 0; i < this.numPlayers; i++) {

      // Pop up message informing user i+1 that it is their turn to launch penguins
      window.alert("Player " + i + "'s Turn!");
      window.alert("Press the Enter Button when complete!");
      let numClicks = 0;
      let positions = [];
      let currentPenguin;

      while(this.selectionOver == false) {
        if (this.lastClick[0] != -1) {
          if (numClicks == 0) {
            for (let p of this.penguinsArray) {
              if (p.position.distanceTo(new THREE.Vector2(this.lastClick[0], this.lastClick[1])) < 0.1) {
                currentPenguin = p;
                positions.push(new THREE.Vector3(this.lastClick[0], .35, this.lastClick[1]));
                numClicks = 1;
                break;
              }
            }
          } else {
            positions.push(new THREE.Vector3(this.lastClick[0], .35, this.lastClick[1]));
            numClicks = 0;
            let direction = positions[1].clone().sub(positions[0]).normalize();
            var arrow = new THREE.ArrowHelper(direction, positions[0], positions[1].distanceTo(positions[0]));
            this.add(arrow);
            if (currentPenguin.arrow != null) {
              this.remove(currentPenguin.arrow);
              currentPenguin.arrow = arrow;
            } else {
              currentPenguin.arrow = arrow;
            }
          }
        }
      }


     // Go through each penguin
      for (let j = i * 4; j < 4 + i * 4; j++) {
        if (this.penguinsArray[j].arrow != null) {
          let launchVector = this.penguinsArray[j].arrow.direction.clone().multiplyScalar(this.penguinsArray[j].arrow.length);
          launchqueue.push(launchVector);
        } else {
          let launchVector = new Vector3();
          launchqueue.push(launchVector);
        }
      }
    }

    // Launch all penguins at the same time
    for (let i = 0; i < this.penguinsArray.length; i++) {
      this.penguinsArray[i].launch(launchQueue[i]);
    }

    // Sets round var to next round at end of round
    this.round += 1;
  }



  update(timeStamp, camera) {
    if (timeStamp < 10000) return; // wait for everything to load
    if (this.state.sentInstructions == false) {
      window.alert("INSTRUCTIONS: Be the last man standing!");
      this.state.sentInstructions = true;
      camera.position.set(0, 150, 0); // set camera position to above
    }
    const { rotationSpeed, updateList } = this.state;
    this.rotation.y = (rotationSpeed * timeStamp) / 10000;

    console.log(this.arePenguinsStill());
    if (this.arePenguinsStill()) {
      console.log('Penguins are still');
      console.log(this.penguinsArray);
      debugger;
      //this.performRound(camera);
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

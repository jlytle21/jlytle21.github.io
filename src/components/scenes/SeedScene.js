import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import { Ice, Penguin, Water } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
  constructor() {
    // Call parent Scene() constructor
    super();

    // Init state
    this.state = {
      gui: new Dat.GUI(), // Create GUI for scene
      rotationSpeed: 0.0,
      updateList: [],
    };

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

    // Number of players
    this.numPlayers = 4;

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
    this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
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
        console.log(p);
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

  // Function that performs a single round of the game
  performRound() {
    // Queue for launching penguins
    let launchQueue = [];

    // Rescales ice
    this.iceScale = 1.0 - (0.15 * (this.round - 1));
    this.ice.scene.scale.multiplyScalar(this.iceScale);

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

      for (let j = i * 4; j < 4 + i * 4; j++) {
        // Eventually get input from user here through key listeners to get magnitude and direction for
        // launch vector
        let launchVector = new Vector3();
        launchqueue.push(launchVector);
      }
    }

    // Launch all penguins at the same time
    for (let i = 0; i < this.penguinsArray.length; i++) {
      this.penguinsArray[i].launch(launchQueue[i]);
    }

    // Sets round var to next round at end of round
    this.round = this.round + 1;
  }



  update(timeStamp) {
    if (timeStamp < 10000) return; // wait for everything to load
    const { rotationSpeed, updateList } = this.state;
    this.rotation.y = (rotationSpeed * timeStamp) / 10000;

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

import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import { Ice, Penguin } from 'objects';
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
        this.background = new Color(0x7ec0ee);

        // Array of penguins in scene
        this.penguinsArray = [];

        // set number of players UP TO 4
        let numPlayers = 4;
        let minimum = -15;
        let maximum = 15;
        let increment = (maximum-minimum) / 5;
        for (let i = 0; i < numPlayers; i++) {
          if (i == 0) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum+j*increment, minimum, 0);
              this.add(penguin);
              this.penguinsArray.push(penguin);
            }
          }
          if (i == 1) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum+j*increment, maximum, 180)
              this.add(penguin);
              this.penguinsArray.push(penguin);
            }
          }
          if (i == 2) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum, minimum+j*increment, 90)
              this.add(penguin);
              this.penguinsArray.push(penguin);
            }
          }
          if (i == 3) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, maximum, minimum+j*increment, 270)
              this.add(penguin);
              this.penguinsArray.push(penguin);
            }
          }
        }
        const lights = new BasicLights();
        const ice = new Ice();
        this.add(ice, lights);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }



    // Check if penguin centers are within bounds of ice. If not, apply downward force on penguin. Else do nothing.
    handlePenguinsOffIce() {
      let edge = 17;
      for (let p of this.penguinsArray) {
        //console.log(p.position.x);
        // console.log(p.position.y);
        if (Math.abs(p.location().x) > edge || Math.abs(p.location().y) > edge && !isFalling) {
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
        p.velocity = p.velocity.add(acc.multiplyScalar(deltaT));
      }
    }

    // Update positions of each penguin based on displacement
    updatePenguinPositions(deltaT) {
      //console.log(this.penguinsArray);
      for (let p of this.penguinsArray) {
        //console.log(p.position.x);
        let acc = p.netForce.clone();
        let v = p.velocity.clone();
        let displacement = v.multiplyScalar(deltaT).add(acc.multiplyScalar(0.5 * deltaT * deltaT));
        // displacement.x = displacement.x + 0.03
        p.position.add(displacement);
        // console.log(displacement.y);
        //p.update(displacement.x, displacement.y, displacement.z);
      }
    }



    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        this.handlePenguinsOffIce();
        this.handlePenguinCollisions();
        this.handleFriction();
        this.updateVelocities(0.05);
        this.updatePenguinPositions(0.05);


        // Call update for each object in the updateList
        //for (const obj of updateList) {
             //obj.update(0, 0); // moves penguins 0 in x and 0 in z direction
        //}
    }
}

export default SeedScene;

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

        // set number of players UP TO 4
        let penguinsArray = [];
        let numPlayers = 4;
        // 17 is out of bounds
        let penguinMass = 1;
        let minimum = -15;
        let maximum = 15;
        let increment = (maximum-minimum) / 5;
        for (let i = 0; i < numPlayers; i++) {
          if (i == 0) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum+j*increment, minimum, 0);
              this.add(penguin);
              penguinsArray.push(penguin);
            }
          }
          if (i == 1) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum+j*increment, maximum, 180)
              this.add(penguin);
              penguinsArray.push(penguin);
            }
          }
          if (i == 2) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum, minimum+j*increment, 90)
              this.add(penguin);
              penguinsArray.push(penguin);
            }
          }
          if (i == 3) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, maximum, minimum+j*increment, 270)
              this.add(penguin);
              penguinsArray.push(penguin);
            }
          }
        }
        const lights = new BasicLights();
        const ice = new Ice(penguinsArray);
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
      for (let p of penguinsArray) {
        if (Math.abs(p.location().x) > edge || Math.abs(p.location().y) > edge) {
          p.fall();
        }
      }
    }

    // Check if penguins are currently within eps of one another, calls penguin launch method to update force of
    // colliding penguins
    handlePenguinCollisions() {
      for (let i = 0; i < penguinsArray.length - 1; i++) {
        let currentPenguin = penguinsArray[i];

        for (let j = i + 1; j < penguinsArray.length; j++) {
          currentPenguin.intersect(penguinsArray[j]);
        }
      }
    }

    // Apply friction to each penguin by decreasing acceleration
    handleFriction() {
      for (let p of penguinsArray) {
        p.applyFriction();
      }
    }

    // Update velocities of each penguin based on accerlations
    updateVelocities(deltaT) {
      for (let p of penguinsArray) {
        let acc = p.netForce.copy();
        p.velocity = p.velocity.add(acc.multiplyScalar(deltaT));
      }
    }

    // Update positions of each penguin based on displacement
    updatePenguinPositions(deltaT) {
      for (let p of penguinsArray) {
        let acc = p.netForce.copy();
        let v = p.velocity.copy();
        let displacement = v.multiplyScalar(deltaT) + acc.multiplyScalar(0.5 * deltaT * deltaT);
        p.updatePosition(displacement);
      }
    }



    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // handlePenguinsOffIce();
        // handlePenguinCollisions();
        // handleFriction();
        // updateVelocities();
        // updatePenguinPositions();


        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(0, 0, 0); // moves penguins 0 in x and 0 in z direction
        }
    }
}

export default SeedScene;

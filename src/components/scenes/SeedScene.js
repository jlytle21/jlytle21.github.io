import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Ice, Penguin } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0.2,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // set number of players UP TO 4
        let numPlayers = 4;
        let minimum = -30;
        let maximum = 30;
        let increment = (maximum-minimum) / 5;
        for (let i = 0; i < numPlayers; i++) {
          if (i == 0) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum+j*increment, minimum, 0);
              this.add(penguin);
            }
          }
          if (i == 1) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum+j*increment, maximum, 180)
              this.add(penguin);
            }
          }
          if (i == 2) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, minimum, minimum+j*increment, 90)
              this.add(penguin);
            }
          }
          if (i == 3) {
            for (let j = 1; j <= 4; j++) {
              let penguin = new Penguin(this, maximum, minimum+j*increment, 270)
              this.add(penguin);
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

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(0.1, 0.1);
        }
    }
}

export default SeedScene;

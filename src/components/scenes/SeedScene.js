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
            rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        let numPlayers = 2;
        for (let i = 0; i < numPlayers; i++) {
          if (i == 0) {
            let penguin1 = new Penguin(this, -9, -9, 0);
            let penguin2 = new Penguin(this, -3, -9, 0);
            let penguin3 = new Penguin(this, 3, -9, 0);
            let penguin4 = new Penguin(this, 9, -9, 0);
            this.add(penguin1, penguin2, penguin3, penguin4);
          }
          if (i == 1) {
            let penguin5 = new Penguin(this, -9, 9, 180);
            let penguin6 = new Penguin(this, -3, 9, 180);
            let penguin7 = new Penguin(this, 3, 9, 180);
            let penguin8 = new Penguin(this, 9, 9, 180);
            this.add(penguin5, penguin6, penguin7, penguin8);
          }
          else {
            let penguin1 = new Penguin(this, 1, 5);
            let penguin2 = new Penguin(this, 2, 5);
            let penguin3 = new Penguin(this, 3, 5);
            let penguin4 = new Penguin(this, 4, 0);
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
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;

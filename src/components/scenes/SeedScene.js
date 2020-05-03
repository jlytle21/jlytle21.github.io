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

        // set number of players UP TO 4
        let numPlayers = 4;
        for (let i = 0; i < numPlayers; i++) {
          if (i == 0) {
            let penguin1 = new Penguin(this, -9, -15, 0);
            let penguin2 = new Penguin(this, -3, -15, 0);
            let penguin3 = new Penguin(this, 3, -15, 0);
            let penguin4 = new Penguin(this, 9, -15, 0);
            this.add(penguin1, penguin2, penguin3, penguin4);
          }
          if (i == 1) {
            let penguin5 = new Penguin(this, -9, 15, 180);
            let penguin6 = new Penguin(this, -3, 15, 180);
            let penguin7 = new Penguin(this, 3, 15, 180);
            let penguin8 = new Penguin(this, 9, 15, 180);
            this.add(penguin5, penguin6, penguin7, penguin8);
          }
          if (i == 2) {
            let penguin9 = new Penguin(this, 15, -9, 270);
            let penguin10 = new Penguin(this, 15, -3, 270);
            let penguin11 = new Penguin(this, 15, 3, 270);
            let penguin12 = new Penguin(this, 15, 9, 270);
            this.add(penguin9, penguin10, penguin11, penguin12);
          }
          if (i == 3) {
            let penguin13 = new Penguin(this, -15, -9, 90);
            let penguin14 = new Penguin(this, -15, -3, 90);
            let penguin15 = new Penguin(this, -15, 3, 90);
            let penguin16 = new Penguin(this, -15, 9, 90);
            this.add(penguin13, penguin14, penguin15, penguin16);
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

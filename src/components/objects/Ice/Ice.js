import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './model.obj';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

class Ice extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new OBJLoader();

        this.name = 'ice';

        loader.load(MODEL, (object) => {
            console.log(object);
            let offset = new Vector3(0.0, -3.25, 0.0);
            object.position.add(offset);

            object.rotation.set(0.0,0.0,0.0);
            object.scale.multiplyScalar(80);
            object.rotateX(-75*Math.PI/180);
            object.rotateY(-10*Math.PI/180);
            this.add(object);
        });
    }
}

export default Ice;

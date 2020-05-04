import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './land.gltf';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

class Ice extends Group {
    constructor(penguins) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'ice';

        loader.load(MODEL, (object) => {
            console.log(object);
            let offset = new Vector3(0.0, -1, 0.0);
            object.scene.scale.multiplyScalar(20);
            object.scene.position.add(offset);
            //object.position.add(offset);

            //object.rotation.set(0.0,0.0,0.0);
            //object.scale.multiplyScalar(80);
            //object.rotateX(-75*Math.PI/180);
            //object.rotateY(-10*Math.PI/180);
            this.add(object.scene);
        });
    }
}

export default Ice;

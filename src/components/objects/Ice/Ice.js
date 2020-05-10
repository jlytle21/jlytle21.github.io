import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './land.gltf';

class Ice extends Group {
    constructor(scalar) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'ice';

        loader.load(MODEL, (object) => { // load model and add to scene
            let offset = new Vector3(0.0, -1 * scalar, 0.0);
            // Scales based on parameter
            object.scene.scale.multiplyScalar(20 * scalar);
            object.scene.position.add(offset);
            this.add(object.scene);
            this.mesh = object.scene;
        });
    }

}

export default Ice;

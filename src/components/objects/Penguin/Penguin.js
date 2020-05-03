import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import MODEL from './10033_Penguin_v1_iterations-2.obj';
import MATERIAL from './10033_Penguin_v1_iterations-2.mtl';
import IMAGE from './10033_Penguin_v1_Diffuse.jpg'

class Penguin extends Group {
    constructor(parent, x, z, rotation) {
        // Call parent Group() constructor
        super();


        this.name = 'penguin';

        const mtlLoader = new MTLLoader();
        //mtlLoader.setResourcePath('./');
        //console.log(mtlLoader);
        mtlLoader.load(MATERIAL, (materials) => {
          const loader = new OBJLoader();
          loader.setMaterials(materials);
          loader.load(MODEL, (object) => {
            object.scale.divideScalar(20);
            object.rotateX(-90*Math.PI/180);
            object.rotateZ(rotation*Math.PI/180);
            object.position.x = x;
            object.position.z = z;
            object.position.y = 1;
            this.add(object);
            parent.addToUpdateList(this);
          });
        });
    }

    update(x, z) {
      this.position.x += x;
      this.position.z += z;
    }
}

export default Penguin;

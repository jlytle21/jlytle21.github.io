import { Group, Vector3 } from 'three';
import MODEL from './model.obj';
import MATERIAL from './materials.mtl';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// from https://poly.google.com/view/6S_UehMUbiW
// Credit: Hoai Nguyen
class Mosasaur extends Group {
  constructor() {
    super();
    const mtlloader = new MTLLoader();
    this.name = 'mosasaur';
    mtlloader.load(MATERIAL, (materials) => { // load object + material and add to scene
      materials.preload();
      const loader = new OBJLoader();
      loader.setMaterials(materials);

      loader.load(MODEL, (object) => {
        object.position.y = -30;
        object.position.z = -205;
        object.position.x = 0;
        object.rotation.y = -0.2;
        object.scale.multiplyScalar(50);
        this.add(object);
      });
    });
  }
}

  export default Mosasaur;

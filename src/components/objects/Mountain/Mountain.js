import { Group, Vector3 } from 'three';
import MODEL from './m.obj';
import MATERIAL from './m.mtl';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

class Mountain extends Group {
  constructor() {
    // from https://poly.google.com/view/0GzMb32v3oH
    super();

    const mtlloader = new MTLLoader();

    this.name = 'mountain';

    mtlloader.load(MATERIAL, (materials) => {
      materials.preload();
      const loader = new OBJLoader();
      loader.setMaterials(materials);

      loader.load(MODEL, (object) => {
        object.scale.multiplyScalar(3);
        object.position.x = -1000;
        object.position.z = -1000;
        object.position.y -= 10;
        object.rotation.y = 1;
        this.add(object);
      });
    });
  }
}

  export default Mountain;

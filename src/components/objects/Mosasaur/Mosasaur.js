import { Group, Vector3 } from 'three';
import MODEL from './model.obj';
import MATERIAL from './materials.mtl';
//import IMAGE from './Tex_Shark.png';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
//import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

class Mosasaur extends Group {
  constructor() {
    // from https://poly.google.com/view/6S_UehMUbiW
    super();



    const mtlloader = new MTLLoader();

    this.name = 'mosasaur';

    mtlloader.load(MATERIAL, (materials) => {
      materials.preload();
      const loader = new OBJLoader();
      loader.setMaterials(materials);

      loader.load(MODEL, (object) => {
        object.position.y = 50;
        object.scale.multiplyScalar(50);
        this.add(object);
      });
    });
  }
}

  export default Mosasaur;

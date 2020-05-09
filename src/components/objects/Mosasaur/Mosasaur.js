import { Group, Vector3 } from 'three';
import MODEL from './model.obj';
import MATERIAL from './materials.mtl';
//import IMAGE from './Tex_Shark.png';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
//import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

class Mosasaur extends Group {
  constructor() {
    // from https://poly.google.com/view/6S_UehMUbiW
    super();

    const loader = new OBJLoader();

    this.name = 'mosasaur';

    loader.load(MODEL, (object) => {
      
      this.add(object);
    });
  }
}

  export default Mosasaur;

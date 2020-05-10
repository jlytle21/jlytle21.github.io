import { Group, Vector3 } from 'three';
import MODEL from './i.obj';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

class Island extends Group {
  constructor() {
    // from https://poly.google.com/view/dBGGbCMGTRu
    super();

    this.name = 'island';

    const loader = new OBJLoader();

    loader.load(MODEL, (object) => { // load object and add to scene
      object.scale.multiplyScalar(3);
      object.position.x = -500;
      object.position.z = 500;
      object.position.y = 100;
      object.rotation.x = 30;
      this.add(object);
    });
  }
}

  export default Island;

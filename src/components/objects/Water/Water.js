import { Group, Vector3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import IMAGE1 from './diffuse.png';
import IMAGE2 from './txt_002_bump.png';
import MODEL from './Ocean.obj';
class Water extends Group {
  constructor() {
    // Call parent Group() constructor
    super();

    const loader = new OBJLoader();

    this.name = 'water';

    loader.load(MODEL, (object) => { // load object and add to scenes
      let texture1 = new TextureLoader().load(IMAGE1);
      let texture2 = new TextureLoader().load(IMAGE2);
      object.traverse((child) => {
        if (child.type == "Mesh") {
          child.material.map = texture1;
          child.material.bumpMap = texture2;
        }
      });
      object.scale.multiplyScalar(1000);
      object.position.y += 45;
      object.position.x -= 400;
      object.position.z -= 450;
      this.add(object);
    });
  }
}

export default Water;

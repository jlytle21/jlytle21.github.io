import { Group, Vector3 } from 'three';
import MODEL from './Mesh_Shark.obj';
import MATERIAL from './Mesh_Shark.mtl';
import IMAGE from './Tex_Shark.png';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

class Shark extends Group {
  constructor(scalar) {
    // Call parent Group() constructor
    super();

    const loader = new OBJLoader();

    this.name = 'shark';

    loader.load(MODEL, (object) => {
      let texture = new TextureLoader().load(IMAGE);
      object.traverse((child) => {
        if (child.type == "Mesh") {
          child.material.map = texture;
        }
      });
      object.scale.multiplyScalar(0.5);
      object.position.y = -23.7;
      this.add(object);
    });
  }
}

  export default Shark;

import { Group, Vector3, TextureLoader } from 'three';
import MODEL from './mount.obj';
import MATERIAL from './albedo.png';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

class Mountain extends Group {
  constructor() {
    // from https://sketchfab.com/3d-models/praise-the-sun-737e12518b1b4e3da8e4406d7da83b90
    super();

    let texture = new TextureLoader().load(MATERIAL);

    this.name = 'mountain';

    const loader = new OBJLoader();

    loader.load(MODEL, (object) => {
      object.traverse((child) => {
        if (child.type == "Mesh") {
          child.material.map = texture;
        }
      });
      object.scale.multiplyScalar(1000);
      object.position.y -= 12;
      object.position.x = 1000;
      object.position.z = -1000;

      this.add(object);
    });

  }
}

  export default Mountain;

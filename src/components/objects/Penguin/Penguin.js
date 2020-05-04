import { Group, Vector3, Vector2 } from 'three';
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


        // set name
        this.name = 'penguin';
        // set force
        this.netForce = new Vector3(0,0,0);
        // set velocity
        this.velocity = new Vector3(0,0,0);

        // delete unused
        delete this.up;
        delete this.rotation;
        delete this.userData;

        const mtlLoader = new MTLLoader(); // load material loader
        //mtlLoader.setResourcePath('./');
        //console.log(mtlLoader);
        mtlLoader.load(MATERIAL, (materials) => { // load material
          const loader = new OBJLoader(); // load object loader
          loader.setMaterials(materials); // set material
          loader.load(MODEL, (object) => {
            object.scale.divideScalar(20); // scale object
            object.rotateX(-90*Math.PI/180); // rotate so right way up
            object.rotateZ(rotation*Math.PI/180); // rotate so right way up
            object.position.x = x; // set position variables
            this.position.x = x;
            object.position.z = z;
            this.position.z = z;
            object.position.y = 1;
            this.position.y = 1;
            this.add(object); // add object to this
            parent.addToUpdateList(this); // add to update list
          });
        });
    }

    // apply gravitational force to penguin
    applyGravity() {
      this.updateForce(new Vector3(0, -10, 0));
    }
    // check if two penguins collide
    collide(penguin) {
      let radius = 1;
      let peng1 = this.position;
      let peng2 = penguin.position;
      if (peng1.distanceTo(peng2) + 2*radius < 1) { // update forces based on collision

        return true;
      }
      else { // do nothing if no collision
      return false;
      }
    }

    // returns location of penguin
    location() {
      return new Vector2(this.position.x, this.position.z);
    }

    // update force
    updateForce(force) {
      this.netForce.add(force);
    }
    update(x, z) {
      this.position.x += x;
      this.position.z += z;
    }
}

export default Penguin;

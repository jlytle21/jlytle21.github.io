import { Group, Vector3, Vector2 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import MODEL from './10033_Penguin_v1_iterations-2.obj';
import MATERIAL from './10033_Penguin_v1_iterations-2.mtl';
import IMAGE1 from './10033_Penguin_v1_Diffuse1.jpg';
import IMAGE2 from './10033_Penguin_v1_Diffuse2.jpg'
import IMAGE3 from './10033_Penguin_v1_Diffuse3.jpg'
import IMAGE4 from './10033_Penguin_v1_Diffuse4.jpg'

class Penguin extends Group {
    constructor(parent, x, z, rotation) {
        // Call parent Group() constructor
        super();

        //used for user selecting direction
        this.arrow = null;

        // set name
        this.name = 'penguin';
        // set force
        this.netForce = new Vector3(0,0,0);
        // set velocity
        this.velocity = new Vector3(0,0,0);
        // set penguinMass
        this.mass = 1;
        // Boolean that signifies whether or not penguin is falling off ice
        this.isFalling = false;
        // Initial coordinates of penguin
        this.coordinates = new Vector3(x, 0.35, z);
        // set player ID
        this.player = 1;

        const loader = new OBJLoader(); // load object loader
        loader.load(MODEL, (object) => {
          let texture = new TextureLoader().load(IMAGE1);
          if (rotation == 90) {
            texture = new TextureLoader().load(IMAGE2);
            this.player = 2;
          }
          if (rotation == 180) {
            texture = new TextureLoader().load(IMAGE3);
            this.player = 3;
          }
          if (rotation == 270) {
            texture = new TextureLoader().load(IMAGE4);
            this.player = 4;
          }
          object.traverse((child) => {
            if (child.type == "Mesh") {
              child.material.map = texture;
            }
          });
          object.scale.divideScalar(20); // scale object
          object.rotateX(-90*Math.PI/180); // rotate so right way up
          object.rotateZ(rotation*Math.PI/180); // rotate so right way up
          object.position.x = x; // set position variables
          object.position.z = z;
          object.position.y = 0.35;
          this.add(object); // add object to this
        });
      }

    // apply gravitational force to penguin
    applyGravity() {
      this.netForce = new Vector3(0, -60, 0);
    }


    // check if two penguins collide
    collide(penguin) {
      let radius = 1;
      let x1 = this.coordinates.clone();
      let x2 = penguin.coordinates.clone();
      if (x1.distanceTo(x2) < 2*radius) { // update velocity based on collision
        let v1 = this.velocity.clone();
        let v2 = penguin.velocity.clone();
        let v1_v2 = new Vector3(0,0,0);
        let v2_v1 = v1_v2.clone();
        let x1_x2 = v1_v2.clone();
        let x2_x1 = v1_v2.clone();

        v1_v2.subVectors(v1, v2);
        v2_v1.subVectors(v2, v1);
        x1_x2.subVectors(x1, x2);
        x2_x1.subVectors(x2, x1);

        let temp1 = v1_v2.dot(x1_x2) / (x1_x2.length() * x1_x2.length());
        let temp2 = x1_x2.clone();
        temp2.multiplyScalar(temp1);
        temp2.multiplyScalar((2*penguin.mass) / (penguin.mass + this.mass));
        this.velocity.sub(temp2);

        let temp3 = v2_v1.dot(x2_x1) / (x2_x1.length() * x2_x1.length());
        let temp4 = x2_x1.clone();
        temp4.multiplyScalar(temp3);
        temp4.multiplyScalar((2*penguin.mass) / (penguin.mass + this.mass));
        penguin.velocity.sub(temp4);

        return true;
      }
      else { // do nothing if no collision
        return false;
      }
    }


    // Method to launch penguin by setting velocity vector to user input
    launch(vector) {
      this.velocity = vector;
    }


    // update the friction element of each penguin
    // Check if penguin is falling off ice, if so no need to apply friction
    applyFriction() {
      if (this.isFalling) {
        return;
      }
      if (this.velocity.length() < 0.25) {
        this.netForce = new Vector3(0,0,0);
      }
      let velocity = this.velocity.clone();
      velocity.normalize;
      this.netForce = velocity.negate();
    }

    // returns location of penguin
    location() {
      return new Vector2(this.position.x, this.position.z);
    }

    // update force
    updateForce(force) {
      this.netForce.add(force);
    }

    // Updates position of penguin
    update(x, y, z) {
      this.position.x += x;
      this.position.y += y;
      this.position.z += z;
    }
}

export default Penguin;

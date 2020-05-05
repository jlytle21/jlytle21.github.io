import { Group, Vector3, Vector2 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
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
        // set penguinMass
        this.mass = 1;
        // Boolean that signifies whether or not penguin is falling off ice
        this.isFalling = false;
        // Initial coordinates of penguin
        this.coordinates = new Vector3(x, 1, z);

        // delete unused
        delete this.up;
        delete this.rotation;
        delete this.userData;

        const mtlLoader = new MTLLoader(); // load material loader
        mtlLoader.load(MATERIAL, (materials) => { // load material
          materials.preload();
          const loader = new OBJLoader(); // load object loader
          loader.setMaterials(materials); // set material
          loader.load(MODEL, (object) => {
            let texture = new TextureLoader().load(IMAGE);
            object.traverse((child) => {
              if (child.type == "Mesh") {
                child.material.map = texture;
              }
            });
            object.scale.divideScalar(20); // scale object
            object.rotateX(-90*Math.PI/180); // rotate so right way up
            object.rotateZ(rotation*Math.PI/180); // rotate so right way up
            object.position.x = x; // set position variables
            //this.position.x = x;
            object.position.z = z;
            //this.position.z = z;
            object.position.y = 1;
            //this.position.y = 1;
            this.add(object); // add object to this
          });
        });
    }

    // apply gravitational force to penguin
    applyGravity() {
      this.netForce = new Vector3(0, -60, 0);
    }


    // check if two penguins collide
    collide(penguin) {
      let radius = 1;
      let peng1 = this.coordinates;
      let peng2 = penguin.coordinates;
      let v1_v2 = new Vector3(0,0,0);
      let v2_v1 = v1_v2.clone();
      let x1_x2 = v1_v2.clone();
      let x2_x1 = v1_v2.clone();
      if (peng1.distanceTo(peng2) < 2*radius) { // update velocity based on collision
        console.log("collision");

        v1_v2.subVectors(this.velocity, penguin.velocity);
        v2_v1.subVectors(penguin.velocity, this.velocity);
        x1_x2.subVectors(peng1, peng2);
        x2_x1.subVectors(peng2, peng1);
        let temp1 = v1_v2.clone();
        temp1.dot(x1_x2);
        temp1.divideScalar(x1_x2.length() * x1_x2.length());
        temp1.multiply(x1_x2);
        temp1.multiplyScalar(this.mass);
        

       

        this.velocity.sub(temp1);
        let temp2 = v2_v1.clone();
        temp2.dot(x2_x1);
        temp2.divideScalar(x2_x1.length() * x2_x1.length());
        temp2.multiply(x2_x1);
        temp2.multiplyScalar(penguin.mass);
        penguin.velocity.sub(temp2);

        
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

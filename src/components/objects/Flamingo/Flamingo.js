import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './Flamingo.glb';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

class Flamingo extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // flamingo from https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html
        const loader = new GLTFLoader();
        loader.load(MODEL, function ( gltf ) {
          flamingo = gltf.scene.children[ 0 ];
          let s = 0.35;
          flamingo.scale.set( s, s, s );
          flamingo.position.y = 15;
          flamingo.rotation.y = - 1;
          flamingo.castShadow = true;
          flamingo.receiveShadow = true;
          let mixer = new AnimationMixer( this.flamingo );
          mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
          mixers.push( mixer );
          this.add(this.flamingo);
        });
    }

}

export default Flamingo;

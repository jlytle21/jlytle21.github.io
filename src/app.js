/**
* app.js
*
* This is the first file loaded. It sets up the Renderer,
* Scene and Camera. It also starts the render loop and
* handles window resizes.
*
*/
import { WebGLRenderer, PerspectiveCamera, Vector3, Texture, Scene, MeshBasicMaterial, PlaneGeometry, Mesh, OrthographicCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
import * as Dat from 'dat.gui';

class Welcome { // class to create popup welcome message
  constructor() { // with help from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_coming_soon
    this.backgroundImage = document.createElement("DIV");
    this.backgroundImage.setAttribute("id", "bgimage");
    document.body.appendChild(this.backgroundImage);
    this.explore = document.createElement("DIV");
    this.explore.setAttribute("id", "explore");
    document.getElementById("bgimage").appendChild(this.explore);
    this.instructions2 = document.createElement("p");
    this.instructions2.appendChild(document.createTextNode("How To Explore The Scene:"));
    this.instructions3 = document.createElement("p");
    this.instructions3.appendChild(document.createTextNode("Press '1' to view the scene from above"));
    this.instructions4 = document.createElement("p");
    this.instructions4.appendChild(document.createTextNode("Use your mouse to click and drag to explore the scene"));
    this.instructions5 = document.createElement("p");
    this.instructions5.appendChild(document.createTextNode("Zoom in and out by scrolling"));
    document.getElementById("explore").appendChild(this.instructions2);
    document.getElementById("explore").appendChild(this.instructions3);
    document.getElementById("explore").appendChild(this.instructions4);
    document.getElementById("explore").appendChild(this.instructions5);
    this.message = document.createElement("DIV");
    this.message.setAttribute("id", "message");
    document.getElementById("bgimage").appendChild(this.message);
    this.name = document.createElement("h1");
    this.name.appendChild(document.createTextNode("Knockout"));
    document.getElementById("message").appendChild(this.name);
    this.divide = document.createElement("hr");
    document.getElementById("message").appendChild(this.divide);
    this.instructions = document.createElement("p");
    this.instructions.appendChild(document.createTextNode("How To Play: Knock all of your opponents' penguins off the ice before they knock off yours!"));
    document.getElementById("message").appendChild(this.instructions);

    this.numPlayers = document.createElement("p");
    this.numPlayers.appendChild(document.createTextNode("Select Number of Players"));
    document.getElementById("message").appendChild(this.numPlayers);

    this.two = document.createElement("BUTTON");
    this.two.setAttribute("id", "two");
    this.two.innerHTML = "2 Players";
    document.getElementById("message").appendChild(this.two);
    this.three = document.createElement("BUTTON");
    this.three.setAttribute("id", "three");
    this.three.innerHTML = "3 Players";
    document.getElementById("message").appendChild(this.three);
    this.four = document.createElement("BUTTON");
    this.four.setAttribute("id", "four");
    this.four.innerHTML = "4 Players";
    document.getElementById("message").appendChild(this.four);

    this.credits = document.createElement("DIV");
    this.credits.setAttribute("id", "credits");
    document.getElementById("bgimage").appendChild(this.credits);
    this.names = document.createElement("p");
    this.names.innerHTML = "Created by Jonah Lytle, Jacob Schachner & Richard Wolf";
    this.credits.appendChild(this.names);

    // style the page
    this.two.style = "background-color: purple; border: none; color: white; padding: 16px 32px; text-align: center; display: inline-block; font-size: 16px; margin: 4px 2px; transition-duration: 0.4s; cursor: pointer; font-family: 'Courier New', Courier, monospace;";
    this.three.style = "background-color: green; border: none; color: white; padding: 16px 32px; text-align: center; display: inline-block; font-size: 16px; margin: 4px 2px; transition-duration: 0.4s; cursor: pointer; font-family: 'Courier New', Courier, monospace;";
    this.four.style = "background-color: blue; border: none; color: white; padding: 16px 32px; text-align: center; display: inline-block; font-size: 16px; margin: 4px 2px; transition-duration: 0.4s; cursor: pointer; font-family: 'Courier New', Courier, monospace;";

    this.message.style = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;"
    this.explore.style = "position: absolute; top: 0; left: 16px; font-size: 10px;";
    this.divide.style = "margin: auto; width: 40%;";
    this.credits.style = "position: absolute; bottom: 0; left: 16px; font-size: 10px;"
    this.backgroundImage.style = "background-color: black; height: 100%; width: 100%; z-index: -1; opacity: 1; background-position: center; background-size: cover; position: fixed; color: white; font-family: 'Courier New', Courier, monospace; font-size: 25px;"
  }
  remove() { // remove the welcome page
    document.getElementById("bgimage").remove();
  }
}

// Initialize core ThreeJS components
let welcomeMessage = new Welcome(); // welcome page
let camera; // initialize camera
let scene; // initialize scene
let renderer; // initialize renderer


// function to start game
function startGame() {

  // Set up camera
  camera.position.set(70, 100, 70);
  camera.lookAt(new Vector3(0, 0, 0));

  // Set up renderer, canvas, and minor CSS adjustments
  renderer.setPixelRatio(window.devicePixelRatio);
  const canvas = renderer.domElement;
  canvas.style.display = 'block'; // Removes padding below canvas
  document.body.style.margin = 0; // Removes margin around page
  document.body.style.overflow = 'hidden'; // Fix scrolling
  document.body.appendChild(canvas);

  // Set up controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 400;
  controls.maxPolarAngle = Math.PI/2; // don't let go below ground
  controls.update();

  // Render loop
  const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp, camera);
    window.requestAnimationFrame(onAnimationFrameHandler);
  };

  window.requestAnimationFrame(onAnimationFrameHandler);
  // Resize Handler
  const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  windowResizeHandler();
  window.addEventListener('resize', windowResizeHandler, false);
}

// create the scene
function createScene(numPlayers) {
    camera = new PerspectiveCamera(); // create camera
    scene = new SeedScene(numPlayers, camera); // create scene
    renderer = new WebGLRenderer({ antialias: true }); // create renderer
    startGame();

}

// determine which button was clicked -- how many players to initialize game with
document.getElementById("two").addEventListener("mousedown", function() {
  createScene(2);
  welcomeMessage.remove();
});
document.getElementById("three").addEventListener("mousedown", function() {
  createScene(3);
  welcomeMessage.remove();
});
document.getElementById("four").addEventListener("mousedown", function() {
  createScene(4);
  welcomeMessage.remove();
});
window.addEventListener("keydown", (e) => { // can also click number button
  if (event.key == "2" && scene == undefined) {
    createScene(2);
    welcomeMessage.remove();
  }
  if (event.key == "3" && scene == undefined) {
    createScene(3);
    welcomeMessage.remove();
  }
  if (event.key == "4" && scene == undefined) {
    createScene(4);
    welcomeMessage.remove();
  }

});

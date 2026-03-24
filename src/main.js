import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import gsap from "gsap";
import { projects } from "./data/projects";
import * as fun from './planets/functions';

const isMobile = window.innerWidth < 768;
let selectedObject = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tooltip = document.getElementById("tooltip");
const tooltipImg = document.getElementById("tooltip-img");
const tooltipTitle = document.getElementById("tooltip-title");
const tooltipDesc = document.getElementById("tooltip-desc");

let githubAvatar = "";

fetch("https://api.github.com/users/Lord-Dexter")
  .then(res => res.json())
  .then(data => {
    githubAvatar = data.avatar_url;
  });

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#bg'), antialias : true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
scene.fog = new THREE.FogExp2(0x000000, 0.002);
renderer.setClearColor(0x000000);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 50;

if (isMobile) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}

const starCount = isMobile ? 2000 : 5000;

if (isMobile) {
  controls.enableDamping = false;
  controls.minDistance = 15;
  controls.maxDistance = 40;
}



window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const sunLight = new THREE.PointLight(0xffaa00, 3, 200);
scene.add(sunLight);

sunLight.position.set(0,0,0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({
  color: 0xffaa00,
  emissive: 0xff5500,
  emissiveIntensity: 3.018
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

sun.userData = {
  type: "sun",
  title: "Lord-Dexter",
  description: "View GitHub Profile"
};

const planets = [];

projects.forEach(p => {
  const planetObj = fun.createPlanet(scene, p);
  planets.push(planetObj);
});

projects.forEach(p => fun.createOrbit(scene, p.orbitRadius));

fun.createStarField(scene);

window.addEventListener('click', (event) => {

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const clickable = [sun, ...planets.map(p => p.planet)];
  const intersects = raycaster.intersectObjects(clickable);

  // ❌ Nothing clicked → hide tooltip
  if (intersects.length === 0) {
    tooltip.style.display = "none";
    selectedObject = null;
    return;
  }

  const clicked = intersects[0].object;

  // 📱 MOBILE BEHAVIOR
  if (isMobile) {

    // Same object tapped twice → OPEN LINK
    if (selectedObject === clicked) {

      // SUN
      if (clicked === sun) {
        window.open('https://github.com/Lord-Dexter', '_blank');
      }

      // PLANET
      const planetData = planets.find(p => p.planet === clicked);
      if (planetData) {
        window.open(planetData.github, "_blank");
      }

      return;
    }

    // First tap → SHOW TOOLTIP
    selectedObject = clicked;

    tooltip.style.display = "block";

    let title = "";
    let desc = "";
    let img = "";

    if (clicked === sun) {
      title = "Lord-Dexter";
      desc = "View GitHub Profile";
      img = githubAvatar;
    }

    const planetData = planets.find(p => p.planet === clicked);
    if (planetData) {
      title = planetData.name;
      desc = planetData.description;
      img = "";
    }

    tooltipTitle.textContent = title;
    tooltipDesc.textContent = desc;

    if (img) {
      tooltipImg.src = img;
      tooltipImg.style.display = "block";
    } else {
      tooltipImg.style.display = "none";
    }

    // Position tooltip (IMPORTANT: world position)
    const vector = new THREE.Vector3();
    clicked.getWorldPosition(vector);

    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";

    return;
  }

  // 💻 DESKTOP BEHAVIOR (unchanged)
  if (clicked === sun) {
    gsap.to(camera.position, {
      duration: 1.5,
      x: 0,
      y: 0,
      z: 8,
      ease: "power2.out"
    });

    setTimeout(() => {
      window.open('https://github.com/Lord-Dexter', '_blank');
    }, 1500);
  }

  const planetData = planets.find(p => p.planet === clicked);
  if (planetData) {

    gsap.to(camera.position, {
      duration: 1.5,
      x: clicked.position.x,
      y: clicked.position.y,
      z: clicked.position.z + 5,
      ease: "power2.out"
    });

    setTimeout(() => {
      window.open(planetData.github, "_blank");
    }, 1500);
  }

});

if (!isMobile) {
  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hoverables = [sun, ...planets.map(p => p.planet)];
    const intersects = raycaster.intersectObjects(hoverables);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      tooltip.style.display = "block";

      let title = "";
      let desc = "";
      let img = "";

      if (object === sun) {
        title = "Lord-Dexter";
        desc = "View GitHub Profile";
        img = githubAvatar;
      }

      const planetData = planets.find(p => p.planet === object);
      if (planetData) {
        title = planetData.name;
        desc = planetData.description;
        img = ""; // optional image later
      }
      
      tooltipTitle.textContent = title;
      tooltipDesc.textContent = desc;

      if (img) {
        tooltipImg.src = img;
        tooltipImg.style.display = "block";
      } else {
        tooltipImg.style.display = "none";
      }

      const vector = new THREE.Vector3();
      object.getWorldPosition(vector);
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

      tooltip.style.left = x + "px";
      tooltip.style.top = y + "px";
    } else {
      tooltip.style.display = "none";
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  sun.rotation.y += 0.005;
  planets.forEach(p => {
    p.pivot.rotation.y += p.speed;
    p.planet.rotation.y += 0.01;
  });
  composer.render();
  controls.update();
}
animate();
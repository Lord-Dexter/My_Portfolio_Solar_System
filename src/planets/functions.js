import * as THREE from "three";

export function createPlanet(scene, data) {

  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const geometry = new THREE.SphereGeometry(data.size, 32, 32);

  const material = new THREE.MeshStandardMaterial({
    color: data.color,
    roughness: 0.7,
    metalness: 0.1
  });

  const planet = new THREE.Mesh(geometry, material);

  planet.position.x = data.orbitRadius;

  pivot.add(planet);

  return {
  planet,
  pivot,
  speed: data.speed,
  github: data.github,
  name: data.name,
  description: data.description
};
}

export function createOrbit(scene, radius) {
    const geometry = new THREE.RingGeometry(radius-0.05, radius+0.05, 64);

    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
    });

    const ring = new THREE.Mesh(geometry, material);

    ring.rotation.x = Math.PI/2;

    scene.add(ring);
}

export function createStarField(scene) {
  const starCount = 5000;

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for(let i = 0; i < starCount; i ++) {
    positions.push(
      THREE.MathUtils.randFloatSpread(600),
      THREE.MathUtils.randFloatSpread(600),
      THREE.MathUtils.randFloatSpread(600)
    );
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    sizeAttenuation: true
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}
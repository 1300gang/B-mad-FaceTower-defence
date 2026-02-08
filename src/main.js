import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';

const mindarThree = new MindARThree({
  container: document.querySelector("#container"),
});

const { renderer, scene, camera } = mindarThree;

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

/**
 * Story A.2: Head Occluder Setup & Alignment
 * We use the built-in face mesh and a placeholder sphere for head occlusion.
 */
// Face mesh occluder
const faceMesh = mindarThree.addFaceMesh();
faceMesh.material.colorWrite = false;
faceMesh.visible = true;
scene.add(faceMesh);

// Head ellipsoid occluder for the rest of the head
const headGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const headMaterial = new THREE.MeshStandardMaterial({ colorWrite: false });
const headOccluder = new THREE.Mesh(headGeometry, headMaterial);
headOccluder.scale.set(1, 1.3, 1.1); // Roughly head shaped
headOccluder.position.set(0, 0, -0.05); // Offset to sit behind the face

// Anchor to the forehead/between eyes (landmark 168)
const headAnchor = mindarThree.addAnchor(168);
headAnchor.group.add(headOccluder);

/**
 * Story A.1: Project Setup & Initial Scene
 * Basic anchor to verify tracking works.
 */
// Anchor 1 is roughly the nose tip
const anchor = mindarThree.addAnchor(1);
const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
anchor.group.add(cube);

const start = async () => {
  try {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("AR Start failed:", error);
    // In a real app, we would show a user-friendly message here
  }
}

start();

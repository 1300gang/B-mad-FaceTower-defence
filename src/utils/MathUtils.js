import * as THREE from 'three';

export const getDistance = (v1, v2) => {
  return v1.distanceTo(v2);
};

export const getDirection = (from, to) => {
  return new THREE.Vector3().subVectors(to, from).normalize();
};

export const lerpVectors = (v1, v2, alpha) => {
  return new THREE.Vector3().lerpVectors(v1, v2, alpha);
};

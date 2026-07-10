import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useSettingsStore } from '../../store/settingsStore';

const MODEL_URL = '/kaaba.gltf';

// Full-bleed rotating 3D viewer shown in the Clock widget while the azan
// plays. Owns its own three.js renderer; everything is disposed on unmount.
export function KaabaModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useSettingsStore((s) => s.azanKaabaScale);
  // Read by the animation loop each frame so slider changes apply live
  // without tearing down the renderer.
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xfff3d6, 0.8);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    const pivot = new THREE.Group();
    scene.add(pivot);

    let disposed = false;
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        // Center the model on the pivot and frame it for the camera.
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        pivot.add(model);
        // Bounding-sphere radius, then pull back far enough for the whole
        // sphere to fit the vertical fov with some margin.
        const radius = size.length() / 2;
        const distance = (radius / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 0.95;
        camera.position.set(0, distance * 0.3, distance);
        camera.lookAt(0, 0, 0);
      },
      undefined,
      (err) => console.warn('Kaaba model failed to load:', err),
    );

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    renderer.setAnimationLoop(() => {
      pivot.rotation.y += 0.006;
      pivot.scale.setScalar(scaleRef.current);
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      observer.disconnect();
      renderer.setAnimationLoop(null);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v instanceof THREE.Texture) v.dispose();
            });
            m.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}

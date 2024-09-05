import {
  forwardRef,
  useImperativeHandle,
  useRef,
  RefObject,
} from "react";
import { memo, useEffect, useState } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/surfaceVert.glsl";
import fragmentShader from "./shaders/surfaceFrag.glsl";

type PlaneType = THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

const loader = new THREE.TextureLoader();
const cmap = loader.load('/all_colormaps.png');
cmap.minFilter = THREE.NearestFilter;
cmap.magFilter = THREE.NearestFilter;

const geometry = new THREE.PlaneGeometry(4, 2, 64 * 4, 32 * 4);

type Props = {};

const createCanvasTextureFromImage = async (imageUrl: string, index: number): Promise<THREE.CanvasTexture> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle cross-origin issues
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = 900; // Width of the canvas
        canvas.height = 450; // Height of the canvas
        context.drawImage(img, index * 900, 0, 900, 450, 0, 0, 900, 450);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        resolve(texture);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = (error) => reject(error);
    img.src = imageUrl;
  });
};

export type SurfaceLayerRef = {
  type: RefObject<PlaneType>,
  tick: (weight: number, uSphereWrapAmount: number) => void,
};

const SurfaceLayer = memo(
  forwardRef<SurfaceLayerRef, Props>(({ }, ref) => {
    console.log('creating SurfaceLayer component');
    const surface_layer_ref = useRef<PlaneType>(null);

    const [windowIndex, setWindowIndex] = useState(0);

    const materialRef = useRef(new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      wireframe: false,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uFrameWeight: { value: 0.0 },
        uSphereWrapAmount: { value: 0.0 },
        uHeightDisplacement: { value: 0.2 },
        uLayerHeight: { value: 0.0 },
        uLayerOpacity: { value: 0.0 },
        thisDataTexture: { value: null },
        nextDataTexture: { value: null },
        textureTimesteps: { value: null },
        thisDataMin: { value: new Float32Array(1) },
        thisDataMax: { value: new Float32Array(1) },
        nextDataMin: { value: null },
        nextDataMax: { value: null },
        referenceHeightTexture: { value: null },
        referenceDataMin: { value: null },
        referenceDataMax: { value: null },
        referenceDataHeightFlag: { value: false },
        colorMap: { value: cmap },
        colorMapIndex: { value: 0.0 },
      },
    }));

    const imageUrl = 'http://localhost:5173/data_textures/2024-08-04_00/aqi_2024-08-04_00_CAMS_global.chunk_1_of_3.webp';

    useEffect(() => {
      const fetchAndUpdateTextures = async () => {
        try {
          const thisCanvasTexture = await createCanvasTextureFromImage(imageUrl, windowIndex);
          const nextCanvasTexture = await createCanvasTextureFromImage(imageUrl, windowIndex + 1);

          if (materialRef.current) {
            materialRef.current.uniforms.thisDataTexture.value = thisCanvasTexture;
            materialRef.current.uniforms.thisDataTexture.needsUpdate = true;
            materialRef.current.uniforms.nextDataTexture.value = nextCanvasTexture;
            materialRef.current.uniforms.nextDataTexture.needsUpdate = true;
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
      };

      fetchAndUpdateTextures();
    }, [windowIndex, imageUrl]);

    useEffect(() => {
      const interval = setInterval(() => {
        setWindowIndex(prevIndex => prevIndex + 1);
      }, 1000); // Update every second

      return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    const tick = (weight: number, uSphereWrapAmount: number) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uFrameWeight.value = weight % 1;
        materialRef.current.uniforms.uSphereWrapAmount.value = uSphereWrapAmount;
        materialRef.current.uniforms.uLayerOpacity.value = 1.0;
      }
    };

    useImperativeHandle(ref, () => ({
      type: surface_layer_ref,
      tick,
    }));

    return (
      <mesh
        ref={surface_layer_ref}
        geometry={geometry}
        material={materialRef.current}
        renderOrder={1}
      />
    );
  })
);

export { SurfaceLayer };
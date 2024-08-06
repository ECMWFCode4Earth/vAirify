import {
    forwardRef,
    useImperativeHandle,
    useRef,
    memo,
    useEffect,
    useCallback,
  } from "react";
  import * as THREE from "three";
  import vertexShader from "./shaders/surfaceVert.glsl";
  import fragmentShader from "./shaders/surfaceFrag.glsl";
  
  type PlaneType = THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  
  const loader = new THREE.TextureLoader();
  const cmap = loader.load('/all_colormaps.png');
  const lsm = loader.load('/NaturalEarthCoastline2.jpg');
  cmap.minFilter = THREE.NearestFilter;
  cmap.magFilter = THREE.NearestFilter;
  lsm.minFilter = THREE.NearestFilter;
  lsm.magFilter = THREE.NearestFilter;


  const geometry = new THREE.PlaneGeometry(4, 2, 64 * 4, 32 * 4);
  
  const createCanvasTextureFromFullImage = async (imageUrl: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Handle cross-origin issues
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        if (context) {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
  
          resolve(canvas);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = (error) => reject(error);
      img.src = imageUrl;
    });
  };
  
  const createCanvasTextureFromCanvas = (canvas: HTMLCanvasElement, index: number): THREE.CanvasTexture => {
    const context = canvas.getContext('2d');
    if (context) {
      const textureCanvas = document.createElement('canvas');
      const textureContext = textureCanvas.getContext('2d');
  
      textureCanvas.width = 900; // Width of the texture canvas
      textureCanvas.height = 450; // Height of the texture canvas
      textureContext.drawImage(canvas, index * 900, 0, 900, 450, 0, 0, 900, 450);
  
      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //   texture.minFilter = THREE.NearestFilter;
    //   texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      return texture;
    } else {
      throw new Error('Failed to get texture canvas context');
    }
  };
  
  export type SurfaceLayerRef = {
    type: RefObject<PlaneType>,
    tick: (weight: number, uSphereWrapAmount: number) => void,
  };
  
  const SurfaceLayer = memo(
    forwardRef<SurfaceLayerRef, {}>(({}, ref) => {
      console.log('creating SurfaceLayer component');
      const surface_layer_ref = useRef<PlaneType>(null);
  
      const materialRef = useRef(new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        wireframe: false,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uFrameWeight: { value: 0 },
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
          lsmTexture: { value: lsm },
        },
      }));
  
      const imageUrl = 'http://localhost:5173/data_textures/2024-08-04_00/aqi_2024-08-04_00_CAMS_global.chunk_1_of_3.webp';
  
      const fullImageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
      const fetchAndUpdateTextures = useCallback(async () => {
        try {
          if (!fullImageCanvasRef.current) {
            // Load the full image and draw it to a single canvas
            const fullCanvas = await createCanvasTextureFromFullImage(imageUrl);
            fullImageCanvasRef.current = fullCanvas;
          }
  
          const canvas = fullImageCanvasRef.current;
          if (canvas) {
            const thisCanvasTexture = createCanvasTextureFromCanvas(canvas, windowIndexRef.current);
            const nextCanvasTexture = createCanvasTextureFromCanvas(canvas, windowIndexRef.current + 1);
  
            if (materialRef.current) {
              materialRef.current.uniforms.thisDataTexture.value = thisCanvasTexture;
              materialRef.current.uniforms.nextDataTexture.value = nextCanvasTexture;
              materialRef.current.uniforms.thisDataTexture.needsUpdate = true;
              materialRef.current.uniforms.nextDataTexture.needsUpdate = true;
            }
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }, [imageUrl]);
  
      const windowIndexRef = useRef(0);
      const elapsedTimeRef = useRef(0);
  
      useEffect(() => {
        fetchAndUpdateTextures();
      }, [fetchAndUpdateTextures]);
  
      useEffect(() => {
        const interval = setInterval(() => {
          elapsedTimeRef.current += 0.03;
  
          if (elapsedTimeRef.current >= 1) {
            if (windowIndexRef.current >= 14.) {
              windowIndexRef.current = 0; // Reset windowIndex
            } else {
              windowIndexRef.current += 1;
            }
            elapsedTimeRef.current = 0; // Reset elapsedTime
            fetchAndUpdateTextures(); // Update textures when the window index changes
          }
  
          const currentTime = elapsedTimeRef.current;
          const weight = currentTime % 1; // Value between 0 and 1
          if (materialRef.current) {
            materialRef.current.uniforms.uFrameWeight.value = weight;
            materialRef.current.uniforms.uFrameWeight.needsUpdate = true;
          }
        }, 1);
  
        return () => clearInterval(interval); // Cleanup on component unmount
      }, [fetchAndUpdateTextures]);
  
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
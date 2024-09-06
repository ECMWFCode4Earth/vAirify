import {
  forwardRef,
  useImperativeHandle,
  useRef,
  memo,
  useCallback,
} from "react";
import * as THREE from "three";
import vertexShader from "./shaders/surfaceVert.glsl";
import fragmentShader from "./shaders/surfaceFrag.glsl";
import { useForecastContext } from '../../context';
import { gsap } from 'gsap';

type PlaneType = THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

type SurfaceLayerProps = {
  forecastData: Record<string, ForecastResponseDto[]>;
  summarizedMeasurementData: Record<string, MeasurementSummaryResponseDto[]>;
};

export type SurfaceLayerRef = {
  type: React.RefObject<PlaneType>;
  tick: (weight: number, uSphereWrapAmount: number) => void;
  changeProjection: (globeState: boolean) => void;
};

// Preload textures globally so they are not reloaded during re-renders
const loader = new THREE.TextureLoader();
const cmap = loader.load('/all_colormaps.png');
const lsm = loader.load('/NaturalEarthCoastline2.jpg');
const height = loader.load('/gebco_08_rev_elev_2k_HQ.jpg');

cmap.minFilter = THREE.NearestFilter;
cmap.magFilter = THREE.NearestFilter;
lsm.minFilter = THREE.NearestFilter;
lsm.magFilter = THREE.NearestFilter;
height.minFilter = THREE.NearestFilter;
height.magFilter = THREE.NearestFilter;

const geometry = new THREE.PlaneGeometry(4, 2, 64 * 4, 32 * 4);

const createCanvasTextureFromMultipleImages = async (imageUrls: string[]): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const images: HTMLImageElement[] = [];
    let imagesLoaded = 0;

    // Helper function to handle image loading
    const onLoadImage = () => {
      imagesLoaded++;
      if (imagesLoaded === imageUrls.length) {
        // All images are loaded, now concatenate them
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          const singleImageWidth = images[0].width;
          const singleImageHeight = images[0].height;

          // Set the canvas width and height to accommodate all images horizontally
          canvas.width = singleImageWidth * imageUrls.length;
          canvas.height = singleImageHeight;

          // Draw each image side by side
          images.forEach((img, index) => {
            context.drawImage(img, index * singleImageWidth, 0);
          });

          resolve(canvas);
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      }
    };

    // Load all images
    imageUrls.forEach((url) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = onLoadImage;
      img.onerror = (error) => reject(error);
      img.src = url;
      images.push(img);
    });
  });
};

const createCanvasTextureFromCanvas = (canvas: HTMLCanvasElement, index: number): THREE.CanvasTexture => {
  const context = canvas.getContext("2d");
  if (context) {
    const textureCanvas = document.createElement("canvas");
    const textureContext = textureCanvas.getContext("2d");

    textureCanvas.width = 900; // Width of the texture canvas
    textureCanvas.height = 450; // Height of the texture canvas
    textureContext.drawImage(canvas, index * 900, 0, 900, 450, 0, 0, 900, 450);

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
  } else {
    throw new Error("Failed to get texture canvas context");
  }
};

const SurfaceLayer = memo(
  forwardRef<SurfaceLayerRef, SurfaceLayerProps>(
    ({ forecastData, summarizedMeasurementData }, ref) => { // Receive isTimeRunning as a prop
      const surface_layer_ref = useRef<PlaneType>(null);
      const materialRef = useRef(
        new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          wireframe: false,
          transparent: true,
          side: THREE.DoubleSide,
          uniforms: {
            uFrame: { value: 0 },
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
            referenceHeightTexture: { value: height },
            referenceDataMin: { value: null },
            referenceDataMax: { value: null },
            referenceDataHeightFlag: { value: false },
            colorMap: { value: cmap },
            colorMapIndex: { value: 0.0 },
            lsmTexture: { value: lsm },
          },
        })
      );

      const fullImageCanvasRef = useRef<HTMLCanvasElement | null>(null);
      const windowIndexRef = useRef(0);

      const { forecastDetails } = useForecastContext();
      const forecastBaseDate = forecastDetails.forecastBaseDate.toFormat('yyyy-MM-dd_HH');
      // const imageUrl = `http://localhost:5173/data_textures/${forecastBaseDate}/aqi_${forecastBaseDate}_CAMS_global.chunk_1_of_3.webp`;

      const imageUrls = [
        `http://localhost:5173/data_textures/${forecastBaseDate}/aqi_${forecastBaseDate}_CAMS_global.chunk_1_of_3.webp`,
        `http://localhost:5173/data_textures/${forecastBaseDate}/aqi_${forecastBaseDate}_CAMS_global.chunk_2_of_3.webp`,
        `http://localhost:5173/data_textures/${forecastBaseDate}/aqi_${forecastBaseDate}_CAMS_global.chunk_3_of_3.webp`,
      ];

      const fetchAndUpdateTextures = useCallback(async () => {
        try {
          if (!fullImageCanvasRef.current) {
            const fullCanvas = await createCanvasTextureFromMultipleImages(imageUrls);
            fullImageCanvasRef.current = fullCanvas;
          }

          const canvas = fullImageCanvasRef.current;
          if (canvas) {
            const thisCanvasTexture = createCanvasTextureFromCanvas(
              canvas,
              windowIndexRef.current
            );
            const nextCanvasTexture = createCanvasTextureFromCanvas(
              canvas,
              windowIndexRef.current + 1
            );

            if (materialRef.current) {
              materialRef.current.uniforms.thisDataTexture.value = thisCanvasTexture;
              materialRef.current.uniforms.nextDataTexture.value = nextCanvasTexture;
            }
          }
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }, [imageUrls]);

      fetchAndUpdateTextures()

      // Handle the tick function to externally control weight and sphere wrapping
      const tick = (sliderValue: number, uSphereWrapAmount: number) => {
        if (materialRef.current) {


          if (windowIndexRef.current != Math.floor(sliderValue)) {
            windowIndexRef.current = Math.floor(sliderValue); // Loop through a max of 15 windows
            fetchAndUpdateTextures(); // Fetch and update textures on each new frame
          }

          // const currentTime = elapsedTimeRef.current;
          const weight = sliderValue % 1; // Value between 0 and 1

          if (materialRef.current) {
            materialRef.current.uniforms.uFrameWeight.value = weight;
          }

          // materialRef.current.uniforms.uFrameWeight.value = weight % 1;
          // materialRef.current.uniforms.uSphereWrapAmount.value = uSphereWrapAmount;
          // materialRef.current.uniforms.uLayerOpacity.value = 1.0;
        }
      };

      const changeProjection = (globeState: boolean) => {
        if (materialRef.current) {
          if ( globeState ) {
            gsap.to(materialRef.current.uniforms.uSphereWrapAmount, { value: 1.0, duration: 2 });
          } else {
            gsap.to(materialRef.current.uniforms.uSphereWrapAmount, { value: 0.0, duration: 2 });
          } 
        }
      };


      useImperativeHandle(ref, () => ({
        type: surface_layer_ref,
        tick,
        changeProjection,
      }));
      return (
        <mesh
          ref={surface_layer_ref}
          geometry={geometry}
          material={materialRef.current}
          renderOrder={1}
        />
      );
    }
  )
);

export { SurfaceLayer };

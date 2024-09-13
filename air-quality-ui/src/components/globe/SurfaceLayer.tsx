import { gsap } from 'gsap'
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef, // Import useEffect
} from 'react'
import * as THREE from 'three'

import fragmentShader from './shaders/surfaceFrag.glsl'
import vertexShader from './shaders/surfaceVert.glsl'
import { useDataTextures } from './useDataTextures'
import { useForecastContext } from '../../context'

// const API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL

const shaderUniforms = {
  uSphereWrapAmount: { value: 0.0 },
  uFrameWeight: { value: 0.5 },
  uFrame: { value: 0.0 },
}

type PlaneType = THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>

type SurfaceLayerProps = {
  isFilterNearest: boolean
  isTimeInterpolation: boolean
  selectedVariable: string
}

export type SurfaceLayerRef = {
  type: React.RefObject<PlaneType>
  tick: (weight: number) => void
  changeProjection: (globeState: boolean) => void
  changeFilter: (filterState: boolean) => void
  changeTimeInterpolation: (timeInterpolationState: boolean) => void
}

// Preload textures globally so they are not reloaded during re-renders
const loader = new THREE.TextureLoader()
const cmap = loader.load('/all_colormaps.png')
const lsm = loader.load('/NaturalEarthCoastline2.jpg')
const height = loader.load('/gebco_08_rev_elev_2k_HQ.jpg')

cmap.minFilter = THREE.NearestFilter
cmap.magFilter = THREE.NearestFilter
lsm.minFilter = THREE.NearestFilter
lsm.magFilter = THREE.NearestFilter
height.minFilter = THREE.NearestFilter
height.magFilter = THREE.NearestFilter

const geometry = new THREE.PlaneGeometry(4, 2, 64 * 4, 32 * 4)

const SurfaceLayer = memo(
  forwardRef<SurfaceLayerRef, SurfaceLayerProps>(
    ({ isFilterNearest, isTimeInterpolation, selectedVariable }, ref) => {
      const surface_layer_ref = useRef<PlaneType>(null)
      const materialRef = useRef(
        new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          wireframe: false,
          transparent: true,
          side: THREE.DoubleSide,
          uniforms: {
            uFrame: { value: 0 },
            uFrameWeight: { value: 0.0 },
            uTimeInterpolation: { value: isTimeInterpolation },
            uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
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
            uVariableIndex: { value: null },
          },
        }),
      )

      const variableIndex =
        selectedVariable === 'aqi'
          ? 1
          : selectedVariable === 'pm2_5'
            ? 2
            : selectedVariable === 'pm10'
              ? 3
              : selectedVariable === 'o3'
                ? 4
                : selectedVariable === 'no2'
                  ? 5
                  : selectedVariable === 'so2'
                    ? 6
                    : undefined
      materialRef.current.uniforms.uVariableIndex.value = variableIndex
      console.log(variableIndex)

      const windowIndexRef = useRef(0)

      const { forecastDetails } = useForecastContext()
      const forecastBaseDate =
        forecastDetails.forecastBaseDate.toFormat('yyyy-MM-dd_HH')

      const { fetchAndUpdateTextures, updateTextureFilter } = useDataTextures(
        forecastBaseDate,
        selectedVariable,
      )

      useEffect(() => {
        fetchAndUpdateTextures(
          0,
          1,
          'reset',
          isFilterNearest ? 'nearest' : 'linear',
          true,
          materialRef,
        )
      }, [selectedVariable])

      // Handle the tick function to externally control weight and sphere wrapping
      const tick = (sliderValue: number) => {
        if (materialRef.current) {
          if (windowIndexRef.current != Math.floor(sliderValue)) {
            let thisFrame, nextFrame, mode
            if (Math.floor(sliderValue) === 0) {
              thisFrame = 0
              nextFrame = 1
              mode = 'reset'
            } else if (Math.floor(sliderValue) > windowIndexRef.current) {
              thisFrame = windowIndexRef.current + 1
              nextFrame = windowIndexRef.current + 2
              mode = 'forward'
            } else {
              thisFrame = windowIndexRef.current - 1
              nextFrame = windowIndexRef.current
              mode = 'backward'
            }
            fetchAndUpdateTextures(
              thisFrame,
              nextFrame,
              mode,
              isFilterNearest ? 'nearest' : 'linear',
              false,
              materialRef,
            )
            windowIndexRef.current = thisFrame
          }

          const weight = materialRef.current.uniforms.uTimeInterpolation.value
            ? sliderValue % 1
            : 0

          materialRef.current.uniforms.uFrameWeight.value = weight
        }
      }

      const changeProjection = (globeState: boolean) => {
        gsap.to(shaderUniforms.uSphereWrapAmount, {
          value: globeState ? 1.0 : 0.0,
          duration: 2,
        })
      }

      const changeFilter = (filterState: boolean) => {
        if (materialRef.current) {
          const filter = filterState ? 'nearest' : 'linear'
          updateTextureFilter(filter, materialRef)
        }
      }

      const changeTimeInterpolation = (timeInterpolationState: boolean) => {
        if (materialRef.current) {
          // console.log('change time', timeInterpolationState)
          materialRef.current.uniforms.uTimeInterpolation.value =
            timeInterpolationState
        }
      }

      useImperativeHandle(ref, () => ({
        type: surface_layer_ref,
        tick,
        changeProjection,
        changeFilter,
        changeTimeInterpolation,
      }))

      return (
        <mesh
          ref={surface_layer_ref}
          geometry={geometry}
          material={materialRef.current}
          renderOrder={1}
        />
      )
    },
  ),
)

export { SurfaceLayer }

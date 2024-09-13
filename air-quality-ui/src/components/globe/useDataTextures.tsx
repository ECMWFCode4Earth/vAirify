import { useCallback, useRef } from 'react'
import * as THREE from 'three'

const UI_URL = import.meta.env.VITE_AIR_QUALITY_UI_URL

const generateImageUrls = (
  forecastBaseDate: string,
  selectedVariable: string,
): string[] => {
  return [
    `${UI_URL}/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_1_of_3.webp`,
    `${UI_URL}/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_2_of_3.webp`,
    `${UI_URL}/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_3_of_3.webp`,
  ]
}

const createCanvasTexturesFromImages = async (
  imageUrls: string[],
): Promise<HTMLCanvasElement[]> => {
  return new Promise((resolve, reject) => {
    const images: HTMLImageElement[] = []
    let imagesLoaded = 0
    const canvases: HTMLCanvasElement[] = []

    const onLoadImage = () => {
      imagesLoaded++
      if (imagesLoaded === imageUrls.length) {
        try {
          images.forEach((img) => {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')

            if (context) {
              canvas.width = img.width
              canvas.height = img.height
              context.drawImage(img, 0, 0)
              canvases.push(canvas)
            } else {
              throw new Error('Failed to get canvas context')
            }
          })

          resolve(canvases)
        } catch (error) {
          reject(error)
        }
      }
    }

    imageUrls.forEach((url) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = onLoadImage
      img.onerror = (error) => {
        console.error(`Failed to load image: ${url}`, error)
        reject(new Error(`Failed to load image: ${url}`))
      }
      img.src = url
      images.push(img)
    })
  })
}

const createCanvasTextureFromCanvas = (
  canvas: HTMLCanvasElement[],
  index: number,
  filter: string,
): THREE.CanvasTexture => {
  let canvasIndex: number
  let frameIndex: number
  if (index < 16) {
    canvasIndex = 0
    frameIndex = index
  } else if (index < 32) {
    canvasIndex = 1
    frameIndex = index - 16
  } else if (index < 48) {
    canvasIndex = 2
    frameIndex = index - 32
  } else {
    canvasIndex = 0
    frameIndex = 0
  }

  const context = canvas[canvasIndex].getContext('2d')
  if (context) {
    const textureCanvas = document.createElement('canvas')
    const textureContext = textureCanvas.getContext('2d')

    textureCanvas.width = 900
    textureCanvas.height = 450
    textureContext?.drawImage(
      canvas[canvasIndex],
      frameIndex * 900,
      0,
      900,
      450,
      0,
      0,
      900,
      450,
    )

    const texture = new THREE.CanvasTexture(textureCanvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.minFilter =
      filter === 'nearest' ? THREE.NearestFilter : THREE.LinearFilter
    texture.magFilter =
      filter === 'nearest' ? THREE.NearestFilter : THREE.LinearFilter

    return texture
  } else {
    throw new Error('Failed to get texture canvas context')
  }
}

// Custom hook for managing textures
export const useDataTextures = (
  forecastBaseDate: string,
  selectedVariable: string,
) => {
  const canvasesRef = useRef<HTMLCanvasElement[] | null>(null)

  const imageUrls = generateImageUrls(forecastBaseDate, selectedVariable)

  const fetchAndUpdateTextures = useCallback(
    async (
      thisFrame: number,
      nextFrame: number,
      mode: string,
      filter: string,
      newVariable: boolean,
      materialRef: React.RefObject<THREE.ShaderMaterial>,
    ) => {
      if (newVariable && canvasesRef.current) {
        canvasesRef.current = null
      }
      try {
        const canvases =
          canvasesRef.current ||
          (await createCanvasTexturesFromImages(imageUrls))

        canvasesRef.current = canvases

        if (materialRef.current) {
          let thisCanvasTexture, nextCanvasTexture

          if (mode === 'forward') {
            nextCanvasTexture = createCanvasTextureFromCanvas(
              canvases,
              nextFrame,
              filter,
            )
            materialRef.current.uniforms.thisDataTexture.value =
              materialRef.current.uniforms.nextDataTexture.value
            materialRef.current.uniforms.nextDataTexture.value =
              nextCanvasTexture
          } else if (mode === 'backward') {
            thisCanvasTexture = createCanvasTextureFromCanvas(
              canvases, // Using the correct canvas for the frame
              thisFrame,
              filter,
            )
            materialRef.current.uniforms.nextDataTexture.value =
              materialRef.current.uniforms.thisDataTexture.value
            materialRef.current.uniforms.thisDataTexture.value =
              thisCanvasTexture
          } else if (mode === 'reset') {
            thisCanvasTexture = createCanvasTextureFromCanvas(
              canvases,
              thisFrame,
              filter,
            )
            nextCanvasTexture = createCanvasTextureFromCanvas(
              canvases,
              nextFrame,
              filter,
            )
            materialRef.current.uniforms.thisDataTexture.value =
              thisCanvasTexture
            materialRef.current.uniforms.nextDataTexture.value =
              nextCanvasTexture
          }
        }
      } catch (error) {
        console.error('Error processing image:', error)
      }
    },
    [imageUrls],
  )

  const updateTextureFilter = useCallback(
    (filter: string, materialRef: React.RefObject<THREE.ShaderMaterial>) => {
      console.log('updateTextureFilter', filter)
      if (materialRef.current) {
        materialRef.current.uniforms.thisDataTexture.value.magFilter =
          filter === 'nearest' ? THREE.NearestFilter : THREE.LinearFilter
        materialRef.current.uniforms.thisDataTexture.value.needsUpdate = true

        materialRef.current.uniforms.nextDataTexture.value.magFilter =
          filter === 'nearest' ? THREE.NearestFilter : THREE.LinearFilter
        materialRef.current.uniforms.nextDataTexture.value.needsUpdate = true
      }
    },
    [],
  )

  return { fetchAndUpdateTextures, updateTextureFilter }
}

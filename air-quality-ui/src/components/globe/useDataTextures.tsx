import { useCallback, useRef } from 'react'
import * as THREE from 'three'

// const API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL

const generateImageUrls = (
  forecastBaseDate: string,
  selectedVariable: string,
): string[] => {
  return [
    `http://localhost:5173/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_1_of_3.webp`,
    `http://localhost:5173/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_2_of_3.webp`,
    `http://localhost:5173/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_3_of_3.webp`,
  ]

  // const imageUrls = [
  //   `http://64.225.143.231/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_1_of_3.webp`,
  //   `http://64.225.143.231/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_2_of_3.webp`,
  //   `http://64.225.143.231/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_3_of_3.webp`,
  // ];

  // const imageUrls = [
  //   `/volume/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_1_of_3.webp`,
  //   `/volume/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_2_of_3.webp`,
  //   `/volume/data_textures/${forecastBaseDate}/${selectedVariable}_${forecastBaseDate}_CAMS_global.chunk_3_of_3.webp`,
  // ];
}

const createCanvasTextureFromMultipleImages = async (
  imageUrls: string[],
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const images: HTMLImageElement[] = []
    let imagesLoaded = 0

    const onLoadImage = () => {
      imagesLoaded++
      if (imagesLoaded === imageUrls.length) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (context) {
          const singleImageWidth = images[0].width
          const singleImageHeight = images[0].height
          canvas.width = singleImageWidth * imageUrls.length
          canvas.height = singleImageHeight
          images.forEach((img, index) => {
            context.drawImage(img, index * singleImageWidth, 0)
          })

          resolve(canvas)
        } else {
          reject(new Error('Failed to get canvas context'))
        }
      }
    }

    imageUrls.forEach((url) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = onLoadImage
      img.onerror = (error) => reject(error)
      img.src = url
      images.push(img)
    })
  })
}

const createCanvasTextureFromCanvas = (
  canvas: HTMLCanvasElement,
  index: number,
  filter: string,
): THREE.CanvasTexture => {
  const context = canvas.getContext('2d')
  if (context) {
    const textureCanvas = document.createElement('canvas')
    const textureContext = textureCanvas.getContext('2d')

    textureCanvas.width = 900
    textureCanvas.height = 450
    textureContext?.drawImage(canvas, index * 900, 0, 900, 450, 0, 0, 900, 450)

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
  const fullImageCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const imageUrls = generateImageUrls(forecastBaseDate, selectedVariable)
  console.log(imageUrls)

  const fetchAndUpdateTextures = useCallback(
    async (
      thisFrame: number,
      nextFrame: number,
      mode: string,
      filter: string,
      newVariable: boolean,
      materialRef: React.RefObject<THREE.ShaderMaterial>,
    ) => {
      if (newVariable && fullImageCanvasRef.current) {
        fullImageCanvasRef.current = null
      }
      try {
        const fullCanvas =
          fullImageCanvasRef.current ||
          (await createCanvasTextureFromMultipleImages(imageUrls))
        fullImageCanvasRef.current = fullCanvas

        if (materialRef.current) {
          let thisCanvasTexture, nextCanvasTexture

          if (mode === 'forward') {
            nextCanvasTexture = createCanvasTextureFromCanvas(
              fullCanvas,
              nextFrame,
              filter,
            )
            materialRef.current.uniforms.thisDataTexture.value =
              materialRef.current.uniforms.nextDataTexture.value
            materialRef.current.uniforms.nextDataTexture.value =
              nextCanvasTexture
          } else if (mode === 'backward') {
            thisCanvasTexture = createCanvasTextureFromCanvas(
              fullCanvas,
              thisFrame,
              filter,
            )
            materialRef.current.uniforms.nextDataTexture.value =
              materialRef.current.uniforms.thisDataTexture.value
            materialRef.current.uniforms.thisDataTexture.value =
              thisCanvasTexture
          } else if (mode === 'reset') {
            thisCanvasTexture = createCanvasTextureFromCanvas(
              fullCanvas,
              thisFrame,
              filter,
            )
            nextCanvasTexture = createCanvasTextureFromCanvas(
              fullCanvas,
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

import { useEffect, useRef, useState } from 'react'

const ImageProcessor = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const imageUrl =
    'http://localhost:5173/data_textures/2024-08-04_00/aqi_2024-08-04_00_CAMS_global.chunk_1_of_3.webp'

  // Create refs to store the image and canvas
  const imageRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const processImage = async () => {
      const img = new Image()
      img.crossOrigin = 'Anonymous' // Handle cross-origin issues

      img.onload = () => {
        // Store the image reference
        imageRef.current = img

        const canvas = document.createElement('canvas')
        canvasRef.current = canvas // Store the canvas reference
        const context = canvas.getContext('2d')

        // Initialize canvas size
        canvas.width = img.width
        canvas.height = img.height

        // Draw the entire image on the canvas
        context?.drawImage(img, 0, 0)

        // Set initial section to display (first 900 pixels in width)
        extractAndSetImage(0, 0, 900, img.height)
      }

      img.src = imageUrl
    }

    processImage()
  }, [imageUrl])

  const extractAndSetImage = (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas) {
      console.error('Canvas is not available')
      return
    }

    if (!context || !imageRef.current) {
      console.error('Context or image is not available')
      return
    }

    // Clear the canvas
    context?.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the specified section of the image onto the canvas
    context?.drawImage(
      imageRef.current,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height,
    )

    // Convert canvas to a data URL and set it as the processed image
    const newImageUrl = canvas.toDataURL('image/webp')
    setProcessedImage(newImageUrl)
  }

  return (
    <div>
      <button onClick={() => extractAndSetImage(0, 0, 900, 400)}>
        Extract First 900x400
      </button>
      <button onClick={() => extractAndSetImage(900, 0, 900, 400)}>
        Extract Next 900x400
      </button>
      {processedImage ? (
        <img src={processedImage} alt="Processed" />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default ImageProcessor

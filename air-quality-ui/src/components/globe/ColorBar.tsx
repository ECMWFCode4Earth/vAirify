import React, { useEffect, useRef } from 'react'
import { PollutantType } from '../../models/types'
import { getContourInfo } from '../../models/pollutant-contours'
import { pollutantTypeDisplay } from '../../models/pollutant-display'

interface ColorBarProps {
  pollutant: PollutantType | 'aqi'
  width?: number
  height?: number
}

export const ColorBar: React.FC<ColorBarProps> = ({ 
  pollutant,
  width = 60,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const contourInfo = getContourInfo(pollutant)
    if (!contourInfo) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw white background with slight padding
    const padding = 8
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    // Draw title and unit
    ctx.fillStyle = '#000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    // Calculate dimensions (adjusted for title)
    const barWidth = width * 0.4
    const barLeft = width * 0.1
    const barHeight = height * 0.65  // Further reduced to make room for two lines
    const barTop = pollutant === 'aqi' ? 
      height * 0.2 :    // Less space for AQI (single line)
      height * 0.25     // More space for pollutants (two lines)
    
    if (pollutant === 'aqi') {
      ctx.fillText('AQI', width / 2, padding + 10)
    } else {
      // Split pollutant display into name and unit
      const displayText = pollutantTypeDisplay[pollutant]
      const [name, unit] = displayText.split(' ')
      ctx.fillText(name, width / 2, padding + 10)
      ctx.font = '10px Arial'  // Smaller font for unit
      ctx.fillText(unit, width / 2, padding + 25)
    }

    // Calculate block height (equal for all levels)
    const blockHeight = barHeight / contourInfo.levels.length

    // Draw each level as a discrete rectangle (from bottom to top)
    contourInfo.levels.forEach((level, i) => {
      const y = barTop + barHeight - ((i + 1) * blockHeight)
      
      // Draw colored rectangle
      ctx.fillStyle = contourInfo.colors[i]
      ctx.fillRect(barLeft, y, barWidth, blockHeight)
    })

    // Draw border
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.strokeRect(barLeft, barTop, barWidth, barHeight)

    // Draw ticks and labels
    ctx.fillStyle = '#000'
    ctx.font = '10px Arial'
    ctx.textAlign = 'left'
    
    if (pollutant === 'aqi') {
      // For AQI, draw labels in the middle of blocks
      contourInfo.levels.forEach((level, i) => {
        const yTop = barTop + barHeight - ((i + 1) * blockHeight)
        const yMiddle = yTop + (blockHeight / 2)
        
        // Draw tick
        ctx.beginPath()
        ctx.moveTo(barLeft + barWidth, yMiddle)
        ctx.lineTo(barLeft + barWidth + 5, yMiddle)
        ctx.stroke()
        
        // Draw label (subtract 1 from the threshold)
        ctx.fillText((level - 1).toString(), barLeft + barWidth + 8, yMiddle + 4)
      })
    } else {
      // For other pollutants, draw min value at bottom
      ctx.beginPath()
      ctx.moveTo(barLeft + barWidth, barTop + barHeight)
      ctx.lineTo(barLeft + barWidth + 5, barTop + barHeight)
      ctx.stroke()
      ctx.fillText(contourInfo.minValue.toString(), barLeft + barWidth + 8, barTop + barHeight + 4)

      // Draw threshold labels at boundaries between blocks
      contourInfo.levels.forEach((level, i) => {
        // Skip the last threshold as it's the max value
        if (i < contourInfo.levels.length - 1) {
          const y = barTop + barHeight - ((i + 1) * blockHeight)
          
          // Draw tick
          ctx.beginPath()
          ctx.moveTo(barLeft + barWidth, y)
          ctx.lineTo(barLeft + barWidth + 5, y)
          ctx.stroke()
          
          // Draw label
          ctx.fillText(level.toString(), barLeft + barWidth + 8, y + 4)
        }
      })
    }

  }, [pollutant, width, height])

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      style={{ 
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    />
  )
} 
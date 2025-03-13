import * as ExifReader from 'exifreader'
import { ref } from 'vue'

export const data = ref({})
/**
 * @pngPath 图片路径
 */
export async function readExifData(pngPath) {
  try {
    const response = await fetch(pngPath)
    const arrayBuffer = await response.arrayBuffer()
    const tags = await ExifReader.load(arrayBuffer, { async: true })
    data.value = tags
    // console.log('EXIF data:', data.value)
    return data.value
  } catch (error) {
    console.error('Error reading EXIF data:', error)
    return null
  }
}
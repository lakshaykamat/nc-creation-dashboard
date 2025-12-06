import LZString from "lz-string"

/**
 * Compresses a string using LZ-String compression and returns base64-encoded result
 * LZ-String provides better compression ratios than gzip for JSON strings
 */
export function compressToBase64(data: string): string {
  try {
    // LZ-String compressToBase64 provides excellent compression for JSON strings
    const compressed = LZString.compressToBase64(data)
    
    // If compression fails or doesn't reduce size, fallback to plain base64
    if (!compressed) {
      return btoa(data)
    }
    
    return compressed
  } catch (error) {
    console.warn("Compression failed, falling back to plain base64:", error)
    // Fallback to plain base64
    return btoa(data)
  }
}

/**
 * Decompresses a base64-encoded LZ-String back to original string
 */
export function decompressFromBase64(encodedData: string): string {
  try {
    const decompressed = LZString.decompressFromBase64(encodedData)
    
    // If decompression fails, try plain base64 decode
    if (!decompressed) {
      return atob(encodedData)
    }
    
    return decompressed
  } catch (error) {
    // If decompression fails, try plain base64 decode
    console.warn("Decompression failed, trying plain base64:", error)
    return atob(encodedData)
  }
}


import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

export default cloudinary

export type CloudinaryResult = {
  public_id: string
  secure_url: string
  width?: number
  height?: number
}

export async function uploadImage(buffer: Buffer, folder: string, filename?: string): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (err, result) => {
        if (err || !result) return reject(err)
        resolve({ public_id: result.public_id!, secure_url: result.secure_url!, width: result.width, height: result.height })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(publicId: string, transformations = 'q_auto,f_auto'): string {
  // Cloudinary delivery URL builder (basic)
  // Example: https://res.cloudinary.com/<cloud>/image/upload/q_auto,f_auto/<public_id>.jpg
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloud}/image/upload/${transformations}/${publicId}`
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

@Injectable()
export class UploadsService {
  private readonly logger = new Logger('Uploads');
  private readonly configured: boolean;
  private readonly uploadDir: string;

  constructor() {
    this.configured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    this.uploadDir = join(process.cwd(), 'public', 'uploads');
    if (this.configured) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    } else {
      this.logger.log('Cloudinary credentials not set — using local disk storage fallback (/public/uploads).');
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
      }
    }
  }

  async uploadImage(file: Express.Multer.File, folder = 'general') {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WEBP, AVIF or GIF images are allowed');
    }
    if (file.size > MAX_BYTES) throw new BadRequestException('Image must be under 8 MB');

    if (!this.configured) {
      // Local file storage fallback
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
      }
      const ext = extname(file.originalname) || '.jpg';
      const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
      const filePath = join(this.uploadDir, filename);
      writeFileSync(filePath, file.buffer);

      const apiUrl = process.env.API_URL ?? 'http://localhost:4000';
      return { url: `${apiUrl}/uploads/${filename}`, publicId: filename, width: 800, height: 800 };
    }

    const base = process.env.CLOUDINARY_UPLOAD_FOLDER ?? 'beyoutiful';
    const safeFolder = folder.replace(/[^a-z0-9-_]/gi, '');
    const result = await new Promise<{ secure_url: string; public_id: string; width: number; height: number }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `${base}/${safeFolder}`,
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (err, res) => (err || !res ? reject(err ?? new Error('Upload failed')) : resolve(res)),
        );
        stream.end(file.buffer);
      },
    );
    return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height };
  }

  async deleteImage(publicId: string) {
    if (!this.configured) {
      const filePath = join(this.uploadDir, publicId);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      return { success: true };
    }
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  }
}


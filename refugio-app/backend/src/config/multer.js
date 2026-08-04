import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 5;

// Aseguramos que la carpeta de uploads existe al arrancar
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Configuración de almacenamiento en disco.
 * Genera nombres únicos para evitar colisiones cuando dos usuarios suben
 * archivos con el mismo nombre.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${randomName}${ext}`);
  }
});

/**
 * Filtro que solo acepta imágenes.
 */
function fileFilter(req, file, cb) {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Formato no permitido. Solo JPEG, PNG o WEBP.');
    error.statusCode = 400;
    cb(error, false);
  }
}

/**
 * Multer configurado para subida de una sola imagen por petición.
 */
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024
  }
});

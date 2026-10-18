import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Garante que os diretórios de uploads existam
const logosDir = path.join(__dirname, '../../uploads/logos');
const bannersDir = path.join(__dirname, '../../uploads/banners');
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });
if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir, { recursive: true });

// Configuração do Multer para armazenamento em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'banner' || req.query.type === 'banner') {
      cb(null, bannersDir);
    } else {
      cb(null, logosDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const prefix = file.fieldname === 'banner' || req.query.type === 'banner' ? 'banner' : 'logo';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${prefix}-${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (PNG, JPG, SVG, WebP) são permitidas.'));
    }
  },
});

// Endpoint de Upload via Multipart Form-Data (aceita logo, banner, etc.)
router.post('/', upload.any(), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const file = files[0];
    const subfolder = file.fieldname === 'banner' || req.query.type === 'banner' ? 'banners' : 'logos';
    const publicUrl = `/uploads/${subfolder}/${file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: file.filename,
      size: file.size,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint alternativo de Upload via Base64
router.post('/base64', async (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data é obrigatório' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'String base64 inválida.' });
    }

    const ext = matches[1].split('/')[1] === 'svg+xml' ? 'svg' : matches[1].split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const uniqueName = `logo-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const filePath = path.join(logosDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/logos/${uniqueName}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

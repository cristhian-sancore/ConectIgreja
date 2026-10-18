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
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

    if (!allowedExts.includes(ext) || !allowedMimes.includes(file.mimetype)) {
      cb(new Error('Formato ou extensão não permitida. Apenas imagens (PNG, JPG, SVG, WebP) são aceitas.'));
    } else {
      cb(null, true);
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
    const ext = path.extname(file.filename).toLowerCase();

    // 🛡️ Proteção Anti-XSS para arquivos SVG:
    if (ext === '.svg') {
      const content = fs.readFileSync(file.path, 'utf8').toLowerCase();
      const dangerousPatterns = ['<script', 'javascript:', 'onload=', 'onerror=', 'onclick=', '<iframe', '<embed', '<object'];
      const hasDangerousContent = dangerousPatterns.some(pattern => content.includes(pattern));

      if (hasDangerousContent) {
        fs.unlinkSync(file.path); // Remove arquivo malicioso imediatamente
        return res.status(400).json({ error: 'Arquivo SVG rejeitado: Contém elementos de script ou links executáveis não permitidos.' });
      }
    }

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

    const mime = matches[1].toLowerCase();
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedMimes.includes(mime)) {
      return res.status(400).json({ error: 'MIME type base64 não permitido.' });
    }

    const ext = mime === 'image/svg+xml' ? 'svg' : mime.split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');

    // Checagem Anti-XSS se for SVG
    if (ext === 'svg') {
      const text = buffer.toString('utf8').toLowerCase();
      if (text.includes('<script') || text.includes('javascript:') || text.includes('onload=') || text.includes('onerror=')) {
        return res.status(400).json({ error: 'SVG base64 contém scripts não permitidos.' });
      }
    }

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

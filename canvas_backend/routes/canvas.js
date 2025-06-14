const router = require('express').Router();
const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const { imageSize } = require('image-size');

// POST /canvas/init
router.post('/init', (req, res) => { 
  // TODO: Implement canvas initialization
});

// POST /canvas/shape
router.post('/shape', (req, res) => { 
  // TODO: Implement shape addition
});

// GET /canvas/export/:id
router.get('/export/:id', (req, res) => { 
  // TODO: Implement canvas export by ID
});

// POST /canvas/export-pdf
router.post('/export-pdf', async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const matches = imageData.match(/^data:image\/(png|jpeg);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    const imgBuffer = Buffer.from(matches[2], 'base64');
    const dimensions = imageSize(imgBuffer);

    // 1) Create an off-screen canvas
    const canvas = createCanvas(dimensions.width, dimensions.height);
    const ctx = canvas.getContext('2d');

    // 2) Fill entire canvas with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3) Load and draw the actual image on top
    const img = await loadImage(imgBuffer);
    ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    // 4) Export a new JPEG buffer with maximum quality (fully opaque)
    const flattenedBuffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });

    // 5) Feed that into PDFKit
    const doc = new PDFDocument({
      autoFirstPage: false,
      size: [dimensions.width, dimensions.height],
      margin: 0,
    });

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const filename = `canvas-${timestamp}.pdf`;
      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        })
        .send(pdfData);
    });

    doc.addPage({ size: [dimensions.width, dimensions.height], margin: 0 });
    doc.save();
    doc.rect(0, 0, dimensions.width, dimensions.height).fill('#FFFFFF');
    doc.restore();
    doc.image(flattenedBuffer, 0, 0, { width: dimensions.width, height: dimensions.height });
    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

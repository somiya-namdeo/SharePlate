import sharp from 'sharp';

async function process() {
  try {
    const img = sharp('public/logo.png');
    
    // Extract the symbol area (459x459 from top-left)
    const icon = img.extract({ left: 0, top: 0, width: 459, height: 459 });
    
    // Convert to buffer to chain operations
    const iconBuffer = await icon.toBuffer();
    
    // Add 20% transparent padding (459 * 0.2 = ~92px on each side)
    const paddedIcon = sharp(iconBuffer)
      .extend({
        top: 92,
        bottom: 92,
        left: 92,
        right: 92,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      // Enhance contrast slightly for small sizes
      .modulate({
        brightness: 0.95,
        saturation: 1.1,
      })
      .sharpen({
        sigma: 1.5,
        m1: 1,
        m2: 2,
        x1: 2,
        y2: 10,
        y3: 20
      });

    // Save different versions
    await paddedIcon.clone().resize(512, 512, { fit: 'contain' }).toFile('public/apple-touch-icon.png');
    await paddedIcon.clone().resize(48, 48, { fit: 'contain' }).toFile('public/favicon-48x48.png');
    await paddedIcon.clone().resize(32, 32, { fit: 'contain' }).toFile('public/favicon-32x32.png');
    await paddedIcon.clone().resize(16, 16, { fit: 'contain' }).toFile('public/favicon-16x16.png');
    await paddedIcon.clone().resize(32, 32, { fit: 'contain' }).toFile('public/favicon.ico');
    
    console.log('Padded favicons generated successfully.');
  } catch (err) {
    console.error(err);
  }
}
process();

import sharp from 'sharp';

async function analyze() {
  try {
    const metadata = await sharp('public/logo.png').metadata();
    console.log(`Dimensions: ${metadata.width}x${metadata.height}`);
  } catch (err) {
    console.error(err);
  }
}
analyze();

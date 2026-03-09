const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function cropImage() {
  const inputPath = path.join(__dirname, '..', 'public', 'logo.png');
  const outputPath = path.join(__dirname, '..', 'public', 'logo_cropped.png');

  try {
    // Trim aggressively removes all transparent/background pixels
    // threshold higher means it's more aggressive
    await sharp(inputPath)
      .trim({
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Trim white/transparent
        threshold: 10
      })
      .toFile(outputPath);
      
    console.log('Successfully aggressively cropped the logo.');
  } catch (error) {
    console.error('Error cropping image:', error);
  }
}

cropImage();

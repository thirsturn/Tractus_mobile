const sharp = require('sharp');
const fs = require('fs');

async function convert() {
  const svgBuffer = fs.readFileSync('./assets/Tractus.svg');
  
  // Create splash screen (Expo default size is 1242x2436, but let's make it 1024x1024 to be safe)
  await sharp(svgBuffer)
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('./assets/splash-icon.png');
    
  // Create icon
  await sharp(svgBuffer)
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('./assets/icon.png');
    
  console.log('Conversion successful!');
}

convert().catch(console.error);

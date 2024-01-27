import dotenv from 'dotenv';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs'; // Import the File System module

dotenv.config();

async function createGridWithPrices(imageData) {
  const gridSize = 1080; // Size of each grid cell
  const numCellsPerRow = 3; // For a 3x3 grid
  const canvas = createCanvas(gridSize * numCellsPerRow, gridSize * numCellsPerRow); // Canvas size for a 3x3 grid
  const ctx = canvas.getContext('2d');
  const borderThickness = 5; // Border thickness for each image
  const priceMargin = 90; // Margin for the price from the bottom and right

  for (let i = 0; i < imageData.length; i++) {
    const { imageUrl, satsToBtc } = imageData[i];
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const pngImageBuffer = await sharp(imageBuffer).toFormat('png').toBuffer();
    const mainImage = await loadImage(pngImageBuffer);

    const posX = (i % numCellsPerRow) * gridSize; // Adjusted for 3x3 grid
    const posY = Math.floor(i / numCellsPerRow) * gridSize; // Adjusted for 3x3 grid

    ctx.drawImage(mainImage, posX, posY, gridSize, gridSize);

    const priceString = `${satsToBtc.toFixed(3)} BTC`;
    const fontSize = 120;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.lineWidth = 20;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    const textWidth = ctx.measureText(priceString).width;
    const priceX = posX + gridSize - textWidth - priceMargin;
    const priceY = posY + gridSize - (priceMargin / 2); // Less subtracted, text moves lower
    ctx.strokeText(priceString, priceX, priceY);
    ctx.fillText(priceString, priceX, priceY);
  }

  // Drawing the borders for a 3x3 grid
  for (let i = 0; i < numCellsPerRow * numCellsPerRow; i++) {
    const posX = (i % numCellsPerRow) * gridSize;
    const posY = Math.floor(i / numCellsPerRow) * gridSize;
    ctx.strokeRect(posX + borderThickness / 2, posY + borderThickness / 2, gridSize - borderThickness, gridSize - borderThickness);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('output.png', buffer); // Write the buffer to a file
}

//datastructure: imgdata =[{url, saleprice}]

//dont forget that to use a specific font, you need to have it in the folder
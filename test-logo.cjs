const fs = require('fs');
const sizeOf = require('image-size');
const content = fs.readFileSync('./src/assets/logoBase64.js', 'utf8');
const b64 = content.split('"')[1];
const buffer = Buffer.from(b64.split(',')[1], 'base64');
const dimensions = sizeOf(buffer);
console.log(dimensions);

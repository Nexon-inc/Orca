const fs = require('fs');

const pricingConfigPath = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\pricing\\config.ts';
const nvidiaPath = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\ai\\nvidia.ts';

if (fs.existsSync(pricingConfigPath)) {
  console.log('=== PRICING CONFIG ===');
  console.log(fs.readFileSync(pricingConfigPath, 'utf8'));
} else {
  console.log('Pricing config not found');
}

if (fs.existsSync(nvidiaPath)) {
  console.log('=== NVIDIA CONFIG ===');
  console.log(fs.readFileSync(nvidiaPath, 'utf8'));
} else {
  console.log('Nvidia config not found');
}

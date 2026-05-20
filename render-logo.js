const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const srcDir = path.join(__dirname, 'src');
  const assetsDir = path.join(srcDir, 'assets');
  
  // Read the SVG content
  const svgPath = path.join(assetsDir, 'logo.svg');
  if (!fs.existsSync(svgPath)) {
    throw new Error(`SVG logo not found at ${svgPath}`);
  }
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Render square logo.png
  console.log('Rendering logo.png...');
  const logoHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #0a192f; /* Deep blue background matching app */
          display: flex;
          justify-content: center;
          align-items: center;
          width: 512px;
          height: 512px;
          overflow: hidden;
        }
        svg {
          width: 90%;
          height: 90%;
        }
      </style>
    </head>
    <body>
      ${svgContent}
    </body>
    </html>
  `;
  
  await page.setContent(logoHtmlContent);
  await page.setViewportSize({ width: 512, height: 512 });
  
  const logoPngPath = path.join(assetsDir, 'logo.png');
  await page.screenshot({ path: logoPngPath, type: 'png', omitBackground: false });
  console.log(`Saved logo.png to ${logoPngPath}`);
  
  // Render premium og-image.png (1200x630)
  console.log('Rendering og-image.png...');
  const ogHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0a192f; /* Deep blue theme */
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          width: 1200px;
          height: 630px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        /* Grid background pattern */
        body::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background-image: 
            linear-gradient(rgba(0, 243, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: rotate(15deg);
          z-index: 1;
        }
        /* Gradient glows */
        .glow-blue {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          z-index: 2;
        }
        .glow-purple {
          position: absolute;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(188, 19, 254, 0.1) 0%, transparent 70%);
          bottom: -150px;
          right: -100px;
          z-index: 2;
        }
        .content {
          display: flex;
          align-items: center;
          gap: 60px;
          z-index: 3;
          padding: 0 80px;
          width: 100%;
          box-sizing: border-box;
        }
        .logo-container {
          flex-shrink: 0;
          width: 320px;
          height: 320px;
          filter: drop-shadow(0 0 25px rgba(0, 243, 255, 0.25));
        }
        .logo-container svg {
          width: 100%;
          height: 100%;
        }
        .text-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-width: 600px;
        }
        h1 {
          margin: 0;
          font-size: 56px;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1.1;
          background: linear-gradient(135deg, #00f3ff 0%, #bc13fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(0, 243, 255, 0.25);
        }
        .tagline {
          font-size: 22px;
          color: #8892b0;
          line-height: 1.4;
          font-weight: 500;
        }
        .features {
          display: flex;
          gap: 12px;
          margin-top: 15px;
        }
        .feature-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          color: #a8b2d1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .feature-badge::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00f3ff;
          box-shadow: 0 0 8px #00f3ff;
        }
        .feature-badge.purple::before {
          background: #bc13fe;
          box-shadow: 0 0 8px #bc13fe;
        }
      </style>
    </head>
    <body>
      <div class="glow-blue"></div>
      <div class="glow-purple"></div>
      <div class="content">
        <div class="logo-container">
          ${svgContent}
        </div>
        <div class="text-container">
          <h1>Poker Planner Neo</h1>
          <div class="tagline">Collaborative, real-time poker planning and agile estimation tool. Work together seamlessly with your team.</div>
          <div class="features">
            <span class="feature-badge">Real-time Sync</span>
            <span class="feature-badge purple">Fully Zoneless</span>
            <span class="feature-badge">Jira Integration</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(ogHtmlContent);
  await page.setViewportSize({ width: 1200, height: 630 });
  
  const ogPngPath = path.join(assetsDir, 'og-image.png');
  await page.screenshot({ path: ogPngPath, type: 'png', omitBackground: false });
  console.log(`Saved og-image.png to ${ogPngPath}`);
  
  await browser.close();
  console.log('Rendering complete!');
}

main().catch(error => {
  console.error('Rendering failed:', error);
  process.exit(1);
});

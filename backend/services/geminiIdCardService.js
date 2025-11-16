const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const fsp = fs.promises;

const DEMO_PROMPT_PATH = path.join(__dirname, '__DEMO_GEMINI_PROMPT.txt');
const configuredPromptPath = process.env.GEMINI_PROMPT_PATH || (fs.existsSync(DEMO_PROMPT_PATH) ? DEMO_PROMPT_PATH : null);

// Verify prompt file
if (fs.existsSync(DEMO_PROMPT_PATH)) {
  console.log('✅ Gemini prompt file verified at:', DEMO_PROMPT_PATH);
  const promptStats = fs.statSync(DEMO_PROMPT_PATH);
  console.log('📄 Prompt file size:', (promptStats.size / 1024).toFixed(2), 'KB');
} else {
  console.warn('⚠️ Gemini prompt file not found at:', DEMO_PROMPT_PATH);
}

function loadPromptTemplate(defaultPrompt) {
  if (!configuredPromptPath) {
    console.log('📝 Using default Gemini prompt');
    return defaultPrompt;
  }

  try {
    const promptFromFile = fs.readFileSync(configuredPromptPath, 'utf8').trim();
    if (promptFromFile.length > 0) {
      console.log('✅ Loaded Gemini prompt from file:', configuredPromptPath);
      console.log('📏 Prompt length:', promptFromFile.length, 'characters');
      return promptFromFile;
    }
  } catch (error) {
    console.warn(`⚠️ Unable to read Gemini prompt file at ${configuredPromptPath}:`, error.message);
  }

  console.log('📝 Falling back to default Gemini prompt');
  return defaultPrompt;
}

const defaultDemoBaseImage = path.join(__dirname, '..', 'utils', 'Base_image.jpg');
const configuredBaseImagePath = process.env.GEMINI_BASE_IMAGE_PATH
  || (fs.existsSync(defaultDemoBaseImage) ? defaultDemoBaseImage : null);

// Verify base image for Gemini service
if (fs.existsSync(defaultDemoBaseImage)) {
  console.log('✅ Gemini base template verified at:', defaultDemoBaseImage);
} else {
  console.warn('⚠️ Gemini base template not found at:', defaultDemoBaseImage);
}

function resolveBaseImagePath(providedPath) {
  const candidate = providedPath || configuredBaseImagePath;
  if (!candidate) return null;

  const absolutePath = path.isAbsolute(candidate)
    ? candidate
    : path.join(process.cwd(), candidate);

  if (fs.existsSync(absolutePath)) {
    return absolutePath;
  }

  console.warn(`⚠️ Gemini base image not found at ${absolutePath}. Falling back to generated template.`);
  return null;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Base ID card template prompt
const ID_CARD_PROMPT_FALLBACK = `Create a professional and visually appealing event ID card with the following specifications:

DESIGN REQUIREMENTS:
- Modern, elegant design with gold and burgundy color scheme
- Event name: "NAVASPURTHI 2025" prominently displayed at the top
- College logo space at the top center
- Professional layout with clear sections
- Gradient background from burgundy (#2B0718) to dark (#060005)
- Gold accents (#F8C76F) for borders and text highlights

CONTENT TO INCLUDE:
- Participant photo (provided)
- Full Name: {NAME}
- Registration ID: {REG_ID}
- College: {COLLEGE}
- Events: {EVENTS}
- QR Code placeholder at bottom right
- "Valid for Navaspurthi 2025" text at bottom

STYLE:
- Premium, festival-themed design
- Clear typography with good contrast
- Professional photo placement (top-center or left side)
- Organized information layout
- Border with gold gradient
- Subtle decorative elements

OUTPUT:
Generate a high-quality ID card image (1200x1800px) that looks professional and ready to print.`;

const ID_CARD_PROMPT = loadPromptTemplate(ID_CARD_PROMPT_FALLBACK);

/**
 * Generate ID card using Gemini AI
 * @param {Object} participantData - Participant information
 * @param {Buffer} profileImageBuffer - Profile photo buffer
 * @param {string} baseImagePath - Path to base template image
 * @returns {Promise<Buffer>} Generated ID card image buffer
 */
async function generateIdCard(participantData, profileImageBuffer, baseImagePath = null) {
  try {
    const { name, registrationId, college, events } = participantData;

    const templatePath = resolveBaseImagePath(baseImagePath);

    // Prepare the prompt with participant data
    const prompt = ID_CARD_PROMPT
      .replace('{NAME}', name)
      .replace('{REG_ID}', registrationId)
      .replace('{COLLEGE}', college)
      .replace('{EVENTS}', Array.isArray(events) ? events.join(', ') : events);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert profile image to base64
    const profileImageBase64 = profileImageBuffer.toString('base64');
    
    // Prepare image parts for Gemini
    const imageParts = [
      {
        inlineData: {
          data: profileImageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ];

    // If base template is provided, add it
    if (templatePath) {
      try {
        const baseImageBuffer = await fsp.readFile(templatePath);
        const baseImageBase64 = baseImageBuffer.toString('base64');
        imageParts.push({
          inlineData: {
            data: baseImageBase64,
            mimeType: 'image/jpeg'
          }
        });
      } catch (error) {
        console.log('Base template not found, using prompt only');
      }
    }

    // Generate content with Gemini
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    
    // Note: Gemini doesn't directly generate images, so we'll use a fallback
    // For actual image generation, we need to use a different approach
    console.log('Gemini response:', response.text());

    // Fallback: Create ID card using sharp (image processing library)
    return await createIdCardWithSharp(participantData, profileImageBuffer, templatePath);

  } catch (error) {
    console.error('Error generating ID card with Gemini:', error);
    // Fallback to sharp-based generation
    return await createIdCardWithSharp(participantData, profileImageBuffer, resolveBaseImagePath(baseImagePath));
  }
}

/**
 * Create ID card using Sharp (fallback method)
 * @param {Object} participantData - Participant information
 * @param {Buffer} profileImageBuffer - Profile photo buffer
 * @param {string} baseImagePath - Path to base template image
 * @returns {Promise<Buffer>} Generated ID card image buffer
 */
async function createIdCardWithSharp(participantData, profileImageBuffer, baseImagePath) {
  try {
    const { name, registrationId, college, events } = participantData;

    // Resize and process profile image
    const processedPhoto = await sharp(profileImageBuffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Create base canvas
    const width = 1200;
    const height = 1800;

    // If base template exists, use it; otherwise create from scratch
    let baseImage;
    if (baseImagePath) {
      try {
        baseImage = await sharp(baseImagePath)
          .resize(width, height, { fit: 'cover' })
          .toBuffer();
      } catch (error) {
        baseImage = await createBaseTemplate(width, height);
      }
    } else {
      baseImage = await createBaseTemplate(width, height);
    }

    // Create SVG overlay with text
    const textOverlay = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F8C76F;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Event Title -->
        <text x="600" y="150" font-family="Arial, sans-serif" font-size="72" font-weight="bold" 
              fill="url(#goldGradient)" text-anchor="middle">NAVASPURTHI 2025</text>
        
        <!-- Name -->
        <text x="600" y="1200" font-family="Arial, sans-serif" font-size="56" font-weight="bold" 
              fill="#F8C76F" text-anchor="middle">${escapeXml(name)}</text>
        
        <!-- Registration ID -->
        <text x="600" y="1300" font-family="Arial, sans-serif" font-size="40" 
              fill="#D4AF37" text-anchor="middle">ID: ${escapeXml(registrationId)}</text>
        
        <!-- College -->
        <text x="600" y="1400" font-family="Arial, sans-serif" font-size="36" 
              fill="#FFFFFF" text-anchor="middle">${escapeXml(college)}</text>
        
        <!-- Events -->
        <text x="600" y="1500" font-family="Arial, sans-serif" font-size="32" 
              fill="#D4AF37" text-anchor="middle">Events: ${escapeXml(Array.isArray(events) ? events.join(', ') : events)}</text>
        
        <!-- Footer -->
        <text x="600" y="1700" font-family="Arial, sans-serif" font-size="28" 
              fill="#888888" text-anchor="middle">Valid for Navaspurthi 2025</text>
      </svg>
    `;

    // Composite everything together
    const finalImage = await sharp(baseImage)
      .composite([
        {
          input: processedPhoto,
          top: 250,
          left: 450
        },
        {
          input: Buffer.from(textOverlay),
          top: 0,
          left: 0
        }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    return finalImage;

  } catch (error) {
    console.error('Error creating ID card with Sharp:', error);
    throw error;
  }
}

/**
 * Create base template image
 */
async function createBaseTemplate(width, height) {
  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#2B0718;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#18010E;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#060005;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F8C76F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
      
      <!-- Border -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" 
            fill="none" stroke="url(#borderGradient)" stroke-width="8" rx="30"/>
      
      <!-- Inner border -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" 
            fill="none" stroke="url(#borderGradient)" stroke-width="2" rx="20" opacity="0.5"/>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate ID cards for multiple participants
 * @param {Array} participants - Array of participant data with photos
 * @param {string} baseImagePath - Path to base template
 * @returns {Promise<Array>} Array of {participantId, idCardBuffer}
 */
async function generateBulkIdCards(participants, baseImagePath = null) {
  const results = [];
  const resolvedTemplate = resolveBaseImagePath(baseImagePath);
  
  for (const participant of participants) {
    try {
      const idCardBuffer = await generateIdCard(
        participant.data,
        participant.profileImageBuffer,
        resolvedTemplate
      );
      
      results.push({
        participantId: participant.id,
        name: participant.data.name,
        idCardBuffer
      });
    } catch (error) {
      console.error(`Error generating ID card for ${participant.data.name}:`, error);
      results.push({
        participantId: participant.id,
        name: participant.data.name,
        error: error.message
      });
    }
  }
  
  return results;
}

module.exports = {
  generateIdCard,
  generateBulkIdCards,
  createIdCardWithSharp
};

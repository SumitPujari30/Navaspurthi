// File: backend/services/idCardGenerator.js
// Enhanced ID Card Generator with QR code and participant details
// 
// This generator uses Canvas API to composite ID cards:
// - Base template: backend/utils/Base_image.jpg (MANDATORY)
// - Gemini prompt: backend/services/__DEMO_GEMINI_PROMPT.txt (for AI generation if needed)
//
// The base template is loaded and used as-is, with only the following additions:
// 1. Participant photo overlaid on designated area
// 2. Participant name and registration ID added as text
// 3. QR code for verification
// 4. Event details and dates
//
// NO modifications are made to the base template design, colors, or layout.

const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// __dirname is automatically available in CommonJS (.cjs files)

const DEFAULT_BASE_TEMPLATE_PATH = path.join(__dirname, '..', 'utils', 'Base_image.jpg');
const DEFAULT_PROMPT_PATH = path.join(__dirname, '__DEMO_GEMINI_PROMPT.txt');

const resolveConfiguredPath = (envValue, defaultPath, label) => {
  const tried = [];

  if (envValue) {
    if (path.isAbsolute(envValue)) {
      tried.push(envValue);
    } else {
      // Try relative to current working directory
      tried.push(path.resolve(process.cwd(), envValue));
      // Try relative to this file
      tried.push(path.resolve(__dirname, envValue));
      // Try relative to project root (one level up)
      tried.push(path.resolve(__dirname, '..', envValue));
    }
  }

  // Always add fallback default path as the last option
  if (defaultPath) {
    tried.push(path.resolve(defaultPath));
  }

  for (const candidate of tried) {
    if (fs.existsSync(candidate)) {
      console.log(`✅ Resolved ${label} path:`, candidate);
      if (envValue && candidate !== tried[tried.length - 1]) {
        console.log(`   ↪︎ Using path derived from environment value "${envValue}"`);
      }
      return { resolved: candidate, tried, fromEnv: Boolean(envValue) };
    }
  }

  console.warn(`⚠️ Could not resolve ${label} using environment value "${envValue || 'N/A'}".`);
  console.warn(`   Paths tried: ${tried.join(' | ')}`);
  const fallbackResolved = path.resolve(defaultPath);
  console.warn(`   Falling back to default path: ${fallbackResolved}`);
  return { resolved: fallbackResolved, tried, fromEnv: false };
};

// Path to base ID card template image - MANDATORY
const { resolved: BASE_IMAGE_PATH, tried: BASE_PATH_ATTEMPTS } = resolveConfiguredPath(
  process.env.GEMINI_BASE_IMAGE_PATH,
  DEFAULT_BASE_TEMPLATE_PATH,
  'base ID card template'
);
const ABSOLUTE_BASE_PATH = path.resolve(BASE_IMAGE_PATH);

// Gemini prompt path (for reference, used by geminiIdCardService.js if needed)
const { resolved: GEMINI_PROMPT_PATH, tried: PROMPT_PATH_ATTEMPTS } = resolveConfiguredPath(
  process.env.GEMINI_PROMPT_PATH,
  DEFAULT_PROMPT_PATH,
  'Gemini prompt'
);

console.log('🔧 ID Card Generator Configuration:');
console.log('   GEMINI_BASE_IMAGE_PATH env:', process.env.GEMINI_BASE_IMAGE_PATH);
console.log('   GEMINI_PROMPT_PATH env:', process.env.GEMINI_PROMPT_PATH);
console.log('   Base path attempts:', BASE_PATH_ATTEMPTS.join(' | '));
console.log('   Prompt path attempts:', PROMPT_PATH_ATTEMPTS.join(' | '));
console.log('   Final BASE_IMAGE_PATH:', BASE_IMAGE_PATH);
console.log('   Final GEMINI_PROMPT_PATH:', GEMINI_PROMPT_PATH);

// Verify base image exists on module load
if (!fs.existsSync(BASE_IMAGE_PATH)) {
  console.error('❌❌❌ CRITICAL ERROR: Base ID card template image not found! ❌❌❌');
  console.error('Expected relative path:', BASE_IMAGE_PATH);
  console.error('Expected absolute path:', ABSOLUTE_BASE_PATH);
  console.error('Please ensure Base_image.jpg exists in backend/utils/ directory');
} else {
  console.log('✅✅✅ Base ID card template VERIFIED ✅✅✅');
  console.log('📁 Relative path:', BASE_IMAGE_PATH);
  console.log('📁 Absolute path:', ABSOLUTE_BASE_PATH);
  const stats = fs.statSync(BASE_IMAGE_PATH);
  console.log('📊 File size:', (stats.size / 1024).toFixed(2), 'KB');
  console.log('🎯 This image will be used for EVERY ID card generated');
}

// Verify Gemini prompt file exists
if (fs.existsSync(GEMINI_PROMPT_PATH)) {
  console.log('✅ Gemini prompt file VERIFIED');
  console.log('📁 Prompt path:', GEMINI_PROMPT_PATH);
  const promptStats = fs.statSync(GEMINI_PROMPT_PATH);
  console.log('📄 Prompt size:', (promptStats.size / 1024).toFixed(2), 'KB');
} else {
  console.warn('⚠️ Gemini prompt file not found at:', GEMINI_PROMPT_PATH);
  console.warn('   (This is OK if not using Gemini AI generation)');
}

class IDCardGenerator {
  constructor() {
    this.width = 1200;
    this.height = 760;
    this.cornerRadius = 30;
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.baseImagePath = BASE_IMAGE_PATH;
    
    // Verify base image on instantiation
    console.log('🔧 IDCardGenerator initialized with base template:', this.baseImagePath);
  }

  async generateIDCard(registrationData, profileImageBuffer = null) {
    try {
      console.log('🎨 Generating enhanced ID card for:', registrationData.full_name || 'Unknown');
      
      // MANDATORY: Load base image first - DO NOT use fallback
      if (!fs.existsSync(BASE_IMAGE_PATH)) {
        const error = new Error(`❌ CRITICAL: Base ID card template image not found at: ${BASE_IMAGE_PATH}`);
        console.error(error.message);
        throw error;
      }

      console.log('📸 Loading base template image from:', BASE_IMAGE_PATH);
      
      // Validate base image file stats to ensure it's the current file
      const baseImageStats = fs.statSync(BASE_IMAGE_PATH);
      console.log('📊 Base image file info:');
      console.log(`   - Size: ${(baseImageStats.size / 1024).toFixed(2)} KB`);
      console.log(`   - Modified: ${baseImageStats.mtime.toISOString()}`);
      console.log(`   - Path: ${BASE_IMAGE_PATH}`);
      
      const baseImage = await loadImage(BASE_IMAGE_PATH);
      
      // IMPORTANT: Use base image dimensions for canvas
      const canvasWidth = baseImage.width;
      const canvasHeight = baseImage.height;
      
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      
      // Draw base image at exact 1:1 scale
      ctx.drawImage(baseImage, 0, 0);
      console.log('✅✅✅ NEW BASE TEMPLATE LOADED AND APPLIED ✅✅✅');
      console.log(`📏 Canvas size: ${canvasWidth}x${canvasHeight} (matched to base image)`);
      console.log(`🎨 Using base template from: ${BASE_IMAGE_PATH}`);
      
      // Add participant photo to base template
      if (profileImageBuffer) {
        console.log('📷 Adding participant photo to base template');
        await this.addProfileImageToTemplate(ctx, profileImageBuffer, canvasWidth, canvasHeight);
      } else {
        console.log('⚠️ No participant photo provided');
      }
      
      // Add participant details to template fields
      console.log('📝 Adding participant details to template fields');
      await this.addParticipantDetails(ctx, registrationData, canvasWidth, canvasHeight);
      
      console.log('🎯 Base template personalized with participant data (no QR code)');

      // Convert to buffer
      const buffer = canvas.toBuffer('image/png');
      
      // Optimize the final image
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 95, compressionLevel: 6 })
        .toBuffer();

      console.log('✅ Enhanced ID card generated successfully using base template');
      console.log(`📦 Output dimensions: ${canvasWidth}x${canvasHeight}`);
      
      return {
        success: true,
        buffer: optimizedBuffer,
        width: canvasWidth,
        height: canvasHeight,
        message: 'ID card generated successfully from base template'
      };

    } catch (error) {
      console.error('❌ ID Card generation error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate ID card'
      };
    }
  }

  // Add participant photo to template (clean, positioned for your template)
  async addProfileImageToTemplate(ctx, imageBuffer, canvasWidth, canvasHeight) {
    // Square placeholder aligned with gold frame on template
    const placeholderSize = Math.round(canvasWidth * 0.37);
    const placeholderX = Math.round((canvasWidth - placeholderSize) / 2);
    const placeholderY = Math.round(canvasHeight * 0.405);
    const inset = Math.round(placeholderSize * 0.04);
    const photoDrawSize = placeholderSize - inset * 2;
    const photoX = placeholderX + inset;
    const photoY = placeholderY + inset;

    try {
      const processedPhoto = await sharp(imageBuffer)
        .resize(photoDrawSize, photoDrawSize, { fit: 'cover', position: 'center' })
        .toBuffer();
      
      const photo = await loadImage(processedPhoto);
      
      // Draw square photo aligned with placeholder (small rounding for clean edges)
      ctx.save();
      const radius = Math.round(photoDrawSize * 0.04);
      ctx.beginPath();
      ctx.moveTo(photoX + radius, photoY);
      ctx.lineTo(photoX + photoDrawSize - radius, photoY);
      ctx.quadraticCurveTo(photoX + photoDrawSize, photoY, photoX + photoDrawSize, photoY + radius);
      ctx.lineTo(photoX + photoDrawSize, photoY + photoDrawSize - radius);
      ctx.quadraticCurveTo(photoX + photoDrawSize, photoY + photoDrawSize, photoX + photoDrawSize - radius, photoY + photoDrawSize);
      ctx.lineTo(photoX + radius, photoY + photoDrawSize);
      ctx.quadraticCurveTo(photoX, photoY + photoDrawSize, photoX, photoY + photoDrawSize - radius);
      ctx.lineTo(photoX, photoY + radius);
      ctx.quadraticCurveTo(photoX, photoY, photoX + radius, photoY);
      ctx.clip();
      ctx.drawImage(photo, photoX, photoY, photoDrawSize, photoDrawSize);
      ctx.restore();
      
      console.log(`✅ Photo added within placeholder at (${photoX}, ${photoY}) size ${photoDrawSize}px (frame ${placeholderSize}px)`);
    } catch (error) {
      console.error('⚠️ Failed to add photo:', error.message);
    }
  }

  // Add participant details to template fields at bottom
  async addParticipantDetails(ctx, registrationData, canvasWidth, canvasHeight) {
    const { full_name, registration_id, college, events } = registrationData;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const valueFontSize = Math.round(canvasHeight * 0.035);
    const baselineLift = Math.round(canvasHeight * 0.014); // keeps text off the underline
    const valueStartX = Math.round(canvasWidth * 0.29);
    const availableWidth = Math.round(canvasWidth * 0.56);
    const minFontSize = Math.round(canvasHeight * 0.024);

    const nameBaseline = Math.round(canvasHeight * 0.7425);
    const collegeBaseline = Math.round(canvasHeight * 0.7975);
    const eventBaseline = Math.round(canvasHeight * 0.8525);
    const idBaseline = Math.round(canvasHeight * 0.9075);

    ctx.fillStyle = '#F8C76F';

    const drawValue = (rawValue, baseline) => {
      const value = rawValue && rawValue.toString().trim() ? rawValue.toString().trim() : 'N/A';
      let fontSize = valueFontSize;
      ctx.font = `bold ${fontSize}px Arial`;
      let metrics = ctx.measureText(value);
      while (metrics.width > availableWidth && fontSize > minFontSize) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px Arial`;
        metrics = ctx.measureText(value);
      }
      ctx.fillText(value, valueStartX, baseline - baselineLift);
      ctx.font = `bold ${valueFontSize}px Arial`;
    };

    const formatRegistrationId = (rawId) => {
      if (!rawId || !rawId.toString().trim()) return rawId;
      // Keep hyphens without extra spaces for compact display
      return rawId.toString().toUpperCase();
    };

    // Name
    drawValue(full_name, nameBaseline);
    console.log(`📝 Name filled in field: ${full_name}`);

    // College
    drawValue(college, collegeBaseline);
    console.log(`🏫 College filled in field: ${college}`);

    // Event(s)
    const eventText = events && events.length > 0 ? events.join(', ') : 'N/A';
    drawValue(eventText, eventBaseline);
    console.log(`🎪 Events filled in field: ${eventText}`);

    // ID Number
    const formattedId = formatRegistrationId(registration_id);
    drawValue(formattedId, idBaseline);
    console.log(`🆔 ID filled in field: ${formattedId}`);
  }

  async addProfileImage(ctx, imageBuffer, registrationData) {
    const imageX = 80;
    const imageY = 200;
    const imageSize = 280;

    try {
      let image;
      
      if (imageBuffer) {
        // Process the provided image
        const processedBuffer = await sharp(imageBuffer)
          .resize(imageSize, imageSize, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();
        
        image = await loadImage(processedBuffer);
      } else {
        // Create avatar with initials
        const avatarBuffer = await this.createAvatar(registrationData.full_name || 'User', imageSize);
        image = await loadImage(avatarBuffer);
      }

      // Create circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2 - 10, 0, Math.PI * 2);
      ctx.clip();

      // Draw image
      ctx.drawImage(image, imageX, imageY, imageSize, imageSize);
      ctx.restore();

      // Add golden border around image
      ctx.beginPath();
      ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2 - 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#F8C76F';
      ctx.lineWidth = 6;
      ctx.stroke();
      
      // Add outer glow
      ctx.beginPath();
      ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2 + 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(248, 199, 111, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

    } catch (error) {
      console.error('Error adding profile image:', error);
      // Draw placeholder circle
      ctx.beginPath();
      ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2 - 10, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();
      ctx.strokeStyle = '#F8C76F';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  }

  async addRegistrationId(ctx, registrationId) {
    // Add prominent registration ID at top-right
    ctx.save();
    
    // Background box for registration ID
    const idBoxX = this.width - 320;
    const idBoxY = 50;
    const idBoxWidth = 250;
    const idBoxHeight = 60;
    
    // Draw rounded rectangle background
    this.roundedRect(ctx, idBoxX, idBoxY, idBoxWidth, idBoxHeight, 10);
    ctx.fillStyle = 'rgba(248, 199, 111, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#F8C76F';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add registration ID text
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(registrationId || 'NV25-0000', idBoxX + idBoxWidth/2, idBoxY + idBoxHeight/2);
    
    ctx.restore();
  }

  async addTextContent(ctx, data) {
    // Event title
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NAVASPURTHI 2025', this.width / 2, 80);

    // Subtitle
    ctx.fillStyle = '#D4AF37';
    ctx.font = '24px Arial';
    ctx.fillText('Tech-Cultural Festival', this.width / 2, 120);

    // User information - right side
    const textX = 420;
    let textY = 220;
    const lineHeight = 45;

    ctx.textAlign = 'left';
    
    // Name (larger and bold)
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('Name:', textX, textY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px Arial';
    ctx.fillText(data.full_name || 'Participant', textX + 130, textY);
    textY += lineHeight + 10;

    // College
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('College:', textX, textY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px Arial';
    const college = (data.college || 'College Name').substring(0, 35);
    ctx.fillText(college, textX + 100, textY);
    textY += lineHeight;

    // Year/Class
    if (data.year) {
      ctx.fillStyle = '#F8C76F';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Year:', textX, textY);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '22px Arial';
      ctx.fillText(data.year, textX + 70, textY);
      textY += lineHeight;
    }

    // Events
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Events:', textX, textY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    
    const events = Array.isArray(data.events) 
      ? data.events.map(e => typeof e === 'string' ? e : e.name).join(', ')
      : (data.event || 'General');
    
    // Wrap events text if too long
    const maxWidth = this.width - textX - 100;
    const wrappedEvents = this.wrapText(ctx, events, maxWidth);
    
    wrappedEvents.forEach((line, index) => {
      ctx.fillText(line, textX + 90, textY + (index * 25));
    });
    
    textY += (wrappedEvents.length * 25) + 20;

    // Participant count for group events
    if (data.total_participants && data.total_participants > 1) {
      ctx.fillStyle = '#F8C76F';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Team Size:', textX, textY);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '22px Arial';
      ctx.fillText(`${data.total_participants} participants`, textX + 120, textY);
      textY += lineHeight;
      
      // Show first few participant names
      if (data.participants && Array.isArray(data.participants)) {
        ctx.fillStyle = '#D4AF37';
        ctx.font = '18px Arial';
        ctx.fillText('Team Members:', textX, textY);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        const maxShow = 3;
        const participantsToShow = data.participants.slice(0, maxShow);
        const remaining = data.participants.length - maxShow;
        
        participantsToShow.forEach((p, index) => {
          ctx.fillText(`• ${p.name}`, textX + 20, textY + 25 + (index * 20));
        });
        
        if (remaining > 0) {
          ctx.fillStyle = '#D4AF37';
          ctx.font = 'italic 16px Arial';
          ctx.fillText(`and ${remaining} more...`, textX + 20, textY + 25 + (maxShow * 20));
        }
      }
    }

    // Add dates at bottom
    ctx.fillStyle = '#F8C76F';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('November 27-28, 2025 | PES University, Bangalore', this.width / 2, this.height - 80);
  }

  async addQRCode(ctx, registrationId) {
    try {
      // Generate verification URL
      const verificationUrl = `${this.frontendUrl}/verify?rid=${registrationId}`;
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: '#2B0718',
          light: '#FFFFFF'
        }
      });
      
      // Load and draw QR code
      const qrImage = await loadImage(qrCodeDataUrl);
      
      // Position at bottom-left with background
      const qrX = 80;
      const qrY = this.height - 230;
      const qrSize = 150;
      
      // White background for QR code
      ctx.fillStyle = '#FFFFFF';
      this.roundedRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 10);
      ctx.fill();
      
      // Draw QR code
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // Add label
      ctx.fillStyle = '#F8C76F';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Verify Registration', qrX + qrSize/2, qrY + qrSize + 25);
      
    } catch (error) {
      console.error('Error adding QR code:', error);
    }
  }

  async addBranding(ctx) {
    // Add festival logo placeholder at top-left
    ctx.save();
    
    // Logo background
    const logoX = 80;
    const logoY = 50;
    const logoSize = 60;
    
    ctx.beginPath();
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(248, 199, 111, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#F8C76F';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Logo text (placeholder - replace with actual logo)
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NV', logoX + logoSize/2, logoY + logoSize/2);
    
    // Organizer logo at bottom-right
    const orgX = this.width - 200;
    const orgY = this.height - 60;
    
    ctx.fillStyle = '#D4AF37';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Organized by PES University', orgX, orgY);
    
    // Social icons placeholder
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(248, 199, 111, 0.7)';
    ctx.fillText('@navaspurthi2025 | navaspurthi.com', orgX, orgY + 20);
    
    ctx.restore();
  }

  async addDecorations(ctx) {
    // Add decorative corner elements
    ctx.save();
    
    // Top-left corner decoration
    ctx.strokeStyle = '#F8C76F';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    
    // Decorative lines
    for (let i = 0; i < 3; i++) {
      const offset = i * 10;
      ctx.beginPath();
      ctx.moveTo(20 + offset, 20);
      ctx.lineTo(20 + offset, 100);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(20, 20 + offset);
      ctx.lineTo(100, 20 + offset);
      ctx.stroke();
    }
    
    // Top-right corner decoration
    for (let i = 0; i < 3; i++) {
      const offset = i * 10;
      ctx.beginPath();
      ctx.moveTo(this.width - 20 - offset, 20);
      ctx.lineTo(this.width - 20 - offset, 100);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(this.width - 20, 20 + offset);
      ctx.lineTo(this.width - 100, 20 + offset);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  async createAvatar(name, size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#F8C76F');
    gradient.addColorStop(1, '#D4AF37');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add subtle pattern
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#2B0718';
    for (let i = 0; i < size; i += 20) {
      ctx.fillRect(i, 0, 2, size);
      ctx.fillRect(0, i, size, 2);
    }
    ctx.globalAlpha = 1;

    // Add user initials
    const initials = this.getInitials(name);
    ctx.fillStyle = '#2B0718';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);

    return canvas.toBuffer('image/jpeg', { quality: 0.9 });
  }

  getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
}

module.exports = new IDCardGenerator();

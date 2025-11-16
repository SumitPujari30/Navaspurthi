const { createCanvas, loadImage, registerFont } = require('canvas');
const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');

class IDCardGenerator {
  constructor() {
    this.width = 1200;
    this.height = 760;
    this.cornerRadius = 30;
  }

  async generateIDCard(registrationData, profileImageBuffer = null) {
    try {
      console.log('🎨 Generating ID card for:', registrationData.full_name || 'Unknown');
      
      const canvas = createCanvas(this.width, this.height);
      const ctx = canvas.getContext('2d');

      // Create background with gradient
      await this.createBackground(ctx);
      
      // Add profile image or avatar
      await this.addProfileImage(ctx, profileImageBuffer, registrationData);
      
      // Add text content
      await this.addTextContent(ctx, registrationData);
      
      // Add QR code
      await this.addQRCode(ctx, registrationData);
      
      // Add decorative elements
      await this.addDecorations(ctx);

      // Add festival logo/branding
      await this.addBranding(ctx);

      // Convert to buffer
      const buffer = canvas.toBuffer('image/png');
      
      // Optimize the final image
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 95, compressionLevel: 6 })
        .toBuffer();

      console.log('✅ ID card generated successfully');
      
      return {
        success: true,
        buffer: optimizedBuffer,
        width: this.width,
        height: this.height,
        message: 'ID card generated successfully'
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

  async createBackground(ctx) {
    // Create rounded rectangle background
    this.roundedRect(ctx, 0, 0, this.width, this.height, this.cornerRadius);
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#2B0718');
    gradient.addColorStop(0.3, '#19010D');
    gradient.addColorStop(0.7, '#060005');
    gradient.addColorStop(1, '#2B0718');
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add border
    ctx.strokeStyle = '#F8C76F';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Add inner glow effect
    const glowGradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
    );
    glowGradient.addColorStop(0, 'rgba(248, 199, 111, 0.1)');
    glowGradient.addColorStop(1, 'rgba(248, 199, 111, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.fill();
  }

  async addProfileImage(ctx, imageBuffer, registrationData) {
    const imageX = 80;
    const imageY = 150;
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

      // Add border around image
      ctx.beginPath();
      ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2 - 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#F8C76F';
      ctx.lineWidth = 6;
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

    // User information
    const textX = 420;
    let textY = 180;
    const lineHeight = 50;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 32px Arial';

    // Name
    ctx.fillText('Name:', textX, textY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '28px Arial';
    ctx.fillText(data.full_name || 'Participant', textX + 120, textY);
    textY += lineHeight;

    // Registration ID
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('ID:', textX, textY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(data.registration_id || 'REG-2025-001', textX + 60, textY);
    textY += lineHeight;

    // College
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('College:', textX, textY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px Arial';
    const college = (data.college || 'College Name').substring(0, 30);
    ctx.fillText(college, textX + 100, textY);
    textY += lineHeight;

    // Event
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Event:', textX, textY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px Arial';
    ctx.fillText(data.event_name || 'General Participation', textX + 80, textY);
    textY += lineHeight;

    // Date
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('March 15-17, 2025 | PES University', textX, textY + 20);
  }

  async addQRCode(ctx, data) {
    try {
      const qrData = JSON.stringify({
        id: data.registration_id,
        name: data.full_name,
        event: data.event_name,
        college: data.college
      });

      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        width: 150,
        margin: 2,
        color: {
          dark: '#2B0718',
          light: '#FFFFFF'
        }
      });

      const qrImage = await loadImage(qrCodeBuffer);
      
      // Position QR code in bottom right
      const qrX = this.width - 200;
      const qrY = this.height - 200;
      
      // Add white background for QR code
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 10, qrY - 10, 170, 170);
      
      ctx.drawImage(qrImage, qrX, qrY, 150, 150);

      // Add QR code label
      ctx.fillStyle = '#D4AF37';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Scan for Details', qrX + 75, qrY + 180);

    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  async addDecorations(ctx) {
    // Add decorative elements
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    
    // Top decorative lines
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.lineTo(this.width - 50, 140);
    ctx.stroke();

    // Bottom decorative lines
    ctx.beginPath();
    ctx.moveTo(50, this.height - 50);
    ctx.lineTo(this.width - 50, this.height - 50);
    ctx.stroke();

    // Add corner decorations
    this.addCornerDecorations(ctx);
  }

  addCornerDecorations(ctx) {
    const cornerSize = 40;
    ctx.strokeStyle = '#F8C76F';
    ctx.lineWidth = 4;

    // Top left
    ctx.beginPath();
    ctx.moveTo(30, 30 + cornerSize);
    ctx.lineTo(30, 30);
    ctx.lineTo(30 + cornerSize, 30);
    ctx.stroke();

    // Top right
    ctx.beginPath();
    ctx.moveTo(this.width - 30 - cornerSize, 30);
    ctx.lineTo(this.width - 30, 30);
    ctx.lineTo(this.width - 30, 30 + cornerSize);
    ctx.stroke();

    // Bottom left
    ctx.beginPath();
    ctx.moveTo(30, this.height - 30 - cornerSize);
    ctx.lineTo(30, this.height - 30);
    ctx.lineTo(30 + cornerSize, this.height - 30);
    ctx.stroke();

    // Bottom right
    ctx.beginPath();
    ctx.moveTo(this.width - 30 - cornerSize, this.height - 30);
    ctx.lineTo(this.width - 30, this.height - 30);
    ctx.lineTo(this.width - 30, this.height - 30 - cornerSize);
    ctx.stroke();
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

    // Add initials
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    ctx.fillStyle = '#2B0718';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);

    return canvas.toBuffer('image/jpeg', { quality: 0.9 });
  }

  async addBranding(ctx) {
    // Add "OFFICIAL" watermark
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.rotate(-Math.PI / 6);
    ctx.fillText('OFFICIAL', this.width / 2 - 100, this.height / 2 + 50);
    ctx.restore();

    // Add festival year
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('2025', this.width - 30, this.height - 20);

    // Add verification text
    ctx.fillStyle = '#F8C76F';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Verified Participant', 30, this.height - 20);
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
}

module.exports = new IDCardGenerator();

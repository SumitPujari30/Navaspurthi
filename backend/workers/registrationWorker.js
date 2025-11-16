const { Worker, Queue } = require('bullmq');
const Redis = require('ioredis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');
const QRCode = require('qrcode');
const { supabaseAdmin } = require('../config/supabase');

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Create queue
const registrationQueue = new Queue('registration', { connection: redis });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ID Card Generator Class
class IdCardGenerator {
  constructor() {
    this.width = 1200;
    this.height = 760;
    this.cornerRadius = 30;
  }

  async generateIdCard(registration, aiImageBuffer = null) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#2B0718');
    gradient.addColorStop(0.5, '#19010D');
    gradient.addColorStop(1, '#060005');
    
    ctx.fillStyle = gradient;
    this.roundRect(ctx, 0, 0, this.width, this.height, this.cornerRadius);
    ctx.fill();

    // Neon border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#F8C76F';
    ctx.shadowBlur = 20;
    this.roundRect(ctx, 4, 4, this.width - 8, this.height - 8, this.cornerRadius);
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Header
    ctx.fillStyle = '#F8C76F';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NAVASPURTHI 2025', this.width / 2, 80);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '24px Arial';
    ctx.fillText('OFFICIAL PARTICIPANT ID', this.width / 2, 120);

    // Profile image section
    const imageSize = 280;
    const imageX = 80;
    const imageY = 180;

    if (aiImageBuffer) {
      try {
        const image = await loadImage(aiImageBuffer);
        
        // Create circular clipping path
        ctx.save();
        ctx.beginPath();
        ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw image
        ctx.drawImage(image, imageX, imageY, imageSize, imageSize);
        ctx.restore();

        // Neon circle border
        ctx.strokeStyle = '#F8C76F';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#F8C76F';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2 + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      } catch (error) {
        console.error('Error loading AI image:', error);
        this.drawPlaceholderImage(ctx, imageX, imageY, imageSize);
      }
    } else {
      this.drawPlaceholderImage(ctx, imageX, imageY, imageSize);
    }

    // Details section
    const detailsX = 420;
    const detailsY = 200;
    const lineHeight = 50;

    const details = [
      { label: 'NAME', value: registration.full_name.toUpperCase() },
      { label: 'ID', value: registration.registration_id },
      { label: 'EVENT', value: registration.event_name.toUpperCase() },
      { label: 'COLLEGE', value: registration.college.toUpperCase() },
      { label: 'AGE GROUP', value: registration.age_group.toUpperCase() }
    ];

    details.forEach((detail, index) => {
      const y = detailsY + (index * lineHeight);
      
      // Label
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(detail.label + ':', detailsX, y);
      
      // Value
      ctx.fillStyle = '#F8C76F';
      ctx.font = '24px Arial';
      const maxWidth = 400;
      const truncatedValue = this.truncateText(ctx, detail.value, maxWidth);
      ctx.fillText(truncatedValue, detailsX, y + 28);
    });

    // QR Code
    const qrSize = 120;
    const qrX = this.width - qrSize - 80;
    const qrY = 180;

    try {
      const qrCodeUrl = `https://navaspurthi.com/verify/${registration.registration_id}`;
      const qrBuffer = await QRCode.toBuffer(qrCodeUrl, {
        width: qrSize,
        margin: 0,
        color: {
          dark: '#F8C76F',
          light: '#00000000'
        }
      });
      
      const qrImage = await loadImage(qrBuffer);
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // QR Label
      ctx.fillStyle = '#D4AF37';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN TO VERIFY', qrX + qrSize/2, qrY + qrSize + 25);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    // Footer
    ctx.fillStyle = '#D4AF37';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Valid for Navaspurthi 2025 Events Only', this.width / 2, this.height - 60);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#B8860B';
    const date = new Date().toLocaleDateString('en-IN');
    ctx.fillText(`Generated on ${date}`, this.width / 2, this.height - 30);

    return canvas.toBuffer('image/png');
  }

  drawPlaceholderImage(ctx, x, y, size) {
    // Placeholder circle
    ctx.fillStyle = '#3a0c1f';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    // Placeholder icon
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👤', x + size/2, y + size/2 + 20);
  }

  roundRect(ctx, x, y, width, height, radius) {
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

  truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }
}

// Worker implementation
const worker = new Worker('registration', async (job) => {
  const { registrationId, registration } = job.data;
  
  console.log(`🔄 Processing registration: ${registration.registration_id}`);
  
  try {
    if (job.name === 'processRegistration') {
      await processFullRegistration(registrationId, registration);
    } else if (job.name === 'generateSimpleIdCard') {
      await generateSimpleIdCard(registrationId, registration);
    }
  } catch (error) {
    console.error(`❌ Worker error for ${registration.registration_id}:`, error);
    
    // Update registration with error
    await supabaseAdmin
      .from('new_registrations')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', registrationId);
    
    throw error;
  }
}, { connection: redis });

async function processFullRegistration(registrationId, registration) {
  console.log(`🎨 Generating AI portrait for: ${registration.registration_id}`);
  
  // Step 1: Download profile image
  const { data: profileImageData, error: downloadError } = await supabaseAdmin.storage
    .from('profiles')
    .download(registration.profile_image_path);
  
  if (downloadError) throw downloadError;
  
  const profileImageBuffer = Buffer.from(await profileImageData.arrayBuffer());
  
  // Step 2: Generate AI portrait
  let aiImageBuffer = null;
  try {
    aiImageBuffer = await generateAIPortrait(profileImageBuffer, registration);
    
    // Upload AI image
    const aiFileName = `${registration.registration_id}.jpg`;
    const { data: aiUploadData, error: aiUploadError } = await supabaseAdmin.storage
      .from('ai-images')
      .upload(aiFileName, aiImageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (aiUploadError) throw aiUploadError;
    
    // Update registration with AI image path
    await supabaseAdmin
      .from('new_registrations')
      .update({ ai_image_path: aiUploadData.path })
      .eq('id', registrationId);
    
    console.log(`✅ AI portrait generated: ${aiFileName}`);
  } catch (error) {
    console.error('⚠️ AI generation failed, using original image:', error);
    aiImageBuffer = profileImageBuffer;
  }
  
  // Step 3: Generate ID Card
  const idCardGenerator = new IdCardGenerator();
  const idCardBuffer = await idCardGenerator.generateIdCard(registration, aiImageBuffer);
  
  // Upload ID card
  const cardFileName = `${registration.registration_id}.png`;
  const { data: cardUploadData, error: cardUploadError } = await supabaseAdmin.storage
    .from('id-cards')
    .upload(cardFileName, idCardBuffer, {
      contentType: 'image/png',
      upsert: true
    });
  
  if (cardUploadError) throw cardUploadError;
  
  // Step 4: Update registration as completed
  await supabaseAdmin
    .from('new_registrations')
    .update({
      id_card_path: cardUploadData.path,
      status: 'completed'
    })
    .eq('id', registrationId);
  
  console.log(`🎉 Registration completed: ${registration.registration_id}`);
}

async function generateSimpleIdCard(registrationId, registration) {
  console.log(`⚡ Generating simple ID card for: ${registration.registration_id}`);
  
  const idCardGenerator = new IdCardGenerator();
  const idCardBuffer = await idCardGenerator.generateIdCard(registration);
  
  // Upload ID card
  const cardFileName = `${registration.registration_id}.png`;
  const { data: cardUploadData, error: cardUploadError } = await supabaseAdmin.storage
    .from('id-cards')
    .upload(cardFileName, idCardBuffer, {
      contentType: 'image/png',
      upsert: true
    });
  
  if (cardUploadError) throw cardUploadError;
  
  // Update registration
  await supabaseAdmin
    .from('new_registrations')
    .update({
      id_card_path: cardUploadData.path,
      status: 'completed'
    })
    .eq('id', registrationId);
  
  console.log(`✅ Simple ID card generated: ${registration.registration_id}`);
}

async function generateAIPortrait(imageBuffer, registration) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  // Convert image to base64
  const base64Image = imageBuffer.toString('base64');
  
  const prompt = `Create a professional, futuristic AI portrait based on this photo. 
  The person is participating in "${registration.event_name}" at Navaspurthi 2025 college fest. 
  Style: Cyberpunk, neon accents, professional headshot, high quality, 4K resolution.
  Keep the person's facial features recognizable but enhance with futuristic elements.
  Background: Dark with subtle neon glow effects in burgundy and gold colors.`;
  
  const imageParts = [
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    },
  ];
  
  // Note: This is a simplified version. In production, you'd use a proper AI image generation service
  // For now, we'll enhance the original image with filters
  const enhancedImage = await sharp(imageBuffer)
    .resize(800, 800, { fit: 'cover' })
    .modulate({ brightness: 1.1, saturation: 1.2 })
    .tint({ r: 255, g: 215, b: 0 }) // Gold tint
    .jpeg({ quality: 90 })
    .toBuffer();
  
  return enhancedImage;
}

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});

worker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

module.exports = {
  registrationQueue,
  worker
};

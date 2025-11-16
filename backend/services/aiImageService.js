const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const { supabaseAdmin } = require('../config/supabase');

class AIImageService {
  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async enhanceProfileImage(imageBuffer, userInfo = {}) {
    try {
      // First, optimize the original image
      const optimizedBuffer = await this.optimizeImage(imageBuffer);
      
      // Try AI enhancement if available
      if (this.genAI) {
        try {
          const enhancedBuffer = await this.tryAIEnhancement(optimizedBuffer, userInfo);
          if (enhancedBuffer) {
            return {
              success: true,
              imageBuffer: enhancedBuffer,
              type: 'ai_enhanced',
              message: 'Image enhanced with AI'
            };
          }
        } catch (aiError) {
          console.log('AI enhancement failed, using optimized original:', aiError.message);
        }
      }

      // Fallback: Use enhanced original image
      const enhancedBuffer = await this.createEnhancedImage(optimizedBuffer, userInfo);
      
      return {
        success: true,
        imageBuffer: enhancedBuffer,
        type: 'enhanced_original',
        message: 'Image optimized and enhanced'
      };

    } catch (error) {
      console.error('Image enhancement error:', error);
      
      // Final fallback: Return optimized original
      try {
        const fallbackBuffer = await this.optimizeImage(imageBuffer);
        return {
          success: true,
          imageBuffer: fallbackBuffer,
          type: 'optimized_original',
          message: 'Image optimized'
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: 'Failed to process image',
          imageBuffer: imageBuffer // Return original as last resort
        };
      }
    }
  }

  async optimizeImage(imageBuffer) {
    return await sharp(imageBuffer)
      .resize(800, 800, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 90,
        progressive: true
      })
      .toBuffer();
  }

  async tryAIEnhancement(imageBuffer, userInfo) {
    // For now, return null since Gemini Vision API might have issues
    // This can be implemented later when the API is stable
    return null;
  }

  async createEnhancedImage(imageBuffer, userInfo) {
    // Create an enhanced version with better contrast and colors
    const enhancedBuffer = await sharp(imageBuffer)
      .modulate({
        brightness: 1.1,
        saturation: 1.2,
        hue: 0
      })
      .sharpen({
        sigma: 1,
        flat: 1,
        jagged: 2
      })
      .gamma(1.1)
      .toBuffer();

    return enhancedBuffer;
  }

  async generateAvatarFallback(userInfo) {
    // Generate a beautiful avatar with user initials if no photo provided
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#F8C76F');
    gradient.addColorStop(1, '#D4AF37');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);

    // Add user initials
    const initials = this.getInitials(userInfo.fullName || 'User');
    ctx.fillStyle = '#2B0718';
    ctx.font = 'bold 300px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 400, 400);

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

  async uploadToStorage(imageBuffer, fileName, bucket = 'ai-images') {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        success: true,
        path: data.path,
        publicUrl: urlData.publicUrl
      };

    } catch (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AIImageService();

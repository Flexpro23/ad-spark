import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// For server-side Vertex AI calls, we'll use the REST API
// This approach works better in serverless environments like Vercel

interface ImageGenerationRequest {
  scenes: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;
  model: 'imagen-4.0-generate-preview-05-20' | 'imagen-4.0-ultra-generate-exp-05-20';
  aspectRatio?: string;
  numberOfImages?: number;
}

interface GeneratedImage {
  sceneId: string;
  imageUrl: string;
  mimeType: string;
  prompt?: string;
}

// Helper function to call Vertex AI Imagen API using Service Account Authentication
async function generateImageForScene(
  scene: { id: string; title: string; description: string; order: number },
  model: string,
  aspectRatio: string = "16:9",
  numberOfImages: number = 1
): Promise<GeneratedImage> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "ai-spark-25";
  const location = "us-central1";

  try {
    // Initialize Google Auth for service account authentication
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      // Use service account key from environment variable for Vercel deployment
      ...(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && {
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
      }),
      // If GOOGLE_APPLICATION_CREDENTIALS is set (local development), it will use that file
      // Otherwise, it will try to use default application credentials
    });

    // Get access token
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    // Map aspect ratios to Vertex AI format
    const aspectRatioMap: { [key: string]: string } = {
      "16:9": "16:9",
      "9:16": "9:16", 
      "1:1": "1:1",
      "4:3": "4:3",
      "3:4": "3:4"
    };

    const requestBody = {
      instances: [{
        prompt: scene.description,
      }],
      parameters: {
        sampleCount: numberOfImages,
        aspectRatio: aspectRatioMap[aspectRatio] || "16:9",
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
        // Add more parameters based on the model capabilities
        ...(model.includes('ultra') && {
          // Ultra model specific parameters
          enhancePrompt: true,
          guidanceScale: 20
        })
      }
    };

    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI API error:', response.status, errorText);
      throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.predictions || result.predictions.length === 0) {
      throw new Error('No images generated');
    }

    const prediction = result.predictions[0];
    
    // Convert base64 to data URL
    const imageUrl = `data:${prediction.mimeType || 'image/png'};base64,${prediction.bytesBase64Encoded}`;

    return {
      sceneId: scene.id,
      imageUrl: imageUrl,
      mimeType: prediction.mimeType || 'image/png',
      prompt: prediction.prompt || scene.description
    };

  } catch (error) {
    console.error('Authentication or API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { scenes, model, aspectRatio = "16:9", numberOfImages = 1 } = body;

    console.log(`Starting image generation for ${scenes.length} scenes using ${model}`);

    // Check if we have proper Google Cloud authentication set up
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    if (!projectId) {
      console.log('No Google Cloud Project ID found, using demo mode');
      
      // Fallback to placeholder images if authentication is not configured
      const placeholderImages: GeneratedImage[] = scenes.map(scene => ({
        sceneId: scene.id,
        imageUrl: `data:image/svg+xml;base64,${Buffer.from(
          `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <text x="50%" y="40%" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">
              ${scene.title}
            </text>
            <text x="50%" y="60%" text-anchor="middle" fill="#e2e8f0" font-family="Arial" font-size="14">
              ${model} (Demo Mode)
            </text>
            <text x="50%" y="75%" text-anchor="middle" fill="#cbd5e1" font-family="Arial" font-size="12">
              Set up Google Cloud authentication for real generation
            </text>
          </svg>`
        ).toString('base64')}`,
        mimeType: "image/svg+xml",
        prompt: scene.description
      }));

      return NextResponse.json({
        success: true,
        images: placeholderImages,
        model: model,
        message: `Generated ${placeholderImages.length} placeholder images. Set up Google Cloud service account authentication for actual generation.`,
        isDemo: true
      });
    }

    // Generate images for each scene
    const generatedImages: GeneratedImage[] = [];
    const errors: string[] = [];
    
    for (const scene of scenes) {
      try {
        console.log(`Generating image for scene: ${scene.title}`);
        const image = await generateImageForScene(scene, model, aspectRatio, numberOfImages);
        generatedImages.push(image);
      } catch (error) {
        let errorMessage = `Failed to generate image for scene "${scene.title}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        
        // If we hit quota limits with ultra model, try with preview model
        if (error instanceof Error && error.message.includes('429') && model.includes('ultra')) {
          console.log(`Quota exceeded for ultra model, retrying with preview model for scene: ${scene.title}`);
          try {
            const fallbackImage = await generateImageForScene(scene, 'imagen-4.0-generate-preview-05-20', aspectRatio, numberOfImages);
            generatedImages.push(fallbackImage);
            console.log(`Successfully generated image with preview model for scene: ${scene.title}`);
            continue; // Skip adding to errors array
          } catch (fallbackError) {
            errorMessage = `Failed with both ultra and preview models for scene "${scene.title}": ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`;
            console.error(errorMessage);
          }
        }
        
        errors.push(errorMessage);
        
        // Add a placeholder for failed generations
        generatedImages.push({
          sceneId: scene.id,
          imageUrl: `data:image/svg+xml;base64,${Buffer.from(
            `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#ef4444"/>
              <text x="50%" y="40%" text-anchor="middle" fill="white" font-family="Arial" font-size="18">
                Generation Failed: ${scene.title}
              </text>
              <text x="50%" y="60%" text-anchor="middle" fill="white" font-family="Arial" font-size="12">
                ${error instanceof Error && error.message.includes('429') ? 'Quota Exceeded' : 'API Error'}
              </text>
            </svg>`
          ).toString('base64')}`,
          mimeType: "image/svg+xml",
          prompt: scene.description
        });
      }
    }

    const response = {
      success: generatedImages.length > 0,
      images: generatedImages,
      model: model,
      message: errors.length > 0 
        ? `Generated ${generatedImages.length - errors.length}/${scenes.length} images successfully. ${errors.length} failed.`
        : `Successfully generated ${generatedImages.length} images using ${model}`,
      errors: errors.length > 0 ? errors : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Vertex AI image generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Note: To implement actual Vertex AI calls, you would need to:
// 1. Set up Google Cloud service account credentials
// 2. Install @google-cloud/aiplatform
// 3. Use the ImageGenerationModel class or REST API calls
// 4. Handle authentication properly

// Example of actual implementation would be:
/*
import { PredictionServiceClient } from '@google-cloud/aiplatform';

const client = new PredictionServiceClient({
  // credentials would be configured here
});

// Then use client.predict() with proper parameters
*/ 
# AdSpark AI - AI-Powered Ad Creation Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ali-odats-projects/v0-ad-spark-workflow)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/gCbR2L4hFrI)

## Overview

AdSpark AI is a comprehensive web application that empowers users to create professional video advertisements using AI technology. The platform combines Firebase for backend services with Google's Gemini 2.5 Flash AI for intelligent ad creation and Google Cloud's Vertex AI Imagen models for high-quality image generation.

## Features

- 🤖 **AI-Powered Idea Enhancement** - Using Gemini 2.5 Flash with thinking capabilities
- 🎨 **AI Image Generation** - Google Cloud Vertex AI Imagen 4.0 models for stunning visuals
- 🔥 **Firebase Integration** - Authentication, Firestore database, and Cloud Storage
- 📁 **Project Management** - Create, save, and manage ad projects
- 💬 **Real-time AI Chat** - Interactive conversation for refining ad concepts
- 📸 **Asset Upload** - Drag-and-drop file uploads with Firebase Storage
- 🎭 **Multi-step Workflow** - Guided process from idea to final ad
- 🔐 **User Authentication** - Email/password and Google OAuth
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Chat**: Google Gemini 2.5 Flash API
- **AI Images**: Google Cloud Vertex AI Imagen 4.0
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ad-spark
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Gemini AI API Key (get from https://ai.google.dev/)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Configuration for Vertex AI
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=ai-spark-25

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Your Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your `.env.local` file

### 4. Set Up Google Cloud Vertex AI (For Image Generation)

#### Option A: Using Service Account (Recommended for Production)

1. **Create a Google Cloud Project** (or use existing one)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing project `ai-spark-25`

2. **Enable Vertex AI API**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

3. **Create a Service Account**
   ```bash
   gcloud iam service-accounts create vertex-ai-service \
     --description="Service account for Vertex AI image generation" \
     --display-name="Vertex AI Service"
   ```

4. **Grant Necessary Permissions**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:vertex-ai-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

5. **Create and Download Service Account Key**
   ```bash
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=vertex-ai-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

6. **Set Environment Variables**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```

#### Option B: Using Default Application Credentials (For Development)

1. **Install Google Cloud CLI**
   - Download from [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)

2. **Authenticate**
   ```bash
   gcloud auth application-default login
   ```

3. **Set Project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

#### Available Imagen Models

The application supports two Imagen 4.0 models:

- **imagen-4.0-generate-preview-05-20** (Preview)
  - Fast generation with good quality
  - Cost-effective for most use cases

- **imagen-4.0-ultra-generate-exp-05-20** (Experimental)
  - Higher quality with enhanced prompt understanding
  - Better for complex scenes and detailed requirements

### 5. Firebase Configuration

The Firebase configuration is already set up in `lib/firebase.ts`. The project uses:
- **Project ID**: ai-spark-25
- **Authentication**: Email/password and Google OAuth
- **Firestore**: Project data storage
- **Storage**: File uploads for assets

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## AI Integration

### Gemini 2.5 Flash Features

- **Thinking Capabilities**: Uses adaptive reasoning for complex ad strategy
- **Cost Efficient**: Optimized price-performance ratio
- **Real-time Chat**: Interactive conversation for idea refinement
- **Streaming Responses**: Real-time AI responses as they're generated

### Vertex AI Imagen Features

- **High-Quality Images**: Professional-grade image generation
- **Multiple Aspect Ratios**: 16:9, 9:16, 1:1, 4:3, 3:4
- **Prompt Enhancement**: Automatic prompt optimization
- **Safety Filters**: Built-in content safety controls

### API Endpoints

- `POST /api/gemini/chat` - General chat functionality
- `POST /api/gemini/enhance-idea` - Specialized idea enhancement
- `POST /api/gemini/stream` - Streaming responses
- `POST /api/vertex-ai/generate-images` - Image generation with Vertex AI

## Image Generation Workflow

1. **Scene Creation**: AI generates detailed scene descriptions
2. **Model Selection**: Choose between Preview or Ultra models
3. **Customization**: Select aspect ratio and generation parameters
4. **Generation**: High-quality images created from scene descriptions
5. **Download**: Save individual images or complete project

## Project Structure

```
ad-spark/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── gemini/        # Gemini AI endpoints
│   │   └── vertex-ai/     # Vertex AI endpoints
│   ├── create/            # Ad creation workflow
│   └── dashboard/         # User dashboard
├── components/            # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Configuration and utilities
└── public/               # Static assets
```

## Development

### Adding New Features

1. Create components in `components/`
2. Add custom hooks in `hooks/`
3. Create API routes in `app/api/`
4. Update Firebase schemas in `hooks/useFirestore.ts`

### AI Prompting

The AI system uses specialized prompts for advertising:
- Target audience analysis
- Creative execution ideas
- Platform-specific recommendations
- Call-to-action optimization

## Troubleshooting

### Image Generation Issues

1. **Authentication Errors**
   - Verify Google Cloud credentials are properly set
   - Check service account permissions
   - Ensure Vertex AI API is enabled

2. **Demo Mode**
   - If authentication fails, the app falls back to placeholder images
   - This allows testing the UI without full Google Cloud setup

3. **Model Availability**
   - Ensure your Google Cloud project has access to Imagen models
   - Check regional availability for the models

## Deployment

The project is automatically deployed on Vercel. Any changes pushed to the main branch will trigger a new deployment.

**Live URL**: [https://vercel.com/ali-odats-projects/v0-ad-spark-workflow](https://vercel.com/ali-odats-projects/v0-ad-spark-workflow)

**Note**: For production deployment with image generation, you'll need to configure Google Cloud credentials in your deployment environment.

## Contributing

This project was originally built with [v0.dev](https://v0.dev) and enhanced with Firebase, Gemini AI, and Vertex AI integration.

Continue building at: **[https://v0.dev/chat/projects/gCbR2L4hFrI](https://v0.dev/chat/projects/gCbR2L4hFrI)**
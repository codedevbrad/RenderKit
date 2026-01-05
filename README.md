<div align="center">

# 🎬 Remotion Video Creator

**Create stunning videos programmatically with React and Remotion**

[![Remotion](https://img.shields.io/badge/Remotion-4.0.398-blue?style=for-the-badge&logo=react)](https://remotion.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Supported-orange?style=for-the-badge&logo=aws-lambda)](https://aws.amazon.com/lambda/)

</div>

---

<div align="center">

### A powerful video creation platform built with Remotion, Next.js, and AWS Lambda

**Create, edit, and render videos programmatically with a beautiful web-based editor**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [AWS Lambda](#-aws-lambda-setup)

</div>

---

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🎨 **Visual Editor** | Web-based studio editor for creating and editing video segments |
| 🎬 **Remotion Studio** | Full Remotion Studio integration for preview and development |
| ☁️ **AWS Lambda Rendering** | Render videos at scale using AWS Lambda |
| 🎯 **Segment Management** | Create, edit, and organize video segments with ease |
| 🎵 **Audio Support** | Add audio tracks to your videos |
| 🖼️ **GIF Integration** | Import and use GIFs from Giphy |
| 💻 **Code Snippets** | Display code snippets with syntax highlighting |
| 📱 **Responsive Design** | Modern, responsive UI built with Tailwind CSS |

</div>

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- AWS account (for Lambda rendering - optional)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd remotion

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📖 Usage

### Open Remotion Studio

Launch the Remotion Studio to preview and develop your videos:

```bash
npm run remotion
# or
npx remotion studio
```

### Render Videos Locally

Render your video composition locally:

```bash
npm run render
# or
npx remotion render
```

### Upgrade Remotion

Keep your Remotion version up to date:

```bash
npx remotion upgrade
```

## ⚙️ Configuration

### Remotion Configuration

Edit `remotion.config.ts` to customize your Remotion setup:

```typescript
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
// Add your custom configurations
```

### Lambda Configuration

Configure AWS Lambda settings in `config.mjs`:

```javascript
export const REGION = "us-east-1";
export const SITE_NAME = "my-next-app";
export const RAM = 3009;
export const DISK = 10240;
export const TIMEOUT = 240;
```

## ☁️ AWS Lambda Setup

<div align="center">

### Render videos at scale with AWS Lambda

</div>

This project supports rendering videos via [Remotion Lambda](https://remotion.dev/lambda) for scalable, serverless video rendering.

### Setup Steps

1. **Configure Environment Variables**
   
   Copy the `.env.example` file to `.env` and fill in your AWS credentials:
   ```bash
   cp .env.example .env
   ```
   
   Complete the [Lambda setup guide](https://www.remotion.dev/docs/lambda/setup) to get your AWS credentials.

2. **Configure Lambda Settings**
   
   Edit the `config.mjs` file with your desired Lambda settings:
   - Region
   - Site name
   - RAM allocation
   - Disk space
   - Timeout duration

3. **Deploy to AWS**
   
   Deploy your Lambda function and Remotion Bundle:
   ```bash
   npm run deploy
   # or
   node deploy.mjs
   ```

### When to Deploy

You should run the deploy script after:
- ✏️ Changing the video template
- ⚙️ Modifying `config.mjs`
- 🔄 Upgrading Remotion to a newer version
- 🎨 Making significant changes to your Remotion components

## 📁 Project Structure

```
remotion/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes for rendering
│   │   └── studio/      # Studio editor pages
│   ├── components/      # Reusable React components
│   ├── editor/          # Video editor components
│   ├── remotion/        # Remotion compositions
│   │   ├── reusable/    # Reusable Remotion components
│   │   └── Main.tsx     # Main composition
│   └── helpers/         # Utility functions
├── config.mjs           # Lambda configuration
├── remotion.config.ts   # Remotion configuration
└── deploy.mjs           # Deployment script
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start Next.js development server
npm run remotion     # Open Remotion Studio

# Building
npm run build        # Build Next.js application
npm start            # Start production server

# Rendering
npm run render       # Render video locally

# Deployment
npm run deploy       # Deploy to AWS Lambda

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Tech Stack

<div align="center">

| Technology | Purpose |
|------------|---------|
| [Remotion](https://remotion.dev) | Video creation framework |
| [Next.js](https://nextjs.org) | React framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [AWS Lambda](https://aws.amazon.com/lambda) | Serverless rendering |
| [Zod](https://zod.dev) | Schema validation |

</div>

---

<div align="center">

**Made with ❤️ using Remotion**

[![Remotion](https://img.shields.io/badge/Powered%20by-Remotion-blue?style=flat-square)](https://remotion.dev)

</div>


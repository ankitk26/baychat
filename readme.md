# baychat

baychat is an open-source AI chatbot application built with TanStack Start, Convex, and the Vercel AI SDK.  
It supports multiple AI providers, real-time messaging, and chat organization.

## Features

### AI Model Support

- Google Gemini
- OpenAI
- Anthropic
- OpenRouter
- BYOK (Bring your own API keys)

### Chat Management

- Real-time streaming responses
- Organize chats with folders
- Pin or branch conversations
- Share chats with others
- Edit or regenerate messages

### UI

- Light and dark themes
- Code syntax highlighting (Shiki)
- Math rendering (KaTeX)
- Markdown support

### Image Generation

- Generate images from text prompts
- Support for multiple image generation models
- Download and share generated images

### Authentication

- GitHub and Google OAuth (via Better Auth)

## Tech Stack

**Frontend**

- TanStack Start (full-stack React framework)
- TanStack Query (server state management)
- ShadCN on Base UI (UI components, base-nova style)
- TanStack Store (client state management)

**Backend**

- Convex (real-time database and backend)
- Better Auth (authentication library)
- Vercel AI SDK (AI model integration)
- Zod (schema validation)

**AI Providers**

- OpenAI (GPT models)
- Anthropic (Claude models)
- Google (Gemini models)
- xAI (Grok models)
- OpenRouter (unified AI API)
- BYOK support for all above providers

**Development**

- Oxlint for linting and Oxfmt for formatting

## Installation

### Prerequisites

- Node.js 18+
- pnpm 9+ (used here)
- Git

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/ankitk26/baychat.git
   cd baychat
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up Convex:

   ```bash
   npx convex dev
   ```

   Follow the prompts to create a new Convex project and get your deployment URL.

4. Create a `.env.local` file in the root directory:

   ```env
   # Convex (Required)
   CONVEX_DEPLOYMENT=dev:your_project_name
   VITE_CONVEX_URL=https://your_project_url.convex.cloud
   VITE_CONVEX_SITE_URL=https://your_project_url.convex.site

   # Site URL (Required)
   VITE_SITE_URL=http://localhost:3000

   # BetterAuth (Required for authentication)
   BETTER_AUTH_SECRET=your_better_auth_secret

   # GitHub OAuth (Required for authentication)
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # Google OAuth (Required for authentication)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Server-only keys for AI providers
   ANTHROPIC_API_KEY=your_anthropic_api_key
   # Used for the monthly trial allowance
   OPENROUTER_TRIAL_API_KEY=your_openrouter_api_key
   # Used to generate chat titles for users without their own API keys
   OPENROUTER_CHAT_TITLE_GENERATION_KEY=your_openrouter_chat_title_key
   ```

5. Run the development server (this starts both the app and Convex):

   ```bash
   pnpm run dev:all
   ```

   Or, run them separately in two terminals:

   ```bash
   pnpm run dev          # starts the Vite app
   npx convex dev        # starts the Convex backend
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Sign in with your GitHub or Google account
2. Configure API keys in settings (optional - new users receive 5 trial messages per month)
3. Start chatting with any available AI model
4. Organize chats by creating folders and pinning important conversations

## Support

- Issues: [GitHub Issues](https://github.com/ankitk26/baychat/issues)
- Discussions: [GitHub Discussions](https://github.com/ankitk26/baychat/discussions)
- Documentation: Check the code comments and type definitions

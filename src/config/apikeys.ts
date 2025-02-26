export const apiKeys = {
    chatgpt: import.meta.env.VITE_CHATGPT_API_KEY || null,
    claude: import.meta.env.VITE_CLAUDE_API_KEY || null,
    gemini: import.meta.env.VITE_GEMINI_API_KEY || null,
    deepseek: import.meta.env.VITE_DEEPSEEK_API_KEY || null,
  };
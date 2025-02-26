import axios from 'axios';

const BASE_URLS = {
  chatgpt: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/complete',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
};

interface ProcessTextParams {
  text: string;
  imagesPerMinute: number;
  estimatedTime: number;
  apiKey: string;
  provider: 'chatgpt' | 'anthropic' | 'gemini' | 'deepseek';
}

const generatePrompt = (text: string, imagesPerMinute: number, estimatedTime: number): string => {
  const wordsPerBlock = `${Math.floor(150 / imagesPerMinute)} to ${Math.floor(200 / imagesPerMinute)}`;
  return `You are an expert in creating descriptive prompts for images. Based on the script of a video, your task is to generate detailed visual prompts for each block of narration. Each image should complement the story without distracting from the narrative.
Return the output as plain text without any markdown, asterisks, or special formatting.

Instructions:
1. Read the full script of the video.
2. Divide the script into ${estimatedTime} blocks (each block represents one minute of the video).
3. For each block:
   - Generate ${imagesPerMinute} distinct image prompts.
   - Adjust the number of words per image prompt accordingly (approximately ${wordsPerBlock} words per image prompt).
4. Each image prompt should:
   - Be visually rich and detailed.
   - Capture the main theme of the block.
   - Include elements suitable for zoom, panning, or text overlay effects.
5. Avoid repetitions: Each image must be unique and relevant to its corresponding block.

Prompt format:
Block X:
- Image Prompt 1: [Detailed visual description].
- Image Prompt 2: [Detailed visual description].
...
- Image Prompt ${imagesPerMinute}: [Detailed visual description].

Video Script:
[${text}]

Task:
Generate image prompts following the instructions above, ensuring each block has ${imagesPerMinute} unique, visually engaging prompts aligned with the corresponding section of the script.`;
};


export const processText = async ({ text, provider, imagesPerMinute,estimatedTime, apiKey }: ProcessTextParams) => {
  console.log(provider)
  const prompt = generatePrompt(text, imagesPerMinute,estimatedTime);
  const baseURL = BASE_URLS[provider];

  if (!baseURL) throw new Error('Invalid provider selected.');

  try {
    let response;

    switch (provider) {
      case 'chatgpt':
        response = await axios.post(
          baseURL,
          {
            model: 'gpt-4-turbo',
            messages: [
              { role: 'system', content: 'You are an expert in creating descriptive prompts for images.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        return { processed_text: response.data.choices[0].message.content };

      case 'anthropic':
        response = await axios.post(
          baseURL,
          {
            model: 'claude-3-opus-20240229',
            prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
            max_tokens_to_sample: 1024,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
            },
          }
        );
        return { processed_text: response.data.completion };

      case 'gemini':
        response = await axios.post(
          `${baseURL}?key=${apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return { processed_text: response.data.candidates[0].content.parts[0].text };

      case 'deepseek':
        response = await axios.post(
          baseURL,
          {
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'You are an expert in creating descriptive prompts for images.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        return { processed_text: response.data.choices[0].message.content };

      default:
        throw new Error('Provider not supported.');
    }
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
};

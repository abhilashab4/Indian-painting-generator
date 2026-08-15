const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function generateImage({ prompt, style, steps, guidance, width, height, lora_scale }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style, steps, guidance, width, height, lora_scale }),
  });

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      throw new Error(data.error || 'An unknown error occurred.');
    }
    throw new Error('Unable to generate the painting. Please check the connection and try again.');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

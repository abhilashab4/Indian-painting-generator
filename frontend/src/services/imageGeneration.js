const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function generateImage({
  prompt,
  style,
  steps,
  guidance,
  width,
  height,
  lora_scale,
}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      style,
      steps,
      guidance,
      width,
      height,
      lora_scale,
    }),
  });

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();

      throw new Error(
        data.error || 'Unable to start image generation.'
      );
    }

    throw new Error(
      'Unable to start image generation. Please check the connection.'
    );
  }

  const data = await response.json();

  const callId = data.call_id;

  if (!callId) {
    throw new Error('No job ID was returned by the server.');
  }

  const resultUrl = `${API_URL}/result/${callId}`;

  while (true) {
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    const resultResponse = await fetch(resultUrl);

    if (resultResponse.status === 202) {
      console.log('Image generation still running...');
      continue;
    }

    if (!resultResponse.ok) {
      const contentType =
        resultResponse.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        const data = await resultResponse.json();

        throw new Error(
          data.error || 'Image generation failed.'
        );
      }

      throw new Error(
        'Unable to generate the painting.'
      );
    }

    const blob = await resultResponse.blob();

    return URL.createObjectURL(blob);
  }
}
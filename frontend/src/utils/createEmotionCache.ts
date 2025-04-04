import createCache from '@emotion/cache';

export default function createEmotionCache() {
  return createCache({
    key: 'mui',
    prepend: true,
    insertionPoint: document.getElementById('emotion-insertion-point'),
  });
} 
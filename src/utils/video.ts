import { VideoSource } from '../types/models';

export const detectSource = (url: string): VideoSource =>
  url.includes('instagram.com') ? 'instagram' : 'youtube';

export const buildEmbedUrl = (url: string) => {
  let videoId: string | undefined;

  if (url.includes('youtube.com/watch')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0];
  }

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1`;
  }

  return url;
};

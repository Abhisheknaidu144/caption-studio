let ffmpeg = null;
let isLoading = false;
let loadPromise = null;

export const loadFFmpeg = async (onProgress) => {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;

  loadPromise = (async () => {
    try {
      const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
      const { toBlobURL } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');

      ffmpeg = new FFmpeg();

      ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';

      let coreLoaded = false;

      try {
        if (typeof SharedArrayBuffer !== 'undefined') {
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
          });
          coreLoaded = true;
        }
      } catch (mtError) {
        console.log('Multi-threaded FFmpeg not available, trying single-threaded...');
      }

      if (!coreLoaded) {
        const stBaseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${stBaseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${stBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }

      return ffmpeg;
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      ffmpeg = null;
      throw error;
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
};

export const extractAudio = async (videoFile, onProgress) => {
  const ff = await loadFFmpeg(onProgress);

  const inputName = 'input.mp4';
  const outputName = 'output.mp3';

  const fileData = await videoFile.arrayBuffer();
  await ff.writeFile(inputName, new Uint8Array(fileData));

  await ff.exec([
    '-i', inputName,
    '-vn',
    '-acodec', 'libmp3lame',
    '-b:a', '64k',
    '-ar', '16000',
    '-ac', '1',
    outputName
  ]);

  const data = await ff.readFile(outputName);
  const audioBlob = new Blob([data.buffer], { type: 'audio/mp3' });

  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return audioBlob;
};

export const getVideoDuration = async (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(videoFile);
  });
};

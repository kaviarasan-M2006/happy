import React, { useState, useRef } from 'react';

interface PhotoItem {
  id: string;
  dataUrl: string;
  caption: string;
  date: string;
  memory: string;
}

interface CanvasVideoMakerProps {
  photos: PhotoItem[];
  musicDataUrl: string;
  onVideoGenerated: (dataUrl: string) => void;
  existingVideoUrl?: string;
}

export const CanvasVideoMaker: React.FC<CanvasVideoMakerProps> = ({
  photos,
  musicDataUrl,
  onVideoGenerated,
  existingVideoUrl
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const startGeneration = async () => {
    if (photos.length === 0) {
      alert('Please upload at least one photo first.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatusText('Preparing media...');

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // Load all images into HTMLImageElement
    const loadedImages: HTMLImageElement[] = await Promise.all(
      photos.map((photo) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = photo.dataUrl;
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load image'));
        });
      })
    );

    setStatusText('Setting up audio tracks...');
    let audioStream: MediaStream | null = null;
    let audioBuffer: AudioBuffer | null = null;
    let audioDestNode: MediaStreamAudioDestinationNode | null = null;

    if (musicDataUrl) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;

        // Fetch and decode base64 audio
        const response = await fetch(musicDataUrl);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        audioDestNode = audioCtx.createMediaStreamDestination();
        audioStream = audioDestNode.stream;
      } catch (err) {
        console.error('Audio initialization failed', err);
      }
    }

    // Set up streams
    const canvasStream = canvas.captureStream(30); // 30 fps
    const tracks = [...canvasStream.getVideoTracks()];
    if (audioStream) {
      tracks.push(...audioStream.getAudioTracks());
    }

    const combinedStream = new MediaStream(tracks);

    // Pick a supported mimeType
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser choose default
        }
      }
    }

    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    const durationPerImage = 3000; // 3 seconds per image
    const totalDuration = loadedImages.length * durationPerImage;
    let startTime = 0;

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onVideoGenerated(reader.result);
        }
        setIsGenerating(false);
        setProgress(100);
        setStatusText('Video generated successfully!');
      };
      reader.readAsDataURL(blob);
    };

    // Play background music if decoded
    if (audioContextRef.current && audioBuffer && audioDestNode) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      source.connect(audioDestNode);
      source.connect(audioContextRef.current.destination);
      source.start(0);
      activeSourceRef.current = source;
    }

    mediaRecorder.start();
    startTime = performance.now();
    setStatusText('Rendering slideshow...');

    const render = () => {
      const elapsed = performance.now() - startTime;
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(Math.round(progressPercent));

      if (elapsed >= totalDuration) {
        // Stop recording
        mediaRecorder.stop();
        if (activeSourceRef.current) {
          activeSourceRef.current.stop();
          activeSourceRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        return;
      }

      // Draw current frame
      const currentIdx = Math.floor(elapsed / durationPerImage);
      const imgProgress = (elapsed % durationPerImage) / durationPerImage;
      const img = loadedImages[currentIdx];

      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);

      // Ken Burns Effect (Zoom)
      const scale = 1.0 + imgProgress * 0.15; // Zoom from 1.0 to 1.15

      // Draw image centering it while retaining aspect ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let dx = 0;
      let dy = 0;

      if (imgAspect > canvasAspect) {
        drawWidth = height * imgAspect;
        dx = (width - drawWidth) / 2;
      } else {
        drawHeight = width / imgAspect;
        dy = (height - drawHeight) / 2;
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      ctx.restore();

      // Fade-in overlay at the very beginning of image duration and fade-out at the end
      let alpha = 1;
      if (imgProgress < 0.1) {
        alpha = imgProgress / 0.1;
      } else if (imgProgress > 0.9) {
        alpha = (1 - imgProgress) / 0.1;
      }

      // Cross-fade with next image if near transition
      if (imgProgress > 0.85 && currentIdx < loadedImages.length - 1) {
        const nextImg = loadedImages[currentIdx + 1];
        const nextAlpha = (imgProgress - 0.85) / 0.15;

        // Draw next image partially overlaying
        const nextImgAspect = nextImg.width / nextImg.height;
        let nDrawWidth = width;
        let nDrawHeight = height;
        let ndx = 0;
        let ndy = 0;

        if (nextImgAspect > canvasAspect) {
          nDrawWidth = height * nextImgAspect;
          ndx = (width - nDrawWidth) / 2;
        } else {
          nDrawHeight = width / nextImgAspect;
          ndy = (height - nDrawHeight) / 2;
        }

        ctx.save();
        ctx.globalAlpha = nextAlpha;
        ctx.drawImage(nextImg, ndx, ndy, nDrawWidth, nDrawHeight);
        ctx.restore();
      }

      // Draw Text Caption (Fade-in with the main image alpha)
      const caption = photos[currentIdx].caption || `Memory ${currentIdx + 1}`;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Caption Background Bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, height - 100, width, 100);

      // Text Drawing
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 5;
      ctx.fillText(caption, width / 2, height - 50);

      // Draw date if present
      if (photos[currentIdx].date) {
        ctx.font = '18px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(photos[currentIdx].date, width / 2, height - 80);
      }

      ctx.restore();

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  };

  return (
    <div className="video-maker-container" style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)' }}>
      <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🎥 AI Slideshow Video Generator
      </h3>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 20px 0' }}>
        Generate a cinematic MP4/WebM video slideshow using your uploaded photos, including background music, Ken Burns panning, and transitions.
      </p>

      {isGenerating ? (
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
            <span>{statusText}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #ff007f, #7f00ff)', transition: 'width 0.1s linear' }}></div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', maxWidth: '320px', height: '180px', marginTop: '15px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
        </div>
      ) : (
        <div>
          <button
            onClick={startGeneration}
            disabled={photos.length === 0}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #7f00ff, #ff007f)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: photos.length === 0 ? 'not-allowed' : 'pointer',
              opacity: photos.length === 0 ? 0.5 : 1,
              width: '100%'
            }}
          >
            {existingVideoUrl ? '🔄 Regenerate Birthday Video' : '🎬 Generate Birthday Video'}
          </button>

          {existingVideoUrl && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '14px', color: '#4caf50', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                ✓ Video generated successfully!
              </p>
              <video
                src={existingVideoUrl}
                controls
                style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'block' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { Upload, ArrowLeftRight, Trash2, Calendar, FileText, Scissors } from 'lucide-react';

interface PhotoItem {
  id: string;
  dataUrl: string;
  caption: string;
  date: string;
  memory: string;
}

interface DragDropUploadProps {
  photos: PhotoItem[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
  featuredVideoUrl: string;
  setFeaturedVideoUrl: (url: string) => void;
  musicUrl: string;
  setMusicUrl: (url: string) => void;
  voiceUrl: string;
  setVoiceUrl: (url: string) => void;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  photos,
  setPhotos,
  featuredVideoUrl,
  setFeaturedVideoUrl,
  musicUrl,
  setMusicUrl,
  voiceUrl,
  setVoiceUrl
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropPhotoId, setCropPhotoId] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);
  const voiceInputRef = useRef<HTMLInputElement | null>(null);

  // File to Base64 utility
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle Drag & Drop Photos
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processPhotos = async (files: FileList) => {
    const remainingSlots = 100 - photos.length;
    if (remainingSlots <= 0) {
      alert('You have reached the maximum limit of 100 photos.');
      return;
    }

    const filesToUpload = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, remainingSlots);

    const newPhotoItems: PhotoItem[] = await Promise.all(
      filesToUpload.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: Math.random().toString(36).substring(2, 9),
          dataUrl: base64,
          caption: file.name.split('.')[0].replace(/[-_]/g, ' '),
          date: '',
          memory: ''
        };
      })
    );

    setPhotos((prev) => [...prev, ...newPhotoItems]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processPhotos(e.dataTransfer.files);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processPhotos(e.target.files);
    }
  };

  // Edit fields
  const updatePhotoField = (id: string, field: keyof PhotoItem, value: string) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, [field]: value } : photo))
    );
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const openCropModal = (id: string) => {
    const photo = photos.find((item) => item.id === id);
    if (!photo) return;
    setCropPhotoId(id);
    setCropImageSrc(photo.dataUrl);
    setCropZoom(1);
    setCropModalOpen(true);
  };

  const applyCrop = async () => {
    if (!cropPhotoId || !cropImageSrc) return;

    const img = new Image();
    img.src = cropImageSrc;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Unable to load image for cropping'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const sourceWidth = img.naturalWidth;
    const sourceHeight = img.naturalHeight;
    const minSide = Math.min(sourceWidth, sourceHeight);
    const zoomedSize = minSide / cropZoom;
    const sourceX = (sourceWidth - zoomedSize) / 2;
    const sourceY = (sourceHeight - zoomedSize) / 2;

    ctx.drawImage(img, sourceX, sourceY, zoomedSize, zoomedSize, 0, 0, 900, 900);
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setPhotos((prev) => prev.map((photo) => (photo.id === cropPhotoId ? { ...photo, dataUrl: croppedDataUrl } : photo)));
    setCropModalOpen(false);
    setCropPhotoId(null);
    setCropImageSrc('');
    setCropZoom(1);
  };

  // Rearranging via Drag and Drop
  const handleCardDragStart = (index: number) => {
    setDraggedCardIndex(index);
  };

  const handleCardDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedCardIndex === null || draggedCardIndex === targetIndex) return;

    // Swap items in-place
    const updatedPhotos = [...photos];
    const draggedItem = updatedPhotos[draggedCardIndex];
    updatedPhotos.splice(draggedCardIndex, 1);
    updatedPhotos.splice(targetIndex, 0, draggedItem);

    setDraggedCardIndex(targetIndex);
    setPhotos(updatedPhotos);
  };

  const handleCardDragEnd = () => {
    setDraggedCardIndex(null);
  };

  // Handle Video, Music, Voice
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'music' | 'voice') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);

      if (type === 'video') setFeaturedVideoUrl(base64);
      if (type === 'music') setMusicUrl(base64);
      if (type === 'voice') setVoiceUrl(base64);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Photo Uploader */}
      <div>
        <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🖼️ Photo Memories ({photos.length}/100)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '15px' }}>
          Upload photos that depict beautiful moments. You can drag cards to rearrange their slideshow order, and add captions or memory logs.
        </p>

        <div
          className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            accept="image/*"
            onChange={handlePhotoSelect}
          />
          <Upload size={32} style={{ color: '#ff007f', marginBottom: '10px' }} />
          <p style={{ fontWeight: 'bold' }}>Drag and Drop Photos here</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>or click to browse from device</p>
        </div>

        {cropModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>✂️ Crop Your Photo</h4>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginBottom: '12px' }}>
                Zoom in to focus on the most important part of the memory.
              </p>
              {cropImageSrc && (
                <img
                  src={cropImageSrc}
                  alt="Crop preview"
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '10px', marginBottom: '12px', background: '#030712' }}
                />
              )}
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', opacity: 0.8 }}>Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setCropModalOpen(false)} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  Cancel
                </button>
                <button type="button" onClick={applyCrop} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleCardDragStart(index)}
                onDragOver={(e) => handleCardDragOver(e, index)}
                onDragEnd={handleCardDragEnd}
                className="photo-card"
                style={{
                  opacity: draggedCardIndex === index ? 0.4 : 1,
                  cursor: 'grab'
                }}
              >
                <div className="photo-thumbnail-container">
                  <img src={photo.dataUrl} className="photo-thumbnail" alt="Thumb" />
                  <div className="photo-actions">
                    <button
                      type="button"
                      onClick={() => openCropModal(photo.id)}
                      className="photo-btn"
                      title="Crop Image"
                    >
                      <Scissors size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePhoto(photo.id)}
                      className="photo-btn"
                      title="Delete Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '5px',
                      left: '5px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ArrowLeftRight size={10} /> #{index + 1}
                  </div>
                </div>

                <div className="photo-info">
                  <input
                    type="text"
                    placeholder="Caption (e.g. Graduation Day)"
                    className="photo-caption-input"
                    value={photo.caption}
                    onChange={(e) => updatePhotoField(photo.id, 'caption', e.target.value)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Calendar size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    <input
                      type="text"
                      placeholder="Date/Year"
                      className="photo-date-input"
                      value={photo.date}
                      onChange={(e) => updatePhotoField(photo.id, 'date', e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    <input
                      type="text"
                      placeholder="Memory / details..."
                      className="photo-date-input"
                      value={photo.memory}
                      onChange={(e) => updatePhotoField(photo.id, 'memory', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Video, Music, Voice Section */}
      <div className="grid grid-cols-2 gap-20">
        {/* Background Music */}
        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
          <h4 style={{ marginBottom: '10px' }}>🎵 Background Music (MP3)</h4>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '15px' }}>
            Upload an MP3 song to set the mood during their Memory World.
          </p>

          <input
            type="file"
            ref={musicInputRef}
            style={{ display: 'none' }}
            accept="audio/mp3,audio/*"
            onChange={(e) => handleMediaUpload(e, 'music')}
          />

          {musicUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <audio src={musicUrl} controls style={{ width: '100%' }} />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMusicUrl('')}
                style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Remove Music
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => musicInputRef.current?.click()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Select MP3 File
            </button>
          )}
        </div>

        {/* Custom Birthday Video */}
        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
          <h4 style={{ marginBottom: '10px' }}>📹 Feature Video (Optional)</h4>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '15px' }}>
            Upload an existing video (MP4) to overlay or play during the journey.
          </p>

          <input
            type="file"
            ref={videoInputRef}
            style={{ display: 'none' }}
            accept="video/mp4,video/*"
            onChange={(e) => handleMediaUpload(e, 'video')}
          />

          {featuredVideoUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <video src={featuredVideoUrl} controls style={{ width: '100%', maxHeight: '120px', borderRadius: '6px' }} />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFeaturedVideoUrl('')}
                style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Remove Video
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => videoInputRef.current?.click()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Select MP4 Video
            </button>
          )}
        </div>
      </div>

      {/* Voice Message */}
      <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
        <h4 style={{ marginBottom: '10px' }}>🎙️ Voice Narration / Message (Optional)</h4>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '15px' }}>
          Add a personalized audio voice note that plays alongside the memories.
        </p>

        <input
          type="file"
          ref={voiceInputRef}
          style={{ display: 'none' }}
          accept="audio/*"
          onChange={(e) => handleMediaUpload(e, 'voice')}
        />

        {voiceUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <audio src={voiceUrl} controls style={{ width: '100%' }} />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setVoiceUrl('')}
              style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Remove Voice Note
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => voiceInputRef.current?.click()}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Select Voice Message Audio
          </button>
        )}
      </div>
    </div>
  );
};

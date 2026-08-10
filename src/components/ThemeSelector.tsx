import React from 'react';

export interface ThemeConfig {
  id: string;
  name: string;
  desc: string;
  previewGradient: string;
  textColor: string;
}

export const themes: ThemeConfig[] = [
  { id: 'fantasy-universe', name: '🌌 Fantasy Universe', desc: 'Nebula gradients, sparkles, elegant serif styling.', previewGradient: 'linear-gradient(135deg, #120024 0%, #2e004f 100%)', textColor: '#f0e6ff' },
  { id: 'galaxy', name: '🪐 Galaxy', desc: 'Space exploration theme, starry particles, futuristic monospace.', previewGradient: 'radial-gradient(circle, #020208 0%, #080816 100%)', textColor: '#e2e8f0' },
  { id: 'princess', name: '👑 Princess', desc: 'Dreamy pink pastels, cursive fonts, magical crowns.', previewGradient: 'linear-gradient(135deg, #fff0f5 0%, #ffb6c1 100%)', textColor: '#5c2c3a' },
  { id: 'royal-gold', name: '✨ Royal Gold', desc: 'Luxury black and glittering gold, premium classical look.', previewGradient: 'linear-gradient(135deg, #0f0f12 0%, #d4af37 100%)', textColor: '#f3e5ab' },
  { id: 'nature', name: '🍃 Nature', desc: 'Forest emerald gradient, falling leaves, clean layout.', previewGradient: 'linear-gradient(135deg, #0c2012 0%, #205c33 100%)', textColor: '#e8f5e9' },
  { id: 'neon', name: '⚡ Neon', desc: 'Cyberpunk style, glowing borders, intense contrasts.', previewGradient: 'linear-gradient(135deg, #050508 0%, #ff007f 100%)', textColor: '#ffffff' },
  { id: 'love', name: '❤️ Love', desc: 'Deep red romantic accents, floating hearts, handwritten feels.', previewGradient: 'linear-gradient(135deg, #3a0007 0%, #a3001c 100%)', textColor: '#ffeef0' },
  { id: 'minimal-elegant', name: '🖤 Minimal Elegant', desc: 'Clean, simple high-contrast layout for a timeless feel.', previewGradient: 'linear-gradient(135deg, #ffffff 0%, #eaeaea 100%)', textColor: '#1a1a1a' },
  { id: 'anime', name: '🎒 Anime', desc: 'Pop cartoon style, comic borders, vibrant layout.', previewGradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)', textColor: '#2c3e50' },
  { id: 'custom', name: '🎨 Custom Theme', desc: 'Define your own theme setup and look.', previewGradient: 'linear-gradient(135deg, #1f4068 0%, #162447 100%)', textColor: '#ffffff' }
];

interface ThemeSelectorProps {
  selectedTheme: string;
  setSelectedTheme: (themeId: string) => void;
  particles: {
    stars: boolean;
    butterflies: boolean;
    balloons: boolean;
    ribbons: boolean;
    petals: boolean;
    sparkles: boolean;
    confetti: boolean;
    fireworks: boolean;
    particles: boolean;
    magicCursor: boolean;
  };
  setParticles: React.Dispatch<React.SetStateAction<{
    stars: boolean;
    butterflies: boolean;
    balloons: boolean;
    ribbons: boolean;
    petals: boolean;
    sparkles: boolean;
    confetti: boolean;
    fireworks: boolean;
    particles: boolean;
    magicCursor: boolean;
  }>>;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  setSelectedTheme,
  particles,
  setParticles
}) => {
  const toggleParticle = (key: keyof typeof particles) => {
    setParticles((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Select an Immersive Theme</h3>
      <div className="themes-grid" style={{ marginBottom: '40px' }}>
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
          >
            <div
              className="theme-card-preview"
              style={{
                background: theme.previewGradient,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.textColor,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}
            >
              Aa Bb
            </div>
            <div className="theme-card-info">
              <div className="theme-card-title">{theme.name}</div>
              <div className="theme-card-desc">{theme.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '20px' }}>Particles & Visual Effects</h3>
      <div className="particles-toggles">
        {(Object.keys(particles) as Array<keyof typeof particles>).map((key) => {
          // Label formatting
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());

          const emojis: Record<string, string> = {
            stars: '⭐ Twinkling Stars',
            butterflies: '🦋 Butterflies',
            balloons: '🎈 Floating Balloons',
            ribbons: '🎗️ Flying Ribbons',
            petals: '🌸 Flower Petals',
            sparkles: '✨ Sparkles',
            confetti: '🎉 Confetti Rain',
            fireworks: '🎆 Fireworks Burst',
            particles: '✨ Glowing Particles',
            magicCursor: '🪄 Magic Cursor Trail'
          };

          return (
            <div className="toggle-switch-card" key={key}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {emojis[key] || label}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={particles[key]}
                  onChange={() => toggleParticle(key)}
                />
                <span className="slider"></span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

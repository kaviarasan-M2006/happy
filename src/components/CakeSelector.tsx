import React from 'react';

interface CakeConfig {
  design: string;
  candleColor: string;
  candleCount: number;
  message: string;
  customTier1Color?: string;
  customTier2Color?: string;
}

interface CakeSelectorProps {
  cake: CakeConfig;
  setCake: React.Dispatch<React.SetStateAction<CakeConfig>>;
  defaultAge: string;
}

export const CakeSelector: React.FC<CakeSelectorProps> = ({ cake, setCake, defaultAge }) => {
  const cakePresetNames = [
    'Velvet Rose', 'Midnight Chocolate', 'Rainbow Sprinkle', 'Golden Crown', 'Berry Bloom', 'Ocean Pearl', 'Lavender Dream', 'Emerald Garden', 'Sunset Citrus', 'Ruby Romance',
    'Galaxy Glaze', 'Candy Cloud', 'Tropical Mango', 'Mint Marble', 'Coffee Caramel', 'Vanilla Confetti', 'Blueberry Moon', 'Peach Blossom', 'Pistachio Luxe', 'Cherry Jubilee',
    'Black Forest', 'Strawberry Swirl', 'Lemon Zest', 'Coconut Snow', 'Red Velvet', 'Rose Gold', 'Purple Orchid', 'Aqua Mermaid', 'Safari Party', 'Space Rocket',
    'Princess Castle', 'Football Party', 'Superhero Pop', 'Dinosaur Fun', 'Unicorn Magic', 'Butterfly Garden', 'Floral Elegance', 'Disco Neon', 'Casino Gold', 'Royal Marble',
    'Ice Cream Party', 'Donut Delight', 'Cookie Stack', 'Fruit Fiesta', 'Candy Cane', 'Autumn Spice', 'Winter Snow', 'Spring Bloom', 'Summer Splash', 'Classic Celebration'
  ];
  const updateCake = (key: keyof CakeConfig, value: any) => {
    setCake((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const syncAgeToCandles = () => {
    const ageNum = parseInt(defaultAge, 10);
    if (!isNaN(ageNum) && ageNum > 0) {
      updateCake('candleCount', Math.min(100, ageNum));
    }
  };

  const selectedPresetIndex = cake.design.match(/^cake-(\d+)$/)?.[1]
    ? Number(cake.design.match(/^cake-(\d+)$/)?.[1]) - 1
    : -1;

  const selectedPresetName =
    selectedPresetIndex >= 0
      ? cakePresetNames[selectedPresetIndex]
      : '';

  const presetHue =
    selectedPresetIndex >= 0
      ? ((selectedPresetIndex + 1) * 43) % 360
      : 0;

  const previewTopBackground = selectedPresetIndex >= 0
    ? `linear-gradient(90deg, hsl(${(presetHue + 12) % 360} 62% 35%), hsl(${(presetHue + 18) % 360} 88% 73%) 45%, hsl(${(presetHue + 30) % 360} 72% 44%))`
    : cake.design === 'chocolate'
      ? '#4e2f18'
      : cake.design === 'strawberry'
        ? '#ff8b94'
        : cake.design === 'rainbow'
          ? 'linear-gradient(90deg, #ff007f, #ff8c00, #ffd700)'
          : cake.design === 'custom'
            ? (cake.customTier2Color || '#ff9999')
            : '#faf9f6';

  const previewBaseBackground = selectedPresetIndex >= 0
    ? `linear-gradient(90deg, hsl(${presetHue} 58% 28%), hsl(${presetHue} 82% 66%) 24%, hsl(${(presetHue + 18) % 360} 92% 88%) 50%, hsl(${presetHue} 75% 52%) 78%, hsl(${presetHue} 58% 25%))`
    : cake.design === 'chocolate'
      ? 'linear-gradient(180deg, #4e2f18 0%, #2f1d0f 100%)'
      : cake.design === 'strawberry'
        ? 'linear-gradient(180deg, #ff8b94 0%, #ff5e6c 100%)'
        : cake.design === 'rainbow'
          ? 'linear-gradient(90deg, #ff007f, #7f00ff, #00ffff)'
          : cake.design === 'custom'
            ? `linear-gradient(180deg, ${cake.customTier2Color || '#ff9999'} 0%, ${cake.customTier1Color || '#ff3333'} 100%)`
            : 'linear-gradient(180deg, #faf9f6 0%, #d4af37 100%)';

  const candleColors = [
    { name: '💖 Hot Pink', value: '#ff3385' },
    { name: '💙 Ocean Blue', value: '#3399ff' },
    { name: '💛 Shiny Gold', value: '#d4af37' },
    { name: '💜 Royal Purple', value: '#9933ff' },
    { name: '💚 Mint Green', value: '#33cc66' },
    { name: '❤️ Classic Red', value: '#cc3333' }
  ];

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Customize the Birthday Cake</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
        {/* Left: Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Cake Flavor / Design</label>
            <select
              className="form-input"
              value={cake.design}
              onChange={(e) => updateCake('design', e.target.value)}
            >
              <option value="strawberry">🍓 Creamy Strawberry (Pink)</option>
              <option value="chocolate">🍫 Double Chocolate (Brown)</option>
              <option value="rainbow">🌈 Magical Rainbow (Gradient)</option>
              <option value="elegant">✨ Royal Gold & Cream (Elegant)</option>
              <option value="classic-3d">Classic 3D Cake — 360° Rotation</option>
              <option value="custom">🎨 Custom Design (Choose Colors)</option>
              <optgroup label="50 designer cake presets">
                {cakePresetNames.map((name, index) => <option key={name} value={`cake-${index + 1}`}>{String(index + 1).padStart(2, '0')} — {name}</option>)}
              </optgroup>
            </select>
          </div>

          {cake.design === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Top Tier Color</label>
                <input
                  type="color"
                  value={cake.customTier2Color || '#ff9999'}
                  onChange={(e) => updateCake('customTier2Color', e.target.value)}
                  style={{ width: '100%', height: '40px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', cursor: 'pointer', borderRadius: '6px', padding: 0 }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Base Tier Color</label>
                <input
                  type="color"
                  value={cake.customTier1Color || '#ff3333'}
                  onChange={(e) => updateCake('customTier1Color', e.target.value)}
                  style={{ width: '100%', height: '40px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', cursor: 'pointer', borderRadius: '6px', padding: 0 }}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Candle Color</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {candleColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => updateCake('candleColor', c.value)}
                  style={{
                    background: cake.candleColor === c.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${cake.candleColor === c.value ? c.value : 'rgba(255,255,255,0.1)'}`,
                    padding: '8px',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: c.value, marginRight: '6px' }}></span>
                  {c.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ margin: 0 }}>Number of Candles: {cake.candleCount}</label>
              {defaultAge && (
                <button
                  type="button"
                  onClick={syncAgeToCandles}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  Sync to Age ({defaultAge})
                </button>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={cake.candleCount}
              onChange={(e) => updateCake('candleCount', parseInt(e.target.value, 10))}
              style={{ accentColor: '#ff007f', cursor: 'pointer' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Cake Message (frosting text)</label>
            <input
              type="text"
              className="form-input"
              value={cake.message}
              onChange={(e) => updateCake('message', e.target.value)}
              placeholder="e.g. Happy Birthday!"
              maxLength={25}
            />
          </div>
        </div>

        {/* Right: Visual Preview */}
        <div
          style={{
            height: '300px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: '30px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '15px', left: '15px', fontSize: '0.8rem', opacity: 0.55, fontWeight: 'bold', zIndex: 10 }}>
            LIVE PREVIEW
          </div>

          {selectedPresetName && (
            <div
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                maxWidth: '58%',
                padding: '5px 9px',
                borderRadius: '999px',
                background: 'rgba(0,0,0,.35)',
                border: '1px solid rgba(255,255,255,.14)',
                fontSize: '0.72rem',
                fontWeight: 700,
                zIndex: 10,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {selectedPresetName}
            </div>
          )}

          {/* Render Candles */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              justifyContent: 'center',
              marginBottom: '-10px',
              zIndex: 3,
              maxWidth: '120px',
              flexWrap: 'wrap-reverse'
            }}
          >
            {Array.from({ length: cake.candleCount }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '6px',
                  height: '24px',
                  background: cake.candleColor,
                  borderRadius: '2px',
                  position: 'relative'
                }}
              >
                {/* Flame */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-1px',
                    width: '8px',
                    height: '11px',
                    background: 'radial-gradient(circle, #ffd700 0%, #ff4500 80%)',
                    borderRadius: '50% 50% 20% 20%',
                    boxShadow: '0 0 5px #ff4500'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Small message above cake if candles are many */}
          {cake.candleCount > 10 && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '5px', zIndex: 3 }}>
              + {cake.candleCount - 10} more candles
            </div>
          )}

          {/* Cake Tier 2 (Top Tier) */}
          <div
            style={{
              width: '110px',
              height: '40px',
              borderRadius: '6px 6px 0 0',
              zIndex: 2,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              background: previewTopBackground
            }}
          />

          {/* Cake Tier 1 (Base Tier) */}
          <div
            style={{
              width: '160px',
              height: '60px',
              borderRadius: '8px 8px 0 0',
              zIndex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              background: previewBaseBackground
            }}
          >
            {/* Cake Message Text */}
            <span
              style={{
                fontFamily: 'serif',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: cake.design === 'elegant' ? '#5c2c3a' : '#fff',
                textAlign: 'center',
                textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                maxWidth: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {cake.message || 'Happy B-Day!'}
            </span>
          </div>

          {/* Plate */}
          <div
            style={{
              width: '190px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              marginTop: '0px',
              zIndex: 1,
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

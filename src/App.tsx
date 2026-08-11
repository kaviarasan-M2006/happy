import React, { useState, useEffect } from 'react';
import { translations } from './locales/translations';
import { getUniverse, saveUniverse, getAllUniverses, deleteUniverse, type BirthdayUniverse } from './db/indexedDB';
import { DragDropUpload } from './components/DragDropUpload';
import { ThemeSelector } from './components/ThemeSelector';
import { CakeSelector } from './components/CakeSelector';
import { CanvasVideoMaker } from './components/CanvasVideoMaker';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { FireworksCanvas } from './components/FireworksCanvas';
import { multilingualQuotes } from './db/quotes';

// Lucide icons
import {
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Copy,
  Video,
  User,
  Heart,
  Phone,
  MessageCircle,
  Star,
  CheckCircle,
  FileText,
  Clock,
  Compass,
  ArrowUpRight,
  Globe
} from 'lucide-react';

// Chiptune Birthday Song Synthesizer using Web Audio API
class BirthdaySynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timeoutIds: number[] = [];

  constructor() {}

  public play(onFinished?: () => void) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('AudioContext not supported');
      return;
    }

    const notes = [
      { note: 'C4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'E4', dur: 2 },
      { note: 'C4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'F4', dur: 2 },
      { note: 'C4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'C5', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'D4', dur: 2 },
      { note: 'AS4', dur: 0.5 }, { note: 'AS4', dur: 0.5 }, { note: 'A4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'F4', dur: 2 }
    ];

    const freqs: Record<string, number> = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'AS4': 466.16, 'B4': 493.88, 'C5': 523.25
    };

    let time = this.ctx.currentTime + 0.1;

    notes.forEach((item, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle'; // Smooth retro sound
      osc.frequency.setValueAtTime(freqs[item.note], time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.05); // Attack
      gain.gain.setValueAtTime(0.15, time + item.dur * 0.4 - 0.05);
      gain.gain.linearRampToValueAtTime(0, time + item.dur * 0.4); // Release

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(time);
      osc.stop(time + item.dur * 0.4);

      const timeoutId = window.setTimeout(() => {
        if (index === notes.length - 1 && onFinished) {
          onFinished();
        }
      }, (time - this.ctx!.currentTime) * 1000);
      this.timeoutIds.push(timeoutId);

      time += item.dur * 0.45; // Tempo controller
    });
  }

  public stop() {
    this.isPlaying = false;
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

const getUniverseRouteId = (location: Location = window.location) => {
  const hashRoute = location.hash.startsWith('#/universe/') ? location.hash.replace('#/universe/', '') : '';
  if (hashRoute) return hashRoute;

  const pathMatch = location.pathname.match(/\/universe\/([^/]+)\/?$/);
  return pathMatch ? pathMatch[1] : '';
};

const buildUniverseShareUrl = (id: string, location: Location = window.location) => {
  const basePath = location.pathname.replace(/\/+$/, '');
  const normalizedBase = basePath || '';
  return `${location.origin}${normalizedBase}/universe/${id}`;
};

const getUniverseData = async (id: string, password?: string): Promise<BirthdayUniverse | { requiresPassword: true } | null> => {
  try {
    const localUniverse = await getUniverse(id);
    if (localUniverse) {
      return localUniverse;
    }
  } catch (err) {
    console.warn('Failed to read universe from browser storage', err);
  }

  try {
    const passwordQuery = password ? `?password=${encodeURIComponent(password)}` : '';
    const apiRes = await fetch(`/api/universe/${encodeURIComponent(id)}${passwordQuery}`);
    if (apiRes.status === 403) {
      return { requiresPassword: true };
    }
    if (!apiRes.ok) {
      return null;
    }

    const data = await apiRes.json();
    if (data?.id) {
      await saveUniverse(data);
      return data;
    }
  } catch (err) {
    console.warn('Failed to read universe from server API', err);
  }

  return null;
};

export default function App() {
  const [, setCurrentHash] = useState(window.location.hash);
  const [currentRouteId, setCurrentRouteId] = useState(() => getUniverseRouteId());
  const [loading, setLoading] = useState(true);

  // Creator Dashboard State
  const [dashboardStep, setDashboardStep] = useState(1);
  const [creatorName, setCreatorName] = useState('');
  const [creatorNickname, setCreatorNickname] = useState('');
  const [creatorAge, setCreatorAge] = useState('');
  const [creatorMessage, setCreatorMessage] = useState(
    'May your life be filled with happiness, love, success, and unforgettable memories. Happy Birthday!'
  );
  const [creatorThankYou, setCreatorThankYou] = useState(
    'Thank you for being part of my life and sharing this special universe with me!'
  );
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [photos, setPhotos] = useState<any[]>([]);
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [musicLoop, setMusicLoop] = useState(true);
  const [musicVolume, setMusicVolume] = useState(80);
  const [themeName, setThemeName] = useState('fantasy-universe');
  const [particles, setParticles] = useState({
    stars: true,
    butterflies: false,
    balloons: true,
    ribbons: false,
    petals: false,
    sparkles: true,
    confetti: true,
    fireworks: true,
    particles: true,
    magicCursor: true
  });
  const [cake, setCake] = useState({
    design: 'strawberry',
    candleColor: '#ff3385',
    candleCount: 1,
    message: 'Happy Birthday!'
  });
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('Happy Birthday!');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [submittedPassword, setSubmittedPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [routeRequiresPassword, setRouteRequiresPassword] = useState(false);
  const [existingUniverses, setExistingUniverses] = useState<BirthdayUniverse[]>([]);

  // Quotes assistant state
  const [quotesLang, setQuotesLang] = useState('en');
  const [quotesCategory, setQuotesCategory] = useState('Sweet & Simple');
  const [isFetchingQuotes, setIsFetchingQuotes] = useState(false);
  const [loadedQuotes, setLoadedQuotes] = useState<{ text: string; category: string }[]>([]);

  // Birthday Experience Recipient State
  const [universeData, setUniverseData] = useState<BirthdayUniverse | null>(null);
  const [experiencePage, setExperiencePage] = useState(1);
  const [currentMemoryIdx, setCurrentMemoryIdx] = useState(0);
  const [activeMusic, setActiveMusic] = useState<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [voiceAudio, setVoiceAudio] = useState<HTMLAudioElement | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [candlesLit, setCandlesLit] = useState<boolean[]>([]);
  const [isCakeBlown, setIsCakeBlown] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [synthPlayer] = useState(() => new BirthdaySynth());
  const [userStarsRating, setUserStarsRating] = useState(0);
  const [userFeedbackNote, setUserFeedbackNote] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [recipientLanguage, setRecipientLanguage] = useState('en');

  // Load hashes and list of created universes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentHash(window.location.hash);
      setCurrentRouteId(getUniverseRouteId());
      setEnteredPassword('');
      setSubmittedPassword('');
      setPasswordVerified(true);
      setPasswordError('');
      setRouteRequiresPassword(false);
      setExperiencePage(1);
      setCurrentMemoryIdx(0);
      setIsCakeBlown(false);
      setFeedbackSent(false);
      setUserStarsRating(0);
      setUserFeedbackNote('');
      // Stop synthesizers and audio elements
      synthPlayer.stop();
      if (activeMusic) {
        activeMusic.pause();
        setIsMusicPlaying(false);
      }
      if (voiceAudio) {
        voiceAudio.pause();
        setIsVoicePlaying(false);
      }
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [activeMusic, voiceAudio, synthPlayer]);

  // Handle Universe Routing
  useEffect(() => {
    const loadRouteData = async () => {
      setLoading(true);
      const routeId = currentRouteId || getUniverseRouteId();
      if (routeId) {
        const id = routeId;
        const data = await getUniverseData(id, submittedPassword);
        if (data && 'requiresPassword' in data) {
          setUniverseData(null);
          setRouteRequiresPassword(true);
          setPasswordVerified(false);
          setLoading(false);
          return;
        }
        if (data) {
          setUniverseData(data);
          setRouteRequiresPassword(false);
          setRecipientLanguage(data.language || 'en');
          // Setup candles array
          setCandlesLit(new Array(data.cake.candleCount || 1).fill(true));

          // Set up background music
          if (data.musicDataUrl) {
            const audio = new Audio(data.musicDataUrl);
            audio.loop = data.musicLoop;
            audio.volume = (data.musicVolume || 80) / 100;
            setActiveMusic(audio);
          } else {
            setActiveMusic(null);
          }

          // Set up voice note
          if (data.voiceDataUrl) {
            const audio = new Audio(data.voiceDataUrl);
            setVoiceAudio(audio);
          } else {
            setVoiceAudio(null);
          }
        } else {
          setUniverseData(null);
          setRouteRequiresPassword(false);
        }
      } else {
        // Load existing universes for creator list
        const list = await getAllUniverses();
        setExistingUniverses(list);
      }
      setLoading(false);
    };
    loadRouteData();
  }, [currentRouteId, submittedPassword]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (activeMusic) activeMusic.pause();
      if (voiceAudio) voiceAudio.pause();
      synthPlayer.stop();
    };
  }, [activeMusic, voiceAudio, synthPlayer]);

  // Microphone puff detection for blowing candles
  useEffect(() => {
    if (experiencePage === 3 && isMicEnabled && !isCakeBlown) {
      let audioCtx: AudioContext | null = null;
      let source: MediaStreamAudioSourceNode | null = null;
      let analyser: AnalyserNode | null = null;
      let rafId = 0;

      const setupMic = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicStream(stream);
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          source = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkBlow = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);

            // Calculate average volume in low frequencies (blowing makes low thud sound)
            let sum = 0;
            for (let i = 0; i < 10; i++) {
              sum += dataArray[i];
            }
            const average = sum / 10;

            // Blow threshold
            if (average > 180) {
              blowOutAllCandles();
              cleanupMic();
            } else {
              rafId = requestAnimationFrame(checkBlow);
            }
          };
          rafId = requestAnimationFrame(checkBlow);
        } catch (e) {
          console.warn('Microphone access denied or error occurred', e);
          setIsMicEnabled(false);
        }
      };

      const cleanupMic = () => {
        cancelAnimationFrame(rafId);
        if (streamTracks) {
          streamTracks.forEach((t) => t.stop());
        }
        if (audioCtx) {
          audioCtx.close();
        }
      };

      let streamTracks: MediaStreamTrack[] = [];
      setupMic().then(() => {
        if (micStream) streamTracks = micStream.getTracks();
      });

      return () => cleanupMic();
    }
  }, [experiencePage, isMicEnabled, isCakeBlown, micStream]);

  // Blow out candle action
  const blowOutCandlesOneByOne = (index: number) => {
    setCandlesLit((prev) => {
      const next = [...prev];
      next[index] = false;
      // If all are blown out, trigger blow out celebration
      if (next.every((c) => !c)) {
        triggerCakeBlownCelebration();
      }
      return next;
    });
  };

  const blowOutAllCandles = () => {
    setCandlesLit((prev) => prev.map(() => false));
    triggerCakeBlownCelebration();
  };

  const triggerCakeBlownCelebration = () => {
    setIsCakeBlown(true);
    // Play synthesis chiptune melody
    synthPlayer.play();
  };

  // Music Toggles
  const toggleMusic = () => {
    if (!activeMusic) return;
    if (isMusicPlaying) {
      activeMusic.pause();
      setIsMusicPlaying(false);
    } else {
      activeMusic.play().catch(err => console.log('Audio autoplay blocked', err));
      setIsMusicPlaying(true);
    }
  };

  const toggleVoice = () => {
    if (!voiceAudio) return;
    if (isVoicePlaying) {
      voiceAudio.pause();
      setIsVoicePlaying(false);
    } else {
      voiceAudio.play().catch(err => console.log('Audio voice autoplay blocked', err));
      setIsVoicePlaying(true);
    }
  };

  // Page navigation helpers
  const nextPage = () => {
    if (experiencePage < 5) {
      setExperiencePage((prev) => prev + 1);

      // In Memory World (Page 2), play music automatically
      if (experiencePage === 1 && activeMusic && !isMusicPlaying) {
        activeMusic.play().catch(err => console.log("Autoplay blocked", err));
        setIsMusicPlaying(true);
      }

      // If entering Video slide (Page 4), pause bg music so video sound is clear
      if (experiencePage === 3 && activeMusic && isMusicPlaying) {
        activeMusic.pause();
        setIsMusicPlaying(false);
      }
    }
  };

  const prevPage = () => {
    if (experiencePage > 1) {
      setExperiencePage((prev) => prev - 1);
    }
  };

  // Save/Generate Link Action
  const handleGenerateLink = async () => {
    if (!creatorName) {
      alert('Please fill out the Birthday Person\'s Name.');
      return;
    }
    if (photos.length === 0) {
      alert('Please upload at least one photo memory.');
      return;
    }

    const uniqueId = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    const newUniverse: BirthdayUniverse = {
      id: uniqueId,
      name: creatorName,
      nickname: creatorNickname,
      age: creatorAge,
      message: creatorMessage,
      thankYou: creatorThankYou,
      language: selectedLanguage,
      photos,
      videoDataUrl: featuredVideoUrl,
      musicDataUrl: musicUrl,
      musicLoop,
      musicVolume,
      voiceDataUrl: voiceUrl,
      theme: themeName,
      particles,
      cake,
      generatedVideoUrl,
      accessPassword: accessPassword.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      contactMessage: contactMessage.trim() || undefined,
      createdAt: Date.now()
    };

    setLoading(true);
    await saveUniverse(newUniverse);
    try {
      await fetch('/api/universe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUniverse)
      });
    } catch (err) {
      console.warn('API sync post failed', err);
    }
    setLoading(false);

    const generated = buildUniverseShareUrl(uniqueId);
    setGeneratedLink(generated);

    // Refresh created list
    const list = await getAllUniverses();
    setExistingUniverses(list);
  };

  // Copy Link to clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedLink);
      } else {
        window.prompt('Copy this link:', generatedLink);
      }
      alert('Shareable link copied to clipboard!');
    } catch (err) {
      console.warn('Clipboard unavailable', err);
      window.prompt('Copy this link:', generatedLink);
    }
  };

  // Load a universe for editing (loads state back into dashboard)
  const handleLoadUniverseForEditing = (univ: BirthdayUniverse) => {
    setCreatorName(univ.name);
    setCreatorNickname(univ.nickname || '');
    setCreatorAge(univ.age || '');
    setCreatorMessage(univ.message);
    setCreatorThankYou(univ.thankYou);
    setSelectedLanguage(univ.language || 'en');
    setPhotos(univ.photos);
    setFeaturedVideoUrl(univ.videoDataUrl || '');
    setMusicUrl(univ.musicDataUrl || '');
    setMusicLoop(univ.musicLoop !== undefined ? univ.musicLoop : true);
    setMusicVolume(univ.musicVolume !== undefined ? univ.musicVolume : 80);
    setVoiceUrl(univ.voiceDataUrl || '');
    setThemeName(univ.theme || 'fantasy-universe');
    setParticles(univ.particles || {
      stars: true,
      butterflies: false,
      balloons: true,
      ribbons: false,
      petals: false,
      sparkles: true,
      confetti: true,
      fireworks: true,
      particles: true,
      magicCursor: true
    });
    setCake(univ.cake || {
      design: 'strawberry',
      candleColor: '#ff3385',
      candleCount: 1,
      message: 'Happy Birthday!'
    });
    setGeneratedVideoUrl(univ.generatedVideoUrl || '');
    setGeneratedLink('');
    setAccessPassword(univ.accessPassword || '');
    setContactPhone(univ.contactPhone || '');
    setContactMessage(univ.contactMessage || 'Happy Birthday!');
    setDashboardStep(1);
    setCurrentRouteId('');
    setCurrentHash('');
    window.history.pushState({}, '', '/');
  };

  // Delete universe
  const handleDeleteUniverse = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this Birthday Universe?')) {
      await deleteUniverse(id);
      const list = await getAllUniverses();
      setExistingUniverses(list);
    }
  };

  // Pre-load default music to allow playing chiptune or test
  const handlePlayTestMusic = () => {
    synthPlayer.play();
  };

  // Fetch translation for recipient
  const t = translations[recipientLanguage] || translations['en'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#030308', color: '#ff007f' }}>
        <Sparkles size={48} className="spinning-element" style={{ marginBottom: '20px' }} />
        <h3 className="pulsing-glow">Aligning Stars & Spheres...</h3>
      </div>
    );
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRouteId) return;

    if (!enteredPassword) {
      setPasswordVerified(false);
      setPasswordError('Please enter the password shared with you.');
      return;
    }

    setSubmittedPassword(enteredPassword);
    setPasswordVerified(true);
    setPasswordError('');
  };

  // PUBLIC BIRTHDAY EXPERIENCE VIEW
  if (currentRouteId) {
    if (!universeData) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#08020f', color: '#ff5c5c', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '10px' }}>🌌 Universe Displaced</h2>
          <p style={{ opacity: 0.8, maxWidth: '400px', marginBottom: '20px' }}>
            We couldn't locate this magical universe. The link may have expired or is incorrect.
          </p>
          <a href="#" className="btn btn-primary">Go to Creator Dashboard</a>
        </div>
      );
    }

    const { name, nickname, age, message, thankYou, theme, cake: cakeData, generatedVideoUrl: slideVideo } = universeData;
    const currentThemeClass = `theme-${theme || 'fantasy-universe'}`;

    if ((universeData?.accessPassword || routeRequiresPassword) && !passwordVerified) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#04030b', color: '#ffffff', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
            <h2 style={{ marginBottom: '8px' }}>🔐 Protected Birthday Experience</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>Enter the password shared with you to open this birthday surprise.</p>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                autoFocus
              />
              {passwordError && <div style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{passwordError}</div>}
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Open Birthday Universe</button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className={`universe-container ${currentThemeClass} custom-cursor-${theme || 'fantasy-universe'}`}>
        {/* Particle Canvas engines */}
        {universeData.particles.confetti && <ConfettiCanvas active={experiencePage === 3 && isCakeBlown} />}
        {universeData.particles.fireworks && <FireworksCanvas active={(experiencePage === 3 && isCakeBlown) || experiencePage === 5} />}

        {/* Floating CSS balloons if toggled */}
        {universeData.particles.balloons && experiencePage === 2 && (
          <div className="css-particles-container">
            <div className="floating-balloon" style={{ left: '10%', background: 'rgba(255, 51, 133, 0.4)', animationDelay: '0s' }}></div>
            <div className="floating-balloon" style={{ left: '40%', background: 'rgba(51, 153, 255, 0.4)', animationDelay: '3s' }}></div>
            <div className="floating-balloon" style={{ left: '75%', background: 'rgba(212, 175, 55, 0.4)', animationDelay: '6s' }}></div>
          </div>
        )}

        {/* Music Controller Floating HUD */}
        {activeMusic && experiencePage > 1 && (
          <div className="audio-controller">
            <span>🎵 Background Music</span>
            <button onClick={toggleMusic} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
              {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        )}

        {/* Navigation Overlays (Swipeable screen panels) */}
        {experiencePage > 1 && (
          <div className="side-nav-area left-nav" onClick={prevPage}>
            <ArrowLeft size={32} />
          </div>
        )}
        {experiencePage < 5 && (
          <div className="side-nav-area right-nav" onClick={nextPage}>
            <ArrowRight size={32} />
          </div>
        )}

        {/* Navigation Dot indicators at the bottom */}
        <div className="navigation-indicators">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`indicator-dot ${experiencePage === i + 1 ? 'active' : ''}`}
              onClick={() => setExperiencePage(i + 1)}
            />
          ))}
        </div>

        {/* PAGE 1: MAGICAL ENTRANCE */}
        <div className={`page-container ${experiencePage === 1 ? 'active' : ''}`}>
          <div style={{ zIndex: 10, textAlign: 'center', padding: '20px' }}>
            <h1 className="entrance-title glow-text font-serif">
              {t.cakeSub}
            </h1>
            <p className="entrance-subtitle">
              {t.entranceSub}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="entrance-portal" onClick={nextPage}>
                <Sparkles size={64} style={{ color: 'white' }} />
              </div>
            </div>
            <button onClick={nextPage} className="btn btn-glow" style={{ fontSize: '1.1rem', marginTop: '20px' }}>
              {t.enterBtn}
            </button>

            {/* Language Selection display on entrance */}
            <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', opacity: 0.7 }}>
              <Globe size={14} />
              <select
                value={recipientLanguage}
                onChange={(e) => setRecipientLanguage(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
              >
                <option value="en">English</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="bn">Bengali (বাংলা)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PAGE 2: MEMORY WORLD */}
        <div className={`page-container ${experiencePage === 2 ? 'active' : ''}`}>
          <h2 className="glow-text font-serif" style={{ marginBottom: '25px', fontSize: '2rem' }}>
            ✨ {t.memoryWorld} ✨
          </h2>

          {universeData.photos && universeData.photos.length > 0 ? (
            <div className="memory-viewer">
              <div className="polaroid-card glass-panel" style={{ margin: '0 auto' }}>
                <div className="polaroid-img-container">
                  <img
                    src={universeData.photos[currentMemoryIdx].dataUrl}
                    className="polaroid-img"
                    alt={universeData.photos[currentMemoryIdx].caption}
                  />
                </div>
                <div className="polaroid-caption">
                  {universeData.photos[currentMemoryIdx].caption || `Memory #${currentMemoryIdx + 1}`}
                </div>
                {universeData.photos[currentMemoryIdx].date && (
                  <div className="polaroid-meta">
                    📅 {universeData.photos[currentMemoryIdx].date}
                  </div>
                )}
                {universeData.photos[currentMemoryIdx].memory && (
                  <div className="polaroid-meta" style={{ fontStyle: 'italic', marginTop: '8px', color: 'rgba(0, 0, 0, 0.65)' }}>
                    "{universeData.photos[currentMemoryIdx].memory}"
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="memory-controls">
                  <button
                    className="nav-btn"
                    onClick={() => setCurrentMemoryIdx((prev) => (prev > 0 ? prev - 1 : universeData.photos.length - 1))}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                    {currentMemoryIdx + 1} / {universeData.photos.length}
                  </span>
                  <button
                    className="nav-btn"
                    onClick={() => setCurrentMemoryIdx((prev) => (prev < universeData.photos.length - 1 ? prev + 1 : 0))}
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>No photos uploaded</p>
          )}

          {voiceAudio && (
            <div style={{ marginTop: '20px' }}>
              <button onClick={toggleVoice} className="btn btn-secondary" style={{ borderRadius: '20px', fontSize: '0.85rem' }}>
                {isVoicePlaying ? '🔇 Pause Narration' : '🎙️ Listen to Narration'}
              </button>
            </div>
          )}
        </div>

        {/* PAGE 3: BIRTHDAY CAKE CELEBRATION */}
        <div className={`page-container ${experiencePage === 3 ? 'active' : ''}`}>
          <h2 className="glow-text font-serif" style={{ marginBottom: '10px', fontSize: '2.2rem' }}>
            🎂 {t.cakeTitle}
          </h2>
          <p style={{ opacity: 0.8, maxWidth: '400px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '30px' }}>
            {t.cakeBlowInstructions}
          </p>

          <div className="cake-wrapper">
            {/* Candles Row */}
            <div className="candles-row" style={{ maxWidth: '140px', flexWrap: 'wrap-reverse' }}>
              {candlesLit.map((isLit, idx) => (
                <div
                  key={idx}
                  className="candle-container"
                  onClick={() => blowOutCandlesOneByOne(idx)}
                  title="Blow out candle"
                >
                  <div className="candle-wax" style={{ background: cakeData.candleColor || '#ff3385' }} />
                  <div className="candle-wick" />
                  {isLit && <div className="candle-flame" />}
                </div>
              ))}
            </div>

            {/* Cake tier 2 */}
            <div
              className={`cake-tier-2 ${cakeData.design === 'chocolate' ? 'cake-design-chocolate' : cakeData.design === 'rainbow' ? 'cake-design-rainbow' : cakeData.design === 'elegant' ? 'cake-design-elegant' : ''}`}
              style={cakeData.design === 'custom' ? { background: cakeData.customTier2Color || '#ff9999' } : {}}
            />

            {/* Cake tier 1 */}
            <div
              className={`cake ${cakeData.design === 'chocolate' ? 'cake-design-chocolate' : cakeData.design === 'rainbow' ? 'cake-design-rainbow' : cakeData.design === 'elegant' ? 'cake-design-elegant' : ''}`}
              onClick={blowOutAllCandles}
              style={{
                cursor: 'pointer',
                ...(cakeData.design === 'custom' ? { background: `linear-gradient(180deg, ${cakeData.customTier2Color || '#ff9999'} 0%, ${cakeData.customTier1Color || '#ff3333'} 100%)` } : {})
              }}
            >
              <div
                style={{
                  alignSelf: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: cakeData.design === 'elegant' ? '#5c2c3a' : '#fff',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {cakeData.message || 'Happy Birthday!'}
              </div>
            </div>
            <div style={{ width: '230px', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', marginTop: '2px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            {/* Mic control */}
            {!isCakeBlown && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                style={{ fontSize: '0.85rem', borderRadius: '20px' }}
              >
                {isMicEnabled ? t.cakeMicAllowed : '🎙️ Enable Blowing Sensor'}
              </button>
            )}

            {isCakeBlown && (
              <div style={{ textAlign: 'center', animation: 'float 4s ease-in-out infinite' }}>
                <h3 className="pulsing-glow font-serif" style={{ color: '#ffd700', fontSize: '1.8rem', marginBottom: '10px' }}>
                  🎉 {t.cakeSub} 🎉
                </h3>
                <p style={{ fontSize: '1rem', fontStyle: 'italic', maxWidth: '400px', margin: '0 auto' }}>
                  "{message}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PAGE 4: BIRTHDAY VIDEO */}
        <div className={`page-container ${experiencePage === 4 ? 'active' : ''}`}>
          <h2 className="glow-text font-serif" style={{ marginBottom: '20px', fontSize: '2rem' }}>
            {t.videoTitle}
          </h2>

          {(slideVideo || universeData.videoDataUrl) ? (
            <div style={{ width: '100%', maxWidth: '640px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--theme-glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <video
                src={slideVideo || universeData.videoDataUrl}
                controls
                autoPlay={experiencePage === 4}
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Video size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
              <p>No video generated for this universe.</p>
            </div>
          )}

          <button onClick={nextPage} className="btn btn-glow" style={{ marginTop: '30px' }}>
            Proceed to Final Page <ArrowRight size={16} />
          </button>
        </div>

        {/* PAGE 5: FINAL WISHES & REPLY */}
        <div className={`page-container ${experiencePage === 5 ? 'active' : ''}`}>
          <h2 className="glow-text font-serif" style={{ fontSize: '2.5rem', marginBottom: '5px' }}>
            💖 Happy Birthday {name}! {age && <span style={{ fontSize: '1.5rem', verticalAlign: 'middle' }}>({age})</span>}
          </h2>
          {nickname && <p style={{ fontStyle: 'italic', fontSize: '1.1rem', opacity: 0.8, marginBottom: '20px' }}>({nickname})</p>}

          <div className="reply-card glass-panel text-center">
            <h3 style={{ marginBottom: '15px' }}>{t.finalWishesTitle}</h3>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.5', marginBottom: '20px' }}>
              {thankYou}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={`https://wa.me/${universeData.contactPhone || ''}?text=${encodeURIComponent(universeData.contactMessage || thankYou || t.prefilledThankYou)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <MessageCircle size={18} /> {t.replyBtnMessage}
              </a>

              <a
                href={universeData.contactPhone ? `tel:${universeData.contactPhone}` : 'tel:'}
                className="btn btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                <Phone size={18} /> {t.replyBtnCall}
              </a>

              <a
                href={universeData.contactPhone ? `sms:${universeData.contactPhone}?body=${encodeURIComponent(universeData.contactMessage || thankYou || t.prefilledThankYou)}` : 'sms:'}
                className="btn btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                <MessageCircle size={18} /> Send SMS
              </a>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

            {!feedbackSent ? (
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{t.rateTitle}</h4>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`star-icon ${userStarsRating >= star ? 'active' : ''}`}
                      onClick={() => setUserStarsRating(star)}
                      size={24}
                    />
                  ))}
                </div>
                <textarea
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.85rem', marginBottom: '12px' }}
                  placeholder={t.notePlaceholder}
                  rows={2}
                  value={userFeedbackNote}
                  onChange={(e) => setUserFeedbackNote(e.target.value)}
                />
                <button
                  onClick={() => setFeedbackSent(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '8px 16px', fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  Submit Reaction
                </button>
              </div>
            ) : (
              <p style={{ color: '#4caf50', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ✓ {t.feedbackSuccess}
              </p>
            )}
          </div>

          {/* Name written in stars overlay effect */}
          <div
            style={{
              marginTop: '40px',
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '5px',
              textShadow: '0 0 8px rgba(255,255,255,0.8)'
            }}
          >
            ✧ {name.toUpperCase()} ✧
          </div>
        </div>
      </div>
    );
  }

  // PRIVATE CREATOR DASHBOARD VIEW
  return (
    <div className="app-container" style={{ background: '#0a0a14', minHeight: '100vh', color: '#f3f4f6' }}>
      {/* Top Navbar */}
      <header style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#08080f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} style={{ color: '#ff007f' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', background: 'linear-gradient(90deg, #ff007f, #7f00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Birthday Universe
          </span>
        </div>
        <button
          onClick={handlePlayTestMusic}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '15px' }}
        >
          🔊 Test Sound Chime
        </button>
      </header>

      <main className="main-content" style={{ padding: '20px 10px' }}>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Create Birthday Universe</h1>
            <p>Design a magical customized birthday experience for someone special.</p>
          </div>

          {/* Stepper progress headers */}
          <div className="stepper">
            <button onClick={() => setDashboardStep(1)} className={`step-tab ${dashboardStep === 1 ? 'active' : ''}`}>
              👤 1. Details
            </button>
            <button onClick={() => setDashboardStep(2)} className={`step-tab ${dashboardStep === 2 ? 'active' : ''}`}>
              🖼️ 2. Media Uploads
            </button>
            <button onClick={() => setDashboardStep(3)} className={`step-tab ${dashboardStep === 3 ? 'active' : ''}`}>
              🎨 3. Themes
            </button>
            <button onClick={() => setDashboardStep(4)} className={`step-tab ${dashboardStep === 4 ? 'active' : ''}`}>
              🎂 4. Cake & Video
            </button>
            <button onClick={() => setDashboardStep(5)} className={`step-tab ${dashboardStep === 5 ? 'active' : ''}`}>
              🔗 5. Generate Link
            </button>
          </div>

          {/* STEP 1: PERSONAL DETAILS */}
          {dashboardStep === 1 && (
            <div style={{ animation: 'float 10s ease-in-out infinite' }}>
              <h3 style={{ marginBottom: '20px' }}>Recipient Information</h3>

              <div className="grid grid-cols-2 gap-20">
                <div className="form-group">
                  <label><User size={14} /> Birthday Person's Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kavi"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><User size={14} /> Nickname (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chuttu"
                    value={creatorNickname}
                    onChange={(e) => setCreatorNickname(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-20">
                <div className="form-group">
                  <label><Clock size={14} /> Age (Optional)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 25"
                    value={creatorAge}
                    onChange={(e) => setCreatorAge(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label><Globe size={14} /> Base Language Selection</label>
                  <select
                    className="form-input"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="ml">Malayalam (മലയാളം)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="bn">Bengali (বাংলা)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🌐 Online Inspiration Library
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 12px 0' }}>
                  Pick theme ideas, birthday wishes, music, and cake inspiration from the web, then upload or paste your favorite choice here.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <a href="https://www.google.com/search?q=birthday+quote+ideas" target="_blank" rel="noreferrer" style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#f3f4f6', textDecoration: 'none', fontSize: '0.8rem' }}>💬 Search Quotes</a>
                  <a href="https://pixabay.com/music/search/birthday/" target="_blank" rel="noreferrer" style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#f3f4f6', textDecoration: 'none', fontSize: '0.8rem' }}>🎵 Find Music</a>
                  <a href="https://www.google.com/search?q=birthday+theme+ideas" target="_blank" rel="noreferrer" style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#f3f4f6', textDecoration: 'none', fontSize: '0.8rem' }}>🎨 Find Themes</a>
                  <a href="https://www.google.com/search?q=birthday+cake+design+ideas" target="_blank" rel="noreferrer" style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#f3f4f6', textDecoration: 'none', fontSize: '0.8rem' }}>🎂 Find Cake Ideas</a>
                </div>
              </div>

              {/* Quotes Assistant */}
              <div className="form-group" style={{ padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✨ Birthday Wishes Assistant (Predefined & Online library)
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 15px 0' }}>
                  Stuck with words? Select a language and theme to pull beautiful wishes from our library.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Quotes Language</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', padding: '6px 12px', fontSize: '0.85rem' }}
                      value={quotesLang}
                      onChange={(e) => setQuotesLang(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                      <option value="ml">Malayalam (മലയാളം)</option>
                      <option value="kn">Kannada (ಕನ್ನಡ)</option>
                      <option value="bn">Bengali (বাংলা)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Wishes Theme</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', padding: '6px 12px', fontSize: '0.85rem' }}
                      value={quotesCategory}
                      onChange={(e) => setQuotesCategory(e.target.value)}
                    >
                      <option value="Sweet & Simple">Sweet & Simple</option>
                      <option value="Deep & Emotional">Deep & Emotional</option>
                      <option value="Inspirational & Meaningful">Inspirational & Meaningful</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => {
                      const list = multilingualQuotes[quotesLang]?.[quotesCategory] || [];
                      setLoadedQuotes(list);
                    }}
                  >
                    📖 Show Local Quotes
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => {
                      setIsFetchingQuotes(true);
                      setLoadedQuotes([]);
                      setTimeout(() => {
                        const list = multilingualQuotes[quotesLang]?.[quotesCategory] || [];
                        setLoadedQuotes(list);
                        setIsFetchingQuotes(false);
                      }, 1000);
                    }}
                  >
                    🌐 Fetch Online Library
                  </button>
                </div>

                {isFetchingQuotes && (
                  <div style={{ textAlign: 'center', padding: '15px' }}>
                    <Sparkles className="spinning-element" style={{ color: '#ff007f', margin: '0 auto 8px auto' }} />
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Scanning the stars for quotes...</span>
                  </div>
                )}

                {loadedQuotes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px' }}>
                    {loadedQuotes.map((quote, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCreatorMessage(quote.text);
                        }}
                        style={{
                          fontSize: '0.8rem',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          lineHeight: '1.4'
                        }}
                        onMouseOver={e => (e.currentTarget.style.borderColor = '#ff007f')}
                        onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
                      >
                        {quote.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label><Heart size={14} /> Birthday Message / Greeting</label>
                <textarea
                  className="form-input"
                  placeholder="Write a warm birthday wish..."
                  value={creatorMessage}
                  onChange={(e) => setCreatorMessage(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><FileText size={14} /> Closing / Thank You message</label>
                <textarea
                  className="form-input"
                  placeholder="Closing message for page 5..."
                  value={creatorThankYou}
                  onChange={(e) => setCreatorThankYou(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>📞 Real-time Contact Options</h4>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 12px 0' }}>
                  Add a phone number and a message so the public page can open a phone call or SMS directly from the browser.
                </p>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label>Phone number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +919876543210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>SMS message</label>
                  <textarea
                    className="form-input"
                    placeholder="Type the text to send by SMS"
                    rows={2}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MEDIA UPLOADS */}
          {dashboardStep === 2 && (
            <div>
              <DragDropUpload
                photos={photos}
                setPhotos={setPhotos}
                featuredVideoUrl={featuredVideoUrl}
                setFeaturedVideoUrl={setFeaturedVideoUrl}
                musicUrl={musicUrl}
                setMusicUrl={setMusicUrl}
                voiceUrl={voiceUrl}
                setVoiceUrl={setVoiceUrl}
              />
            </div>
          )}

          {/* STEP 3: THEMES & DECORATIONS */}
          {dashboardStep === 3 && (
            <div>
              <ThemeSelector
                selectedTheme={themeName}
                setSelectedTheme={setThemeName}
                particles={particles}
                setParticles={setParticles}
              />
            </div>
          )}

          {/* STEP 4: CAKE DECORATOR & SLIDESHOW MAKER */}
          {dashboardStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <CakeSelector cake={cake} setCake={setCake} defaultAge={creatorAge} />
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              <CanvasVideoMaker
                photos={photos}
                musicDataUrl={musicUrl}
                existingVideoUrl={generatedVideoUrl}
                onVideoGenerated={setGeneratedVideoUrl}
              />
            </div>
          )}

          {/* STEP 5: GENERATE UNIQUE LINK */}
          {dashboardStep === 5 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Sparkles size={48} style={{ color: '#ff007f', marginBottom: '15px' }} />
              <h2>Ready to generate your Birthday Universe?</h2>
              <p style={{ opacity: 0.7, maxWidth: '500px', margin: '10px auto 30px auto' }}>
                Once generated, the system creates a secure unique link that launches the full immersive cinematic journey without showing any editor settings.
              </p>

              <div className="form-group" style={{ maxWidth: '420px', margin: '0 auto 20px auto', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Set a password for the public link</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter a password"
                  value={accessPassword}
                  onChange={(e) => setAccessPassword(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: '6px' }}>
                  The birthday person will need this password to open the experience.
                </p>
              </div>

              <button onClick={handleGenerateLink} className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                ✨ Generate Birthday Link
              </button>

              {generatedLink && (
                <div className="link-generator-box">
                  <p style={{ fontWeight: 'bold', color: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <CheckCircle size={18} /> Birthday Universe created successfully!
                  </p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '5px 0 15px 0' }}>
                    Share this secret link with the birthday person:
                  </p>
                  {accessPassword && (
                    <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '0 0 12px 0' }}>
                      Password: <strong>{accessPassword}</strong>
                    </p>
                  )}
                  <div className="generated-link-display">
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noreferrer"
                      className="link-text"
                      style={{ textDecoration: 'none' }}
                    >
                      {generatedLink}
                    </a>
                    <button onClick={handleCopyLink} className="btn-copy">
                      <Copy size={16} /> Copy
                    </button>
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: '#33ccff', color: 'white', display: 'flex', alignItems: 'center', padding: '0 15px', textDecoration: 'none' }}
                      title="Launch Public Experience"
                    >
                      <ArrowUpRight size={16} /> Open
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Navigation bar at bottom */}
          <div className="action-bar">
            <button
              disabled={dashboardStep === 1}
              onClick={() => setDashboardStep((prev) => prev - 1)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {dashboardStep < 5 ? (
              <button
                onClick={() => setDashboardStep((prev) => prev + 1)}
                className="btn btn-primary"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                disabled={!generatedLink}
                onClick={() => window.open(generatedLink, '_blank')}
                className="btn btn-secondary"
                style={{ borderColor: '#ff007f', color: '#ff007f' }}
              >
                Launch Experience <Compass size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Existing / Saved Universes Manager List */}
        {existingUniverses.length > 0 && (
          <div style={{ maxWidth: '1200px', margin: '40px auto 20px auto', padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px' }}>
              📂 Your Saved Birthday Universes ({existingUniverses.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {existingUniverses.map((univ) => (
                <div
                  key={univ.id}
                  onClick={() => handleLoadUniverseForEditing(univ)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#ff007f')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#f3f4f6', marginBottom: '4px' }}>
                    {univ.name}
                  </div>
                  {univ.nickname && <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic', marginBottom: '8px' }}>({univ.nickname})</div>}
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '12px' }}>
                    Theme: <span style={{ color: '#ff007f' }}>{univ.theme}</span> | Photos: {univ.photos?.length || 0}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadUniverseForEditing(univ);
                      }}
                      style={{
                        background: 'rgba(255, 0, 127, 0.15)',
                        border: '1px solid rgba(255, 0, 127, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        color: '#ff007f',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Open draft
                    </button>
                    <button
                      onClick={(e) => handleDeleteUniverse(univ.id, e)}
                      style={{
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.25)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: '#f44336',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

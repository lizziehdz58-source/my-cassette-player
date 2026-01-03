import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Heart, Star } from "lucide-react";

export default function CassettePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioFiles, setAudioFiles] = useState([]);
  const [side, setSide] = useState("A");
  const [showFlipMessage, setShowFlipMessage] = useState(false);
  const [showLoveNote, setShowLoveNote] = useState(false);
  const [overlayText, setOverlayText] = useState(null);
  const [bootGlow, setBootGlow] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState(1);

  const audioRef = useRef(null);
  const animationRef = useRef(null);

  // PRELOAD TRACKS
  useEffect(() => {
    setAudioFiles([
      { name: "Paramore – All I Wanted", url: "/music/Paramore All I Wanted.mp3" },
      { name: "MCR – Helena", url: "/music/MCR Helena.mp3" },
      { name: "Evanescence – Bring Me To Life", url: "/music/Evanescence Bring Me To Life.mp3" },
      { name: "System Of A Down – Lonely Day", url: "/music/System Of A Down Lonely Day.mp3" },
      { name: "Paramore – Decode", url: "/music/Paramore Decode.mp3" },
      { name: "N.I.B. – Black Sabbath", url: "/music/N.I.B. Black Sabbath.mp3" },
      { name: "Foo Fighters – Everlong", url: "/music/Foo Fighters Everlong.mp3" },
      { name: "Foo Fighters – The Pretender", url: "/music/Foo Fighters The Pretender.mp3" },
      { name: "Pierce The Veil – Bulls In The Bronx", url: "/music/Pierce The Veil Bulls In The Bronx.mp3" },
      { name: "Paramore – Ignorance", url: "/music/Paramore Ignorance.mp3" },
    ]);

    setTimeout(() => setBootGlow(false), 1200);
  }, []);

  const sideAFiles = audioFiles.slice(0, 5);
  const sideBFiles = audioFiles.slice(5);
  const currentSideFiles = side === "A" ? sideAFiles : sideBFiles;

  // CLICK SOUND
  const playClickSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 700;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const loadTrack = (trackIndex = currentTrack) => {
    if (!audioRef.current || !currentSideFiles.length) return;
    audioRef.current.src = currentSideFiles[trackIndex].url;
    audioRef.current.load();
  };

  const togglePlay = () => {
    playClickSound();
    loadTrack();
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setOverlayText(`PAUSE | Side ${side}`);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setOverlayText(`PLAY | Side ${side}`);
      });
    }
    setTimeout(() => setOverlayText(null), 800);
  };

  const handleNext = () => {
    playClickSound();
    const next = (currentTrack + 1) % currentSideFiles.length;
    setCurrentTrack(next);
    loadTrack(next);
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
    setOverlayText(`PLAY | Side ${side}`);
    setTimeout(() => setOverlayText(null), 800);
  };

  const handlePrev = () => {
    playClickSound();
    const prev = (currentTrack - 1 + currentSideFiles.length) % currentSideFiles.length;
    setCurrentTrack(prev);
    loadTrack(prev);
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
    setOverlayText(`PLAY | Side ${side}`);
    setTimeout(() => setOverlayText(null), 800);
  };

  const flipSide = () => {
    playClickSound();
    setShowFlipMessage(true);
    audioRef.current?.pause();
    setIsPlaying(false);
    setOverlayText(`FLIP | ${side === "A" ? "B" : "A"}`);
    setTimeout(() => {
      setSide((s) => (s === "A" ? "B" : "A"));
      setCurrentTrack(0);
      setShowFlipMessage(false);
      setOverlayText(null);
    }, 1100);
  };

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // GLOW EFFECT
  useEffect(() => {
    if (!audioRef.current) return;

    const updateGlow = () => {
      const t = audioRef.current.currentTime;
      const base = 1 + Math.sin(t * 2 * Math.PI * 0.5) * 0.07;
      const flicker = 0.95 + Math.random() * 0.1;
      setGlowIntensity(base * flicker);
      animationRef.current = requestAnimationFrame(updateGlow);
    };

    if (isPlaying) animationRef.current = requestAnimationFrame(updateGlow);
    else {
      cancelAnimationFrame(animationRef.current);
      setGlowIntensity(1);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  // BUTTON STYLE WITH HIGHLIGHT
  const getButtonStyle = (active = false) => ({
    background: active ? "#2e1065" : "#12091f",
    color: "#e9d5ff",
    border: "1px solid #2e1065",
    borderRadius: 10,
    padding: 10,
    cursor: "pointer",
    boxShadow: active
      ? `0 0 ${12 * glowIntensity}px rgba(80,0,80,0.6)`
      : "0 0 12px rgba(0,0,0,0.8)",
    transition: "0.15s all ease-in-out",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0415", color: "#e9d5ff", padding: 20 }}>
      {/* VCR STATUS */}
      <div style={{
        position: "absolute",
        top: 12,
        left: 12,
        fontFamily: "monospace",
        fontSize: 14,
        color: "#c4b5fd",
        textShadow: "0 0 8px rgba(0,0,0,0.9)"
      }}>
        {side}{currentTrack + 1} {isPlaying ? "▷" : "❚❚"} {formatTime(currentTime)}
      </div>

      {/* CASSETTE IMAGE */}
      <div style={{ position: "relative", maxWidth: 500, margin: "0 auto" }}>
        <img
          src="/IMG_1298.jpg"
          alt="Cassette"
          style={{
            width: "100%",
            borderRadius: 12,
            animation: isPlaying ? "vhsDrift 0.8s infinite, grungeGlow 2s infinite alternate" : "none",
            boxShadow: bootGlow
              ? `
                0 0 ${60 * glowIntensity}px rgba(60,0,60,0.8),
                0 0 ${35 * glowIntensity}px rgba(80,0,80,0.6),
                0 0 ${20 * glowIntensity}px rgba(120,20,120,0.4)
              `
              : `
                0 0 45px rgba(60,0,60,0.7),
                0 0 18px rgba(80,0,80,0.5)
              `,
            transition: "box-shadow 0.2s ease, filter 0.2s ease",
            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.1)) contrast(1.05) saturate(1.05)",
          }}
        />

        {/* SCANLINES */}
        <div style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 2px)"
        }} />

        {/* OVERLAY */}
        {overlayText && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontFamily: "monospace",
            background: "rgba(0,0,0,0.5)",
            animation: "playPulse 0.5s ease-out, flicker 0.3s infinite"
          }}>
            {overlayText}
          </div>
        )}

        {/* ANIMATIONS */}
        <style>{`
          @keyframes vhsDrift {
            0% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-0.4px) rotate(-0.15deg); }
            50% { transform: translateY(0.3px) rotate(0.15deg); }
            75% { transform: translateY(-0.3px) rotate(-0.1deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }

          @keyframes playPulse {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.25); }
            100% { filter: brightness(1); }
          }

          @keyframes flicker {
            0% { opacity: 1; }
            50% { opacity: 0.85; }
            100% { opacity: 1; }
          }

          @keyframes grungeGlow {
            0% { box-shadow: 0 0 60px rgba(60,0,60,0.8),0 0 35px rgba(80,0,80,0.6),0 0 20px rgba(120,20,120,0.4);}
            50% { box-shadow: 0 0 63px rgba(60,0,60,0.85),0 0 38px rgba(80,0,80,0.65),0 0 22px rgba(120,20,120,0.45);}
            100% { box-shadow: 0 0 60px rgba(60,0,60,0.8),0 0 35px rgba(80,0,80,0.6),0 0 20px rgba(120,20,120,0.4);}
          }
        `}</style>
      </div>

      {/* AUDIO */}
      <audio ref={audioRef} onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)} />

      {/* CONTROLS */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22 }}>
        <button style={getButtonStyle(false)} onClick={handlePrev}><SkipBack /></button>
        <button style={getButtonStyle(isPlaying)} onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</button>
        <button style={getButtonStyle(false)} onClick={handleNext}><SkipForward /></button>
        <button style={getButtonStyle(false)} onClick={flipSide}><RotateCcw /></button>
        <button style={{ ...getButtonStyle(false), background: "#1b0b1f" }} onClick={() => setShowLoveNote(true)}>
          <Heart fill="#ff2d2d" />
        </button>
      </div>

      {/* TRACK LIST */}
      <div style={{ maxWidth: 500, margin: "24px auto", color: "#b497f2" }}>
        <h3>Side {side}</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {currentSideFiles.map((t, i) => (
            <li
              key={i}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                marginBottom: 2,
                background: i === currentTrack ? "rgba(100,0,100,0.4)" : "transparent",
                color: i === currentTrack ? "#ffb2ff" : "#b497f2",
                transition: "0.2s all ease",
                cursor: "pointer",
              }}
              onClick={() => {
                setCurrentTrack(i);
                loadTrack(i);
                audioRef.current.play().catch(() => {});
                setIsPlaying(true);
              }}
            >
              {side}{i + 1}. {t.name}
            </li>
          ))}
        </ul>
      </div>

      {/* LOVE NOTE */}
      {showLoveNote && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#0a0415", padding: 30, borderRadius: 14, border: "1px solid #4c1d95", maxWidth: 420, color: "#e9d5ff" }}>
            <button onClick={() => setShowLoveNote(false)} style={{ float: "right" }}>×</button>
            <h2 style={{ color: "#b497f2" }}>Happy Birthday Thomas <Heart fill="#ff2d2d" /></h2>
            <p>I made this for you because you mean so much to me. You're the love of my life, and I'm forever grateful for every moment with you.</p>
            <p>I hope this year is everything you imagined. You deserve it all. I'm always hoping and thinking the best for you!</p>
            <p style={{ fontWeight: "bold", color: "#b497f2" }}>I love you. <Heart fill="#ff2d2d" /></p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: 40, color: "#b497f2" }}>
        January 1 2026 <Star fill="#4c1d95" /> Grunge Edition
      </div>
    </div>
  );
}



         





















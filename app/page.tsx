 "use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Camera,
  Share2,
  Download,
  Upload,
  Mail,
  Send,
  Sparkles,
  Heart,
  Lock,
  Shield,
  Film,
  Music2,
} from "lucide-react";
import { Howl } from "howler";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GeminiConstellation from "./components/GeminiConstellation";

/**
 * Pro Birthday Page — V9.3 (Hooks-safe hot reload)
 * Fix: React "Rendered more hooks than during the previous render."
 * Cause: hooks were called conditionally / inside helper components.
 * Solution: keep ALL hooks at top-level, move SmartImg to separate component outside.
 */

const MAX_PHOTOS = 41;
const STORAGE = "birthday_v9_state_v1";

// MAIN LOCK (she password)
const LOCK_PASSWORD = "vinitha19"; // change

// ADMIN PANEL (only you)
const ADMIN_PASSWORD = "rithvik@admin"; // change

// MEMORY VAULT (extra private)
const VAULT_PASSWORD = "onlyus"; // change

type Message = { text: string; ts: number };

// ------------------------
// SmartImg (no hooks inside ProBirthday)
// ------------------------
function SmartImg({
  srcBase,
  alt,
  className,
  onClick,
  loading,
  style,
  motionProps,
  onFailFinal,
}: {
  srcBase: string;
  alt?: string;
  className?: string;
  onClick?: (...args: any[]) => void;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
  motionProps?: any;
  onFailFinal?: () => void;
}) {
  const imgExtensions = [".jpg", ".JPG", ".jpeg", ".JPEG"];
  const videoExtensions: string[] = [];
  const allExtensions = [...imgExtensions, ...videoExtensions];

  const hasExt = /\.[a-z0-9]+(\?.*)?$/i.test(srcBase);
  const isData = srcBase.startsWith("data:");
  const candidates = isData || hasExt ? [srcBase] : allExtensions.map((e) => srcBase + e);

  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(false);

  function handleError() {
    if (i + 1 < candidates.length) setI(i + 1);
    else {
      try {
        onFailFinal?.();
      } catch (e) {}
      setHidden(true);
    }
  }

  if (hidden) return null;

  const cur = candidates[i];
  const isVideo = videoExtensions.some((ext) => cur.toLowerCase().endsWith(ext));

  if (isVideo) {
    const finalStyle: React.CSSProperties = { ...(style || {}), objectFit: "contain", width: "100%", height: "100%" };
    const videoProps: React.VideoHTMLAttributes<HTMLVideoElement> = {
      src: cur,
      className,
      onError: () => handleError(),
      onClick: onClick as any,
      style: finalStyle,
      playsInline: true,
    };
    const isThumb = /h-\d+/.test(className || "") || /thumb/.test(className || "");
    if (isThumb) return <video {...videoProps} muted loop autoPlay />;
    return <video {...videoProps} controls />;
  }

  if (motionProps) {
    const { key: motionKey, ...restMotion } = motionProps || {};
      return (
        <motion.img
          key={motionKey}
          {...restMotion}
          src={cur}
        alt={alt}
        className={className}
        onError={() => handleError()}
        onClick={onClick}
        loading={loading}
        style={style}
      />
    );
  }

  return (
    <img
      src={cur}
      alt={alt}
      className={className}
      onError={() => handleError()}
      onClick={onClick}
      loading={loading}
      style={style}
    />
  );
}

// ------------------------
// helper
// ------------------------
function calcAge() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const year = now.getFullYear();
  // Birthday: Nov 19
  const base = 20; // 20 at 2025; you can adjust if needed
  // If after Nov 19 in current year, increment
  const hasHadBirthdayThisYear = month > 11 || (month === 11 && day >= 19);
  const yearsSince2025 = year - 2025;
  const age = base + yearsSince2025 + (hasHadBirthdayThisYear ? 0 : -1);
  return Math.max(1, age);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "LV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ------------------------
// main component
// ------------------------
export default function ProBirthday() {
  // ---- hooks MUST be top-level, no conditional hooks ----
  const [hydrated, setHydrated] = useState(false);

  // lock state
  const [locked, setLocked] = useState(true);
  const [lockPass, setLockPass] = useState("");
  const [lockErr, setLockErr] = useState("");

  // admin state
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr] = useState("");

  // vault state
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultAuthed, setVaultAuthed] = useState(false);
  const [vaultPass, setVaultPass] = useState("");
  const [vaultErr, setVaultErr] = useState("");

  // core state
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showMusicGate, setShowMusicGate] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [memoryOfDay, setMemoryOfDay] = useState<string | null>(null);
  const [huntFound, setHuntFound] = useState<number[]>([]);
  const [huntStarted, setHuntStarted] = useState(false);
  const [huntOpen, setHuntOpen] = useState(false);


  const [showLetter, setShowLetter] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [typedText, setTypedText] = useState("");

  const [confettiKey, setConfettiKey] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accent, setAccent] = useState("#ff6fa3");
  const [isGiftOpen, setGiftOpen] = useState(false);

  const [reactions, setReactions] = useState<Record<string, { love: number }>>({});
  const [captions, setCaptions] = useState<Record<string, string>>({}); // per-photo caption
  const [captionDraft, setCaptionDraft] = useState("");

  // love jar
  const [jarHearts, setJarHearts] = useState(0);
  const [compliment, setCompliment] = useState<string>("");

  // voice note
  const [voicePlaying, setVoicePlaying] = useState(false);

  // cinematic ending
  const [endingOpen, setEndingOpen] = useState(false);

  // NEW: engagement features
  const [openWhenOpen, setOpenWhenOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [montageOpen, setMontageOpen] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [bottleOpen, setBottleOpen] = useState(false);
  const [petalsOn, setPetalsOn] = useState(true);
  const [notif, setNotif] = useState<{id:number; text:string} | null>(null);

  // wish-to-mail
  const [wishText, setWishText] = useState("");
  // extra modes
  const [polaroidOpen, setPolaroidOpen] = useState(false);
  const [polaroidOrder, setPolaroidOrder] = useState<number[]>([]);
  const [constellationOpen, setConstellationOpen] = useState(false);
  const [wishSending, setWishSending] = useState(false);
  const [wishStatus, setWishStatus] = useState<string>("");

  // envelope personalization
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [loveToast, setLoveToast] = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState("");

  // refs
  const audioRef = useRef<Howl | null>(null);
  const voiceRef = useRef<Howl | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const jarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  // derived
  const current = photos[index];

  // ensure index always points to a real displayable media (no blank loops)
  useEffect(() => {
    if (!photos.length) return;
    if (!current) setIndex(0);
  }, [photos.length, current]);

  const btn = "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-shadow shadow-sm";
  const primaryBtn = btn + " bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600";
  const ghostBtn = btn + " bg-white/6 text-white/90 hover:bg-white/10";

  const computedAge = useMemo(() => calcAge(), []);

  // hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // initial photos (manifest-driven to avoid blanks / 404 spam)
useEffect(() => {
  async function load() {
    try {
      const res = await fetch("/images/manifest.json", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.media) && data.media.length) {
          setPhotos(data.media);
          return;
        }
      }
    } catch (e) {}
    // fallback (01..41)
    const arr: string[] = [];
    for (let i = 1; i <= MAX_PHOTOS; i++) arr.push(`/images/${String(i).padStart(2, "0")}`);
    setPhotos(arr);
  }
  load();
}, []);

  // load saved state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.messages) setMessages(parsed.messages);
      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.accent) setAccent(parsed.accent);
      if (parsed.uploads) setUploads(parsed.uploads);
      if (parsed.reactions) setReactions(parsed.reactions);
        if (parsed.favorites) setFavorites(parsed.favorites);
      if (parsed.index != null) setIndex(parsed.index);
      if (parsed.captions) setCaptions(parsed.captions);
      if (parsed.locked != null) setLocked(parsed.locked);
      if (parsed.jarHearts != null) setJarHearts(parsed.jarHearts);
    } catch (e) {}
  }, []);

  // persist
  useEffect(() => {
    const out = {
      messages,
      theme,
      accent,
      uploads,
      reactions,
      index,
      captions,
      locked,
      favorites,
      jarHearts,
    };
    try {
      localStorage.setItem(STORAGE, JSON.stringify(out));
    } catch {}
  }, [messages, theme, accent, uploads, reactions, index, captions, locked, jarHearts]);

  // merge uploads
  useEffect(() => {
    if (uploads.length) setPhotos((p) => [...uploads, ...p.filter((x) => !uploads.includes(x))]);
  }, [uploads]);

  // favorites toggle
  function toggleFavorite(p: string) {
    setFavorites((cur) => {
      if (cur.includes(p)) return cur.filter((x) => x !== p);
      return [p, ...cur];
    });
  }

  // setup audio
  useEffect(() => {
    audioRef.current = new Howl({ src: ["/Ham%20Tere%20Pyaar%20Main.mp3"], html5: true, volume: 0.6, loop: true });
    voiceRef.current = new Howl({ src: ["/voice-note.mp3"], html5: true, volume: 0.9 });
    return () => {
      audioRef.current?.unload();
      voiceRef.current?.unload();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play();
    else audioRef.current.pause();
  }, [playing]);

  // init polaroid order once photos loaded
  useEffect(() => {
    if (!photos.length) return;
    if (polaroidOrder.length) return;
    const idxs = Array.from({ length: Math.min(16, photos.length) }, (_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    setPolaroidOrder(idxs);
  }, [photos.length]);

  // slideshow
  useEffect(() => {
    if (!photos.length) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % photos.length), 4200);
    return () => clearInterval(t);
  }, [photos.length]);

  
  // Love notifications (random)
  useEffect(() => {
    const lines = [
      "Rithvik says: I’m proud of you 💖",
      "Just a reminder: you’re deeply loved 🤍",
      "If you’re reading this… I’m thinking of you.",
      "You’re my favorite person, always.",
      "I’m grateful you exist, Vinitha.",
    ];
    const t = setInterval(() => {
      // only if page open (not intro modals)
      if (showIntro || showLetter || showLightbox || openWhenOpen || wheelOpen || montageOpen || puzzleOpen) return;
      const pick = lines[Math.floor(Math.random() * lines.length)];
      setNotif({ id: Date.now(), text: pick });
      setTimeout(() => setNotif(null), 4200);
    }, 22000);
    return () => clearInterval(t);
  }, [showIntro, showLetter, showLightbox, openWhenOpen, wheelOpen, montageOpen, puzzleOpen]);


  // theme apply
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty("--accent", accent);
  }, [theme, accent]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "Escape") {
        setShowLightbox(false);
        setShowLetter(false);
        setVaultOpen(false);
        setAdminOpen(false);
        setEndingOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length]);

  // typed letter (clean formatting + scroll)
  useEffect(() => {
    if (!showLetter) return;
    const name = recipientName || "Vinitha";
    const letter = [
      `Dear ${name},`,
      "",
      "Pause for just a moment — breathe.",
      "This isn’t just a website.",
      "It’s a small universe made from memories, feelings, and quiet promises.",
      "",
      "Somewhere between random conversations and the moments you’ll never know mattered to me…",
      "you became important. Not loudly. Not suddenly. Just deeply.",
      "",
      "I built this because words weren’t enough anymore.",
      "Because some people deserve something *made*, not bought.",
      "",
      "So when you’re here — scrolling through pictures, unlocking surprises, hearing my voice —",
      "I want you to feel one thing clearly:",
      "",
      "✨ You are loved. You are valued. You are safe here. ✨",
      "",
      "If you ever doubt yourself, come back to this place.",
      "This page is proof that you matter more than you realize.",
      "",
      "Happy Birthday, my favourite person.",
      "",
      "— Rithvik 🤍",
    ].join("\n");

    setTypedText("");
    let idx = 0;
    const iv = setInterval(() => {
      setTypedText((prev) => prev + letter[idx]);
      idx++;
      if (idx >= letter.length) clearInterval(iv);
    }, 22);
    return () => clearInterval(iv);
  }, [showLetter, recipientName]);

  // fireworks
  useEffect(() => {
    if (!showFireworks) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let running = true;

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    type P = { x: number; y: number; vx: number; vy: number; life: number; color: string };
    const parts: P[] = [];
    function burst(x: number, y: number) {
      for (let i = 0; i < 80; i++) {
        const ang = Math.random() * Math.PI * 2,
          sp = Math.random() * 6 + 2;
        parts.push({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 60 + Math.random() * 60,
          color: `hsl(${Math.floor(Math.random() * 360)} 90% 60%)`,
        });
      }
    }
    burst(w * 0.5, h * 0.35);
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.06;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 100);
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) parts.splice(i, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
    const stop = setTimeout(() => {
      running = false;
      setShowFireworks(false);
    }, 4800);

    return () => {
      running = false;
      clearTimeout(stop);
      window.removeEventListener("resize", onResize);
    };
  }, [showFireworks]);

  // confetti canvas
  useEffect(() => {
    if (!confettiKey) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }> = [];
    function spawn() {
      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.5,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 6 + 2,
          life: 60 + Math.random() * 60,
          color: `hsl(${Math.floor(Math.random() * 360)} 90% 60%)`,
          size: 6 + Math.random() * 6,
        });
      }
    }
    spawn();
    let running = true;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.15;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 120);
        ctx.fillRect(p.x, p.y, p.size, p.size);
        if (p.life <= 0) particles.splice(i, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
    const stop = setTimeout(() => {
      running = false;
      particles = [];
      ctx.clearRect(0, 0, w, h);
    }, 4200);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      clearTimeout(stop);
      window.removeEventListener("resize", onResize);
    };
  }, [confettiKey]);

  // Jar hearts canvas animation
  useEffect(() => {
    const canvas = jarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = 92);
    let h = (canvas.height = 130);
    let running = true;

    type H = { x: number; y: number; vy: number; vx: number; s: number; a: number };
    const hearts: H[] = [];
    function spawnHeart() {
      hearts.push({
        x: 20 + Math.random() * 52,
        y: h - 10,
        vy: 0.6 + Math.random() * 0.9,
        vx: (Math.random() - 0.5) * 0.4,
        s: 8 + Math.random() * 10,
        a: 0.7 + Math.random() * 0.3,
      });
    }

    // spawn based on jarHearts
    const target = Math.min(240, jarHearts);
    for (let i = 0; i < Math.min(18, Math.floor(target / 10) + 3); i++) spawnHeart();

    function drawHeart(x: number, y: number, size: number, alpha: number) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255,111,163,1)";
      ctx.beginPath();
      const s = size;
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - s / 2, y - s / 2, x - s, y + s / 3, x, y + s);
      ctx.bezierCurveTo(x + s, y + s / 3, x + s / 2, y - s / 2, x, y);
      ctx.fill();
      ctx.restore();
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      // subtle particles
      for (let p = 0; p < 10; p++) {
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      // hearts float
      for (let i = hearts.length - 1; i >= 0; i--) {
        const he = hearts[i];
        he.y -= he.vy;
        he.x += he.vx;
        he.a -= 0.003;
        drawHeart(he.x, he.y, he.s, he.a);
        if (he.y < 12 || he.a <= 0) hearts.splice(i, 1);
      }
      if (hearts.length < 10 && Math.random() < 0.18) spawnHeart();
      requestAnimationFrame(frame);
    }
    frame();

    return () => {
      running = false;
    };
  }, [jarHearts]);

  // reactions
  function addReaction(src: string) {
    setReactions((r) => {
      const prev = r[src] || { love: 0 };
      return { ...r, [src]: { love: prev.love + 1 } };
    });
    setJarHearts((x) => x + 3);
    setConfettiKey((k) => k + 1);
  }

  // uploads
  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setUploads((u) => [url, ...u]);
      };
      reader.readAsDataURL(f);
    });
  }

  function addMessage() {
    const txt = messageText.trim();
    if (!txt) return;
    setMessages((m) => [{ text: txt, ts: Date.now() }, ...m]);
    setMessageText("");
    setConfettiKey((k) => k + 1);
    setJarHearts((x) => x + 4);
  }

  // Share
  function share() {
    function b64EncodeUnicode(str: string) {
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => String.fromCharCode(parseInt(p1, 16)))
      );
    }
    const payload = { i: index, msg: messages[0]?.text || "" };
    const encoded = b64EncodeUnicode(JSON.stringify(payload));
    const url = `${location.origin}${location.pathname}#p=${encoded}`;
    navigator.clipboard?.writeText(url).then(() => alert("Link copied to clipboard"));
  }

  // parse share
  useEffect(() => {
    const h = location.hash;
    if (!h.startsWith("#p=")) return;
    try {
      function b64DecodeUnicode(str: string) {
        return decodeURIComponent(
          Array.prototype.map
            .call(atob(str), (c: string) => {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
      }
      const decoded = JSON.parse(b64DecodeUnicode(h.slice(3)));
      if (decoded?.i != null) setIndex(Number(decoded.i));
      if (decoded?.msg) setMessages((m) => [{ text: decoded.msg, ts: Date.now() }, ...m]);
    } catch {}
  }, []);

  // Export certificate
  async function exportCertificate() {
    const node = document.querySelector(".gallery-stage") as HTMLElement | null;
    if (!node) {
      alert("Open a photo area to export");
      return;
    }
    const canvas = await html2canvas(node, { scale: 2 });
    const img = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(img, "JPEG", 0, 0, canvas.width, canvas.height);
    pdf.save("for-vinitha.pdf");
  }

  // Wish to mail via API route
  async function sendWishToMail() {
    const txt = wishText.trim();
    if (!txt) return;
    setWishSending(true);
    setWishStatus("");
    try {
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish: txt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setWishStatus("Sent 💌");
      setWishText("");
      setConfettiKey((k) => k + 1);
      setJarHearts((x) => x + 10);
    } catch (e: any) {
      setWishStatus("Failed to send");
    } finally {
      setWishSending(false);
    }
  }

  // Voice note play
  function toggleVoice() {
    const v = voiceRef.current;
    if (!v) return;
    if (voicePlaying) {
      v.stop();
      setVoicePlaying(false);
      return;
    }
    v.play();
    setVoicePlaying(true);
    setJarHearts((x) => x + 6);
    setConfettiKey((k) => k + 1);
    v.once("end", () => setVoicePlaying(false));
  }

  // Reveal gift
  function revealGift() {
    setGiftOpen(true);
    setTimeout(() => {
      setShowLetter(true);
    }, 520);
    setConfettiKey((k) => k + 1);
    setJarHearts((x) => x + 7);
  }

  // Envelope open w/ name prompt
  async function handleOpenEnvelope() {
    if (envelopeOpen) return;
    setEnvelopeOpen(true);
    setConfettiKey((k) => k + 1);
    setShowFireworks(true);
    await new Promise((r) => setTimeout(r, 800));
    setShowNamePrompt(true);
    setTimeout(() => nameInputRef.current?.focus(), 80);
  }
  function submitName() {
    const n = recipientName.trim();
    if (!n) {
      nameInputRef.current?.focus();
      return;
    }
    setShowNamePrompt(false);
    setShowLetter(true);
    setConfettiKey((k) => k + 1);
  }

  // Compliments
  const compliments = useMemo(
    () => [
      "You light up ordinary moments like magic ✨",
      "You deserve softness, love, and the happiest life 🌸",
      "Your smile could fix bad days. Seriously 🤍",
      "You’re rare. Beautifully rare. 🌙",
      "If comfort had a name, it would be you 🕊️",
      "You’re the kind of person people thank fate for 🌷",
      "You’re lovable exactly as you are 💗",
    ],
    []
  );

  function dropCompliment() {
    const pick = compliments[Math.floor(Math.random() * compliments.length)];
    setCompliment(pick);
    setJarHearts((x) => x + 3);
    setConfettiKey((k) => k + 1);
    setTimeout(() => setCompliment(""), 7000);
  }

  // Captions
  useEffect(() => {
    if (!current) return;
    setCaptionDraft(captions[current] || "");
  }, [current, captions]);

  function saveCaption() {
    if (!current) return;
    setCaptions((c) => ({ ...c, [current]: captionDraft.trim() }));
    setConfettiKey((k) => k + 1);
    setJarHearts((x) => x + 2);
  }

  // LOCK submit
  function unlock() {
    if (lockPass.trim() === LOCK_PASSWORD) {
      setLocked(false);
      setLockErr("");
      setConfettiKey((k) => k + 1);
      setJarHearts((x) => x + 5);
    } else {
      setLockErr("Wrong password 🤍");
    }
  }

  // Admin
  function openAdmin() {
    setAdminOpen((s) => !s);
    setAdminErr("");
  }
  function authAdmin() {
    if (adminPass.trim() === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setAdminErr("");
    } else setAdminErr("Wrong admin password");
  }

  // Vault
  function toggleVault() {
    setVaultOpen((s) => !s);
    setVaultErr("");
  }
  function authVault() {
    if (vaultPass.trim() === VAULT_PASSWORD) {
      setVaultAuthed(true);
      setVaultErr("");
      setConfettiKey((k) => k + 1);
    } else setVaultErr("Wrong vault password");
  }

  // vault items (static)
  const vaultItems = useMemo(() => {
    // expects /public/vault/01.jpg...
    const arr: string[] = [];
    for (let i = 1; i <= 18; i++) arr.push(`/vault/${String(i).padStart(2, "0")}`);
    return arr;
  }, []);

  // Engagement helpers: wheel spin and puzzle check
  function spinWheel() {
    const prizes = ["A Hug", "A Kiss", "Chocolate", "Date Night", "Surprise"];
    if (!wheelRef.current) return;
    const idx = Math.floor(Math.random() * prizes.length);
    const slice = 360 / prizes.length;
    const extra = Math.floor(Math.random() * slice);
    const spins = 5; // full rotations
    const deg = spins * 360 + idx * slice + extra;
    wheelRef.current.style.transition = "transform 3s cubic-bezier(.2,.8,.2,1)";
    wheelRef.current.style.transform = `rotate(${deg}deg)`;
    setWheelResult(null);
    setTimeout(() => {
      setWheelResult(prizes[idx]);
    }, 3200);
  }

  function checkPuzzleAnswer(input: string) {
    const norm = input.trim().toLowerCase();
    const ok = /19/.test(norm) && /(nov|november|11|19\/11|19-11)/.test(norm);
    if (ok) {
      setPuzzleSolved(true);
      setNotif({ id: Date.now(), text: "Puzzle solved! 🎉" });
      setTimeout(() => setNotif(null), 3500);
    } else {
      setNotif({ id: Date.now(), text: "Try again — think of the date." });
      setTimeout(() => setNotif(null), 2500);
    }
  }

  // Small input helper for the puzzle modal
  function PuzzleInput({ onSubmit }: { onSubmit: (val: string) => void }) {
    const [val, setVal] = useState("");
    return (
      <div className="flex gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 19 Nov" className="flex-1 rounded-md px-3 py-2 border" />
        <button className={primaryBtn} onClick={() => onSubmit(val)}>
          Try
        </button>
      </div>
    );
  }

  // Avoid SSR mismatch
  if (!hydrated) return <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#fff7fb,#fff)" }} />;

  // LOCK SCREEN
  if (locked) {
    return (
      <div className="lock-root">
        <div className="lock-card">
          <div className="lock-badge">
            <Lock size={16} /> Private Surprise
          </div>
          <div className="lock-title">A page made only for you 🤍</div>
          <div className="lock-sub">
            Enter the password to open your birthday world.
            <div style={{ marginTop: 10, fontWeight: 900, opacity: 0.8 }}>Hint: your special date + love</div>
          </div>

          <div className="lock-form">
            <input
              value={lockPass}
              onChange={(e) => setLockPass(e.target.value)}
              type="password"
              placeholder="Password"
              className="lock-input"
              onKeyDown={(e) => e.key === "Enter" && unlock()}
            />
            <button onClick={unlock} className="lock-btn">
              Open ✨
            </button>
          </div>
          {lockErr && <div className="lock-err">{lockErr}</div>}
          <div className="lock-hint">If you forgot the password, ask Rithvik 😌</div>
        </div>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="pro-root relative min-h-screen pb-28">
      {/* Music Gate Overlay (for mobile autoplay restrictions) */}
      <AnimatePresence>
        {showMusicGate && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="letter-modal" style={{zIndex: 200}}>
            <div className="letter-card" style={{maxWidth: 520}}>
              <div className="text-center">
                <div className="text-2xl font-extrabold mb-2">Tap once for music 🎶</div>
                <div className="text-sm text-gray-600 mb-5">Some phones block autoplay. One tap will start the song and it will loop in the background.</div>
                <button className={primaryBtn + " rounded-xl px-6 py-3"} onClick={() => { setShowMusicGate(false); setPlaying(true); audioRef.current?.play(); }}>Start Music</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* intro overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-gradient-to-b from-rose-50/90 to-sky-50/90 backdrop-blur-sm"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute -left-24 -top-24 w-96 h-96 rounded-full opacity-30"
                  style={{ background: "radial-gradient(closest-side,#ff7aa6,transparent)", filter: "blur(64px)" }}
                />
                <div
                  className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full opacity-30"
                  style={{ background: "radial-gradient(closest-side,#7ad2ff,transparent)", filter: "blur(64px)" }}
                />
                {Array.from({ length: 26 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 760, opacity: [1, 0] }}
                    transition={{ duration: 6 + (i % 7) * 0.25, delay: i * 0.07, ease: "linear" }}
                    style={{ position: "absolute", left: `${Math.random() * 100}%` }}
                  >
                    <div style={{ fontSize: 22 }}>💖</div>
                  </motion.div>
                ))}
              </div>

              <div className="z-10 flex flex-col items-center gap-6 px-4">
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring" }}
                  className="text-4xl md:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500"
                >
                  A special day for you, Vinitha
                </motion.h2>

                <button className="intro-big" onClick={() => handleOpenEnvelope()}>
                  <Sparkles size={18} /> Open the Letter
                </button>

                <div className="text-sm text-center max-w-xl text-slate-700">
                  Tap the button to read the letter first — then explore your memory world.
                </div>
                <button onClick={() => setShowIntro(false)} className="text-sm text-slate-500 underline">
                  Skip intro
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti canvas */}
      <canvas ref={confettiCanvasRef} className="pointer-events-none fixed inset-0 z-[60]" />

      {/* Top toolbar */}
      <div className="w-full sticky top-4 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-[min(980px,92%)] pointer-events-auto rounded-full bg-white/6 backdrop-blur px-4 py-2 flex items-center gap-4 shadow-md">
          <div className="flex-1">
            <div className="text-sm font-medium">Love Meter</div>
            <div className="w-full h-2 bg-white/10 rounded overflow-hidden mt-2">
              <div
                className="h-2 rounded bg-gradient-to-r from-pink-400 to-rose-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      messages.length * 4 + Object.values(reactions).reduce((s, r) => s + r.love * 6, 0) + jarHearts
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-200">{messages.length} wishes • {Object.values(reactions).reduce((s, r) => s + r.love, 0)} loves</div>
          <div className="keys-pill text-xs text-slate-200">
            <Shield size={14} /> locked
          </div>
        </div>
      </div>

      {/* hero */}
      <div className="pro-hero">
        <div>
          <motion.h1
            className="pro-title"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90 }}
          >
            For Vinitha — {computedAge} Years of You
          </motion.h1>
          <div className="pro-sub">Memories, surprises, and small promises — with all my love.</div>

          <div className="hero-chips">
            <span className="hero-chip hero-chip-on">
              <Sparkles size={14} /> Love Jar
            </span>
            <span className="hero-chip">
              <Music2 size={14} /> Voice Note
            </span>
            <span className="hero-chip">
              <Lock size={14} /> Memory Vault
            </span>
            <span className="hero-chip">
              <Film size={14} /> Cinematic Ending
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button className={ghostBtn + (playing ? " btn-on" : "")} onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
            {playing ? <Pause size={16} /> : <Play size={16} />} Music
          </button>

          <button className={primaryBtn} onClick={() => setShowLetter(true)}>
            <Camera size={16} /> Open Letter
          </button>

          <button className={ghostBtn} onClick={() => share()}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      <main className="pro-main">
        {/* ENGAGEMENT AREA */}
        <section className="engage-grid">
          {/* Love Jar */}
          <div className="engage-card">
            <div className="engage-head">
              <div>
                <div className="engage-title">
                  <Heart size={18} /> Love Jar
                </div>
                <div className="engage-sub">Every click adds love to the jar — it fills over time 💗</div>
              </div>
              <div className="mood-pill">
                <span style={{ fontWeight: 1000, fontSize: 12 }}>Mood</span>
                <select className="mood-select" onChange={(e) => setAccent(e.target.value)} defaultValue="#ff6fa3">
                  <option value="#ff6fa3">Pink</option>
                  <option value="#ff7aa6">Rose</option>
                  <option value="#ffb77a">Peach</option>
                  <option value="#7ad2ff">Sky</option>
                </select>
              </div>
            </div>

            <div className="jar-wrap">
              <div className="jar-with-canvas">
                <div className="jar-glass jar-pulse">
                  <div className="jar-liquid" style={{ height: `${Math.min(100, jarHearts)}%` }} />
                  <div className="jar-shine" />
                </div>
                <canvas className="jar-canvas" ref={jarCanvasRef} width={92} height={130} />
              </div>

              <div className="jar-info">
                <div className="jar-big">{jarHearts} 💗</div>
                <div className="jar-small">Jar fills with reactions, wishes, surprises.</div>

                <div className="jar-actions">
                  <button className="jar-btn" onClick={() => { setJarHearts((x) => x + 5); setConfettiKey((k) => k + 1); }}>
                    <Sparkles size={16} /> Add Love
                  </button>
                  <button className="jar-btn" onClick={dropCompliment}>
                    <Heart size={16} /> Drop a Compliment
                  </button>
                </div>

                {compliment && <div className="compliment-box">✨ {compliment}</div>}
              </div>
            </div>

            <div className="daily-quote">
              “You deserve the kind of love that feels like home — gentle, safe, and endless.”
            </div>
          </div>

          {/* Voice + Wish */}
          <div className="engage-card">
            <div className="engage-head">
              <div>
                <div className="engage-title">
                  <Music2 size={18} /> Voice Note Surprise
                </div>
                <div className="engage-sub">Press play — this is my voice, just for you.</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-10 flex-wrap">
              <button className={"voice-btn " + (voicePlaying ? "voice-on" : "")} onClick={toggleVoice}>
                {voicePlaying ? <Pause size={18} /> : <Play size={18} />} Play Voice Note
              </button>
              <div className="voice-tip">File: <b>/public/voice-note.mp3</b></div>
            </div>

            <div className="wish-box mt-5">
              <div className="engage-title">
                <Mail size={18} /> Write a Wish (sends to Rithvik)
              </div>
              <div className="engage-sub">Only you (admin) will receive it on email 💌</div>

              <textarea
                className="wish-textarea mt-3"
                rows={5}
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder="Write anything you want... (private)"
              />
              <div className="mt-3 flex items-center justify-between gap-10 flex-wrap">
                <button className={primaryBtn + " rounded-xl px-4 py-2"} onClick={sendWishToMail} disabled={wishSending}>
                  <Send size={16} /> {wishSending ? "Sending..." : "Send Wish"}
                </button>
                <div className="text-sm font-semibold" style={{ opacity: 0.7 }}>
                  {wishStatus}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <section className="pro-grid">
          <div className="card">
            <div className="gallery-stage" aria-live="polite">
              <AnimatePresence initial={false} mode="wait">
                {current && (
                  <SmartImg
                    srcBase={current}
                    alt={`memory ${index + 1}`}
                    onFailFinal={() => setIndex(i => (i + 1) % photos.length)}
                    motionProps={{
                      key: current,
                      initial: { opacity: 0, scale: 1.02 },
                      animate: { opacity: 1, scale: 1 },
                      exit: { opacity: 0, scale: 0.98 },
                      transition: { duration: 0.7 },
                      className: "w-full h-full object-contain bg-black/5",
                      onClick: () => setShowLightbox(true),
                      loading: "lazy",
                      
                    }}
                  />
                )}
              </AnimatePresence>

              {captions[current] && (
                <div className="caption-overlay">
                  <div className="caption-pill">“{captions[current]}”</div>
                </div>
              )}

              <div className="controls-floating">
                <button onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)} className="controls-icon">
                  ◀
                </button>
                <button onClick={() => setIndex((i) => (i + 1) % photos.length)} className="controls-icon">
                  ▶
                </button>
                <div className="ml-4 text-sm text-white bg-black/30 px-3 py-1 rounded-full">
                  {index + 1}/{photos.length}
                </div>
              </div>
            </div>

            <div className="timeline-row mt-6">
              <input
                type="range"
                min={0}
                max={Math.max(1, photos.length - 1)}
                value={index}
                onChange={(e) => setIndex(Number(e.target.value))}
                className="w-full"
              />
              <div className="timeline-age">Age ≈ {Math.round((index / Math.max(1, photos.length - 1)) * computedAge)} yrs</div>
            </div>

            {/* Caption editor */}
            <div className="caption-area mt-5">
              <div className="caption-title">
                <Sparkles size={16} /> Memory Caption
              </div>
              <div className="caption-body">Add a caption to this photo (visible to her).</div>

              <div className="mt-3 flex gap-2 flex-wrap">
                <input
                  value={captionDraft}
                  onChange={(e) => setCaptionDraft(e.target.value)}
                  placeholder="Example: 'That day your smile fixed my world.'"
                  className="lock-input"
                  style={{ flex: 1 }}
                />
                <button onClick={saveCaption} className="lock-btn">
                  Save
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <label className={btn} title="Upload images">
                <Upload size={16} />{" "}
                <input type="file" accept="image/*,video/*" multiple onChange={onFiles} className="hidden" />
              </label>

              <button className={btn} onClick={() => exportCertificate()}>
                <Download size={16} /> Export Certificate
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button className={btn} onClick={() => setShowFireworks(true)}>
                  🎆
                </button>
                <button className={btn} onClick={() => setConfettiKey((k) => k + 1)}>
                  🎉
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            {/* Guestbook */}
            <div className="sidebar panel">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Guestbook</h3>
                <div className="text-sm text-gray-500">{messages.length} messages</div>
              </div>

              <div className="flex gap-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write a wish..."
                  className="flex-1 rounded-xl px-3 py-2 border focus:ring-2 focus:ring-[var(--accent)]"
                />
                <button onClick={addMessage} className={primaryBtn + " px-4 py-2 rounded-xl"}>
                  Send
                </button>
              </div>

              <div className="mt-3 max-h-48 overflow-auto space-y-2">
                {messages.map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/80 border">
                    <div className="font-semibold">{m.text}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(m.ts).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appearance */}

<div className="sidebar panel">
  <h4 className="font-semibold">🌟 Memory of the Day</h4>
  <div className="text-xs text-gray-500 mt-1">A random moment chosen for today.</div>
  <div className="mt-3 rounded-xl overflow-hidden bg-white/80 border" style={{ height: 160 }}>
    {memoryOfDay ? (
      <SmartImg srcBase={memoryOfDay} alt="memory of the day" className="w-full h-full object-cover" onClick={() => { const idx = photos.indexOf(memoryOfDay); if (idx >= 0) setIndex(idx); }} />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Loading…</div>
    )}
  </div>
  {memoryOfDay && (
    <div className="mt-3 flex gap-2">
      <button className={btn} onClick={() => toggleFavorite(memoryOfDay)}>⭐ {favorites.includes(memoryOfDay) ? "Saved" : "Save"}</button>
      <button className={btn} onClick={() => { const idx = photos.indexOf(memoryOfDay); if (idx >= 0) { setIndex(idx); setShowLightbox(true); } }}>Open</button>
    </div>
  )}
</div>

<div className="sidebar panel">
  <h4 className="font-semibold">⭐ Favorites</h4>
  <div className="text-xs text-gray-500 mt-1">Your favorite moments saved here.</div>
  {!favorites.length ? (
    <div className="mt-3 text-sm text-gray-500">No favorites yet — tap ⭐ Save on any photo.</div>
  ) : (
    <div className="mt-3 fav-grid">
      {favorites.slice(0, 12).map((p, i) => (
        <div key={i} className="relative">
          <SmartImg srcBase={p} alt={`fav ${i}`} className="w-full h-20 object-cover rounded-lg bg-gray-100" onClick={() => { const idx = photos.indexOf(p); if (idx >= 0) { setIndex(idx); setShowLightbox(true); }}} />
          <button className="fav-remove" onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}>✕</button>
        </div>
      ))}
    </div>
  )}
</div>


<div className="sidebar panel">
  <h4 className="font-semibold">🎁 Surprise Controls</h4>
  <div className="text-xs text-gray-500 mt-1">Cute interactive surprises for you.</div>

  <div className="mt-4 grid grid-cols-2 gap-2">
    <button className={btn} onClick={() => setBottleOpen(true)}>🍾 Bottle</button>
    <button className={btn} onClick={() => setPetalsOn(v => !v)}>{petalsOn ? "🌹 Petals: ON" : "🌹 Petals: OFF"}</button>
    <button className={btn} onClick={() => setHuntStarted(true)}>💗 Treasure Hunt</button>
    <button className={btn} onClick={() => setWheelOpen(true)}>🎡 Wheel</button>
    <button className={btn} onClick={() => setPuzzleOpen(true)}>🧩 Puzzle</button>
    <button className={btn} onClick={() => setMontageOpen(true)}>🎬 Montage</button>
  </div>

  <div className="mt-3 p-3 rounded-xl bg-white/75 border">
    <div className="font-semibold text-sm">Treasure Progress</div>
    <div className="text-xs text-gray-500 mt-1">{huntFound.length}/5 hearts found</div>
    <div className="w-full h-2 bg-white/60 rounded mt-2 overflow-hidden">
      <div className="h-2 rounded bg-gradient-to-r from-pink-400 to-rose-500" style={{ width: `${(huntFound.length/5)*100}%` }} />
    </div>
    <div className="text-[11px] text-gray-500 mt-2">Tip: look around the page ✨</div>
  </div>
</div>

            <div className="sidebar panel">
              <h4 className="font-semibold">Appearance</h4>
              <div className="mt-3 flex items-center gap-3">
                <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))} className={btn}>
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-10 h-10 p-0 rounded-full" />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`I love you, Vinitha ❤️`);
                  }}
                  className={btn}
                >
                  Copy Note
                </button>
              </div>
            </div>
          </aside>
        </section>

</main>

{/* LOVE STORY CHAPTERS */}
<main className="pro-main">
  <section className="hidden-section">
    <div className="engage-head">
      <div>
        <div className="engage-title"><Sparkles size={18}/> Love Story Chapters</div>
        <div className="engage-sub">Scroll slowly… this is our story written in feelings.</div>
      </div>
      <button className="jar-btn" onClick={() => { setConfettiKey(k=>k+1); setJarHearts(x=>x+8); }}>💖 Feel it</button>
    </div>

    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { t: 'Chapter 1 — “The First Spark”', b: `It started quietly…\nLike the universe whispered your name into my life.\nAnd the first time I truly noticed you,\neverything inside me went soft… like spring.` },
        { t: 'Chapter 2 — “My Favorite Feeling”', b: `Some people feel like memories.\nBut you felt like home — even before I knew what home meant.\nEvery smile of yours turned ordinary days into magic.` },
        { t: 'Chapter 3 — “I Stayed”', b: `Life tested us early,\nbut my heart didn’t know how to leave.\nBecause even when everything felt uncertain,\none thing stayed clear — I wanted you. Only you.` },
        { t: 'Chapter 4 — “You Became Mine”', b: `And then… it happened.\nNot loud, not dramatic — just real.\nA moment where my heart finally smiled and said:\n“She’s mine. She chose me.”` },
        { t: 'Chapter 5 — “Our Beautiful Era”', b: `From that day, we weren’t just two people,\nwe became a story.\nA story full of small laughs, late talks, tiny fights,\nand even tinier “I miss you” messages.` },
        { t: 'Chapter 6 — “You Made Me Better”', b: `Loving you wasn’t just love…\nit was growth.\nYou unknowingly turned me into a better man —\nmore patient, more real, more alive.` },
        { t: 'Chapter 7 — “My Favorite Person”', b: `In crowds, in noise, in a world full of people…\nmy eyes still search for only one soul — you.\nBecause Vinitha… you’re not part of my life.\nYou are my life.` },
        { t: 'Final Chapter — “Forever, Us.”', b: `And here we are… still holding on, still choosing, still loving.\nMaybe we’re not perfect,\nbut we are real — and that is rare.\n\nNo matter where life takes us,\none thing is permanent:\n\n✨ My heart will always find you.\n✨ My love will always choose you.\n✨ And my future… will always have “us” in it.\n\nHappy ending?\nNo, baby…\nThis isn’t the ending.\n\n💖 This is just the beginning of forever.` },
      ].map((c, i) => (
        <div key={i} className="engage-card" style={{ margin: 0 }}>
          <div className="hidden-page-title">{c.t}</div>
          <div className="hidden-page-body whitespace-pre-wrap">{c.b}</div>
        </div>
      ))}
    </div>
  </section>
</main>

{/* Lightbox */}

      <AnimatePresence>
        {showLightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setShowLightbox(false)}>
            <div className="letter-card" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full h-[72vh] rounded-lg overflow-hidden bg-white">
                <SmartImg srcBase={current} alt="full" className="w-full h-full object-contain" />
                {captions[current] && <div className="caption-lightbox">“{captions[current]}”</div>}
                <div className="absolute top-4 right-4 flex gap-2 flex-wrap">
                  <button onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)} className={btn}>
                    ◀
                  </button>
                  <button onClick={() => setIndex((i) => (i + 1) % photos.length)} className={btn}>
                    ▶
                  </button>
                  <button onClick={() => exportCertificate()} className={btn}>
                    📄 Export
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Prompt */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setShowNamePrompt(false)}>
            <div className="letter-card" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">A tiny request 💗</h3>
                <p className="text-sm text-gray-600 mb-4">Enter your name — so this letter becomes truly yours.</p>
                <input
                  ref={nameInputRef}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-[var(--accent)]"
                  onKeyDown={(e) => e.key === "Enter" && submitName()}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={submitName} className={primaryBtn + " px-4 py-2 rounded-xl"}>
                    Open Letter
                  </button>
                  <button onClick={() => { setShowNamePrompt(false); setEnvelopeOpen(false); }} className={btn}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter */}
      <AnimatePresence>
        {showLetter && (
          <motion.div initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setShowLetter(false)}>
            <div className="letter-card letter-scroll" onClick={(e) => e.stopPropagation()}>
              <div className="letter-header">
                <div className="letter-badge">
                  <Sparkles size={14} /> A letter for you
                </div>
                <div className="letter-badge">{recipientName ? getInitials(recipientName) : "LOVE"}</div>
              </div>

              <div className="letter-paper">
                <div className="letter-text-pro whitespace-pre-wrap">{typedText}</div>
              </div>

              <div className="mt-4 flex justify-end gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setShowFireworks(true);
                    setConfettiKey((k) => k + 1);
                    setShowLetter(false);
                    setShowIntro(false);
                  }}
                  className={primaryBtn + " px-4 py-2 rounded-xl"}
                >
                  Celebrate 🎆
                </button>
                <button onClick={() => setShowLetter(false)} className={btn}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vault FAB */}
      <div className="vault-fab">
        <button className="vault-fab-btn" onClick={toggleVault} title="Memory Vault">
          <Lock size={18} />
        </button>
      </div>

      {/* Ending FAB */}
      <div className="ending-fab">
        <button className="ending-fab-btn" onClick={() => setEndingOpen(true)} title="Cinematic Ending">
          <Film size={18} />
        </button>
      </div>

      {/* Admin FAB */}
      <div className="admin-fab">
        <button className="admin-fab-btn" onClick={openAdmin} title="Admin Panel">
          <Shield size={18} />
        </button>
      </div>

      {/* Vault Modal */}
      <AnimatePresence>
        {vaultOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setVaultOpen(false)}>
            <div className="letter-card" onClick={(e) => e.stopPropagation()}>
              <div className="letter-header">
                <div className="letter-badge">
                  <Lock size={14} /> Memory Vault
                </div>
              </div>

              {!vaultAuthed ? (
                <>
                  <div className="engage-sub" style={{ marginTop: 6 }}>
                    Extra private memories. Password protected 🔒
                  </div>
                  <div className="vault-row">
                    <input
                      value={vaultPass}
                      onChange={(e) => setVaultPass(e.target.value)}
                      type="password"
                      placeholder="Vault password"
                      className="vault-input"
                      onKeyDown={(e) => e.key === "Enter" && authVault()}
                    />
                    <button className="lock-btn" onClick={authVault}>
                      Unlock
                    </button>
                  </div>
                  {vaultErr && <div className="vault-err">{vaultErr}</div>}
                </>
              ) : (
                <>
                  <div className="engage-sub" style={{ marginTop: 6 }}>
                    Welcome to the private vault 🤍
                  </div>
                  <div className="vault-grid">
                    {vaultItems.map((v, i) => (
                      <div key={i} className="vault-item">
                        <SmartImg srcBase={v} alt={`vault ${i}`} className="vault-thumb" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setVaultOpen(false)} className={btn}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Drawer */}
      <AnimatePresence>
        {adminOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="admin-drawer">
            <div className="admin-inner">
              <div className="admin-title">Admin Panel</div>
              <div className="admin-sub">Only you should access this.</div>

              {!adminAuthed ? (
                <>
                  <div className="admin-row">
                    <input
                      className="admin-input"
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="Admin password"
                      onKeyDown={(e) => e.key === "Enter" && authAdmin()}
                    />
                    <button className="admin-btn" onClick={authAdmin}>
                      Unlock
                    </button>
                  </div>
                  {adminErr && <div className="admin-err">{adminErr}</div>}
                </>
              ) : (
                <>
                  <div className="admin-section">
                    <div className="admin-label">Controls</div>

                    <div className="admin-row">
                      <button className="admin-chip" onClick={() => setShowFireworks(true)}>
                        🎆 Fireworks
                      </button>
                      <button className="admin-chip" onClick={() => setConfettiKey((k) => k + 1)}>
                        🎉 Confetti
                      </button>
                      <button className="admin-chip" onClick={() => setEndingOpen(true)}>
                        🎬 Ending
                      </button>
                    </div>

                    <div className="admin-note">
                      Tip: Change passwords in <b>app/page.tsx</b> constants: <code>LOCK_PASSWORD</code>, <code>ADMIN_PASSWORD</code>, <code>VAULT_PASSWORD</code>.
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Ending */}
      <AnimatePresence>
        {endingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ending-modal">
            <div className="ending-screen">
              <div className="ending-header">
                <div className="ending-badge">
                  <Film size={16} /> Final Scene
                </div>
                <button className="ending-close" onClick={() => setEndingOpen(false)}>
                  Close
                </button>
              </div>

              <div className="ending-stage">
                <motion.div
                  className="credits"
                  initial={{ y: "70%" }}
                  animate={{ y: "-180%" }}
                  transition={{ duration: 36, ease: "linear" }}
                >
                  <div className="credits-title">For Vinitha</div>
                  <div className="credits-line">Starring: Your Smile ✨</div>
                  <div className="credits-line">Co‑starring: Your Kind Heart 🤍</div>
                  <div className="credits-line">Special Appearance: Your Laugh 🌙</div>
                  <div className="credits-gap" />
                  <div className="credits-line">Directed by: Rithvik</div>
                  <div className="credits-line">Produced with: Love & Patience</div>
                  <div className="credits-line">Location: Every Memory We Made</div>
                  <div className="credits-gap" />
                  <div className="credits-line">Message:</div>
                  <div className="credits-line">“You are loved.”</div>
                  <div className="credits-gap" />
                  <div className="credits-line">The End…</div>
                </motion.div>
              </div>

              <div className="ending-footer">
                <button
                  className="ending-btn"
                  onClick={() => {
                    setShowFireworks(true);
                    setConfettiKey((k) => k + 1);
                    setEndingOpen(false);
                  }}
                >
                  <Sparkles size={18} /> One Last Celebration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


{/* Polaroid FAB */}
<div className="ending-fab" style={{ bottom: 256 }}>
  <button className="ending-fab-btn" onClick={() => setPolaroidOpen(true)} title="Polaroid Scatter">
    🖼️
  </button>
</div>

{/* Constellation FAB */}
<div className="ending-fab" style={{ bottom: 196 }}>
  <button className="ending-fab-btn" onClick={() => setConstellationOpen(true)} title="Gemini Constellation">
    ✨
  </button>
</div>

{/* Polaroid Scatter Mode */}
<AnimatePresence>
  {polaroidOpen && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setPolaroidOpen(false)}>
      <div className="letter-card" onClick={(e) => e.stopPropagation()} style={{ padding: 14 }}>
        <div className="letter-header">
          <div className="letter-badge"><Sparkles size={14}/> Polaroid Scatter Mode</div>
          <button className={btn} onClick={() => {
            const idxs = [...polaroidOrder];
            for (let i = idxs.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
            }
            setPolaroidOrder(idxs);
          }}>Shuffle</button>
        </div>

        <div style={{ position: 'relative', height: '68vh', borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(circle at 20% 20%, rgba(255,111,163,0.18), transparent 50%), rgba(255,255,255,0.35)' }}>
          {polaroidOrder.map((pi, k) => {
            const p = photos[pi];
            const rot = (k % 2 ? 1 : -1) * (6 + (k % 5));
            const left = (k * 11) % 82;
            const top = (k * 17) % 70;
            return (
              <motion.div
                key={k}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: k * 0.03 }}
                style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, width: 180, transform: `rotate(${rot}deg)`, cursor: 'pointer' }}
                onClick={() => { setIndex(pi); setShowLightbox(true); }}
              >
                <div style={{ borderRadius: 18, background: 'rgba(255,255,255,0.9)', padding: 10, boxShadow: '0 28px 80px rgba(0,0,0,0.18)' }}>
                  <div style={{ borderRadius: 14, overflow: 'hidden', height: 140, background: '#fff' }}>
                    <SmartImg srcBase={p} alt="polaroid" className="w-full h-full object-cover" />
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 12, color: 'rgba(18,18,23,0.72)' }}>
                    {captions[p] ? `“${captions[p]}”` : 'Tap to open'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 flex justify-between flex-wrap gap-2">
          <button className={primaryBtn + " rounded-xl"} onClick={() => { setConfettiKey(k=>k+1); setJarHearts(x=>x+10); }}>Sprinkle Love</button>
          <button className={btn} onClick={() => setPolaroidOpen(false)}>Close</button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

{/* Gemini Constellation (replaces Starry Night) */}
<AnimatePresence>
  {constellationOpen && (
    <GeminiConstellation visible={true} onClose={() => setConstellationOpen(false)} />
  )}
</AnimatePresence>

{/* fireworks canvas */}

      {/* Petals (floating) */}
      {petalsOn && (
        <div className="petals" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              className="petal"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 920, opacity: 1 }}
              transition={{ duration: 5 + (i % 5), delay: (i % 7) * 0.15, repeat: Infinity, repeatDelay: 2 + (i % 3) }}
              style={{ left: `${(i * 11) % 100}%`, fontSize: 18 + (i % 6) * 3 }}
            >
              🌹
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottle Modal */}
      <AnimatePresence>
        {bottleOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setBottleOpen(false)}>
            <div className="letter-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 780 }}>
              <div className="letter-header">
                <div className="letter-badge">🍾 Message in a Bottle</div>
                <button className={btn} onClick={() => setBottleOpen(false)}>Close</button>
              </div>

              <div className="bottle-stage mt-4">
                <div className="bottle" aria-hidden>
                  <div className="bottle-neck" />
                  <div className="bottle-body">
                    <div className="bottle-glow" />
                    <div className="bottle-scroll">
                      <div className="scroll-title">A tiny love note</div>
                      <div className="scroll-text">I love you more than words — every day with you is a gift. — R</div>
                      <div className="scroll-sign">— Always</div>
                    </div>
                    <div className="bottle-water" />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wheel Modal */}
      <AnimatePresence>
        {wheelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setWheelOpen(false)}>
            <div className="letter-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
              <div className="letter-header">
                <div className="letter-badge">🎡 Wheel of Love</div>
                <button className={btn} onClick={() => setWheelOpen(false)}>Close</button>
              </div>

              <div className="wheel-wrap mt-4">
                <div ref={wheelRef} className="wheel" style={{ width: 340, height: 340, borderRadius: '50%', position: 'relative' }}>
                  {['A Hug', 'A Kiss', 'Chocolate', 'Date Night', 'Surprise'].map((t, i, arr) => (
                    <div key={i} className="wheel-slice" style={{ transform: `rotate(${(360 / arr.length) * i}deg)` }}>
                      <span style={{ transform: `rotate(${360 / arr.length / 2}deg)` }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button className={primaryBtn + ' rounded-xl'} onClick={spinWheel}>Spin</button>
                <div className="wheel-result">{wheelResult ?? 'Ready to spin'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Puzzle Modal */}
      <AnimatePresence>
        {puzzleOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setPuzzleOpen(false)}>
            <div className="letter-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <div className="letter-header">
                <div className="letter-badge">🧩 Memory Puzzle</div>
                <button className={btn} onClick={() => setPuzzleOpen(false)}>Close</button>
              </div>

              <div className="p-4">
                {!puzzleSolved ? (
                  <>
                    <div className="text-sm text-gray-600 mb-3">Enter the special date to unlock the memory.</div>
                    <PuzzleInput onSubmit={(val: string) => checkPuzzleAnswer(val)} />
                  </>
                ) : (
                  <div className="puzzle-photo puzzle-solved">
                    <div className="text-lg font-semibold">Unlocked — 19 Nov</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Montage Modal */}
      <AnimatePresence>
        {montageOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="letter-modal" onClick={() => setMontageOpen(false)}>
            <div className="letter-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 980 }}>
              <div className="letter-header">
                <div className="letter-badge">🎬 Memory Montage</div>
                <button className={btn} onClick={() => setMontageOpen(false)}>Close</button>
              </div>

              <div className="mt-3 montage-stage">
                <div className="montage-grid p-4">
                  {photos.slice(0, 9).map((p, i) => (
                    <div key={i} className="montage-media" onClick={() => { setIndex(i); setShowLightbox(true); }}>
                      <SmartImg srcBase={p} alt={`montage ${i}`} className="w-full h-28 object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button className={primaryBtn + ' rounded-xl'} onClick={() => { setEndingOpen(true); setMontageOpen(false); }}>Roll Credits</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showFireworks && <canvas ref={canvasRef} className="fw-canvas" />}

      {/* confetti DOM */}
      <div key={confettiKey} className="confetti-root" aria-hidden>
        {Array.from({ length: 56 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 1 }}
            animate={{ y: 900, opacity: 0 }}
            transition={{ duration: 2 + Math.random() }}
            style={{ position: "absolute", left: `${Math.random() * 100}%` }}
          >
            <div style={{ width: 8, height: 12, background: `hsl(${Math.floor(Math.random() * 360)} 80% 60%)`, borderRadius: 2 }} />
          </motion.div>
        ))}
      </div>

      {/* bottom strip */}
      <div className="control-strip">
        <button onClick={() => setShowLightbox((s) => !s)} className={btn}>
          📷
        </button>
        <button onClick={() => setShowLetter(true)} className={btn}>
          💌
        </button>
        <button onClick={() => setConfettiKey((k) => k + 1)} className={btn}>
          🎉
        </button>
        <button onClick={() => setEndingOpen(true)} className={btn}>
          🎬
        </button>
      </div>

      <footer className="text-center py-8 text-sm text-gray-500">
        Made with ❤️ — for Vinitha. Customize images in <code>/public/images</code> and couple pics in <code>/public/vault</code>
      </footer>
    </div>
  );
}

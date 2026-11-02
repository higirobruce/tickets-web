"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Camera QR reader. Uses the browser's BarcodeDetector when present (Chrome, Android),
 * otherwise decodes frames with jsQR (Safari). Calls onCode(text) once per distinct code.
 */
export default function QrScanner({ onCode, paused = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastRef = useRef({ code: null, at: 0 });
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    let raf;
    let detector = null;
    let jsQR = null;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setReady(true);
        if ("BarcodeDetector" in window) {
          try {
            detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          } catch {
            detector = null;
          }
        }
        if (!detector) jsQR = (await import("jsqr")).default;
        tick();
      } catch (err) {
        setError(err?.name === "NotAllowedError" ? "Camera access was refused. Allow the camera for this site, or type the ticket number below." : `Camera unavailable: ${err?.message || err}`);
      }
    }

    function emit(code) {
      const now = Date.now();
      if (code === lastRef.current.code && now - lastRef.current.at < 4000) return;
      lastRef.current = { code, at: now };
      onCode(code);
    }

    async function tick() {
      if (stopped) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !paused) {
        try {
          if (detector) {
            const codes = await detector.detect(video);
            if (codes[0]?.rawValue) emit(codes[0].rawValue);
          } else if (jsQR) {
            const canvas = canvasRef.current;
            const w = (canvas.width = Math.min(640, video.videoWidth));
            const h = (canvas.height = Math.round((video.videoHeight / video.videoWidth) * w));
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(video, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const found = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
            if (found?.data) emit(found.data);
          }
        } catch {
          // a bad frame is not an error; keep scanning
        }
      }
      raf = setTimeout(tick, 150);
    }

    start();
    return () => {
      stopped = true;
      clearTimeout(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [paused]);

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-night aspect-square sm:aspect-video">
        <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {ready && !paused && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 rounded-xl ring-4 ring-white/70" />
          </div>
        )}
        {!ready && !error && <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">Starting camera...</div>}
      </div>
      {error && <div className="notice-warn">{error}</div>}
    </div>
  );
}

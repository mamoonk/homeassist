import { useEffect, useRef } from 'react';

interface SmartMirrorBackgroundProps {
  deviceId: string;
}

export function SmartMirrorBackground({ deviceId }: SmartMirrorBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        // Permission denied or no camera available — background just stays empty.
      }
    }

    start();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [deviceId]);

  return <video ref={videoRef} className="smart-mirror-video" autoPlay muted playsInline />;
}

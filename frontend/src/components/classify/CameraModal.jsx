import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Default to rear camera on phones
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image file instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_waste_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
        onClose();
      }
    }, 'image/jpeg', 0.92);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B2B]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D3EAD7] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D3EAD7] bg-[#F7FAF7]">
          <div className="flex items-center gap-2 text-[#183B2B] font-bold">
            <Camera className="w-5 h-5 text-[#16845B]" />
            <span>Capture Waste Item</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#EAF5EC] text-[#52705F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-[#183B2B] aspect-[4/3] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-white space-y-2">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-400" />
              <p className="text-sm font-medium">{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Overlay target guide */}
              <div className="absolute inset-8 border-2 border-white/50 border-dashed rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-white/70 text-xs font-medium px-3 py-1 bg-black/40 rounded-full backdrop-blur-xs">
                  Center waste item here
                </span>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-5 flex items-center justify-around bg-[#FFFFFF]">
          <button
            type="button"
            onClick={switchCamera}
            disabled={!!cameraError}
            className="p-3 rounded-full bg-[#EAF5EC] text-[#16845B] hover:bg-[#D3EAD7] transition-colors disabled:opacity-50"
            title="Switch front/rear camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!!cameraError}
            className="px-6 py-3 rounded-2xl bg-[#16845B] hover:bg-[#126e4b] text-white font-bold text-sm shadow-md flex items-center gap-2 transform active:scale-95 transition-all disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-3 rounded-full bg-[#F7FAF7] text-[#52705F] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

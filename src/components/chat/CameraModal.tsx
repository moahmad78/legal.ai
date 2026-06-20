"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, RefreshCw, UploadCloud } from "lucide-react";
import { useUploadStore } from "@/store/upload-store";
import { useUpload } from "@/hooks/use-upload";

export function CameraModal({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setFile } = useUploadStore();
  const uploadMutation = useUpload();

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError("Camera access denied or not available. Please check your permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Handle dialog opening/closing
  if (open && !stream && !photo && !error) {
    startCamera();
  } else if (!open && stream) {
    stopCamera();
    setTimeout(() => setPhoto(null), 300); // reset after closing animation
  }

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      const ctx = canvasRef.current.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0, width, height);
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
      setPhoto(dataUrl);
      stopCamera();
    }
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  const usePhoto = () => {
    if (photo) {
      // Convert dataURL to Blob
      const byteString = atob(photo.split(',')[1]);
      const mimeString = photo.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: mimeString });
      
      setFile(file);
      uploadMutation.mutate(file);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black/95 text-white border-white/10 rounded-2xl">
        <div className="relative flex flex-col h-[600px] max-h-[85vh]">
          <div className="absolute top-4 right-4 z-20">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-400 font-medium mb-4">{error}</p>
                <Button onClick={() => onOpenChange(false)} variant="secondary">Close</Button>
              </div>
            ) : photo ? (
              <img src={photo} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="p-6 flex items-center justify-center gap-6 bg-black pb-8">
            {!photo && !error && (
              <Button onClick={takePhoto} size="icon" className="h-16 w-16 rounded-full bg-white text-black hover:bg-white/90 border-4 border-white/20 hover:scale-105 transition-transform">
                <Camera className="h-6 w-6" />
              </Button>
            )}
            {photo && (
              <>
                <Button onClick={retake} variant="ghost" className="text-white hover:bg-white/10 rounded-xl px-6 h-12">
                  <RefreshCw className="h-4 w-4 mr-2" /> Retake
                </Button>
                <Button onClick={usePhoto} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-12">
                  <UploadCloud className="h-4 w-4 mr-2" /> Use Photo
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

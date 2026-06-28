"use client";
import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check, X } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { useUploadStore } from "@/store/upload-store";
import { toast } from "sonner";

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CameraModal({ open, onOpenChange }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const uploadMutation = useUpload();
  const { setFile } = useUploadStore();

  // Start camera when modal opens
  useEffect(() => {
    if (open && !captured) {
      startCamera();
    }
    return () => {
      if (!open) stopCamera();
    };
  }, [open]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // rear camera on mobile
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } 
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCaptured(null);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCaptured(dataUrl);
    // Stop camera stream after capture
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const usePhoto = () => {
    if (!captured) return;
    // Convert base64 to File
    fetch(captured)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { 
          type: 'image/jpeg' 
        });
        setFile(file);
        uploadMutation.mutate(file);
        toast.success("Photo captured! Analyzing...");
        onOpenChange(false);
        stopCamera();
      });
  };

  const handleClose = () => {
    stopCamera();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Take a Photo
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-black aspect-[4/3] w-full">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center 
                            justify-center text-white text-center p-6 gap-3">
              <X className="h-10 w-10 text-red-400" />
              <p className="text-sm">{cameraError}</p>
            </div>
          ) : captured ? (
            <img src={captured} alt="Captured" className="w-full h-full object-cover" />
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

        <div className="p-4 flex items-center justify-center gap-4 bg-background">
          {!captured ? (
            <>
              <Button variant="outline" onClick={handleClose} className="rounded-full">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button 
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="rounded-full h-14 w-14 p-0 bg-primary hover:bg-primary/90"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={retake} className="rounded-full">
                <RotateCcw className="h-4 w-4 mr-2" /> Retake
              </Button>
              <Button onClick={usePhoto} className="rounded-full">
                <Check className="h-4 w-4 mr-2" /> Use Photo
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

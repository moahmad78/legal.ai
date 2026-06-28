"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, File as FileIcon, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useUploadStore } from "@/store/upload-store";
import { useUpload } from "@/hooks/use-upload";
import { useAnalysisStore } from "@/store/analysis-store";
import { useAnalysis } from "@/hooks/use-analysis";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/services/storage/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const STAGES = [
  "Extracting document text...",
  "Detecting document type...",
  "Generating AI insights...",
  "Preparing results..."
];

export function Uploader() {
  const { file, status, progress, setFile, reset } = useUploadStore();
  const uploadMutation = useUpload();
  
  const { status: analysisStatus } = useAnalysisStore();
  const analyzeMutation = useAnalysis();

  const [analysisStage, setAnalysisStage] = useState(0);

  // Auto-trigger analysis
  useEffect(() => {
    if (status === "success" && analysisStatus === "idle") {
      const docId = useUploadStore.getState().documentId;
      if (docId) {
        const timer = setTimeout(() => {
          analyzeMutation.mutate({ documentId: docId });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [status, analysisStatus, analyzeMutation]);

  // Processing stages
  useEffect(() => {
    if (analysisStatus === "processing") {
      setAnalysisStage(0);
      const interval = setInterval(() => {
        setAnalysisStage((prev) => Math.min(prev + 1, STAGES.length - 1));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [analysisStatus]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        const error = fileRejections[0].errors[0];
        if (error.code === "file-too-large") {
          toast.error("File is larger than 20MB limit");
        } else if (error.code === "file-invalid-type") {
          toast.error("File type is not supported");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        uploadMutation.mutate(selectedFile);
      }
    },
    [setFile, uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: status === "uploading" || status === "success" || analysisStatus === "processing",
  });

  return (
    <div {...getRootProps()}>
      <motion.div 
        animate={{ scale: isDragActive ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer rounded-[24px] overflow-hidden bg-card text-card-foreground shadow-card",
          isDragActive ? "border-primary bg-primary/5 shadow-card-hover" : "border-border hover:border-primary/50 hover:shadow-card-hover",
          (status === "uploading" || status === "success") && "pointer-events-none opacity-90"
        )}
      >
        <input {...getInputProps()} />
      <CardContent className="flex flex-col items-center justify-center py-20 text-center min-h-[400px]">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div key="idle" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="flex flex-col items-center w-full max-w-md mx-auto">
              <motion.div 
                animate={{ scale: isDragActive ? 1.1 : 1, y: isDragActive ? -10 : 0 }}
                className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 shadow-sm transition-transform duration-300 group-hover:scale-105"
              >
                <UploadCloud className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="text-3xl font-semibold mb-3 tracking-tight font-heading">Upload Document</h3>
              <p className="text-muted-foreground mb-8 text-base font-body">
                {isDragActive ? "Drop the file here..." : "Drag and drop your document here, or click to browse. We securely analyze your document in seconds."}
              </p>
              <div className={buttonVariants({ size: "lg", className: "px-10 h-14 rounded-[14px] text-base shadow-md transition-transform hover:-translate-y-[2px]" })}>
                Browse Files
              </div>
              <div className="flex items-center gap-4 mt-10 text-sm font-medium text-muted-foreground font-body">
                <Badge variant="secondary" className="px-3 py-1 font-normal bg-muted/50">PDF</Badge>
                <Badge variant="secondary" className="px-3 py-1 font-normal bg-muted/50">DOCX</Badge>
                <Badge variant="secondary" className="px-3 py-1 font-normal bg-muted/50">PNG</Badge>
                <Badge variant="secondary" className="px-3 py-1 font-normal bg-muted/50">JPG</Badge>
              </div>
            </motion.div>
          )}

          {status === "uploading" && file && (
            <motion.div key="uploading" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="w-full max-w-md flex flex-col items-center mx-auto">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
              <h3 className="text-xl font-semibold mb-3 font-heading">Uploading {file.name}</h3>
              <Progress value={progress} className="w-full h-3 mb-3 rounded-full" />
              <p className="text-sm text-muted-foreground font-body">{progress}% Complete</p>
            </motion.div>
          )}

          {status === "success" && (analysisStatus === "idle" || analysisStatus === "completed") && file && (
            <motion.div key="success" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="w-full max-w-md flex flex-col items-center mx-auto">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="h-20 w-20 bg-[hsl(var(--success-bg))] rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="h-10 w-10 text-success" />
              </motion.div>
              <h3 className="text-2xl font-semibold mb-2 font-heading">
                {analysisStatus === "completed" ? "Analysis Complete!" : "Upload Complete!"}
              </h3>
              <p className="text-muted-foreground mb-8 text-base font-body bg-muted/50 px-4 py-2 rounded-lg truncate w-full max-w-[300px]">{file.name}</p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); reset(); useAnalysisStore.getState().reset(); }}
                className={buttonVariants({ variant: "outline", className: "w-full h-12 rounded-[12px] hover:bg-muted" })}
              >
                Upload Another
              </button>
            </motion.div>
          )}

          {analysisStatus === "processing" && (
            <motion.div key="processing" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="w-full max-w-md flex flex-col items-center mx-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="h-14 w-14 text-primary animate-spin relative z-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-heading">Analyzing with AI...</h3>
              <p className="text-base font-medium text-primary text-center font-body max-w-[300px]">
                {STAGES[analysisStage]}
              </p>
            </motion.div>
          )}

          {analysisStatus === "failed" && (
            <motion.div key="analysis-failed" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="w-full max-w-md flex flex-col items-center mx-auto">
              <div className="h-20 w-20 bg-[hsl(var(--danger-bg))] rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-danger" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-heading">Analysis failed</h3>
              <p className="text-danger mb-8 text-base font-body text-center">There was an error generating AI insights. Please try again.</p>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const docId = useUploadStore.getState().documentId;
                  if(docId) analyzeMutation.mutate({ documentId: docId });
                }}
                className={buttonVariants({ variant: "default", className: "mb-3 w-full h-12 rounded-[12px]" })}
              >
                Retry Analysis
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); reset(); useAnalysisStore.getState().reset(); }}
                className={buttonVariants({ variant: "outline", className: "w-full h-12 rounded-[12px] hover:bg-muted" })}
              >
                Upload Another
              </button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div key="error" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="w-full max-w-md flex flex-col items-center mx-auto">
              <div className="h-20 w-20 bg-[hsl(var(--danger-bg))] rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-danger" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-heading">Upload Failed</h3>
              <p className="text-danger mb-8 text-base font-body">There was an error uploading your file. Please check your connection and try again.</p>
              <button 
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className={buttonVariants({ variant: "outline", className: "h-12 px-8 rounded-[12px] hover:bg-muted" })}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      </motion.div>
    </div>
  );
}

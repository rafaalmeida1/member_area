import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import './PDFUpload.css';

interface PDFUploadProps {
  onUploadSuccess?: (file: UploadedPDF) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // em MB
  className?: string;
}

interface UploadedPDF {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export function PDFUpload({ 
  onUploadSuccess, 
  onUploadError, 
  maxFileSize = 50,
  className = '' 
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleError, handleSuccess } = useErrorHandler();

  const validateFile = (file: File): boolean => {
    // Verificar se é PDF
    if (file.type !== 'application/pdf') {
      handleError(new Error("Por favor, selecione apenas arquivos PDF."));
      return false;
    }

    // Verificar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      handleError(new Error(`O arquivo deve ter no máximo ${maxFileSize}MB. Arquivo atual: ${fileSizeMB.toFixed(2)}MB`));
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);
    setSelectedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'DOCUMENT');

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no upload');
      }

      const result = await response.json();
      
      const uploadedPDF: UploadedPDF = {
        id: result.data.id,
        filename: result.data.originalFilename,
        url: result.data.publicUrl,
        size: result.data.fileSize,
        uploadedAt: result.data.createdAt,
      };

      handleSuccess(`${file.name} foi enviado com sucesso.`);

      if (onUploadSuccess) {
        onUploadSuccess(uploadedPDF);
      }

      // Reset do componente
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 2000);

    } catch (error) {
      handleError(error);

      if (onUploadError) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
        onUploadError(errorMessage);
      }

      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className={`pdf-upload-container ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf"
        className="pdf-upload-input"
        disabled={isUploading}
      />

      <div
        className={`pdf-upload-dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {!isUploading ? (
          <div className="pdf-upload-content">
            <div className="pdf-upload-icon">
              <Upload size={32} />
            </div>
            <div className="pdf-upload-text">
              <h3>Enviar PDF</h3>
              <p>Clique aqui ou arraste um arquivo PDF</p>
              <span className="pdf-upload-limit">
                Máximo: {maxFileSize}MB
              </span>
            </div>
          </div>
        ) : (
          <div className="pdf-upload-progress">
            {selectedFile && (
              <div className="pdf-upload-file-info">
                <File size={24} />
                <div className="file-details">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="cancel-button"
                  disabled={uploadProgress === 100}
                >
                  {uploadProgress === 100 ? <CheckCircle size={20} /> : <X size={20} />}
                </button>
              </div>
            )}
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">
                {uploadProgress === 100 ? 'Upload concluído!' : `${uploadProgress}%`}
              </span>
            </div>

            {uploadProgress < 100 && (
              <div className="upload-status">
                <div className="loading-spinner" />
                <span>Enviando arquivo...</span>
              </div>
            )}

            {uploadProgress === 100 && (
              <div className="upload-success">
                <CheckCircle size={20} />
                <span>Upload realizado com sucesso!</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pdf-upload-info">
        <div className="info-item">
          <AlertCircle size={16} />
          <span>Apenas arquivos PDF são aceitos</span>
        </div>
        <div className="info-item">
          <File size={16} />
          <span>Tamanho máximo: {maxFileSize}MB</span>
        </div>
      </div>
    </div>
  );
}

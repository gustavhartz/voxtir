import { useState } from 'react';

type FileUploadResult = {
  error: string | null;
  file: File | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
};

const useFileUpload = (allowedFileTypes: string[], maxSizeInMB: number) => {
  const [fileUploadResult, setFileUploadResult] = useState<FileUploadResult>({
    error: null,
    file: null,
    fileUrl: null,
    fileName: null,
    fileType: null,
    fileSize: null,
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      const fileType = file.type;
      const fileName = file.name;

      if (fileSizeInMB > maxSizeInMB) {
        setFileUploadResult({
          error: `File size exceeds the limit of ${maxSizeInMB}MB.`,
          file: file,
          fileUrl: null,
          fileName: fileName,
          fileType: fileType,
          fileSize: fileSizeInMB,
        });
        return;
      }

      if (!allowedFileTypes.includes(fileType)) {
        setFileUploadResult({
          error: 'File type is not allowed.',
          file: file,
          fileUrl: null,
          fileName: fileName,
          fileType: fileType,
          fileSize: fileSizeInMB,
        });
        return;
      }

      setFileUploadResult({
        error: null,
        file: file,
        fileUrl: URL.createObjectURL(file),
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSizeInMB,
      });
    } else {
      setFileUploadResult({
        error: null,
        file: file,
        fileUrl: null,
        fileName: null,
        fileType: null,
        fileSize: null,
      });
    }
  };

  return {
    file: fileUploadResult.file,
    error: fileUploadResult.error,
    fileUrl: fileUploadResult.fileUrl,
    fileName: fileUploadResult.fileName,
    fileType: fileUploadResult.fileType,
    fileSize: fileUploadResult.fileSize,
    handleFileChange,
  };
};

export default useFileUpload;

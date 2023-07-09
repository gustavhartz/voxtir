import { useState } from 'react';

type FileUploadResult = {
  file: File | null;
  error: string | null;
};

const useFileUpload = (allowedFileTypes: string[], maxSizeInMB: number) => {
  const [fileUploadResult, setFileUploadResult] = useState<FileUploadResult>({
    file: null,
    error: null,
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeInMB) {
        setFileUploadResult({
          file: null,
          error: `File size exceeds the limit of ${maxSizeInMB}MB.`,
        });
        return;
      }

      const fileType = file.type;
      if (!allowedFileTypes.includes(fileType)) {
        setFileUploadResult({
          file: null,
          error: 'File type is not allowed.',
        });
        return;
      }

      setFileUploadResult({
        file,
        error: null,
      });
    } else {
      setFileUploadResult({
        file: null,
        error: null,
      });
    }
  };

  return {
    file: fileUploadResult.file,
    error: fileUploadResult.error,
    handleFileChange,
  };
};

export default useFileUpload;

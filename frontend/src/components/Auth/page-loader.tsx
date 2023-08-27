import React from 'react';
import { FaRegFileAudio } from 'react-icons/fa';

export const PageLoader: React.FC = () => {
  return (
    <div className="max-w-full w-full h-screen flex justify-center items-center">
      <div className="animate-bounce flex items-center flex-col">
        <FaRegFileAudio size={80} />
        <p className="font-bold text-4xl">Voxtir</p>
      </div>
    </div>
  );
};

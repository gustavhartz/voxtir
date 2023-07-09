import React, { useRef, useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import { toggleModal } from '../../state/keyboard';
import { useAppSelector } from '../../hooks';

interface ModalProps {
  children: React.ReactNode | React.ReactNode[];
}

const Modal: React.FC<ModalProps> = ({ children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { isModalOpen } = useAppSelector((state) => state.keyboard);
    const toggleOpen = () => {
        dispatch(toggleModal());
    }

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      toggleOpen();
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen]);

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-white rounded-lg w-full m-4 mx-24 px-4 py-4">
        {children}
        <button
          className="bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-bold py-2 px-4 mt-4 rounded"
          onClick={toggleOpen}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;

import { useEffect } from 'react';

const useKeyPress = (targetKey: string, callback: () => void): void => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (
        event.key === targetKey &&
        (event.metaKey || event.ctrlKey) // Check if the meta key (or ctrl key) is pressed
      ) {
        event.preventDefault(); // Prevent default browser behavior (e.g., opening a new tab)
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetKey, callback]);
};

export default useKeyPress;

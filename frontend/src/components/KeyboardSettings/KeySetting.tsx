import React, { useState } from 'react';

import { useAppDispatch,useAppSelector } from '../../hooks';
import {
  setMute,
  setPlaybackDown,
  setPlaybackUp,
  setPlayPause,
  setSkipBackward,
  setSkipForward,
  setVolumeDown,
  setVolumeUp,
} from '../../state/keyboard';

export type KeyFunction =
  | 'playPause'
  | 'skipForward'
  | 'skipBackward'
  | 'playbackUp'
  | 'playbackDown'
  | 'mute'
  | 'volumeUp'
  | 'volumeDown';

export interface KeySettingProps {
  text: string;
  keyFunction: KeyFunction;
}

const KeySetting: React.FC<KeySettingProps> = (props) => {
  const { text, keyFunction } = props;
  const [showInput, setShowInput] = useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const keyboardState = useAppSelector((state) => state.keyboard);
  const dispatch = useAppDispatch();

  const toggleInput = () => {
    setShowInput(!showInput);
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const pressedKey = e.key;
    switch (keyFunction) {
      case 'playPause':
        e.currentTarget.value = pressedKey;
        dispatch(setPlayPause(e.key));
        break;
      case 'skipForward':
        dispatch(setSkipForward(e.key));
        break;
      case 'skipBackward':
        dispatch(setSkipBackward(e.key));
        break;
      case 'playbackUp':
        dispatch(setPlaybackUp(e.key));
        break;
      case 'playbackDown':
        dispatch(setPlaybackDown(e.key));
        break;
      case 'mute':
        dispatch(setMute(e.key));
        break;
      case 'volumeUp':
        dispatch(setVolumeUp(e.key));
        break;
      case 'volumeDown':
        dispatch(setVolumeDown(e.key));
        break;
      default:
        break;
    }
    toggleInput();
  };

  React.useEffect(() => {
    if (showInput) {
      inputRef.current?.focus();
    }
  }, [showInput]);
  return (
    <div className="flex flex-row justify-between items-center py-0.5">
      <h4 className="text-lg text-gray-600 font-medium">{text}</h4>
      <div className="items-center flex flex-row space-x-2">
        <span className="text-2xl">⌘ +</span>

        {!showInput && (
          <button
            onClick={toggleInput}
            className="px-2 py-1 min-w-max text-md font-semibold text-black bg-gray-200 hover:animate-pulse hover:duration-1000 rounded-lg"
          >
            {keyboardState[keyFunction].toUpperCase()}
          </button>
        )}

        {showInput && (
          <input
            ref={inputRef}
            type="text"
            onKeyUp={handleKeyUp}
            onBlur={toggleInput}
            onAbort={toggleInput}
            value={keyboardState[keyFunction]}
            className="bg-gray-100 max-w-min"
            placeholder="Assign a key..."
          />
        )}
      </div>
    </div>
  );
};

export default KeySetting;

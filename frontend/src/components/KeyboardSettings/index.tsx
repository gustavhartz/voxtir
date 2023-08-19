import React from 'react';

import { useAppSelector } from '../../hooks';
import KeySetting from './KeySetting';
import { KeySettingProps } from './KeySetting';
const controlKeys: KeySettingProps[] = [
  {
    text: 'Play/Pause',
    keyFunction: 'playPause',
  },
];

const volumeKeys: KeySettingProps[] = [
  {
    text: 'Volume Up',
    keyFunction: 'volumeUp',
  },
  {
    text: 'Volume Down',
    keyFunction: 'volumeDown',
  },
  {
    text: 'Mute',
    keyFunction: 'mute',
  },
];

const trackKeys: KeySettingProps[] = [
  {
    text: 'Skip Forward',
    keyFunction: 'skipForward',
  },
  {
    text: 'Skip Backward',
    keyFunction: 'skipBackward',
  },
];

const KeyboardSettings = () => {
  const playPause = useAppSelector((state) => state.keyboard.playPause);
  return (
    <div className="flex flex-col">
      <div className="flex flex-col pb-4">
        <h3 className="text-3xl font-semibold pb-2">Keyboard Shortcuts</h3>
        <span>
          Set specific keyboard keys to make your transcription faster. For
          example you can toggle play and pause of audio while you write with:
          <span className="font-semibold">
            {' '}
            CMD + {playPause.toUpperCase()}
          </span>
        </span>
      </div>

      <div className="shadow-md rounded-md bg-slate-50 p-3">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-2xl font-semibold pb-2 text-black">Control</h4>
        </div>
        {controlKeys.map((key, idx) => {
          return (
            <KeySetting
              key={`control-${idx}`}
              text={key.text}
              keyFunction={key.keyFunction}
            />
          );
        })}
      </div>

      <div className="shadow-md rounded-md bg-slate-50 p-3 mt-4">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-2xl font-semibold pb-2 text-black">
            Audio Volume
          </h4>
        </div>
        {volumeKeys.map((key, idx) => {
          return (
            <KeySetting
              key={`control-${idx}`}
              text={key.text}
              keyFunction={key.keyFunction}
            />
          );
        })}
      </div>

      <div className="shadow-md rounded-md bg-slate-50 p-3 mt-4">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-2xl font-semibold pb-2 text-black">
            Audio Track
          </h4>
        </div>
        {trackKeys.map((key, idx) => {
          return (
            <KeySetting
              key={`control-${idx}`}
              text={key.text}
              keyFunction={key.keyFunction}
            />
          );
        })}
      </div>
    </div>
  );
};

export default KeyboardSettings;

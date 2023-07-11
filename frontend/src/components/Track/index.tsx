import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useAppSelector } from '../../hooks';
import { useDispatch } from 'react-redux';
import { setToSkipped, setCurrentPosition } from '../../state/track';
import { GrBackTen, GrForwardTen } from 'react-icons/gr';
import useKeyPress from '../../hook/useKeyPress';
import { toggleModal } from '../../state/track';

const Track = () => {
  const audioRef = React.useRef<AudioPlayer>(null);
  const dispatch = useDispatch();
  const { hasSkipped, skipToPosition, settings, fileUrl } = useAppSelector(
    (state) => state.track
  );

  const handleUploadAudio = () => {
    dispatch(toggleModal());
  };
  const {
    mute,
    playPause,
    skipBackward,
    skipForward,
    playbackDown,
    playbackUp,
    volumeDown,
    volumeUp,
  } = useAppSelector((state) => state.keyboard);

  React.useEffect(() => {
    if (audioRef?.current?.audio.current && !hasSkipped) {
      const splitHHMMSS = skipToPosition.split(':');
      const seconds =
        parseInt(splitHHMMSS[0]) * 3600 +
        parseInt(splitHHMMSS[1]) * 60 +
        parseInt(splitHHMMSS[2]);

      audioRef.current.audio.current.currentTime = seconds;

      if (settings.pauseOnSkip) {
        audioRef.current.audio.current.pause();
      }

      dispatch(setToSkipped());
    }
  }, [hasSkipped, skipToPosition]);

  useKeyPress(playPause, () => {
    audioRef?.current?.audio?.current?.paused
      ? audioRef.current.audio.current.play()
      : audioRef?.current?.audio?.current?.pause();
    console.log('playPause');
  });

  useKeyPress(mute, () => {
    if (
      audioRef?.current?.audio?.current?.muted !== null &&
      audioRef?.current?.audio?.current?.muted !== undefined &&
      audioRef?.current?.audio?.current?.muted === false
    ) {
      audioRef.current.audio.current.muted = true;
    } else if (
      audioRef?.current?.audio?.current?.muted !== null &&
      audioRef?.current?.audio?.current?.muted !== undefined &&
      audioRef?.current?.audio?.current?.muted === true
    ) {
      audioRef.current.audio.current.muted = false;
    }
  });
  useKeyPress(volumeDown, () => {
    if (
      audioRef?.current?.audio?.current?.volume !== null &&
      audioRef?.current?.audio?.current?.volume !== undefined &&
      audioRef?.current?.audio?.current?.volume > 0.1
    ) {
      audioRef.current.audio.current.volume =
        audioRef.current.audio.current.volume - 0.1;
    }
    console.log('volumeDown');
  });

  useKeyPress(volumeUp, () => {
    if (
      audioRef?.current?.audio?.current?.volume !== undefined &&
      audioRef?.current?.audio?.current?.volume !== null &&
      audioRef?.current?.audio?.current?.volume < 1
    ) {
      audioRef.current.audio.current.volume =
        audioRef.current.audio.current.volume + 0.1;
    }
    console.log('volumeUp');
  });

  useKeyPress(skipBackward, () => {
    if (
      audioRef?.current?.audio?.current?.currentTime !== null &&
      audioRef?.current?.audio?.current?.currentTime !== undefined &&
      audioRef?.current?.audio?.current?.currentTime > 0
    ) {
      audioRef.current.audio.current.currentTime =
        audioRef.current.audio.current.currentTime - settings.goBackTime;
    }
    console.log('skipBackward');
  });

  useKeyPress(skipForward, () => {
    if (
      audioRef?.current?.audio?.current?.currentTime !== null &&
      audioRef?.current?.audio?.current?.currentTime !== undefined &&
      audioRef?.current?.audio?.current?.currentTime <
        audioRef?.current?.audio?.current?.duration
    ) {
      audioRef.current.audio.current.currentTime =
        audioRef.current.audio.current.currentTime + settings.goForwardTime;
    }
    console.log('skipForward');
  });

  useKeyPress(playbackDown, () => {
    if (
      audioRef?.current?.audio?.current?.playbackRate !== null &&
      audioRef?.current?.audio?.current?.playbackRate !== undefined &&
      audioRef?.current?.audio?.current?.playbackRate > 0.1
    ) {
      audioRef.current.audio.current.playbackRate =
        audioRef.current.audio.current.playbackRate - 0.1;
    }
    console.log('playbackDown');
  });

  useKeyPress(playbackUp, () => {
    if (
      audioRef?.current?.audio?.current?.playbackRate !== null &&
      audioRef?.current?.audio?.current?.playbackRate !== undefined &&
      audioRef?.current?.audio?.current?.playbackRate < 3
    ) {
      audioRef.current.audio.current.playbackRate =
        audioRef.current.audio.current.playbackRate + 0.1;
    }
    console.log('playbackUp');
  });

  // Set the state for use in the editor timestamp default button
  const handleTimeUpdate = () => {
    if (audioRef.current?.audio.current) {
      const time = audioRef.current.audio.current.currentTime;
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time - hours * 3600) / 60);
      const seconds = Math.floor(time - hours * 3600 - minutes * 60);
      const formattedTime = `${hours < 10 ? '0' + hours : hours}:${
        minutes < 10 ? '0' + minutes : minutes
      }:${seconds < 10 ? '0' + seconds : seconds}`;

      dispatch(setCurrentPosition(formattedTime));
      console.log(formattedTime);
    }
  };
  audioRef.current?.audio.current?.addEventListener(
    'timeupdate',
    handleTimeUpdate
  );

  if (!fileUrl) {
    return (
      <button
        onClick={handleUploadAudio}
        className="p-3 font-medium text-white shadow-md transition-colors hover:bg-blue-500 bg-blue-400 w-full text-center"
      >
        Upload audio to start
      </button>
    );
  }

  return (
    <AudioPlayer
      ref={audioRef}
      customIcons={{
        rewind: <GrBackTen className="text-gray-100 text-2xl" />,
        forward: <GrForwardTen className="text-gray-100 text-2xl ml-2" />,
      }}
      src={fileUrl}
      onLoadedData={(_) => {
        audioRef.current?.audio.current?.pause();
      }}
      progressJumpSteps={{
        backward: settings.goBackTime * 1000,
        forward: settings.goForwardTime * 1000,
      }}
      layout="horizontal"
      showFilledProgress={true}
      className="bg-white w-full h-20 border-none px-8"
    />
  );
};

export default Track;

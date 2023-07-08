import React from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useAppSelector } from "../../hooks";
import { useDispatch } from "react-redux";
import { setToSkipped } from "../../state/track";
import { GrBackTen, GrForwardTen } from "react-icons/gr";
import useKeyPress from "../../hook/useKeyPress";

const Track = () => {
  const audioRef = React.useRef<AudioPlayer>(null);
  const dispatch = useDispatch();
  const { hasSkipped, skipToPosition, settings } = useAppSelector((state) => state.track);
  const { mute, playPause, skipBackward, skipForward, playbackDown, playbackUp, volumeDown, volumeUp } = useAppSelector((state) => state.keyboard);


  const GoBackIcon = () => {
    return (
      <GrBackTen className="text-gray-100 text-2xl" />
    )
  }

  const GoForwardIcon = () => {
    return (
      <GrForwardTen className="text-gray-100 text-2xl ml-2" />
    )
  }
  
  React.useEffect(() => {
    if (audioRef?.current?.audio.current && !hasSkipped) {
      const splitHHMMSS = skipToPosition.split(':');
      const seconds = parseInt(splitHHMMSS[0]) * 3600 + parseInt(splitHHMMSS[1]) * 60 + parseInt(splitHHMMSS[2]);

      audioRef.current.audio.current.currentTime = seconds

      if (settings.pauseOnSkip) {
        audioRef.current.audio.current.pause()
      }

      dispatch(setToSkipped());
    }
  }, [hasSkipped, skipToPosition])

  useKeyPress(playPause, () => {
    audioRef?.current?.audio?.current?.paused ? audioRef.current.audio.current.play() : audioRef?.current?.audio?.current?.pause();
    console.log('playPause')
  })

  useKeyPress(mute, () => {
    if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.muted !== (null || undefined) && audioRef?.current?.audio?.current?.muted === false) {
      audioRef.current.audio.current.muted = true;
    } else if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.muted !== (null || undefined) && audioRef?.current?.audio?.current?.muted === true) {
      audioRef.current.audio.current.muted = false;
    }
  })
  useKeyPress(volumeDown, () => {
    if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.volume !== (null || undefined) && audioRef?.current?.audio?.current?.volume > 0.1) {
      audioRef.current.audio.current.volume = audioRef.current.audio.current.volume - 0.1;
    }
    console.log('volumeDown')
  })

  useKeyPress(volumeUp, () => {
    if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.volume !== (null || undefined) && audioRef?.current?.audio?.current?.volume < 1) {
      audioRef.current.audio.current.volume = audioRef.current.audio.current.volume + 0.1;
    }
    console.log('volumeUp')
  })

  useKeyPress(skipBackward, () => {
    if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.currentTime !== (null || undefined) && audioRef?.current?.audio?.current?.currentTime > 0) {
      audioRef.current.audio.current.currentTime = audioRef.current.audio.current.currentTime - settings.goBackTime;
    }
    console.log('skipBackward')
  })

  useKeyPress(skipForward, () => {
    if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.currentTime !== (null || undefined) && audioRef?.current?.audio?.current?.currentTime < audioRef?.current?.audio?.current?.duration) {
      audioRef.current.audio.current.currentTime = audioRef.current.audio.current.currentTime + settings.goForwardTime;
    }
    console.log('skipForward')
  })

  useKeyPress(playbackDown, () => {
    if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.playbackRate !== (null || undefined) && audioRef?.current?.audio?.current?.playbackRate > 0.1) {
      audioRef.current.audio.current.playbackRate = audioRef.current.audio.current.playbackRate - 0.1;
    }
    console.log('playbackDown')
  })

  useKeyPress(playbackUp, () => {
    if (audioRef && audioRef.current && audioRef?.current?.audio?.current?.playbackRate !== (null || undefined) && audioRef?.current?.audio?.current?.playbackRate < 3) {
      audioRef.current.audio.current.playbackRate = audioRef.current.audio.current.playbackRate + 0.1;
    }
    console.log('playbackUp')
  })


  return (
    <AudioPlayer
        ref={audioRef}
        customIcons={{
          rewind: <GoBackIcon />,
          forward: <GoForwardIcon />,
        }}
        src="https://upload.wikimedia.org/wikipedia/commons/c/ca/TWIP_-_2010-05-30_Interview_with_Gaza_Freedom_Flotilla_organizer_Greta_Berlin_.vorb.oga"
        autoPlay
        progressJumpSteps={{ backward: settings.goBackTime * 1000, forward: settings.goForwardTime * 1000 }}
        layout="horizontal"
        showFilledProgress={true}
        className="bg-white w-full h-20 border-none px-8"
  />
  )
};

export default Track;
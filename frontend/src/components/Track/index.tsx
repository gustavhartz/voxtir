import React from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useAppSelector } from "../../hooks";
import { useDispatch } from "react-redux";
import { setToSkipped } from "../../state/track";
const Track = () => {
  const audioRef = React.useRef<AudioPlayer>(null);
  const dispatch = useDispatch();
  const { hasSkipped, skipToPosition } = useAppSelector((state) => state.track);

  React.useEffect(() => {
    if (audioRef?.current?.audio.current && !hasSkipped) {
      const splitHHMMSS = skipToPosition.split(':');
      const seconds = parseInt(splitHHMMSS[0]) * 3600 + parseInt(splitHHMMSS[1]) * 60 + parseInt(splitHHMMSS[2]);

      audioRef.current.audio.current.currentTime = seconds
      dispatch(setToSkipped());
    }
  }, [hasSkipped, skipToPosition])
  return (
    <AudioPlayer
        ref={audioRef}
        src="https://upload.wikimedia.org/wikipedia/commons/c/ca/TWIP_-_2010-05-30_Interview_with_Gaza_Freedom_Flotilla_organizer_Greta_Berlin_.vorb.oga"
        autoPlay
        progressJumpSteps={{ backward: 10000, forward: 10000 }}
        layout="horizontal"
        showFilledProgress={true}
        className="bg-white w-full h-20 border-none px-8"
  />
  )
};

export default Track;

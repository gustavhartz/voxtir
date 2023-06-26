import React from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const Track = () => {
  return (
    <AudioPlayer
        src="https://upload.wikimedia.org/wikipedia/commons/c/ca/TWIP_-_2010-05-30_Interview_with_Gaza_Freedom_Flotilla_organizer_Greta_Berlin_.vorb.oga"
        autoPlay
        progressJumpSteps={{ backward: 10000, forward: 10000 }}
        layout="horizontal"
        showFilledProgress={true}
        className="w-full h-20 !bg-transparent border-none px-8"
  />
  )
};

export default Track;

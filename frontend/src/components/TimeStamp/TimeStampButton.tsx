import { NodeViewWrapper, NodeConfig } from "@tiptap/react";
import React, { useState } from "react";
import useDoubleClick from 'use-double-click';

export default (props: NodeConfig) => {
  const [show, setShow] = useState(true);
  const [timeStamp, setTimeStamp] = useState<string>("00:00:00");
  const buttonRef = React.useRef(null);

  const timeRegex = new RegExp("^[0-9]{2}:[0-9]{2}:[0-9]{2}$");

  const triggerButton = () => {
    if (!show) {
        console.log("running single click")
      props.updateAttributes({
        count: props.node.attrs.count + 1,
      });
    }
  };

  const toggleShowInput = () => {
    setShow(true);
    console.log("running double click")
  };

  const toggleCloseInput = () => {
    setShow(false);
};

  const changeTimeStamp = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("test");
    const { value } = event.currentTarget;
    setTimeStamp(value);
  };

  useDoubleClick({
    onSingleClick: () => {
      triggerButton();
    },
    onDoubleClick: () => {
      toggleShowInput();
    },
    ref: buttonRef,
    latency: 250
  });

  /*
  onBlur={toggleCloseInput}
onKeyDown={(e) => {
    if (e.key === 'Escape') {
        toggleCloseInput();
    }
}}
  */
  return (
    <NodeViewWrapper className="timestamp-button" as={'span'}>
    <button
        ref={buttonRef}
        className={`
        text-white text-md px-1 
        ${timeRegex.test(timeStamp) ? 'bg-[#07BF5C]' : 'bg-red-500'}
        `}
    
    >
        {!show && (timeRegex.test(timeStamp) ? timeStamp : 'Invalid Timestamp')}
        {show && <input 
            autoFocus={show}
            onBlur={toggleCloseInput}
            onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                    toggleCloseInput();
                }
            }}
            className="max-w-min text-center 
            rounded-lg shadow-lg focus:outline-none bg-transparent text-white text-md px-1" 
            value={timeStamp} 
            onChange={changeTimeStamp} 

          />}
    </button>
    </NodeViewWrapper>
  );
};

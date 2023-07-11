import { NodeViewWrapper, NodeConfig } from '@tiptap/react';
import React, { useState } from 'react';
import useDoubleClick from 'use-double-click';
import { useDispatch } from 'react-redux';
import { skipToPosition } from '../../../../state/track';
export default (props: NodeConfig) => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(props.node.attrs.show);
  const [timeStamp, setTimeStamp] = useState<string>(
    props.node.attrs.timestamp
  );
  const buttonRef = React.useRef(null);

  const timeRegex = new RegExp('^[0-9]{2}:[0-9]{2}:[0-5]{1}[0-9]{1}$');

  const triggerButton = () => {
    if (!show) {
      dispatch(skipToPosition(timeStamp));
    }

    console.log('triggered');
  };

  const toggleShowInput = () => {
    setShow(true);
  };

  const toggleCloseInput = () => {
    setShow(false);
  };

  const changeTimeStamp = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setTimeStamp(value);
    props.updateAttributes({
      timestamp: value,
    });
  };

  useDoubleClick({
    onSingleClick: () => {
      if (!show) {
        triggerButton();
      }
    },
    onDoubleClick: () => {
      toggleShowInput();
    },
    ref: buttonRef,
    latency: 250,
  });

  return (
    <NodeViewWrapper className="timestamp-button text-inherit" as={'span'}>
      <button
        ref={buttonRef}
        className={`
        text-white text-md px-1 mx-1 rounded-lg hover:shadow-lg focus:outline-none
        ${timeRegex.test(timeStamp) ? 'bg-[#07BF5C]' : 'bg-red-500'}
        `}
      >
        {!show && (timeRegex.test(timeStamp) ? timeStamp : 'Invalid Timestamp')}
        {show && (
          <input
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
          />
        )}
      </button>
    </NodeViewWrapper>
  );
};

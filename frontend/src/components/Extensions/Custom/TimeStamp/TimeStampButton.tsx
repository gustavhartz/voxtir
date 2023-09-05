import { NodeConfig, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import useDoubleClick from 'use-double-click';

import { skipToPosition } from '../../../../state/track';

const TimestampButton = (props: NodeConfig): JSX.Element => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(props.node.attrs.show);
  const [timeStamp, setTimeStamp] = useState<string>(
    props.node.attrs.timestamp
  );
  const buttonRef = React.useRef(null);
  const timeRegex = new RegExp('^[0-9]{2}:[0-9]{2}:[0-5]{1}[0-9]{1}$');

  const triggerButton = (): void => {
    if (!show) {
      dispatch(skipToPosition(timeStamp));
    }

    console.log('triggered');
  };

  const toggleShowInput = (): void => {
    setShow(true);
  };

  const toggleCloseInput = (): void => {
    setShow(false);
  };

  const changeTimeStamp = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
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
        ${
          show
            ? 'text-white text-md px-1 mx-1 rounded-lg hover:shadow-lg focus:outline-none'
            : 'inline-block w-3 h-3 mx-0.5 rounded-full cursor-pointer'
        }
        ${timeRegex.test(timeStamp) ? 'bg-[#659b80]' : 'bg-red-500'}
        `}
      >
        {show && (
          <input
            autoFocus={show}
            onBlur={toggleCloseInput}
            onKeyDown={(e): void => {
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

export default TimestampButton;

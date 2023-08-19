import { ReactRendererOptions } from '@tiptap/react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export const MentionList = forwardRef<MentionListRef, Props>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white rounded-md shadow-sm text-black text-opacity-80 text-sm overflow-hidden p-1 relative">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`bg-transparent border rounded-md block m-0 p-1.5 text-left w-full ${
              index === selectedIndex ? 'bg-blue-300' : ''
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <button
          className="bg-transparent border rounded-md block m-0 p-1 text-left w-full on"
          onClick={() => props.command({ id: props.query })}
        >
          Add "{props.query}" as a new speaker
        </button>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';

type Props = {
  editor: ReactRendererOptions['editor'];
  range: Range;
  query: string;
  text: string;
  items: string[];
  command: (props: { id: string }) => void;
  decorationNode: Element | null;
  clientRect?: (() => DOMRect | null) | null;
};

export type MentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

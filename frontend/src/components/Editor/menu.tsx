import { Editor } from '@tiptap/react';
import React from 'react';
import {
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineUnderline,
} from 'react-icons/ai';
import { LuHeading1, LuHeading2 } from 'react-icons/lu';

interface MenuBarProps {
  editor: Editor;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  const items = [
    {
      icon: AiOutlineBold,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: AiOutlineItalic,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: AiOutlineUnderline,
      title: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    {
      icon: LuHeading1,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: LuHeading2,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
  ];

  return (
    <div className="menu-bar fixed bottom-20 left-70 bg-gray-100 rounded-md shadow-md">
      {items.map((item, index) => (
        <button
          key={item.title}
          onClick={() => item.action()}
          className={`p-2 mx-1 ${
            item.isActive() ? 'font-semibold' : 'font-normal'
          }`}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
};

export default MenuBar;

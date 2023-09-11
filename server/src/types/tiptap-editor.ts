interface TextContent {
  type: 'text';
  text: string;
}

interface MentionContent {
  type: 'mention';
  attrs: {
    id: string;
    label?: null | string;
  };
}

interface TimeStampButtonContent {
  type: 'timeStampButton';
  attrs: {
    timestamp: string;
  };
}

type ParagraphContent = (
  | TextContent
  | MentionContent
  | TimeStampButtonContent
)[];

interface Paragraph {
  type: 'paragraph';
  content?: ParagraphContent;
}

export interface Doc {
  type: 'doc';
  content: Paragraph[];
}

export interface TipTapTransformerDocument {
  default: Doc;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface MentionContent {
  type: 'mention';
  attrs: {
    id: string;
    label?: null | string;
  };
}

export interface TimeStampButtonContent {
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

export interface Paragraph {
  type: 'paragraph';
  content?: ParagraphContent;
}

export interface Heading {
  type: 'heading';
  attrs: {
    level: 1 | 2 | 3 | 4 | 5;
  };
  content?: ParagraphContent;
}
export interface Doc {
  type: 'doc';
  content: DocContent;
}
type DocContent = (Paragraph | Heading)[];

export interface TipTapTransformerDocument {
  default: Doc;
}

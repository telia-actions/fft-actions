type SlackTextType = 'mrkdwn' | 'plain_text';

type SlackTextBlock = {
  type: SlackTextType;
  text: string;
};

export type SlackPayloadBlockText = {
  type: string;
  text: SlackTextBlock;
};

export type SlackPayloadBlockFields = {
  type: string;
  fields: SlackTextBlock[];
};

export type SlackPayloadAttachmentText = {
  color: string;
  fallback: string;
  text: string;
};

export type SlackPayloadAttachmentBlocks = {
  color: string;
  fallback: string;
  blocks: SlackPayloadBlockText[];
};

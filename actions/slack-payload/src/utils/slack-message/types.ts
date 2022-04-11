type SlackTextTypes = 'mrkdwn' | 'plain_text';

type SlackTextBlock = {
  type: SlackTextTypes;
  text: string;
};

export type SlackPayloadBlock = {
  type: string;
  text?: SlackTextBlock;
  fields?: SlackTextBlock[];
};

export type SlackPayloadAttachment = {
  color: string;
  fallback: string;
  text?: string;
  blocks?: SlackPayloadBlock[];
};

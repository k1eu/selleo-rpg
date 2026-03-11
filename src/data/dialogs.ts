export interface DialogLine {
  speaker: string;
  text: string;
}

export const SPEAKER_PORTRAITS: Record<string, string> = {
  'Bart': 'chibi-bart',
  'Kieu': 'chibi-kieu',
};

export const KIEU_DIALOG: DialogLine[] = [
  { speaker: 'Kieu', text: 'Hey Bart! Welcome to Selleo RPG!' },
  { speaker: 'Bart', text: 'Hey Kieu! Good to see you here.' },
  { speaker: 'Kieu', text: "This world is still pretty empty, but we're working on it." },
  { speaker: 'Bart', text: 'Yeah, I noticed. Just grass everywhere.' },
  { speaker: 'Kieu', text: "Give it time. Great things start small. Try jumping with Space!" },
  { speaker: 'Bart', text: "Will do. Catch you later!" },
];

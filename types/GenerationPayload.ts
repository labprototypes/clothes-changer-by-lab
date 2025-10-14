export type UploadItem = {
  id: string; // uuid
  file: File | null; // on frontend
  comment?: string;
  displayOrder: number; // order in its section
};

export type Section =
  | { kind: 'top'; items: UploadItem[]; sectionComment?: string }
  | { kind: 'bottom'; items: UploadItem[]; sectionComment?: string }
  | { kind: 'shoes'; items: UploadItem[]; sectionComment?: string }
  | { kind: 'accessories'; items: UploadItem[]; sectionComment?: string };

export type RefsBlock = {
  light?: { items: UploadItem[]; comment?: string };
  color?: { items: UploadItem[]; comment?: string };
  style?: { items: UploadItem[]; comment?: string };
};

export type UserImages = { items: UploadItem[]; comment?: string };

export type Mode = 'text' | 'refs+text' | 'replace-on-user';

export type GenerationPayload = {
  mode: Mode;
  presetStyle?: 'street' | 'classic' | 'minimal' | 'sport' | 'none';
  textBrief?: string;
  sections: Section[];
  refs?: RefsBlock;
  userImages?: UserImages; // required when mode='replace-on-user'
  options?: {
    keepBackground?: boolean;
    redrawBackground?: boolean;
    highDetail?: boolean;
    seed?: number | null;
  };
};

// Server-side helpers: the API will receive files separately (multer buffers),
// so the server representation will replace File with Buffer.
export type ServerUploadItem = Omit<UploadItem, 'file'> & { file?: Buffer | null };

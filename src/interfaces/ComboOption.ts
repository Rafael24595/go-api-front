export interface ComboTag {
  label: string;
  name?: string;
  title?: string;
  icon?: string;
  disable?: boolean;
}

export interface ComboForm extends ComboTag {
  name: string;
}

export interface ComboOption extends ComboTag {
  action: () => void;
}

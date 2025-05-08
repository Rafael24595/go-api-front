export interface ComboOption {
    label: string;
    name?: string;
    title?: string;
    icon?: string;
    action: () => void;
  }
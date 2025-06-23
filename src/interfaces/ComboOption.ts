export interface ComboOption {
    label: string;
    name?: string;
    title?: string;
    icon?: string;
    disable?: boolean;
    action: () => void;
  }
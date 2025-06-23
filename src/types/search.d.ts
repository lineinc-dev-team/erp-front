export interface SearchField {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "checkbox" | "number";
  option?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

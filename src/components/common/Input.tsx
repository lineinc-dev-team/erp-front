import { SearchField } from "@/types/search";
import {
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export default function CommonInput({
  field,
  value,
  onChange,
}: {
  field: SearchField;
  value: string | number;
  onChange: (v: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  switch (field.type) {
    case "text":
      return (
        <TextField
          label={field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "date":
      return (
        <DatePicker label={field.label} value={value} onChange={onChange} />
      );
    case "select":
      return (
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          label={field.label}
        >
          {field.options?.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      );
    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label={field.label}
        />
      );
    default:
      return null;
  }
}

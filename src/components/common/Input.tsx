import { TextField } from "@mui/material";
import React from "react";

type CommonInputProps = {
  label?: string;
  value: string;
  error: boolean;
  helperText?: string;
  onChange: (vale: string) => void;
  type?: string;
  fullWidth?: boolean;
  required?: boolean;
  placeholder: string;
  className: string;
};

export default function CommonInput({
  value,
  error,
  helperText = "",
  onChange,
  type = "text",
  placeholder,
  fullWidth = true,
  required = false,
  className,
}: CommonInputProps) {
  return (
    <TextField
      variant="outlined"
      value={value}
      error={error}
      placeholder={placeholder}
      helperText={helperText}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      className={className}
      fullWidth={fullWidth}
      required={required}
      size="small"
      sx={{
        my: 1,
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "black",
          },
          "&:hover fieldset": {
            borderColor: "black",
          },
          "&.Mui-focused fieldset": {
            borderColor: "black",
          },
        },
      }}
    />
  );
}

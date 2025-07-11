export interface SnackbarState {
  open: boolean
  message: string
  severity: AlertColor
  showSnackbar: (message: string, severity?: AlertColor) => void
  closeSnackbar: () => void
}

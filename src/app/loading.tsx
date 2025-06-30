'use client'
import CircularProgress from '@mui/material/CircularProgress'

export default function Loading() {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}
    >
      <CircularProgress size={60} color="primary" />
    </div>
  )
}

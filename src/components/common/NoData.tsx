import { GridOverlay } from '@mui/x-data-grid'
import React from 'react'

export const CustomNoRowsOverlay = () => (
  <GridOverlay>
    <div style={{ padding: 20, textAlign: 'center' }}>조회 결과가 없습니다.</div>
  </GridOverlay>
)

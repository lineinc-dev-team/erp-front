'use client'

import React from 'react'

interface CommonModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
  width?: string
}

export default function SiteDateListModal({
  open,
  onClose,
  title,
  children,
  width = '1300px',
}: CommonModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl relative" style={{ width }}>
        {/* title bar */}
        <div className="bg-blue-500 text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
          <h2 className="font-semibold">{title}</h2>

          <button onClick={onClose} className="text-white hover:text-gray-300 text-xl">
            ✕
          </button>
        </div>

        {/* body */}
        <div className="p-6 ">{children}</div>
      </div>
    </div>
  )
}

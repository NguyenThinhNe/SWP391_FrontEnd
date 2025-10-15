import React from 'react'

export default function MainLayout({ children }) {
  return (
    // Use full viewport width/height to ensure the app fits the screen
    // allow vertical scrolling inside the viewport if content overflows
    <div className="w-screen h-screen bg-gray-50 overflow-auto">
      {children}
    </div>
  )
}

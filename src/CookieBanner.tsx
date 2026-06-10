import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-700">Deze site gebruikt functionele cookies.</p>
        <button
          onClick={() => {
            localStorage.setItem('cookie-consent', '1')
            setShow(false)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Accepteren
        </button>
      </div>
    </div>
  )
}

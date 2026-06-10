import { useState, useEffect } from 'react'

const DISMISS_KEY = 'ios-install-banner-weggeklikt'

function isIosSafari(): boolean {
  const ua = navigator.userAgent
  // iPadOS Safari meldt zich als Macintosh; maxTouchPoints onderscheidt touch-apparaten
  const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIos && isSafari
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  )
}

export default function IosInstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    if (isIosSafari() && !isStandalone()) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          Installeer Verhuurcheck op uw beginscherm: tik op{' '}
          <svg
            className="inline w-4 h-4 align-text-bottom text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="deelknop"
            role="img"
          >
            <path d="M12 3v12M8 7l4-4 4 4M5 11v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>{' '}
          en kies <span className="font-medium">'Zet op beginscherm'</span>.
        </p>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1')
            setShow(false)
          }}
          aria-label="Banner sluiten"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

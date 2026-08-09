import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'dm-install-dismissed'
const isIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

// Themed toast prompting the user to install the PWA. Shows on the home screen
// when the browser offers install (Chrome/Android) or gives an iOS hint.
export function InstallPrompt({ visible }: { visible: boolean }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [canShow, setCanShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone
    if (standalone) return

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setCanShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    if (isIOS()) setCanShow(true) // iOS has no event → manual hint
    return () => window.removeEventListener('beforeinstallprompt', onBIP)
  }, [])

  if (!visible || !canShow) return null

  const dismiss = () => {
    setCanShow(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }
  const install = async () => {
    if (deferred) {
      deferred.prompt()
      await deferred.userChoice
    }
    dismiss()
  }

  return (
    <div className="install-toast">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="install-icon" alt="" />
      <div className="install-body">
        <strong className="install-title">Install Dice Masters</strong>
        <span className="dim small">
          {deferred ? 'Play fullscreen & offline.' : 'Tap Share, then “Add to Home Screen”.'}
        </span>
      </div>
      {deferred && (
        <button className="btn gold install-btn" onClick={install}>
          Install
        </button>
      )}
      <button className="install-close" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}

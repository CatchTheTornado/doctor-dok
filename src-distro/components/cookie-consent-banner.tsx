'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsentBannerComponent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consentChoice = localStorage.getItem('cookieConsent')
    if (!consentChoice) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowBanner(false)
    // we're not storing the consent in DB because its probably shown before user is logged in so we're not sure which database to store the term in
    // Enable cookies or tracking scripts here
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShowBanner(false)
    // Disable non-essential cookies or tracking here
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:flex md:items-center md:justify-between shadow-lg" role="alert" aria-live="polite">
      <div className="mb-4 md:mb-0 md:mr-4 flex-grow">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read more about our <a href="/content/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Button onClick={handleAccept} variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Accept
        </Button>
      </div>
      <button 
        onClick={handleDecline} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Close cookie consent banner"
      >
      </button>
    </div>
  )
}
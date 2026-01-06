"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

type Status = "loading" | "success" | "error"

interface StatePayload {
  provider: string
  nonce: string
}

function decodeState(state: string): StatePayload | null {
  try {
    const decoded = atob(state)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<Status>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [deepLink, setDeepLink] = useState("")

  useEffect(() => {
    const url = new URL(window.location.href)

    // Check for iRacing OAuth callback (query params: ?code=...&state=...)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")

    if (code && state) {
      // Validate state is for iRacing
      const stateData = decodeState(state)
      if (stateData?.provider === "iracing") {
        // Redirect to app with code and state for token exchange
        const link = `hotlapai://auth/iracing-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        setDeepLink(link)
        setStatus("success")

        setTimeout(() => {
          window.location.href = link
        }, 500)
        return
      }
    }

    // Check for error in query params (iRacing error)
    const queryError = url.searchParams.get("error")
    const queryErrorDescription = url.searchParams.get("error_description")

    if (queryError) {
      setStatus("error")
      setErrorMessage(queryErrorDescription || queryError)
      return
    }

    // Existing Supabase OAuth flow (hash-based: #access_token=...&refresh_token=...)
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")
    const error = params.get("error")
    const errorDescription = params.get("error_description")

    if (error) {
      setStatus("error")
      setErrorMessage(errorDescription || error)
      return
    }

    if (!accessToken || !refreshToken) {
      setStatus("error")
      setErrorMessage("Missing authentication tokens. Please try signing in again.")
      return
    }

    const link = "hotlapai://auth/callback#" + hash
    setDeepLink(link)
    setStatus("success")

    // Auto-redirect after short delay
    setTimeout(() => {
      window.location.href = link
    }, 500)
  }, [])

  const handleOpenApp = () => {
    if (deepLink) {
      window.location.href = deepLink
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white selection:bg-amber-500/30 selection:text-amber-500">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 text-center p-8 max-w-md">
        {/* Logo */}
        <Image
          src="/hotlapai-logo.svg"
          alt="Hotlap.ai"
          width={130}
          height={82}
          className="mx-auto mb-8"
          priority
        />

        {/* Card container */}
        <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-8 shadow-2xl shadow-amber-900/5">
          {status === "loading" && (
            <div className="py-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-white mb-2">Processing</h2>
              <p className="text-zinc-400">Completing sign in...</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sign in complete</h2>
              <p className="text-zinc-400 mb-8">You can now return to the app.</p>
              <Button
                onClick={handleOpenApp}
                size="lg"
                className="w-full h-12 bg-primary hover:bg-amber-400 text-black font-bold tracking-tight transition-all duration-300 rounded-md shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)]"
              >
                Open Hotlap.ai
              </Button>
              <p className="mt-6 text-sm text-zinc-600">
                You can close this window after opening the app.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sign in failed</h2>
              <p className="text-zinc-400">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

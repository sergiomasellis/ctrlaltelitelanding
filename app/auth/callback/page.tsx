"use client"

import { useEffect, useState } from "react"

type Status = "loading" | "success" | "error"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<Status>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [deepLink, setDeepLink] = useState("")

  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center text-white">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          HotLap.ai
        </h1>

        {status === "loading" && (
          <div className="mb-6">
            <div className="w-10 h-10 border-3 border-slate-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Processing sign in...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-green-500 mb-2">Sign in complete</h2>
              <p className="text-slate-400">You can now return to the app.</p>
            </div>
            <button
              onClick={handleOpenApp}
              className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/40 transition-all cursor-pointer"
            >
              Open HotLap.ai
            </button>
            <p className="mt-6 text-sm text-slate-500">
              You can close this window after opening the app.
            </p>
          </>
        )}

        {status === "error" && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Sign in failed</h2>
            <p className="text-slate-400">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}

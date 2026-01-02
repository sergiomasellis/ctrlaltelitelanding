import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  const baseCallbackUrl = "https://hotlap.ai/auth/callback"

  if (error) {
    const params = new URLSearchParams({ error, error_description: errorDescription || "" })
    return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
  }

  if (!code) {
    const params = new URLSearchParams({ error: "missing_code", error_description: "No authorization code received" })
    return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
  }

  // Parse state to get provider info
  let provider = "google"
  try {
    if (state) {
      const stateData = JSON.parse(atob(state))
      provider = stateData.provider || "google"
    }
  } catch {
    // Default to google if state parsing fails
  }

  try {
    let idToken: string | null = null

    if (provider === "google") {
      // Exchange code for tokens with Google
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotlap.ai"}/api/auth/callback`,
          grant_type: "authorization_code",
        }),
      })

      const tokens = await tokenResponse.json()

      if (tokens.error) {
        const params = new URLSearchParams({
          error: tokens.error,
          error_description: tokens.error_description || "Failed to exchange code"
        })
        return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
      }

      idToken = tokens.id_token
    } else if (provider === "discord") {
      // Discord doesn't support OIDC (no id_token), so we can't use signInWithIdToken
      // Discord auth continues to use the Supabase OAuth flow
      const params = new URLSearchParams({
        error: "discord_not_supported",
        error_description: "Discord uses Supabase OAuth flow. This endpoint is for Google only."
      })
      return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
    }

    if (!idToken) {
      const params = new URLSearchParams({ error: "no_token", error_description: "No ID token received" })
      return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
    }

    // Use the ID token to sign in with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: provider as "google",
      token: idToken,
    })

    if (supabaseError || !data.session) {
      const params = new URLSearchParams({
        error: "supabase_error",
        error_description: supabaseError?.message || "Failed to create session"
      })
      return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
    }

    // Redirect to callback page with Supabase tokens
    const hash = new URLSearchParams({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: "bearer",
      expires_in: String(data.session.expires_in || 3600),
    }).toString()

    return NextResponse.redirect(`${baseCallbackUrl}#${hash}`)
  } catch (err) {
    console.error("OAuth callback error:", err)
    const params = new URLSearchParams({
      error: "server_error",
      error_description: err instanceof Error ? err.message : "An unexpected error occurred"
    })
    return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
  }
}

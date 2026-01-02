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
      // Exchange code for tokens with Discord
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.DISCORD_CLIENT_ID!,
          client_secret: process.env.DISCORD_CLIENT_SECRET!,
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

      // Discord doesn't return an id_token, we need to use access_token to get user info
      // and then sign in with Supabase using a different method
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })

      const discordUser = await userResponse.json()

      // For Discord, we'll use Supabase's signInWithOAuth on the server side
      // by creating a session directly
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )

      // Sign in or create user with Discord identity
      // We use the admin API to upsert the user
      const email = discordUser.email
      if (!email) {
        const params = new URLSearchParams({
          error: "no_email",
          error_description: "Discord account must have a verified email"
        })
        return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
      }

      // Check if user exists
      const { data: existingUsers } = await supabase
        .from("users")
        .select("auth_user_id")
        .eq("email", email)
        .limit(1)

      let authUserId: string

      if (existingUsers && existingUsers.length > 0) {
        authUserId = existingUsers[0].auth_user_id
      } else {
        // Create new auth user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: discordUser.global_name || discordUser.username,
            avatar_url: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
            provider: "discord",
            provider_id: discordUser.id,
          },
        })

        if (createError || !newUser.user) {
          const params = new URLSearchParams({
            error: "create_failed",
            error_description: createError?.message || "Failed to create user"
          })
          return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
        }

        authUserId = newUser.user.id
      }

      // Generate session tokens for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      })

      if (sessionError || !sessionData) {
        // Fallback: create a session directly
        const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
          type: "signup",
          email,
        })

        if (signInError) {
          const params = new URLSearchParams({
            error: "session_failed",
            error_description: "Failed to create session"
          })
          return NextResponse.redirect(`${baseCallbackUrl}#${params}`)
        }
      }

      // Since we can't easily get access/refresh tokens from admin API,
      // we'll redirect with a special token that the app can exchange
      // For now, let's use the magic link approach differently

      // Actually, let's use a simpler approach - exchange via Supabase OAuth
      // This requires setting up Discord in Supabase dashboard, which is already done
      // So for Discord, we'll keep using the Supabase flow for now
      const params = new URLSearchParams({
        error: "discord_not_supported",
        error_description: "Discord OAuth via landing site not yet implemented. Please use Supabase flow."
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

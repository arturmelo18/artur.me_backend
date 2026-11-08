type CurrentTrack = {
  isPlaying: boolean
  name: string
  artists: string[]
  album: string
  coverUrl: string | null
  progressMs: number
  durationMs: number
  url: string
}

export class SpotifyConnector {
  private baseUrl = "https://api.spotify.com/v1"
  private tokenUrl = "https://accounts.spotify.com/api/token"

  private accessToken: string | null = null
  private expiresAt = 0

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken
    }

    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
      throw new Error("Credenciais do Spotify ausentes no .env")
    }

    const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")

    const res = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
    })

    if (!res.ok) {
      throw new Error(`Falha ao renovar token do Spotify: ${res.status} ${await res.text()}`)
    }

    const data = await res.json()
    this.accessToken = data.access_token
    this.expiresAt = Date.now() + (data.expires_in - 60) * 1000

    return this.accessToken!
  }

  async getCurrentlyPlayingTrack(): Promise<CurrentTrack | null> {
    const token = await this.getAccessToken()

    const res = await fetch(`${this.baseUrl}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 204) return null

    if (!res.ok) {
      throw new Error(`Spotify API: ${res.status} ${await res.text()}`)
    }

    const data = await res.json()

    if (!data?.item) return null

    return {
      isPlaying: data.is_playing,
      name: data.item.name,
      artists: data.item.artists?.map((a: { name: string }) => a.name) ?? [],
      album: data.item.album?.name ?? "",
      coverUrl: data.item.album?.images?.[0]?.url ?? null,
      progressMs: data.progress_ms ?? 0,
      durationMs: data.item.duration_ms,
      url: data.item.external_urls?.spotify ?? "",
    }
  }
}
export type MusicServiceType = "spotify" | "youtube_music" | "apple_music" | "deezer" | "other";

export interface ParsedTrackMetadata {
  service: MusicServiceType;
  title?: string;
  artist?: string;
  embedUrl?: string;
  canonicalUrl: string;
  rawUrl: string;
  playlistImportId?: string;
}

/**
 * Normaliza e identifica serviços de streaming musical conhecidos a partir de uma URL.
 */
export function detectMusicService(rawUrl: string): MusicServiceType {
  const url = rawUrl.toLowerCase().trim();
  if (url.includes("spotify.com") || url.includes("spoti.fi")) {
    return "spotify";
  }
  if (
    url.includes("music.youtube.com") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  ) {
    return "youtube_music";
  }
  if (url.includes("apple.com") || url.includes("music.apple.com")) {
    return "apple_music";
  }
  if (url.includes("deezer.com") || url.includes("deezer.page.link")) {
    return "deezer";
  }
  return "other";
}

/**
 * Extrai parâmetros e gera players incorporados (embed) oficiais legais quando suportados.
 */
export function parseMusicUrl(rawUrl: string): ParsedTrackMetadata {
  const trimmed = rawUrl.trim();
  const service = detectMusicService(trimmed);
  let embedUrl: string | undefined = undefined;
  const titleHint: string | undefined = undefined;
  const artistHint: string | undefined = undefined;
  let playlistImportId: string | undefined = undefined;

  try {
    const parsed = new URL(trimmed);

    if (service === "spotify") {
      // Exemplo: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
      // Embed oficial Spotify: https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const typeIdx = pathParts.findIndex(
        (p) => p === "track" || p === "playlist" || p === "album",
      );
      if (typeIdx !== -1 && pathParts[typeIdx + 1]) {
        const itemType = pathParts[typeIdx];
        const itemId = pathParts[typeIdx + 1];
        embedUrl = `https://open.spotify.com/embed/${itemType}/${itemId}`;
        if (itemType === "playlist") {
          playlistImportId = itemId;
        }
      }
    } else if (service === "youtube_music") {
      // Exemplo: https://music.youtube.com/watch?v=dQw4w9WgXcQ ou https://www.youtube.com/watch?v=...
      const v = parsed.searchParams.get("v");
      const list = parsed.searchParams.get("list");
      if (list) {
        playlistImportId = list;
      }
      if (v) {
        embedUrl = `https://www.youtube.com/embed/${v}`;
      } else if (parsed.hostname === "youtu.be") {
        const vid = parsed.pathname.slice(1);
        if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
      }
    } else if (service === "apple_music") {
      // Exemplo: https://music.apple.com/us/album/song-name/12345?i=67890
      // Embed oficial Apple Music: https://embed.music.apple.com/...
      embedUrl = trimmed.replace("music.apple.com", "embed.music.apple.com");
    } else if (service === "deezer") {
      // Exemplo: https://www.deezer.com/track/123456
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const trackIdx = pathParts.indexOf("track");
      if (trackIdx !== -1 && pathParts[trackIdx + 1]) {
        const trackId = pathParts[trackIdx + 1];
        embedUrl = `https://widget.deezer.com/widget/dark/track/${trackId}`;
      }
    }
  } catch {
    // URL inválida, mantém serviço padrão
  }

  return {
    service,
    title: titleHint,
    artist: artistHint,
    embedUrl,
    canonicalUrl: trimmed,
    rawUrl: trimmed,
    playlistImportId,
  };
}

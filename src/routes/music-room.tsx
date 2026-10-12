import { useState, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Music,
  Plus,
  Search,
  Filter,
  Play,
  Heart,
  ExternalLink,
  Edit3,
  Trash2,
  Copy,
  FolderPlus,
  Upload,
  X,
  Check,
  Disc3,
  Radio,
  BookOpen,
  Users,
  Sparkles,
  Link2,
  ArrowUpDown,
  ListMusic,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Headphones,
  SlidersHorizontal,
} from "lucide-react";
import {
  useStore,
  actions,
  MUSIC_DEFAULT_CATEGORIES,
  type MusicPlaylist,
  type MusicTrack,
  type MusicStreamingService,
  type Book,
  type Chapter,
  type Character,
} from "@/lib/store";
import { parseMusicUrl, detectMusicService } from "@/lib/music-parser";
import { MediaImage } from "@/components/MediaImage";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";

export const Route = createFileRoute("/music-room")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    playlist?: string;
    musica?: string;
    livro?: string;
    personagem?: string;
  } => {
    return {
      ...(typeof search?.playlist === "string" ? { playlist: search.playlist } : {}),
      ...(typeof search?.musica === "string" ? { musica: search.musica } : {}),
      ...(typeof search?.livro === "string" ? { livro: search.livro } : {}),
      ...(typeof search?.personagem === "string" ? { personagem: search.personagem } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Music Room — Spectral Archive Studio" },
      {
        name: "description",
        content:
          "A trilha sonora das suas histórias começa aqui. Crie e organize playlists literárias.",
      },
      { property: "og:title", content: "Music Room — Spectral Archive Studio" },
      {
        property: "og:description",
        content:
          "Playlists, trilhas sonoras literárias e organização musical de livros e personagens.",
      },
    ],
  }),
  component: MusicRoomRoute,
});

// Informações e status real das integrações de streaming
const STREAMING_SERVICES_INFO: {
  id: MusicStreamingService;
  name: string;
  badge: string;
  description: string;
  statusNotes: string;
  requiresClientSetup: boolean;
  docUrl: string;
}[] = [
  {
    id: "spotify",
    name: "Spotify",
    badge: "API Oficial / Embed Web Player",
    description:
      "Importação de metadados de faixas e playlists abertas via links diretos e player oficial Spotify Embed.",
    statusNotes:
      "A importação de playlists privadas do usuário e reprodução contínua completa exigem autenticação OAuth com Client ID/Secret registrado no Spotify Developer Dashboard.",
    requiresClientSetup: true,
    docUrl: "https://developer.spotify.com/documentation/web-api",
  },
  {
    id: "youtube_music",
    name: "YouTube Music",
    badge: "YouTube Data API v3 & IFrame",
    description:
      "Suporte completo para links diretos de faixas e álbuns, incorporação de player via IFrame e links diretos ao YouTube Music.",
    statusNotes:
      "A listagem de bibliotecas privadas de usuário requer autenticação Google OAuth com escopo youtube.readonly. A adição manual por links está pronta e totalmente funcional.",
    requiresClientSetup: true,
    docUrl: "https://developers.google.com/youtube/v3",
  },
  {
    id: "apple_music",
    name: "Apple Music",
    badge: "Apple MusicKit JS",
    description:
      "Player oficial incorporado Apple Music e links diretos para a biblioteca do streaming.",
    statusNotes:
      "Acesso à biblioteca pessoal requer Developer Token assinado com chave privada Apple (MusicKit JS). Inclusão por links diretos funciona nativamente.",
    requiresClientSetup: true,
    docUrl: "https://developer.apple.com/musickit/",
  },
  {
    id: "deezer",
    name: "Deezer",
    badge: "Deezer Widget & SDK",
    description: "Pré-escuta de faixas via widget oficial Deezer e links diretos.",
    statusNotes:
      "Importação direta de conta requer token Deezer OAuth. Links públicos podem ser adicionados diretamente no formulário.",
    requiresClientSetup: true,
    docUrl: "https://developers.deezer.com/",
  },
];

function getServiceBadgeColor(service: MusicStreamingService) {
  switch (service) {
    case "spotify":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
    case "youtube_music":
      return "border-rose-500/40 bg-rose-500/10 text-rose-400";
    case "apple_music":
      return "border-pink-500/40 bg-pink-500/10 text-pink-400";
    case "deezer":
      return "border-amber-500/40 bg-amber-500/10 text-amber-400";
    default:
      return "border-primary/40 bg-primary/10 text-primary";
  }
}

function getServiceLabel(service: MusicStreamingService) {
  switch (service) {
    case "spotify":
      return "Spotify";
    case "youtube_music":
      return "YouTube Music";
    case "apple_music":
      return "Apple Music";
    case "deezer":
      return "Deezer";
    default:
      return "Link Musical";
  }
}

export function MusicRoomRoute() {
  const searchParams = Route.useSearch();

  // Dados do store
  const books = useStore((s) => s.books ?? []);
  const chapters = useStore((s) => s.chapters ?? []);
  const characters = useStore((s) => s.characters ?? []);
  const playlists = useStore((s) => s.musicPlaylists ?? []);
  const tracks = useStore((s) => s.musicTracks ?? []);
  const customCategories = useStore((s) => s.musicCustomCategories ?? []);
  const streamingConnections = useStore(
    (s) =>
      s.musicStreamingConnections ?? {
        spotify: false,
        youtube_music: false,
        apple_music: false,
        deezer: false,
        other: false,
      },
  );

  // Pares de casais calculados a partir dos personagens
  const couples = useMemo(() => {
    return characters
      .filter((c) => c.partnerId && c.id < c.partnerId)
      .map((a) => {
        const b = characters.find((c) => c.id === a.partnerId);
        return {
          id: `${a.id}::${a.partnerId}`,
          label: `${a.name} & ${b?.name || "Par"}`,
        };
      });
  }, [characters]);

  // Lista de todas as categorias disponíveis
  const allCategories = useMemo(() => {
    const defaultList = [...MUSIC_DEFAULT_CATEGORIES];
    const customList = customCategories.filter(
      (c) => !(defaultList as readonly string[]).includes(c),
    );
    return [...defaultList, ...customList];
  }, [customCategories]);

  // Estados de navegação interna e filtros
  const [activeTab, setActiveTab] = useState<"playlists" | "tracks" | "services">("playlists");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    searchParams.playlist || null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>("all");
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>(searchParams.livro || "all");
  const [selectedCharFilter, setSelectedCharFilter] = useState<string>(
    searchParams.personagem || "all",
  );
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<"recent" | "name" | "tracks-count">("recent");

  // Modais de Formulário
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<MusicPlaylist | null>(null);

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importService, setImportService] = useState<MusicStreamingService>("spotify");

  const [serviceDetailsModal, setServiceDetailsModal] = useState<MusicStreamingService | null>(
    null,
  );

  // Player de visualização atual
  const [activePlayingTrack, setActivePlayingTrack] = useState<MusicTrack | null>(null);

  // Playlist selecionada atualmente (se houver)
  const currentSelectedPlaylist = useMemo(() => {
    if (!selectedPlaylistId) return null;
    return playlists.find((p) => p.id === selectedPlaylistId) || null;
  }, [playlists, selectedPlaylistId]);

  // Músicas pertencentes à playlist selecionada
  const selectedPlaylistTracks = useMemo(() => {
    if (!currentSelectedPlaylist) return [];
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    return currentSelectedPlaylist.trackIds
      .map((id) => trackMap.get(id))
      .filter((t): t is MusicTrack => Boolean(t));
  }, [currentSelectedPlaylist, tracks]);

  // Playlists filtradas
  const filteredPlaylists = useMemo(() => {
    return playlists
      .filter((pl) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const inName = pl.name.toLowerCase().includes(q);
          const inDesc = pl.description.toLowerCase().includes(q);
          const inTags = (pl.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!inName && !inDesc && !inTags) return false;
        }
        if (selectedCategoryFilter !== "all" && pl.category !== selectedCategoryFilter) {
          return false;
        }
        if (selectedBookFilter !== "all" && pl.bookId !== selectedBookFilter) {
          return false;
        }
        if (selectedCharFilter !== "all" && pl.characterId !== selectedCharFilter) {
          return false;
        }
        if (onlyFavoritesFilter && !pl.isFavorite) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "name") return a.name.localeCompare(b.name);
        if (sortOption === "tracks-count")
          return (b.trackIds?.length || 0) - (a.trackIds?.length || 0);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [
    playlists,
    searchQuery,
    selectedCategoryFilter,
    selectedBookFilter,
    selectedCharFilter,
    onlyFavoritesFilter,
    sortOption,
  ]);

  // Músicas filtradas gerais
  const filteredTracks = useMemo(() => {
    return tracks
      .filter((trk) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const inTitle = trk.title.toLowerCase().includes(q);
          const inArtist = trk.artist.toLowerCase().includes(q);
          const inAlbum = (trk.album || "").toLowerCase().includes(q);
          const inTags = (trk.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!inTitle && !inArtist && !inAlbum && !inTags) return false;
        }
        if (selectedServiceFilter !== "all" && trk.service !== selectedServiceFilter) {
          return false;
        }
        if (selectedBookFilter !== "all" && trk.bookId !== selectedBookFilter) {
          return false;
        }
        if (selectedCharFilter !== "all" && trk.characterId !== selectedCharFilter) {
          return false;
        }
        if (onlyFavoritesFilter && !trk.isFavorite) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [
    tracks,
    searchQuery,
    selectedServiceFilter,
    selectedBookFilter,
    selectedCharFilter,
    onlyFavoritesFilter,
  ]);

  // Abertura de criação de playlist
  const handleOpenNewPlaylist = () => {
    const initial = actions.newMusicPlaylist({
      bookId: selectedBookFilter !== "all" ? selectedBookFilter : "",
      characterId: selectedCharFilter !== "all" ? selectedCharFilter : "",
    });
    setEditingPlaylist(initial);
    setPlaylistModalOpen(true);
  };

  // Abertura de criação de música
  const handleOpenNewTrack = () => {
    const initial = actions.newMusicTrack({
      playlistIds: currentSelectedPlaylist ? [currentSelectedPlaylist.id] : [],
      bookId: currentSelectedPlaylist?.bookId || "",
      characterId: currentSelectedPlaylist?.characterId || "",
    });
    setEditingTrack(initial);
    setTrackModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl pb-20">
      {/* 1. CABEÇALHO PRINCIPAL DA MUSIC ROOM */}
      <header className="mb-8 border-b border-border/60 pb-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Music className="h-6 w-6 text-icon-primary" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Music Room
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                A trilha sonora das suas histórias começa aqui.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenNewPlaylist}
              className="btn flex items-center gap-2 !min-h-10 !px-4 text-xs shadow-md"
              data-testid="btn-criar-playlist"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Criar Playlist</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewTrack}
              className="btn-ghost flex items-center gap-2 !min-h-10 !px-4 text-xs border border-border/80"
              data-testid="btn-adicionar-musica"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Música</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className="btn-ghost flex items-center gap-2 !min-h-10 !px-3.5 text-xs text-muted-foreground hover:text-foreground"
              data-testid="btn-streaming-services"
            >
              <Radio className="h-4 w-4 text-icon-secondary" />
              <span>Conectar Serviços</span>
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-border/40 pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("playlists");
              setSelectedPlaylistId(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === "playlists" && !selectedPlaylistId
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ListMusic className="h-4 w-4" />
            <span>Playlists ({playlists.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tracks")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === "tracks"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Disc3 className="h-4 w-4" />
            <span>Todas as Músicas ({tracks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === "services"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>Serviços de Streaming</span>
          </button>

          {currentSelectedPlaylist && (
            <span className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <span>{currentSelectedPlaylist.name}</span>
              <button
                type="button"
                onClick={() => setSelectedPlaylistId(null)}
                className="hover:text-destructive ml-1"
                title="Fechar detalhes da playlist"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
      </header>

      {/* 2. PLAYER OFICIAL / PREVIEW INCORPORADO ATIVO (SE HOUVER) */}
      {activePlayingTrack && (
        <div className="card-luxe mb-8 p-4 border border-primary/30 shadow-xl bg-card/95">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Disc3 className="h-5 w-5 animate-spin" style={{ animationDuration: "6s" }} />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{activePlayingTrack.title}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {activePlayingTrack.artist}{" "}
                  {activePlayingTrack.album ? `• ${activePlayingTrack.album}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={activePlayingTrack.url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost !min-h-8 !px-3 text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Abrir no{" "}
                {getServiceLabel(activePlayingTrack.service)}
              </a>
              <button
                type="button"
                onClick={() => setActivePlayingTrack(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                title="Fechar player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            {(() => {
              const parsed = parseMusicUrl(activePlayingTrack.url);
              if (parsed.embedUrl) {
                return (
                  <div className="overflow-hidden rounded-xl border border-border/80 bg-black/10">
                    <iframe
                      src={parsed.embedUrl}
                      title={`Player ${activePlayingTrack.title}`}
                      className="w-full h-32 md:h-40 border-0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                );
              }
              return (
                <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
                  <p>Este link musical abre diretamente no serviço original do artista.</p>
                  <a
                    href={activePlayingTrack.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                  >
                    Ouvir agora no {getServiceLabel(activePlayingTrack.service)} →
                  </a>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 3. ABA: SERVIÇOS DE STREAMING */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5">
            <h2 className="font-display text-xl font-semibold">Conectar Serviços de Streaming</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Investigação e conexões com plataformas musicais. A Music Room utiliza links oficiais
              e players incorporados autorizados pelas plataformas, respeitando as permissões de
              cada ecossistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STREAMING_SERVICES_INFO.map((svc) => {
              const isConnected = Boolean(streamingConnections[svc.id]);
              return (
                <div key={svc.id} className="card-luxe p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 text-foreground">
                          <Radio className="h-5 w-5 text-icon-primary" />
                        </span>
                        <div>
                          <h3 className="font-display text-lg font-semibold">{svc.name}</h3>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getServiceBadgeColor(svc.id)}`}
                          >
                            {svc.badge}
                          </span>
                        </div>
                      </div>

                      <span
                        data-testid={`status-${svc.id}`}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isConnected
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-secondary/60 text-muted-foreground border border-border"
                        }`}
                      >
                        {isConnected ? "Conectado" : "Não conectado"}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {svc.description}
                    </p>

                    <div className="mt-3 rounded-xl border border-border/60 bg-secondary/30 p-3 text-[11px] text-muted-foreground">
                      <strong className="block text-foreground mb-0.5">Capacidade real:</strong>
                      {svc.statusNotes}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4 gap-2">
                    <button
                      type="button"
                      data-testid={`btn-toggle-${svc.id}`}
                      onClick={() => {
                        actions.setStreamingServiceConnection(svc.id, !isConnected);
                      }}
                      className={`btn !min-h-9 !px-4 text-xs ${
                        isConnected
                          ? "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25"
                          : ""
                      }`}
                    >
                      {isConnected ? "Desconectar" : "Conectar Serviço"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImportService(svc.id);
                        setImportModalOpen(true);
                      }}
                      className="btn-ghost !min-h-9 !px-3 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Importar
                    </button>

                    <a
                      href={svc.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <span>Docs</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ABA: PLAYLIST DETALHADA SELECIONADA */}
      {activeTab === "playlists" && currentSelectedPlaylist && (
        <div className="space-y-6">
          <div className="card-luxe p-6 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-56 shrink-0 aspect-square rounded-2xl overflow-hidden bg-secondary/40 border border-border flex items-center justify-center relative">
              {currentSelectedPlaylist.coverUrl ? (
                <MediaImage
                  src={currentSelectedPlaylist.coverUrl}
                  alt={currentSelectedPlaylist.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                  <Headphones className="h-12 w-12 text-primary/40 mb-2" />
                  <span className="text-xs">Sem capa definida</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                    {currentSelectedPlaylist.category}
                  </span>
                  {currentSelectedPlaylist.isFavorite && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <Heart className="h-3 w-3 fill-current" /> Favorita
                    </span>
                  )}
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-semibold">
                  {currentSelectedPlaylist.name}
                </h2>

                <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {currentSelectedPlaylist.description ||
                    "Nenhuma descrição fornecida para esta playlist."}
                </p>

                {/* Vínculos com o Universo */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {currentSelectedPlaylist.bookId && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      {books.find((b) => b.id === currentSelectedPlaylist.bookId)?.title ||
                        "Livro Vinculado"}
                    </span>
                  )}
                  {currentSelectedPlaylist.characterId && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {characters.find((c) => c.id === currentSelectedPlaylist.characterId)?.name ||
                        "Personagem Vinculado"}
                    </span>
                  )}
                  {currentSelectedPlaylist.tags?.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-border/60 bg-secondary/30 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
                <span className="text-xs text-muted-foreground">
                  {selectedPlaylistTracks.length}{" "}
                  {selectedPlaylistTracks.length === 1 ? "música" : "músicas"} cadastradas
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlaylist(currentSelectedPlaylist);
                      setPlaylistModalOpen(true);
                    }}
                    className="btn-ghost !min-h-9 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      actions.duplicateMusicPlaylist(currentSelectedPlaylist.id);
                    }}
                    className="btn-ghost !min-h-9 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" /> Duplicar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      actions.toggleFavoritePlaylist(currentSelectedPlaylist.id);
                    }}
                    className="btn-ghost !min-h-9 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${currentSelectedPlaylist.isFavorite ? "fill-primary text-primary" : ""}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Tem certeza que deseja excluir esta playlist? As músicas associadas continuarão disponíveis.",
                        )
                      ) {
                        actions.deleteMusicPlaylist(currentSelectedPlaylist.id);
                        setSelectedPlaylistId(null);
                      }
                    }}
                    className="btn-ghost !min-h-9 !px-3 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* LISTA DE MÚSICAS DA PLAYLIST COM REORDENAÇÃO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Faixas Musicais</h3>
              <button
                type="button"
                onClick={handleOpenNewTrack}
                className="btn !min-h-8 !px-3 text-xs flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Faixa
              </button>
            </div>

            {selectedPlaylistTracks.length === 0 ? (
              <div className="card-luxe p-8 text-center text-muted-foreground">
                <Disc3 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium">Nenhuma música nesta playlist ainda.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione músicas manuais por link ou conecte músicas já cadastradas.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewTrack}
                  className="btn mt-4 !min-h-9 !px-4 text-xs"
                >
                  <Plus className="h-4 w-4" /> Adicionar Primeira Música
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPlaylistTracks.map((trk, idx) => (
                  <div
                    key={trk.id}
                    className="card-luxe p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5 text-center">
                        {idx + 1}
                      </span>
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary/50 border border-border overflow-hidden flex items-center justify-center">
                        {trk.coverUrl ? (
                          <MediaImage
                            src={trk.coverUrl}
                            alt={trk.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Music className="h-5 w-5 text-icon-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm truncate">{trk.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {trk.artist} {trk.album ? `• ${trk.album}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setActivePlayingTrack(trk)}
                        className="btn-ghost !min-h-8 !px-2.5 text-xs flex items-center gap-1 text-primary"
                        title="Tocar / Ver Player"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>

                      <a
                        href={trk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost !min-h-8 !px-2.5 text-xs text-muted-foreground hover:text-foreground"
                        title="Abrir no serviço de origem"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTrack(trk);
                          setTrackModalOpen(true);
                        }}
                        className="btn-ghost !min-h-8 !px-2 text-xs text-muted-foreground hover:text-foreground"
                        title="Editar faixa"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          actions.removeTrackFromPlaylist(currentSelectedPlaylist.id, trk.id);
                        }}
                        className="btn-ghost !min-h-8 !px-2 text-xs text-muted-foreground hover:text-destructive"
                        title="Remover da playlist"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ABA: GRADE DE PLAYLISTS */}
      {activeTab === "playlists" && !currentSelectedPlaylist && (
        <div className="space-y-6">
          {/* BARRA DE BUSCA E FILTROS */}
          <div className="card-luxe p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por título, artista, descrição ou tags..."
                  className="w-full pl-10 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary min-w-[130px]"
                >
                  <option value="all">Todas as Categorias</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBookFilter}
                  onChange={(e) => setSelectedBookFilter(e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary min-w-[130px]"
                >
                  <option value="all">Todos os Livros</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setOnlyFavoritesFilter((v) => !v)}
                  className={`btn-ghost !min-h-9 !px-3 text-xs flex items-center gap-1.5 ${
                    onlyFavoritesFilter ? "!border-primary !bg-primary/10 text-primary" : ""
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${onlyFavoritesFilter ? "fill-current" : ""}`} />
                  <span>Favoritas</span>
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE PLAYLISTS */}
          {filteredPlaylists.length === 0 ? (
            <div className="card-luxe p-12 text-center text-muted-foreground">
              <ListMusic className="h-12 w-12 text-primary/30 mx-auto mb-3" />
              <h3 className="font-display text-xl font-semibold text-foreground">
                Nenhuma playlist encontrada
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                Crie sua primeira playlist literária para organizar as músicas que inspiram a
                escrita do seu livro.
              </p>
              <button
                type="button"
                onClick={handleOpenNewPlaylist}
                className="btn mt-5 !min-h-10 !px-5 text-xs shadow-md"
              >
                <Plus className="h-4 w-4" /> Criar Primeira Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className="card-luxe p-4 cursor-pointer hover:border-primary/60 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-secondary/50 border border-border/80 relative mb-3 flex items-center justify-center">
                      {pl.coverUrl ? (
                        <MediaImage
                          src={pl.coverUrl}
                          alt={pl.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Headphones className="h-12 w-12 text-primary/40" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.toggleFavoritePlaylist(pl.id);
                        }}
                        className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-foreground hover:bg-background transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${pl.isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                      <span>{pl.category}</span>
                      <span>•</span>
                      <span className="text-muted-foreground font-normal">
                        {pl.trackIds?.length || 0} faixas
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold truncate group-hover:text-primary transition-colors">
                      {pl.name}
                    </h3>

                    {pl.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {pl.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">
                      {pl.bookId ? books.find((b) => b.id === pl.bookId)?.title : "Geral"}
                    </span>
                    <span className="text-primary group-hover:translate-x-1 transition-transform">
                      Abrir →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. ABA: TODAS AS MÚSICAS */}
      {activeTab === "tracks" && (
        <div className="space-y-6">
          <div className="card-luxe p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar músicas por título, artista ou álbum..."
                  className="w-full pl-10 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedServiceFilter}
                  onChange={(e) => setSelectedServiceFilter(e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary min-w-[130px]"
                >
                  <option value="all">Todos os Serviços</option>
                  <option value="spotify">Spotify</option>
                  <option value="youtube_music">YouTube Music</option>
                  <option value="apple_music">Apple Music</option>
                  <option value="deezer">Deezer</option>
                  <option value="other">Outros Links</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenNewTrack}
                  className="btn !min-h-9 !px-4 text-xs flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Nova Música
                </button>
              </div>
            </div>
          </div>

          {filteredTracks.length === 0 ? (
            <div className="card-luxe p-12 text-center text-muted-foreground">
              <Disc3 className="h-12 w-12 text-primary/30 mx-auto mb-3" />
              <h3 className="font-display text-xl font-semibold text-foreground">
                Nenhuma música cadastrada
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                Adicione faixas colando o link do Spotify, YouTube Music, Apple Music, Deezer ou
                qualquer URL.
              </p>
              <button
                type="button"
                onClick={handleOpenNewTrack}
                className="btn mt-5 !min-h-10 !px-5 text-xs shadow-md"
              >
                <Plus className="h-4 w-4" /> Adicionar Primeira Faixa
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTracks.map((trk) => (
                <div
                  key={trk.id}
                  className="card-luxe p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-secondary/50 border border-border overflow-hidden flex items-center justify-center">
                      {trk.coverUrl ? (
                        <MediaImage
                          src={trk.coverUrl}
                          alt={trk.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Music className="h-6 w-6 text-icon-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{trk.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full border ${getServiceBadgeColor(trk.service)}`}
                        >
                          {getServiceLabel(trk.service)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {trk.artist} {trk.album ? `• ${trk.album}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setActivePlayingTrack(trk)}
                      className="btn !min-h-8 !px-3 text-xs flex items-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Ouvir
                    </button>

                    <a
                      href={trk.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost !min-h-8 !px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      title="Abrir no serviço de origem"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTrack(trk);
                        setTrackModalOpen(true);
                      }}
                      className="btn-ghost !min-h-8 !px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            "Excluir o registro desta música? Ela será removida de todas as playlists.",
                          )
                        ) {
                          actions.deleteMusicTrack(trk.id);
                        }
                      }}
                      className="btn-ghost !min-h-8 !px-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. MODAL: CRIAR OU EDITAR PLAYLIST */}
      {playlistModalOpen && editingPlaylist && (
        <PlaylistEditorModal
          playlist={editingPlaylist}
          books={books}
          characters={characters}
          categories={allCategories}
          onClose={() => {
            setPlaylistModalOpen(false);
            setEditingPlaylist(null);
          }}
          onSave={(saved) => {
            actions.saveMusicPlaylist(saved);
            setPlaylistModalOpen(false);
            setEditingPlaylist(null);
          }}
        />
      )}

      {/* 8. MODAL: CRIAR OU EDITAR MÚSICA */}
      {trackModalOpen && editingTrack && (
        <TrackEditorModal
          track={editingTrack}
          playlists={playlists}
          books={books}
          characters={characters}
          onClose={() => {
            setTrackModalOpen(false);
            setEditingTrack(null);
          }}
          onSave={(saved) => {
            actions.saveMusicTrack(saved);
            setTrackModalOpen(false);
            setEditingTrack(null);
          }}
        />
      )}

      {/* 9. MODAL: IMPORTAR DE STREAMING */}
      {importModalOpen && (
        <StreamingImportModal
          service={importService}
          playlists={playlists}
          onClose={() => setImportModalOpen(false)}
          onImport={(imported) => {
            actions.saveMusicTrack(imported);
            setImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ===========================================================================
// SUBCOMPONENTES E MODAIS ESPECÍFICOS
// ===========================================================================

function PlaylistEditorModal({
  playlist: initial,
  books,
  characters,
  categories,
  onClose,
  onSave,
}: {
  playlist: MusicPlaylist;
  books: Book[];
  characters: Character[];
  categories: string[];
  onClose: () => void;
  onSave: (pl: MusicPlaylist) => void;
}) {
  const [pl, setPl] = useState<MusicPlaylist>({ ...initial });
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !pl.tags.includes(val)) {
      setPl({ ...pl, tags: [...pl.tags, val] });
      setTagInput("");
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      const ref = await storeMediaDataUrl(`pl_cov_${Date.now()}`, dataUrl);
      setPl({ ...pl, coverUrl: ref });
    } catch {
      // Falha silenciosa de leitura
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="card-luxe flex h-[92vh] max-h-[850px] w-full max-w-3xl min-w-0 flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="playlist-editor-modal"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderPlus className="h-5 w-5 text-icon-primary" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">
                {pl.name.trim() ? pl.name : "Nova Playlist Musical"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Personalize os dados editoriais, capa e vínculos literários da playlist.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Nome da Playlist *
            </label>
            <input
              type="text"
              value={pl.name}
              onChange={(e) => setPl({ ...pl, name: e.target.value })}
              placeholder="Ex: Trilha Sonora de Chama e Espadas, Tema de Amor..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-medium"
              data-testid="playlist-name-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Categoria
              </label>
              <select
                value={pl.category}
                onChange={(e) => setPl({ ...pl, category: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Livro Vinculado
              </label>
              <select
                value={pl.bookId || ""}
                onChange={(e) => setPl({ ...pl, bookId: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Geral / Toda a Saga</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Personagem Vinculado
            </label>
            <select
              value={pl.characterId || ""}
              onChange={(e) => setPl({ ...pl, characterId: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Nenhum personagem específico</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Descrição ou Conceito da Playlist
            </label>
            <textarea
              rows={3}
              value={pl.description}
              onChange={(e) => setPl({ ...pl, description: e.target.value })}
              placeholder="Descreva a atmosfera sonora desta playlist, em qual momento da escrita ela é ideal..."
              className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Capa da Playlist (Upload ou Link)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pl.coverUrl || ""}
                onChange={(e) => setPl({ ...pl, coverUrl: e.target.value })}
                placeholder="Cole URL de imagem externa ou envie..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost !min-h-9 !px-3 text-xs flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4" /> Enviar
              </button>
            </div>
          </div>

          {pl.coverUrl && (
            <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-border">
              <MediaImage
                src={pl.coverUrl}
                alt="Capa da playlist"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPl({ ...pl, coverUrl: "" })}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ex: instrumental, melancolia, batalha..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-ghost !min-h-8 !px-3 text-xs"
              >
                Adicionar
              </button>
            </div>
            {pl.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pl.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/80 px-2.5 py-0.5 text-xs text-foreground"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => setPl({ ...pl, tags: pl.tags.filter((x) => x !== t) })}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={pl.isFavorite}
                onChange={(e) => setPl({ ...pl, isFavorite: e.target.checked })}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Adicionar aos Favoritos</span>
            </label>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between border-t border-border/60 bg-secondary/20 px-5 py-3">
          <button type="button" onClick={onClose} className="btn-ghost !min-h-9 text-xs">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (!pl.name.trim()) {
                alert("Por favor, preencha o nome da playlist.");
                return;
              }
              onSave(pl);
            }}
            className="btn flex items-center gap-2 !min-h-9 !px-5 text-xs shadow-md"
            data-testid="btn-salvar-playlist"
          >
            <Check className="h-4 w-4" />
            <span>Salvar Playlist</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function TrackEditorModal({
  track: initial,
  playlists,
  books,
  characters,
  onClose,
  onSave,
}: {
  track: MusicTrack;
  playlists: MusicPlaylist[];
  books: Book[];
  characters: Character[];
  onClose: () => void;
  onSave: (trk: MusicTrack) => void;
}) {
  const [trk, setTrk] = useState<MusicTrack>({ ...initial });
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (newUrl: string) => {
    const parsed = parseMusicUrl(newUrl);
    setTrk({
      ...trk,
      url: newUrl,
      service: parsed.service,
    });
  };

  const handleTogglePlaylist = (plId: string) => {
    const exists = trk.playlistIds.includes(plId);
    setTrk({
      ...trk,
      playlistIds: exists
        ? trk.playlistIds.filter((id) => id !== plId)
        : [...trk.playlistIds, plId],
    });
  };

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !trk.tags.includes(val)) {
      setTrk({ ...trk, tags: [...trk.tags, val] });
      setTagInput("");
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      const ref = await storeMediaDataUrl(`trk_cov_${Date.now()}`, dataUrl);
      setTrk({ ...trk, coverUrl: ref });
    } catch {
      // Erro silencioso
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="card-luxe flex h-[92vh] max-h-[850px] w-full max-w-3xl min-w-0 flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="track-editor-modal"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Disc3 className="h-5 w-5 text-icon-primary" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">
                {trk.title.trim() ? trk.title : "Adicionar Música por Link"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Cole a URL de qualquer serviço musical para integrar à sua trilha sonora.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              URL da Música (Link do Spotify, YouTube Music, Apple Music, Deezer, etc.) *
            </label>
            <div className="relative">
              <input
                type="text"
                value={trk.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://open.spotify.com/track/... ou https://music.youtube.com/..."
                className="w-full rounded-xl border border-input bg-background pl-3.5 pr-28 py-2 text-sm outline-none focus:border-primary font-mono text-xs"
                data-testid="track-url-input"
              />
              <span
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded-full border ${getServiceBadgeColor(trk.service)}`}
              >
                {getServiceLabel(trk.service)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Título da Música *
              </label>
              <input
                type="text"
                value={trk.title}
                onChange={(e) => setTrk({ ...trk, title: e.target.value })}
                placeholder="Ex: Moonlight Sonata, Run Free..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-medium"
                data-testid="track-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Artista ou Intérprete *
              </label>
              <input
                type="text"
                value={trk.artist}
                onChange={(e) => setTrk({ ...trk, artist: e.target.value })}
                placeholder="Ex: Hans Zimmer, Ludwig Göransson..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                data-testid="track-artist-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Álbum (Opcional)
              </label>
              <input
                type="text"
                value={trk.album || ""}
                onChange={(e) => setTrk({ ...trk, album: e.target.value })}
                placeholder="Ex: Inception Soundtrack"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Livro Relacionado
              </label>
              <select
                value={trk.bookId || ""}
                onChange={(e) => setTrk({ ...trk, bookId: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Geral / Toda a Saga</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vínculo em Múltiplas Playlists */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Adicionar às Playlists:
            </label>
            {playlists.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma playlist cadastrada ainda. Crie uma playlist na tela principal para
                organizar suas faixas.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {playlists.map((p) => {
                  const isChecked = trk.playlistIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTogglePlaylist(p.id)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-colors truncate ${
                        isChecked
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                      }`}
                    >
                      <ListMusic className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Notas e Observações de Escrita
            </label>
            <textarea
              rows={2}
              value={trk.notes || ""}
              onChange={(e) => setTrk({ ...trk, notes: e.target.value })}
              placeholder="Qual cena esta música inspira? Que emoção evoca para os personagens?"
              className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Capa ou Imagem da Faixa
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={trk.coverUrl || ""}
                onChange={(e) => setTrk({ ...trk, coverUrl: e.target.value })}
                placeholder="URL da capa..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost !min-h-9 !px-3 text-xs flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4" /> Enviar
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={trk.isFavorite}
                onChange={(e) => setTrk({ ...trk, isFavorite: e.target.checked })}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Marcar como Faixa Favorita</span>
            </label>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between border-t border-border/60 bg-secondary/20 px-5 py-3">
          <button type="button" onClick={onClose} className="btn-ghost !min-h-9 text-xs">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (!trk.title.trim() || !trk.artist.trim() || !trk.url.trim()) {
                alert("Por favor, preencha a URL, o título e o artista da música.");
                return;
              }
              onSave(trk);
            }}
            className="btn flex items-center gap-2 !min-h-9 !px-5 text-xs shadow-md"
            data-testid="btn-salvar-musica"
          >
            <Check className="h-4 w-4" />
            <span>Salvar Música</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StreamingImportModal({
  service,
  playlists,
  onClose,
  onImport,
}: {
  service: MusicStreamingService;
  playlists: MusicPlaylist[];
  onClose: () => void;
  onImport: (trk: MusicTrack) => void;
}) {
  const [importUrl, setImportUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || "");

  const handleUrlPaste = (val: string) => {
    setImportUrl(val);
    const parsed = parseMusicUrl(val);
    if (!title && parsed.title) setTitle(parsed.title);
    if (!artist && parsed.artist) setArtist(parsed.artist);
  };

  const handleConfirm = () => {
    if (!importUrl.trim()) {
      alert("Por favor, insira o link da música ou playlist.");
      return;
    }
    const parsed = parseMusicUrl(importUrl);
    const nowIso = new Date().toISOString();
    const newTrk: MusicTrack = {
      id: `trk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim() || `Faixa Importada (${getServiceLabel(service)})`,
      artist: artist.trim() || "Artista Desconhecido",
      url: importUrl.trim(),
      service: parsed.service !== "other" ? parsed.service : service,
      tags: ["importado"],
      playlistIds: selectedPlaylistId ? [selectedPlaylistId] : [],
      isFavorite: false,
      addedAt: nowIso,
      updatedAt: nowIso,
    };
    onImport(newTrk);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="card-luxe flex max-h-[85vh] w-full max-w-lg flex-col p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-icon-primary" />
            <h3 className="font-display text-lg font-semibold">
              Importar de {getServiceLabel(service)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-border/80 bg-secondary/30 p-3 text-xs text-muted-foreground leading-relaxed">
            A importação direta respeita as diretrizes de streaming. Cole o link da faixa ou
            playlist pública para importar metadados legais e incorporar o player oficial.
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Link da Música / Faixa *
            </label>
            <input
              type="text"
              value={importUrl}
              onChange={(e) => handleUrlPaste(e.target.value)}
              placeholder="Cole a URL compartilhável..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Título da Faixa
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Título da música..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Artista
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ex: Nome do artista..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Adicionar à Playlist
            </label>
            <select
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
            >
              <option value="">Nenhuma (guardar em Todas as Músicas)</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-border/40 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost !min-h-9 text-xs">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} className="btn !min-h-9 !px-4 text-xs">
            Confirmar Importação
          </button>
        </div>
      </div>
    </div>
  );
}

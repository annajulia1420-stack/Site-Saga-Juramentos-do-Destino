import { useState, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  History,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  BookOpen,
  Users,
  Heart,
  Globe2,
  Sparkles,
  Check,
  X,
  Edit3,
  Trash2,
  Copy,
  Star,
  Layers,
  LayoutGrid,
  List as ListIcon,
  Tag,
  ArrowRight,
  ArrowUpRight,
  Shield,
  Swords,
  Flame,
  Key,
  Compass,
  AlertCircle,
  FileText,
  Download,
  Share2,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  useStore,
  actions,
  TIMELINE_EVENT_TYPES,
  TIMELINE_IMPACT_LEVELS,
  TIMELINE_NARRATIVE_MOMENTS,
  DEFAULT_TIMELINE_ERAS,
  type TimelineEvent,
  type TimelineEventType,
  type TimelineImpactLevel,
  type TimelineNarrativeMoment,
  type Book,
  type Chapter,
  type Character,
} from "@/lib/store";
import type { WorldEncyclopediaRecord, WorldOrganization } from "@/lib/encyclopedia-types";
import { MediaImage } from "@/components/MediaImage";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";

export const Route = createFileRoute("/linha-do-tempo")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    livro?: string;
    evento?: string;
    era?: string;
    personagem?: string;
    casal?: string;
  } => {
    return {
      ...(typeof search?.livro === "string" ? { livro: search.livro } : {}),
      ...(typeof search?.evento === "string" ? { evento: search.evento } : {}),
      ...(typeof search?.era === "string" ? { era: search.era } : {}),
      ...(typeof search?.personagem === "string" ? { personagem: search.personagem } : {}),
      ...(typeof search?.casal === "string" ? { casal: search.casal } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Linha do Tempo Narrativa — Spectral Archive Studio" },
      {
        name: "description",
        content:
          "Organize os acontecimentos da sua história, conecte eventos e mantenha a cronologia da sua saga sob controle.",
      },
      { property: "og:title", content: "Linha do Tempo Narrativa — Spectral Archive Studio" },
      {
        property: "og:description",
        content:
          "Planejador cronológico e narrativa visual de sagas e livros no Spectral Archive Studio.",
      },
    ],
  }),
  component: LinhaDoTempoRoute,
});

type ViewMode = "timeline" | "eras" | "grid" | "character";
type SortOption = "chrono-asc" | "chrono-desc" | "recent" | "impact";

// Ícones correspondentes a cada tipo de evento
function getEventTypeIcon(type: TimelineEventType) {
  switch (type) {
    case "Marco Histórico":
      return Shield;
    case "Trama Principal":
      return Sparkles;
    case "Ponto de Virada":
      return Flame;
    case "Batalha & Confronto":
      return Swords;
    case "Revelação & Segredo":
      return Key;
    case "Romance & Vínculo":
      return Heart;
    case "Magia & Transformação":
      return Compass;
    case "Tragédia & Perda":
      return AlertCircle;
    case "Decisão Crucial":
      return Flame;
    case "Flashback & Memória":
      return History;
    case "Profecia & Visão":
      return Sparkles;
    default:
      return Clock;
  }
}

// Estilo visual e cor de badge por tipo de evento
function getEventTypeBadgeClass(type: TimelineEventType) {
  switch (type) {
    case "Marco Histórico":
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    case "Trama Principal":
      return "border-primary/40 bg-primary/10 text-primary";
    case "Ponto de Virada":
      return "border-rose-500/40 bg-rose-500/10 text-rose-300 font-semibold";
    case "Batalha & Confronto":
      return "border-red-500/40 bg-red-500/10 text-red-300";
    case "Revelação & Segredo":
      return "border-purple-500/40 bg-purple-500/10 text-purple-300";
    case "Romance & Vínculo":
      return "border-pink-500/40 bg-pink-500/10 text-pink-300";
    case "Magia & Transformação":
      return "border-teal-500/40 bg-teal-500/10 text-teal-300";
    case "Tragédia & Perda":
      return "border-zinc-500/40 bg-zinc-500/10 text-zinc-300";
    case "Decisão Crucial":
      return "border-orange-500/40 bg-orange-500/10 text-orange-300";
    case "Flashback & Memória":
      return "border-indigo-500/40 bg-indigo-500/10 text-indigo-300";
    case "Profecia & Visão":
      return "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

function getImpactBadge(impact: TimelineImpactLevel) {
  switch (impact) {
    case "Crucial / Ponto de Virada":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300 shadow-sm">
          <Sparkles className="h-3 w-3 text-amber-400" /> Crucial
        </span>
      );
    case "Alto Impacto":
      return (
        <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          Alto Impacto
        </span>
      );
    case "Impacto Moderado":
      return (
        <span className="inline-flex items-center rounded-full border border-border bg-secondary/80 px-2 py-0.5 text-[11px] text-muted-foreground">
          Moderado
        </span>
      );
    case "Secundário / Contexto":
      return (
        <span className="inline-flex items-center rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground/80">
          Secundário
        </span>
      );
  }
}

function LinhaDoTempoRoute() {
  const searchParams = Route.useSearch();
  const books = useStore((s) => s.books ?? []);
  const chapters = useStore((s) => s.chapters ?? []);
  const characters = useStore((s) => s.characters ?? []);
  const worldRecords = useStore((s) => s.worldRecords ?? []);
  const worldOrgs = useStore((s) => s.worldOrganizations ?? []);
  const events = useStore((s) => s.timelineEvents ?? []);
  const eras = useStore((s) => s.timelineEras ?? DEFAULT_TIMELINE_ERAS);

  // Pares de casais calculados a partir dos personagens
  const couples = useMemo(() => {
    return characters
      .filter((c) => c.partnerId && c.id < c.partnerId)
      .map((a) => {
        const b = characters.find((c) => c.id === a.partnerId);
        return {
          id: `${a.id}::${a.partnerId}`,
          charA: a,
          charB: b,
          label: `${a.name} & ${b?.name || "Par"}`,
        };
      })
      .filter((pair) => pair.charB);
  }, [characters]);

  // Estados locais de interface
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>(searchParams.livro || "all");
  const [selectedEraFilter, setSelectedEraFilter] = useState<string>(searchParams.era || "all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedImpactFilter, setSelectedImpactFilter] = useState<string>("all");
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<string>(
    searchParams.personagem || "all",
  );
  const [selectedCoupleFilter, setSelectedCoupleFilter] = useState<string>(
    searchParams.casal || "all",
  );
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyCanonical, setOnlyCanonical] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("chrono-asc");

  // Diálogos e Modais
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eraModalOpen, setEraModalOpen] = useState(false);
  const [newEraName, setNewEraName] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Rastreamento de personagem específico para o modo 4
  const [trackedCharacterId, setTrackedCharacterId] = useState<string>(characters[0]?.id || "");

  // Mapeamentos rápidos para exibição
  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const chapterMap = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);
  const charMap = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters]);
  const worldRecordMap = useMemo(() => new Map(worldRecords.map((w) => [w.id, w])), [worldRecords]);
  const orgMap = useMemo(() => new Map(worldOrgs.map((o) => [o.id, o])), [worldOrgs]);

  // Estatísticas da Linha do Tempo
  const stats = useMemo(() => {
    const total = events.length;
    const crucialCount = events.filter((e) => e.impactLevel === "Crucial / Ponto de Virada").length;
    const uniqueEras = new Set(events.map((e) => e.eraOrPeriod).filter(Boolean)).size;
    const uniqueChars = new Set(events.flatMap((e) => e.characterIds || [])).size;
    return {
      total,
      crucialCount,
      uniqueEras: uniqueEras || eras.length,
      uniqueChars,
    };
  }, [events, eras]);

  // Eventos filtrados e ordenados
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Busca textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = ev.title.toLowerCase().includes(q);
        const inDesc = ev.description.toLowerCase().includes(q);
        const inTags = (ev.tags || []).some((t) => t.toLowerCase().includes(q));
        const inDate = (ev.storyDate || "").toLowerCase().includes(q);
        const inEra = (ev.eraOrPeriod || "").toLowerCase().includes(q);
        const inLoc = (ev.locationName || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inTags && !inDate && !inEra && !inLoc) return false;
      }

      // Filtro de livro
      if (selectedBookFilter === "general") {
        if (ev.bookId) return false;
      } else if (selectedBookFilter !== "all") {
        if (ev.bookId !== selectedBookFilter) return false;
      }

      // Filtro de era
      if (selectedEraFilter !== "all") {
        if (ev.eraOrPeriod !== selectedEraFilter) return false;
      }

      // Filtro de tipo
      if (selectedTypeFilter !== "all") {
        if (ev.type !== selectedTypeFilter) return false;
      }

      // Filtro de impacto
      if (selectedImpactFilter !== "all") {
        if (ev.impactLevel !== selectedImpactFilter) return false;
      }

      // Filtro de personagem
      if (selectedCharacterFilter !== "all") {
        if (!(ev.characterIds || []).includes(selectedCharacterFilter)) return false;
      }

      // Filtro de casal
      if (selectedCoupleFilter !== "all") {
        if (ev.coupleId !== selectedCoupleFilter) return false;
      }

      // Filtro de favoritos
      if (onlyFavorites && !ev.isFavorite) return false;

      // Filtro de canônico
      if (onlyCanonical && !ev.isCanonical) return false;

      return true;
    });
  }, [
    events,
    searchQuery,
    selectedBookFilter,
    selectedEraFilter,
    selectedTypeFilter,
    selectedImpactFilter,
    selectedCharacterFilter,
    selectedCoupleFilter,
    onlyFavorites,
    onlyCanonical,
  ]);

  const sortedEvents = useMemo(() => {
    const list = [...filteredEvents];
    switch (sortBy) {
      case "chrono-asc":
        return list.sort((a, b) => (a.chronologicalOrder || 0) - (b.chronologicalOrder || 0));
      case "chrono-desc":
        return list.sort((a, b) => (b.chronologicalOrder || 0) - (a.chronologicalOrder || 0));
      case "recent":
        return list.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      case "impact": {
        const weight: Record<TimelineImpactLevel, number> = {
          "Crucial / Ponto de Virada": 4,
          "Alto Impacto": 3,
          "Impacto Moderado": 2,
          "Secundário / Contexto": 1,
        };
        return list.sort((a, b) => (weight[b.impactLevel] || 0) - (weight[a.impactLevel] || 0));
      }
      default:
        return list;
    }
  }, [filteredEvents, sortBy]);

  // Lista de eventos recentes (últimos 4 modificados)
  const recentEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, [filteredEvents]);

  // Agrupamento por Era
  const eventsByEra = useMemo(() => {
    const groups: { era: string; events: TimelineEvent[] }[] = [];
    const eraSet = new Set(eras);
    events.forEach((e) => {
      if (e.eraOrPeriod) eraSet.add(e.eraOrPeriod);
    });

    Array.from(eraSet).forEach((eraName) => {
      const eraEvs = sortedEvents.filter((e) => e.eraOrPeriod === eraName);
      if (eraEvs.length > 0) {
        groups.push({ era: eraName, events: eraEvs });
      }
    });

    // Eventos sem era definida
    const semEra = sortedEvents.filter((e) => !e.eraOrPeriod);
    if (semEra.length > 0) {
      groups.push({ era: "Sem Época Definida", events: semEra });
    }

    return groups;
  }, [sortedEvents, eras, events]);

  // Abertura de modal para criar ou editar
  const handleOpenNewEvent = (defaults?: Partial<TimelineEvent>) => {
    const initial = actions.newTimelineEvent({
      bookId:
        selectedBookFilter !== "all" && selectedBookFilter !== "general" ? selectedBookFilter : "",
      eraOrPeriod: selectedEraFilter !== "all" ? selectedEraFilter : eras[0] || "Presente da Saga",
      ...defaults,
    });
    setEditingEvent(initial);
    setEditorOpen(true);
  };

  const handleOpenEditEvent = (ev: TimelineEvent) => {
    setEditingEvent(structuredClone(ev));
    setEditorOpen(true);
  };

  const handleDuplicate = (id: string) => {
    const dup = actions.duplicateTimelineEvent(id);
    if (dup) {
      setEditingEvent(dup);
      setEditorOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    actions.deleteTimelineEvent(id);
    setDeleteConfirmId(null);
  };

  // Gerador de texto formatado da cronologia
  const generateExportText = () => {
    let out = `# CRONOLOGIA NARRATIVA — SPECTRAL ARCHIVE STUDIO\n`;
    out += `Gerado em: ${new Date().toLocaleDateString("pt-BR")}\n`;
    out += `Total de eventos: ${sortedEvents.length}\n\n`;

    sortedEvents.forEach((ev, idx) => {
      out += `--------------------------------------------------\n`;
      out += `${idx + 1}. [${ev.eraOrPeriod || "Época não definida"}] ${ev.title}\n`;
      if (ev.storyDate) out += `   Data na História: ${ev.storyDate}\n`;
      out += `   Tipo: ${ev.type} | Impacto: ${ev.impactLevel}\n`;
      if (ev.bookId) {
        const b = bookMap.get(ev.bookId);
        out += `   Livro: ${b?.title || ev.bookId}\n`;
      }
      if (ev.chapterId) {
        const c = chapterMap.get(ev.chapterId);
        out += `   Capítulo: ${c ? `Cap. ${c.number} — ${c.title}` : ev.chapterId}\n`;
      }
      if (ev.characterIds && ev.characterIds.length > 0) {
        const names = ev.characterIds
          .map((cid) => charMap.get(cid)?.name)
          .filter(Boolean)
          .join(", ");
        out += `   Personagens: ${names}\n`;
      }
      if (ev.description) {
        out += `\n   ${ev.description.replace(/\n/g, "\n   ")}\n`;
      }
      out += `\n`;
    });

    return out;
  };

  const handleCopyExportText = async () => {
    try {
      await navigator.clipboard.writeText(generateExportText());
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2600);
    } catch {
      // Fallback
    }
  };

  const handleDownloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `spectral-linha-do-tempo-${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <div className="mx-auto max-w-7xl pb-20">
      {/* 1. CABEÇALHO DA LINHA DO TEMPO */}
      <header className="mb-8 border-b border-border/60 pb-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <History className="h-5 w-5 text-icon-primary" />
              </span>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  Linha do Tempo Narrativa
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Organize os acontecimentos da sua história, conecte eventos e mantenha a
                  cronologia da sua saga sob controle.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação Principais */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenNewEvent()}
              className="btn flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              data-testid="btn-novo-evento"
            >
              <Plus className="h-4 w-4" />
              <span>Novo evento</span>
            </button>

            <button
              type="button"
              onClick={() => setEraModalOpen(true)}
              className="btn-ghost flex items-center gap-1.5 !text-xs"
              title="Gerenciar ou adicionar nova Era / Período cronológico"
            >
              <Layers className="h-3.5 w-3.5 text-icon-primary" />
              <span>Nova Era</span>
            </button>

            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="btn-ghost flex items-center gap-1.5 !text-xs"
              title="Exportar roteiro e resumo cronológico"
            >
              <Share2 className="h-3.5 w-3.5 text-icon-secondary" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* 2. CARDS DE RESUMO & ESTATÍSTICAS */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card-luxe flex items-center gap-3.5 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-icon-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground">Eventos Mapeados</span>
              <p className="font-display text-xl font-semibold leading-tight">{stats.total}</p>
            </div>
          </div>

          <div className="card-luxe flex items-center gap-3.5 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Flame className="h-5 w-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground">Pontos de Virada</span>
              <p className="font-display text-xl font-semibold leading-tight text-amber-300">
                {stats.crucialCount}
              </p>
            </div>
          </div>

          <div className="card-luxe flex items-center gap-3.5 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
              <Layers className="h-5 w-5 text-icon-secondary" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground">Eras & Épocas</span>
              <p className="font-display text-xl font-semibold leading-tight">{stats.uniqueEras}</p>
            </div>
          </div>

          <div className="card-luxe flex items-center gap-3.5 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-300" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground">Personagens Ativos</span>
              <p className="font-display text-xl font-semibold leading-tight">
                {stats.uniqueChars}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. EVENTOS RECENTES (ATALHO RÁPIDO) */}
      {recentEvents.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-icon-primary" />
              Eventos Recentes
            </h2>
            <span className="text-[11px] text-muted-foreground">Últimos modificados</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {recentEvents.map((re) => {
              const TypeIcon = getEventTypeIcon(re.type);
              return (
                <div
                  key={re.id}
                  onClick={() => handleOpenEditEvent(re)}
                  className="card-luxe group flex cursor-pointer items-center justify-between gap-3 p-3 transition-all hover:border-primary/50 hover:bg-secondary/70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="truncate">{re.eraOrPeriod}</span>
                      {re.storyDate && <span>· {re.storyDate}</span>}
                    </div>
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {re.title}
                    </p>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:text-primary">
                    <TypeIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. BARRA DE FILTROS, BUSCA E MODOS DE VISUALIZAÇÃO */}
      <section className="mb-6 space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por título, descrição, tags, data ou local..."
              className="w-full rounded-xl border border-input bg-background/80 py-2 pl-9 pr-8 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Seletor de Modos de Visualização */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background/60 p-1">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "timeline"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Linha do Tempo Vertical Contínua"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cronológica</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("eras")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "eras"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Agrupado por Eras ou Livros"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Por Eras</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grade de Cartões Visuais"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cartões</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("character")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "character"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Acompanhar Jornada de Personagem ou Casal"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Por Personagem</span>
            </button>
          </div>
        </div>

        {/* Linha de Filtros Detalhados */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {/* Seletor de Livro / Universo */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Livro / Universo
            </label>
            <select
              value={selectedBookFilter}
              onChange={(e) => setSelectedBookFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/90 px-2 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="all">Toda a Saga (Todos)</option>
              <option value="general">Geral / Universo Global</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  Livro {b.order}: {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Era */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Era / Época
            </label>
            <select
              value={selectedEraFilter}
              onChange={(e) => setSelectedEraFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/90 px-2 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="all">Todas as Eras</option>
              {eras.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de Evento
            </label>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/90 px-2 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="all">Todos os Tipos</option>
              {TIMELINE_EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Impacto */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Impacto Narrativo
            </label>
            <select
              value={selectedImpactFilter}
              onChange={(e) => setSelectedImpactFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/90 px-2 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="all">Qualquer Impacto</option>
              {TIMELINE_IMPACT_LEVELS.map((imp) => (
                <option key={imp} value={imp}>
                  {imp}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Personagem */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Personagem
            </label>
            <select
              value={selectedCharacterFilter}
              onChange={(e) => setSelectedCharacterFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/90 px-2 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="all">Todos os Personagens</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Ordenação
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-lg border border-input bg-background/90 px-2 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="chrono-asc">Cronológica (Início → Fim)</option>
              <option value="chrono-desc">Cronológica (Fim → Início)</option>
              <option value="recent">Modificados Recentemente</option>
              <option value="impact">Cruciais Primeiro</option>
            </select>
          </div>
        </div>

        {/* Linha de Filtros Rápidos / Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFavorites((f) => !f)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                onlyFavorites
                  ? "border border-amber-400 bg-amber-400/20 text-amber-300 font-medium"
                  : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className={`h-3 w-3 ${onlyFavorites ? "fill-amber-400 text-amber-400" : ""}`} />
              Favoritos
            </button>

            <button
              type="button"
              onClick={() => setOnlyCanonical((c) => !c)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                onlyCanonical
                  ? "border border-primary bg-primary/20 text-primary font-medium"
                  : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Check className="h-3 w-3" />
              Apenas Canônicos
            </button>

            {couples.length > 0 && (
              <select
                value={selectedCoupleFilter}
                onChange={(e) => setSelectedCoupleFilter(e.target.value)}
                className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground outline-none"
              >
                <option value="all">Qualquer Casal</option>
                {couples.map((c) => (
                  <option key={c.id} value={c.id}>
                    Casal: {c.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground">
            Exibindo <strong>{sortedEvents.length}</strong> de {events.length} acontecimentos
          </div>
        </div>
      </section>

      {/* 5. ÁREA PRINCIPAL: VISUALIZAÇÕES */}
      {sortedEvents.length === 0 ? (
        /* ESTADO VAZIO CONVIDATIVO */
        <div className="card-luxe mt-8 p-12 text-center" data-testid="empty-timeline-state">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <History className="h-8 w-8 text-icon-primary" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold">
            {events.length === 0
              ? "Sua saga aguarda os primeiros acontecimentos"
              : "Nenhum evento encontrado com os filtros selecionados"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {events.length === 0
              ? "Reúna datas históricas, batalhas épicas, momentos românticos e reviravoltas da história. Conecte cada evento a livros, capítulos e personagens para não perder nenhum detalhe da cronologia."
              : "Tente limpar os filtros de busca ou selecionar outro livro ou período da história."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenNewEvent()}
              className="btn flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Criar Primeiro Evento
            </button>
            {events.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBookFilter("all");
                  setSelectedEraFilter("all");
                  setSelectedTypeFilter("all");
                  setSelectedImpactFilter("all");
                  setSelectedCharacterFilter("all");
                  setSelectedCoupleFilter("all");
                  setOnlyFavorites(false);
                  setOnlyCanonical(false);
                }}
                className="btn-ghost"
              >
                Limpar Todos os Filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* MODO 1: LINHA DO TEMPO VERTICAL CONTÍNUA */}
          {viewMode === "timeline" && (
            <div className="relative pl-6 sm:pl-10">
              {/* Linha vertical mestra com gradiente */}
              <div
                className="absolute bottom-4 left-3 top-4 w-0.5 sm:left-5"
                style={{
                  background:
                    "linear-gradient(to bottom, var(--primary), var(--icon-secondary), var(--border))",
                }}
              />

              <div className="space-y-8">
                {sortedEvents.map((ev, idx) => {
                  const TypeIcon = getEventTypeIcon(ev.type);
                  const isCrucial = ev.impactLevel === "Crucial / Ponto de Virada";
                  const book = ev.bookId ? bookMap.get(ev.bookId) : null;
                  const chapter = ev.chapterId ? chapterMap.get(ev.chapterId) : null;
                  const prevEv = ev.previousEventId
                    ? events.find((x) => x.id === ev.previousEventId)
                    : null;
                  const nextEv = ev.nextEventId
                    ? events.find((x) => x.id === ev.nextEventId)
                    : null;

                  return (
                    <div key={ev.id} className="relative group">
                      {/* Nó / Marcador da Linha do Tempo */}
                      <div
                        className={`absolute -left-6 top-3 flex h-7 w-7 sm:-left-10 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-transform duration-200 group-hover:scale-110 ${
                          isCrucial
                            ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20"
                            : "border-primary bg-card text-icon-primary"
                        }`}
                      >
                        <TypeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>

                      {/* Card do Evento */}
                      <article
                        className={`card-luxe transition-all duration-200 hover:border-primary/60 hover:shadow-lg ${
                          isCrucial ? "border-amber-500/30 bg-amber-500/[0.02]" : ""
                        }`}
                      >
                        <div className="p-4 sm:p-5">
                          {/* Topo do Card: Era, Data, Tipo e Ações */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Era / Época */}
                              <span className="rounded-md border border-border bg-secondary/80 px-2 py-0.5 text-xs font-medium text-foreground">
                                {ev.eraOrPeriod}
                              </span>

                              {/* Data narrativa */}
                              {ev.storyDate && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 text-icon-primary" />
                                  {ev.storyDate}
                                </span>
                              )}

                              {/* Tipo com Badge Colorido */}
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${getEventTypeBadgeClass(
                                  ev.type,
                                )}`}
                              >
                                <TypeIcon className="h-3 w-3" />
                                {ev.type}
                              </span>

                              {/* Impacto */}
                              {getImpactBadge(ev.impactLevel)}

                              {!ev.isCanonical && (
                                <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                                  Rascunho / Hipótese
                                </span>
                              )}
                            </div>

                            {/* Botões de Ação do Nó */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => actions.toggleFavoriteTimelineEvent(ev.id)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-amber-400"
                                title={ev.isFavorite ? "Desfavoritar" : "Favoritar"}
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    ev.isFavorite ? "fill-amber-400 text-amber-400" : ""
                                  }`}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicate(ev.id)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                title="Duplicar evento"
                              >
                                <Copy className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditEvent(ev)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary"
                                title="Editar evento"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(ev.id)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
                                title="Excluir evento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Corpo: Título e Detalhes */}
                          <div className="mt-3">
                            <h2 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
                              {ev.title}
                            </h2>

                            {/* Imagem de Referência do Evento se existir */}
                            {ev.coverImageUrl && (
                              <div className="my-3 overflow-hidden rounded-xl border border-border/80 max-h-60 max-w-md bg-secondary/40">
                                <MediaImage
                                  src={ev.coverImageUrl}
                                  alt={ev.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}

                            {/* Descrição */}
                            {ev.description && (
                              <div className="mt-2.5 whitespace-pre-line text-sm text-muted-foreground/90 leading-relaxed">
                                {ev.description}
                              </div>
                            )}

                            {/* Anotações do autor se houver */}
                            {ev.authorNotes && (
                              <div className="mt-3 rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  Notas do Autor:{" "}
                                </span>
                                {ev.authorNotes}
                              </div>
                            )}
                          </div>

                          {/* Rodapé do Card: Vínculos (Livro, Capítulo, Local, Personagens, Tags) */}
                          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40 text-xs">
                            {/* Livro vinculado */}
                            {book ? (
                              <Link
                                to="/livros/$id"
                                params={{ id: book.id }}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/60 px-2 py-1 text-foreground transition-colors hover:border-primary/50"
                              >
                                <BookOpen className="h-3 w-3 text-icon-primary" />
                                <span>Livro: {book.title}</span>
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-secondary/30 px-2 py-1 text-muted-foreground">
                                <Globe2 className="h-3 w-3 text-icon-secondary" />
                                Saga Global
                              </span>
                            )}

                            {/* Capítulo vinculado */}
                            {chapter && (
                              <Link
                                to="/capitulos"
                                search={{ livro: chapter.bookId, capitulo: chapter.id }}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/60 px-2 py-1 text-foreground transition-colors hover:border-primary/50"
                              >
                                <FileText className="h-3 w-3 text-icon-primary" />
                                <span>
                                  Cap. {chapter.number} — {chapter.title}
                                </span>
                              </Link>
                            )}

                            {/* Local / Cenário */}
                            {(ev.locationName || ev.worldRecordId) && (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2 py-1 text-muted-foreground">
                                <Globe2 className="h-3 w-3 text-teal-400" />
                                {ev.locationName || worldRecordMap.get(ev.worldRecordId!)?.title}
                              </span>
                            )}

                            {/* Personagens Participantes */}
                            {ev.characterIds && ev.characterIds.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                                {ev.characterIds.map((cid) => {
                                  const c = charMap.get(cid);
                                  if (!c) return null;
                                  return (
                                    <Link
                                      key={c.id}
                                      to="/personagens/$id"
                                      params={{ id: c.id }}
                                      className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[11px] text-foreground transition-colors hover:border-primary hover:text-primary"
                                    >
                                      {c.photo ? (
                                        <MediaImage
                                          src={c.photo}
                                          alt={c.name}
                                          className="h-3.5 w-3.5 rounded-full object-cover"
                                        />
                                      ) : (
                                        <span className="h-3.5 w-3.5 rounded-full bg-primary/20 text-[9px] font-bold text-primary flex items-center justify-center">
                                          {c.name[0]}
                                        </span>
                                      )}
                                      <span>{c.name}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}

                            {/* Casal Vinculado */}
                            {ev.coupleId && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-[11px] text-pink-300">
                                <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                                {couples.find((cp) => cp.id === ev.coupleId)?.label || "Casal"}
                              </span>
                            )}

                            {/* Causa e Consequência */}
                            {prevEv && (
                              <span
                                onClick={() => handleOpenEditEvent(prevEv)}
                                className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-border/70 bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                title={`Causa anterior: ${prevEv.title}`}
                              >
                                <span>Causa: {prevEv.title}</span>
                              </span>
                            )}

                            {nextEv && (
                              <span
                                onClick={() => handleOpenEditEvent(nextEv)}
                                className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-border/70 bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                title={`Consequência: ${nextEv.title}`}
                              >
                                <span>Consequência: {nextEv.title}</span>
                              </span>
                            )}

                            {/* Tags */}
                            {ev.tags &&
                              ev.tags.map((tg) => (
                                <span
                                  key={tg}
                                  className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  <Tag className="h-2.5 w-2.5" />
                                  {tg}
                                </span>
                              ))}
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO 2: AGRUPADO POR ERAS */}
          {viewMode === "eras" && (
            <div className="space-y-6">
              {eventsByEra.map((group) => (
                <div key={group.era} className="card-luxe overflow-hidden p-5">
                  <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-5 w-5 text-icon-primary" />
                      <div>
                        <h2 className="font-display text-2xl font-semibold">{group.era}</h2>
                        <span className="text-xs text-muted-foreground">
                          {group.events.length} acontecimentos nesta época
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenNewEvent({ eraOrPeriod: group.era })}
                      className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Adicionar nesta Era
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {group.events.map((ev) => {
                      const TypeIcon = getEventTypeIcon(ev.type);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => handleOpenEditEvent(ev)}
                          className="group flex cursor-pointer flex-col justify-between rounded-xl border border-border/70 bg-secondary/30 p-3.5 transition-all hover:border-primary hover:bg-secondary/70"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                              <span>{ev.storyDate || "Data não especificada"}</span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] border ${getEventTypeBadgeClass(
                                  ev.type,
                                )}`}
                              >
                                {ev.type}
                              </span>
                            </div>
                            <h3 className="mt-1.5 font-display text-lg font-medium text-foreground group-hover:text-primary">
                              {ev.title}
                            </h3>
                            {ev.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {ev.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                            <span>{ev.impactLevel}</span>
                            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              Editar →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODO 3: GRADE VISUAL DE CARTÕES */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedEvents.map((ev) => {
                const TypeIcon = getEventTypeIcon(ev.type);
                return (
                  <article
                    key={ev.id}
                    className="card-luxe group flex flex-col justify-between overflow-hidden transition-all hover:border-primary/60"
                  >
                    {ev.coverImageUrl && (
                      <div className="h-36 w-full overflow-hidden bg-secondary">
                        <MediaImage
                          src={ev.coverImageUrl}
                          alt={ev.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
                          <span>{ev.eraOrPeriod}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] border ${getEventTypeBadgeClass(
                              ev.type,
                            )}`}
                          >
                            {ev.type}
                          </span>
                        </div>

                        <h3 className="mt-2 font-display text-xl font-semibold text-foreground group-hover:text-primary">
                          {ev.title}
                        </h3>

                        {ev.storyDate && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Data: {ev.storyDate}
                          </p>
                        )}

                        {ev.description && (
                          <p className="mt-2 line-clamp-3 text-xs text-muted-foreground/90">
                            {ev.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                        {getImpactBadge(ev.impactLevel)}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => actions.toggleFavoriteTimelineEvent(ev.id)}
                            className="p-1 text-muted-foreground hover:text-amber-400"
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                ev.isFavorite ? "fill-amber-400 text-amber-400" : ""
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditEvent(ev)}
                            className="btn-ghost !min-h-7 !px-2 text-xs"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* MODO 4: ACOMPANHAR JORNADA DO PERSONAGEM OU CASAL */}
          {viewMode === "character" && (
            <div className="space-y-6">
              {/* Seletor de Personagem em Foco */}
              <div className="card-luxe p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Selecione o Personagem para Rastrear o Arco Cronológico:
                </label>
                <div className="flex flex-wrap gap-2">
                  {characters.map((c) => {
                    const isSelected = c.id === trackedCharacterId;
                    const charEventsCount = events.filter((e) =>
                      (e.characterIds || []).includes(c.id),
                    ).length;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTrackedCharacterId(c.id)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-md"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {c.photo ? (
                          <MediaImage
                            src={c.photo}
                            alt={c.name}
                            className="h-4 w-4 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">
                            {c.name[0]}
                          </span>
                        )}
                        <span>{c.name}</span>
                        <span
                          className={`rounded-full px-1.5 text-[10px] ${
                            isSelected ? "bg-black/20 text-white" : "bg-card text-muted-foreground"
                          }`}
                        >
                          {charEventsCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cronologia Pessoal do Personagem */}
              {(() => {
                const char = charMap.get(trackedCharacterId);
                const charEvents = sortedEvents.filter((e) =>
                  (e.characterIds || []).includes(trackedCharacterId),
                );

                if (!char) {
                  return (
                    <div className="card-luxe p-8 text-center text-muted-foreground">
                      Nenhum personagem selecionado.
                    </div>
                  );
                }

                return (
                  <div>
                    <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-3">
                        {char.photo ? (
                          <MediaImage
                            src={char.photo}
                            alt={char.name}
                            className="h-12 w-12 rounded-2xl object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-xl font-bold text-primary">
                            {char.name[0]}
                          </div>
                        )}
                        <div>
                          <h2 className="font-display text-2xl font-semibold">
                            Arco Cronológico de {char.name}
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            {charEvents.length} acontecimentos com a presença direta deste
                            personagem
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/personagens/$id"
                        params={{ id: char.id }}
                        className="btn-ghost !min-h-8 !px-3 text-xs"
                      >
                        Ver Ficha Completa →
                      </Link>
                    </div>

                    {charEvents.length === 0 ? (
                      <div className="card-luxe p-8 text-center">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {char.name} ainda não foi vinculado a nenhum evento da Linha do Tempo.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenNewEvent({ characterIds: [trackedCharacterId] })}
                          className="btn mt-4 !min-h-8 text-xs"
                        >
                          ＋ Adicionar Evento com {char.name}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {charEvents.map((ev, i) => (
                          <div
                            key={ev.id}
                            onClick={() => handleOpenEditEvent(ev)}
                            className="card-luxe cursor-pointer p-4 transition-all hover:border-primary/60"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span>
                                #{i + 1} · {ev.eraOrPeriod} {ev.storyDate && `— ${ev.storyDate}`}
                              </span>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] border ${getEventTypeBadgeClass(
                                  ev.type,
                                )}`}
                              >
                                {ev.type}
                              </span>
                            </div>
                            <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                              {ev.title}
                            </h3>
                            {ev.description && (
                              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {ev.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* 6. MODAL COMPLETO DE CRIAÇÃO E EDIÇÃO DO EVENTO */}
      {editorOpen && editingEvent && (
        <EventEditorModal
          event={editingEvent}
          books={books}
          chapters={chapters}
          characters={characters}
          couples={couples}
          eras={eras}
          worldRecords={worldRecords}
          worldOrgs={worldOrgs}
          allEvents={events}
          onClose={() => {
            setEditorOpen(false);
            setEditingEvent(null);
          }}
          onSave={(savedEv) => {
            actions.saveTimelineEvent(savedEv);
            setEditorOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* 7. DIÁLOGO DE ADIÇÃO DE NOVA ERA */}
      {eraModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setEraModalOpen(false)}
        >
          <div
            className="card-luxe w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-icon-primary" />
                <h3 className="font-display text-xl font-semibold">Gerenciar Eras & Épocas</h3>
              </div>
              <button
                type="button"
                onClick={() => setEraModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-foreground mb-1">
                Nome da Nova Era ou Período:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEraName}
                  onChange={(e) => setNewEraName(e.target.value)}
                  placeholder="Ex: Terceira Idade, Anos Sombrios, Paz Dourada..."
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newEraName.trim()) {
                      actions.addTimelineEra(newEraName.trim());
                      setNewEraName("");
                    }
                  }}
                  className="btn !min-h-9 !px-4 text-xs"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Eras Atuais:
              </label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {eras.map((era) => (
                  <div
                    key={era}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-xs"
                  >
                    <span>{era}</span>
                    <button
                      type="button"
                      onClick={() => actions.deleteTimelineEra(era)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remover Era"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setEraModalOpen(false)}
                className="btn !min-h-9 text-xs"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL DE EXPORTAÇÃO DA CRONOLOGIA */}
      {exportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setExportModalOpen(false)}
        >
          <div
            className="card-luxe flex max-h-[85vh] w-full max-w-2xl flex-col p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-icon-secondary" />
                <h3 className="font-display text-xl font-semibold">Exportar Linha do Tempo</h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              <p className="text-xs text-muted-foreground mb-2">
                Prévia textual formatada da cronologia narrativa atual (pronta para copiar e colar
                no seu editor de texto ou baixar em arquivo JSON):
              </p>
              <textarea
                readOnly
                value={generateExportText()}
                className="h-72 w-full rounded-xl border border-input bg-secondary/30 p-3 font-mono text-xs leading-relaxed outline-none"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
              <div className="text-xs text-muted-foreground">
                {copiedNotification && (
                  <span className="font-semibold text-primary">
                    ✓ Copiado para a área de transferência!
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="btn-ghost flex items-center gap-1.5 !min-h-9 !px-3 text-xs"
                >
                  <Download className="h-4 w-4" /> Baixar JSON
                </button>
                <button
                  type="button"
                  onClick={handleCopyExportText}
                  className="btn flex items-center gap-1.5 !min-h-9 !px-4 text-xs"
                >
                  <Copy className="h-4 w-4" /> Copiar Texto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="card-luxe w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-destructive">
              Excluir este evento?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Esta ação removerá o evento da linha do tempo. Essa operação não pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="btn-ghost !min-h-8 !px-3 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn !min-h-8 !px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// MODAL EDITOR COMPLETO DE EVENTO
// ===========================================================================
function EventEditorModal({
  event: initialEvent,
  books,
  chapters,
  characters,
  couples,
  eras,
  worldRecords,
  worldOrgs,
  allEvents,
  onClose,
  onSave,
}: {
  event: TimelineEvent;
  books: Book[];
  chapters: Chapter[];
  characters: Character[];
  couples: { id: string; label: string }[];
  eras: string[];
  worldRecords: WorldEncyclopediaRecord[];
  worldOrgs: WorldOrganization[];
  allEvents: TimelineEvent[];
  onClose: () => void;
  onSave: (ev: TimelineEvent) => void;
}) {
  const [ev, setEv] = useState<TimelineEvent>({ ...initialEvent });
  const [activeTab, setActiveTab] = useState<
    "geral" | "cronologia" | "narrativa" | "vinculos" | "visual"
  >("geral");
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capítulos filtrados para o livro selecionado no formulário
  const bookChapters = useMemo(() => {
    if (!ev.bookId) return [];
    return chapters.filter((c) => c.bookId === ev.bookId);
  }, [chapters, ev.bookId]);

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !ev.tags.includes(val)) {
      setEv({ ...ev, tags: [...ev.tags, val] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEv({ ...ev, tags: ev.tags.filter((t) => t !== tag) });
  };

  const handleToggleCharacter = (charId: string) => {
    const exists = ev.characterIds.includes(charId);
    setEv({
      ...ev,
      characterIds: exists
        ? ev.characterIds.filter((id) => id !== charId)
        : [...ev.characterIds, charId],
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      const ref = await storeMediaDataUrl(`tle_${Date.now()}`, dataUrl);
      setEv({ ...ev, coverImageUrl: ref });
    } catch {
      // Ignorar erro
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="card-luxe flex h-[94vh] max-h-[900px] w-full max-w-4xl min-w-0 flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="event-editor-modal"
      >
        {/* Cabeçalho do Editor (Fixo no topo do modal) */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary">
              <History className="h-4 w-4 sm:h-5 sm:w-5 text-icon-primary" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg sm:text-xl font-semibold truncate leading-tight">
                {ev.title.trim() ? ev.title : "Novo Evento Narrativo"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Cadastre as informações cronológicas e os vínculos deste acontecimento.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar editor"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Abas de Navegação no Editor (Rolagem horizontal independente das abas) */}
        <div className="shrink-0 border-b border-border/60 bg-secondary/15 px-3 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1 text-xs whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab("geral")}
              className={`shrink-0 rounded-lg px-3 py-2 font-medium transition-colors ${
                activeTab === "geral"
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              Identificação
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cronologia")}
              className={`shrink-0 rounded-lg px-3 py-2 font-medium transition-colors ${
                activeTab === "cronologia"
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              Cronologia & Época
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("narrativa")}
              className={`shrink-0 rounded-lg px-3 py-2 font-medium transition-colors ${
                activeTab === "narrativa"
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              Narrativa & Descrição
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vinculos")}
              className={`shrink-0 rounded-lg px-3 py-2 font-medium transition-colors ${
                activeTab === "vinculos"
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              Vínculos & Personagens
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={`shrink-0 rounded-lg px-3 py-2 font-medium transition-colors ${
                activeTab === "visual"
                  ? "bg-background text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              Imagem & Estética
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas com Rolagem Vertical Dedicada */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 min-w-0">
          {/* ABA 1: IDENTIFICAÇÃO GERAL */}
          {activeTab === "geral" && (
            <div className="space-y-4 max-w-full">
              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  value={ev.title}
                  onChange={(e) => setEv({ ...ev, title: e.target.value })}
                  placeholder="Ex: A Queda do Palácio de Vidro, O Primeiro Beijo sob as Estrelas..."
                  data-testid="event-title-input"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Tipo de Evento
                  </label>
                  <select
                    value={ev.type}
                    onChange={(e) => setEv({ ...ev, type: e.target.value as TimelineEventType })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {TIMELINE_EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Nível de Impacto na História
                  </label>
                  <select
                    value={ev.impactLevel}
                    onChange={(e) =>
                      setEv({ ...ev, impactLevel: e.target.value as TimelineImpactLevel })
                    }
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {TIMELINE_IMPACT_LEVELS.map((imp) => (
                      <option key={imp} value={imp}>
                        {imp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {ev.type === "Personalizado" && (
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Nome do Tipo Personalizado
                  </label>
                  <input
                    type="text"
                    value={ev.customType || ""}
                    onChange={(e) => setEv({ ...ev, customType: e.target.value })}
                    placeholder="Ex: Cerimônia de Iniciação, Eclipse Lendário..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Momento Narrativo
                  </label>
                  <select
                    value={ev.narrativeMoment}
                    onChange={(e) =>
                      setEv({ ...ev, narrativeMoment: e.target.value as TimelineNarrativeMoment })
                    }
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {TIMELINE_NARRATIVE_MOMENTS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-1 md:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={ev.isCanonical}
                      onChange={(e) => setEv({ ...ev, isCanonical: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Evento Canônico</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={ev.isFavorite}
                      onChange={(e) => setEv({ ...ev, isFavorite: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Favorito</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: CRONOLOGIA & ÉPOCA */}
          {activeTab === "cronologia" && (
            <div className="space-y-4 max-w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Era / Época / Período *
                  </label>
                  <select
                    value={ev.eraOrPeriod}
                    onChange={(e) => setEv({ ...ev, eraOrPeriod: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {eras.map((era) => (
                      <option key={era} value={era}>
                        {era}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Data Narrativa Dentro da História
                  </label>
                  <input
                    type="text"
                    value={ev.storyDate}
                    onChange={(e) => setEv({ ...ev, storyDate: e.target.value })}
                    placeholder="Ex: 14 de Solstício, Ano 420 ou 3 anos antes da Queda"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Ano Fictício
                  </label>
                  <input
                    type="text"
                    value={ev.fictionalYear ?? ""}
                    onChange={(e) => setEv({ ...ev, fictionalYear: e.target.value })}
                    placeholder="Ex: 420 ou -150"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Mês Fictício
                  </label>
                  <input
                    type="text"
                    value={ev.fictionalMonth ?? ""}
                    onChange={(e) => setEv({ ...ev, fictionalMonth: e.target.value })}
                    placeholder="Ex: Brumário, Lua Azul"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Dia Fictício
                  </label>
                  <input
                    type="text"
                    value={ev.fictionalDay ?? ""}
                    onChange={(e) => setEv({ ...ev, fictionalDay: e.target.value })}
                    placeholder="Ex: 14 ou Solstício"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Ordem Cronológica Numérica (para ordenação linear)
                </label>
                <input
                  type="number"
                  value={ev.chronologicalOrder}
                  onChange={(e) =>
                    setEv({ ...ev, chronologicalOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Valores menores ocorrem antes no tempo. Use intervalos (ex: 10, 20, 30) para
                  facilitar inserções futuras.
                </p>
              </div>
            </div>
          )}

          {/* ABA 3: NARRATIVA & DESCRIÇÃO */}
          {activeTab === "narrativa" && (
            <div className="space-y-4 max-w-full">
              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Descrição Detalhada do Acontecimento
                </label>
                <textarea
                  rows={5}
                  value={ev.description}
                  onChange={(e) => setEv({ ...ev, description: e.target.value })}
                  placeholder="Descreva o que acontece neste momento crucial, o contexto das ações e como a cena se desenrola..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px]"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Anotações de Bastidores / Notas do Autor
                </label>
                <textarea
                  rows={3}
                  value={ev.authorNotes || ""}
                  onChange={(e) => setEv({ ...ev, authorNotes: e.target.value })}
                  placeholder="Ideias a desenvolver, foreshadowing a plantar nos capítulos anteriores, pistas para o leitor..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary min-h-[80px]"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Tags Personalizadas
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
                    placeholder="Adicionar tag (ex: batalha, revelação, magia)..."
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-ghost !min-h-8 !px-3 text-xs shrink-0"
                  >
                    Adicionar
                  </button>
                </div>
                {ev.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {ev.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/80 px-2.5 py-0.5 text-xs text-foreground"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 4: VÍNCULOS & PERSONAGENS */}
          {activeTab === "vinculos" && (
            <div className="space-y-4 max-w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Livro Vinculado
                  </label>
                  <select
                    value={ev.bookId || ""}
                    onChange={(e) => setEv({ ...ev, bookId: e.target.value, chapterId: "" })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Geral / Saga Inteira</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        Livro {b.order}: {b.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Capítulo Vinculado
                  </label>
                  <select
                    value={ev.chapterId || ""}
                    onChange={(e) => setEv({ ...ev, chapterId: e.target.value })}
                    disabled={!ev.bookId || bookChapters.length === 0}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="">Nenhum capítulo específico</option>
                    {bookChapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        Cap. {c.number} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Local / Reino da Enciclopédia
                  </label>
                  <select
                    value={ev.worldRecordId || ""}
                    onChange={(e) => setEv({ ...ev, worldRecordId: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Selecionar local da Enciclopédia...</option>
                    {worldRecords.map((wr) => (
                      <option key={wr.id} value={wr.id}>
                        {wr.category}: {wr.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Nome Livre do Cenário / Local
                  </label>
                  <input
                    type="text"
                    value={ev.locationName || ""}
                    onChange={(e) => setEv({ ...ev, locationName: e.target.value })}
                    placeholder="Ex: Ponte das Lágrimas, Salão Real..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Casal Relacionado */}
              {couples.length > 0 && (
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Casal Romântico Vinculado
                  </label>
                  <select
                    value={ev.coupleId || ""}
                    onChange={(e) => setEv({ ...ev, coupleId: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Nenhum casal específico</option>
                    {couples.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conexões de Causa e Efeito */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Evento Anterior / Causa
                  </label>
                  <select
                    value={ev.previousEventId || ""}
                    onChange={(e) => setEv({ ...ev, previousEventId: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Sem evento anterior direto</option>
                    {allEvents
                      .filter((x) => x.id !== ev.id)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.eraOrPeriod}: {x.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Evento Posterior / Consequência
                  </label>
                  <select
                    value={ev.nextEventId || ""}
                    onChange={(e) => setEv({ ...ev, nextEventId: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Sem evento posterior direto</option>
                    {allEvents
                      .filter((x) => x.id !== ev.id)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.eraOrPeriod}: {x.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Seleção de Personagens Presentes */}
              <div className="pt-2 border-t border-border/40 min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Personagens Presentes ou Diretamente Envolvidos:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {characters.map((c) => {
                    const isChecked = ev.characterIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleToggleCharacter(c.id)}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-colors min-w-0 ${
                          isChecked
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                        }`}
                      >
                        {c.photo ? (
                          <MediaImage
                            src={c.photo}
                            alt={c.name}
                            className="h-6 w-6 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-primary/20 text-[10px] font-bold text-primary flex items-center justify-center shrink-0">
                            {c.name[0]}
                          </div>
                        )}
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ABA 5: IMAGEM & ESTÉTICA */}
          {activeTab === "visual" && (
            <div className="space-y-4 max-w-full">
              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Imagem de Cena ou Referência Visual
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={ev.coverImageUrl || ""}
                    onChange={(e) => setEv({ ...ev, coverImageUrl: e.target.value })}
                    placeholder="Cole uma URL de imagem externa ou faça upload..."
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary min-w-0"
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
                    className="btn-ghost flex items-center justify-center gap-1.5 !min-h-9 !px-3.5 text-xs shrink-0"
                  >
                    <Upload className="h-4 w-4" /> Enviar do dispositivo
                  </button>
                </div>
              </div>

              {ev.coverImageUrl && (
                <div className="relative mt-2 overflow-hidden rounded-xl border border-border bg-secondary/40 max-w-md max-h-72">
                  <MediaImage
                    src={ev.coverImageUrl}
                    alt={ev.title}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setEv({ ...ev, coverImageUrl: "" })}
                    className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Fixo com Botões Salvar e Cancelar */}
        <div className="shrink-0 flex items-center justify-between border-t border-border/60 bg-secondary/20 px-4 py-3 sm:px-6 sm:py-3.5">
          <button type="button" onClick={onClose} className="btn-ghost !min-h-9 text-xs">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (!ev.title.trim()) {
                alert("Por favor, preencha o título do evento.");
                return;
              }
              onSave(ev);
            }}
            className="btn flex items-center gap-2 !min-h-9 !px-5 text-xs shadow-md"
            data-testid="btn-salvar-evento"
          >
            <Check className="h-4 w-4" />
            <span>Salvar Evento</span>
          </button>
        </div>
      </div>
    </div>
  );
}

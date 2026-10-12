import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ScrollText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Save,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Users,
  Globe2,
  Building2,
  Clock,
  Sparkles,
  Check,
  X,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
  Compass,
  Flame,
  Heart,
  Anchor,
  Lock,
  Calendar,
} from "lucide-react";
import {
  useStore,
  actions,
  resolveCharacterModel,
  CHAPTER_TYPES,
  CHAPTER_STATUSES,
  type Chapter,
  type ChapterType,
  type ChapterStatus,
  type ChapterImportantEvent,
} from "@/lib/store";
import { Cover } from "@/components/Cover";
import {
  RichTextWordEditor,
  sanitizeRichHtml,
  normalizeSummaryToHtml,
  extractPlainTextFromHtml,
} from "@/components/chapters/RichTextWordEditor";

export const Route = createFileRoute("/capitulos")({
  validateSearch: (search: Record<string, unknown>): { livro?: string; capitulo?: string } => {
    return {
      ...(typeof search?.livro === "string" ? { livro: search.livro } : {}),
      ...(typeof search?.capitulo === "string" ? { capitulo: search.capitulo } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Capítulos e Sinopses — Juramentos Studio" },
      {
        name: "description",
        content:
          "Organização de capítulos, sinopses, editor rico estilo Microsoft Word e acompanhamento de progresso da escrita.",
      },
      { property: "og:title", content: "Capítulos e Sinopses — Juramentos Studio" },
      {
        property: "og:description",
        content:
          "Organização de capítulos, sinopses, editor rico estilo Microsoft Word e acompanhamento de progresso da escrita.",
      },
    ],
  }),
  component: CapitulosPage,
});

const STATUS_WEIGHT: Record<ChapterStatus, number> = {
  "Não iniciado": 1,
  Planejado: 2,
  "Em escrita": 3,
  Escrito: 4,
  "Em revisão": 5,
  Revisado: 6,
  Finalizado: 7,
};

export function CapitulosPage() {
  const searchParams = Route.useSearch();
  const books = useStore((s) => s.books);
  const chapters = useStore((s) => s.chapters ?? []);
  const characters = useStore((s) => s.characters ?? []);
  const worldRecords = useStore((s) => s.worldRecords ?? []);
  const worldOrganizations = useStore((s) => s.worldOrganizations ?? []);

  // Livro selecionado ("ALL" permite visualizar todos os livros, ou ID de um livro específico)
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    if (searchParams.livro && books.some((b) => b.id === searchParams.livro)) {
      return searchParams.livro;
    }
    return books[0]?.id ?? "";
  });

  // Garante que se os livros mudarem e o selecionado não existir mais, seleciona o primeiro disponível
  useEffect(() => {
    if (
      selectedBookId &&
      selectedBookId !== "ALL" &&
      books.length > 0 &&
      !books.some((b) => b.id === selectedBookId)
    ) {
      setSelectedBookId(books[0]!.id);
    } else if (!selectedBookId && books.length > 0) {
      setSelectedBookId(books[0]!.id);
    }
  }, [books, selectedBookId]);

  // Modos da tela: hub (lista/cartões), edit (formulário + editor Word), read (leitura limpa)
  const [viewMode, setViewMode] = useState<"hub" | "edit" | "read">("hub");
  const [draftChapter, setDraftChapter] = useState<Chapter | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string>("");
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  // Estados de Pesquisa, Filtros, Ordenação e Layout
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterPart, setFilterPart] = useState<string>("");
  const [filterCharacterId, setFilterCharacterId] = useState<string>("");
  const [filterLocationId, setFilterLocationId] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "number" | "displayOrder" | "title" | "status" | "updatedAt"
  >("number");
  const [layoutMode, setLayoutMode] = useState<"list" | "cards">("list");

  // Estado para confirmação de exclusão de capítulo
  const [deleteTargetChapter, setDeleteTargetChapter] = useState<Chapter | null>(null);

  // Estados auxiliares dentro do formulário do capítulo
  const [newEventText, setNewEventText] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventText, setEditingEventText] = useState("");
  const [newArtifactText, setNewArtifactText] = useState("");

  // Coleta todos os eventos históricos da enciclopédia para possível vínculo
  const allHistoricalEvents = useMemo(
    () =>
      worldRecords.flatMap((rec) =>
        (rec.historicalEvents ?? []).map((ev) => ({
          ...ev,
          recordName: rec.name || "Registro sem nome",
        })),
      ),
    [worldRecords],
  );

  // Coleta objetos marcantes cadastrados em personagens secundários como sugestões de artefatos
  const registeredStrikingObjects = useMemo(
    () =>
      characters.flatMap((c) =>
        (c.secStrikingObjects ?? []).map((obj) => ({
          id: obj.id,
          name: obj.name,
          ownerName: c.name,
        })),
      ),
    [characters],
  );

  // Abre capítulo se vier via parâmetro de URL
  useEffect(() => {
    if (searchParams.capitulo) {
      const found = chapters.find((c) => c.id === searchParams.capitulo);
      if (found) {
        setSelectedBookId(found.bookId);
        setDraftChapter(structuredClone(found));
        setIsDirty(false);
        setViewMode("read");
      }
    }
  }, [searchParams.capitulo]);

  // Salvamento automático seguro com debounce (800ms) quando o capítulo em edição já possui título ou resumo
  useEffect(() => {
    if (viewMode !== "edit" || !draftChapter || !isDirty) return;
    const timer = setTimeout(() => {
      actions.saveChapter(draftChapter);
      setIsDirty(false);
      setSaveFeedback("Salvo automaticamente");
    }, 800);
    return () => clearTimeout(timer);
  }, [draftChapter, isDirty, viewMode]);

  const currentBook = useMemo(
    () => books.find((b) => b.id === selectedBookId),
    [books, selectedBookId],
  );

  // Capítulos pertencentes ao escopo do livro selecionado
  const scopedChapters = useMemo(() => {
    if (!selectedBookId || selectedBookId === "ALL") return chapters;
    return chapters.filter((c) => c.bookId === selectedBookId);
  }, [chapters, selectedBookId]);

  // Partes/seções disponíveis no livro atual para filtro rápido
  const availableParts = useMemo(() => {
    const set = new Set<string>();
    scopedChapters.forEach((c) => {
      if (c.partOrSection && c.partOrSection.trim()) {
        set.add(c.partOrSection.trim());
      }
    });
    return Array.from(set);
  }, [scopedChapters]);

  // Lista filtrada e ordenada de capítulos
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return scopedChapters
      .filter((ch) => {
        if (filterStatus && ch.status !== filterStatus) return false;
        if (filterType && ch.type !== filterType) return false;
        if (filterPart && ch.partOrSection.trim() !== filterPart) return false;
        if (filterCharacterId && !(ch.characterIds ?? []).includes(filterCharacterId)) {
          return false;
        }
        if (filterLocationId && !(ch.worldRecordIds ?? []).includes(filterLocationId)) {
          return false;
        }

        if (!q) return true;

        const inTitle = (ch.title || "").toLowerCase().includes(q);
        const inNumber =
          String(ch.number).includes(q) ||
          `capítulo ${ch.number}`.includes(q) ||
          `capitulo ${ch.number}`.includes(q);
        const plainSummary = (
          ch.summaryPlainText || extractPlainTextFromHtml(ch.summaryHtml || "")
        ).toLowerCase();
        const inSummary = plainSummary.includes(q);
        const inEvents = (ch.importantEvents ?? []).some((ev) =>
          ev.description.toLowerCase().includes(q),
        );
        const inChars = (ch.characterIds ?? []).some((cid) => {
          const charObj = characters.find((c) => c.id === cid);
          return (
            charObj &&
            (charObj.name.toLowerCase().includes(q) ||
              (charObj.nicknames || "").toLowerCase().includes(q))
          );
        });

        return inTitle || inNumber || inSummary || inEvents || inChars;
      })
      .sort((a, b) => {
        if (sortBy === "number") {
          return (a.number || 0) - (b.number || 0);
        }
        if (sortBy === "displayOrder") {
          return (a.displayOrder || a.number || 0) - (b.displayOrder || b.number || 0);
        }
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "", "pt-BR");
        }
        if (sortBy === "status") {
          return (STATUS_WEIGHT[a.status] ?? 0) - (STATUS_WEIGHT[b.status] ?? 0);
        }
        if (sortBy === "updatedAt") {
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        }
        return 0;
      });
  }, [
    scopedChapters,
    searchQuery,
    filterStatus,
    filterType,
    filterPart,
    filterCharacterId,
    filterLocationId,
    sortBy,
    characters,
  ]);

  // Painel de Progresso da Escrita (baseado nos dados reais dos capítulos do livro selecionado)
  const progressStats = useMemo(() => {
    const totalRegistered = scopedChapters.length;
    const denominator = totalRegistered;

    const counts: Record<ChapterStatus, number> = {
      "Não iniciado": 0,
      Planejado: 0,
      "Em escrita": 0,
      Escrito: 0,
      "Em revisão": 0,
      Revisado: 0,
      Finalizado: 0,
    };

    scopedChapters.forEach((ch) => {
      counts[ch.status] = (counts[ch.status] ?? 0) + 1;
    });

    const finalizedCount = counts["Finalizado"];
    const writtenOrBeyondCount =
      counts["Escrito"] + counts["Em revisão"] + counts["Revisado"] + counts["Finalizado"];

    const completionPercent =
      denominator > 0 ? Math.min(100, Math.round((finalizedCount / denominator) * 100)) : 0;

    const writtenPercent =
      denominator > 0 ? Math.min(100, Math.round((writtenOrBeyondCount / denominator) * 100)) : 0;

    return {
      totalRegistered,
      plannedTarget: denominator,
      counts,
      finalizedCount,
      writtenOrBeyondCount,
      completionPercent,
      writtenPercent,
    };
  }, [scopedChapters]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    filterStatus ||
    filterType ||
    filterPart ||
    filterCharacterId ||
    filterLocationId,
  );

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setFilterType("");
    setFilterPart("");
    setFilterCharacterId("");
    setFilterLocationId("");
  };

  const handleStartNewChapter = () => {
    const targetBookId =
      selectedBookId && selectedBookId !== "ALL" ? selectedBookId : (books[0]?.id ?? "");
    if (!targetBookId) return;
    const fresh = actions.newChapter(targetBookId);
    setDraftChapter(fresh);
    setIsDirty(false);
    setSaveFeedback("");
    setViewMode("edit");
  };

  const handleOpenEditChapter = (ch: Chapter) => {
    const normalizedHtml = normalizeSummaryToHtml(ch.summaryHtml, ch.summaryPlainText);
    const normalizedPlain = ch.summaryPlainText || extractPlainTextFromHtml(normalizedHtml);
    setDraftChapter({
      ...structuredClone(ch),
      summaryHtml: normalizedHtml,
      summaryPlainText: normalizedPlain,
    });
    setIsDirty(false);
    setSaveFeedback("");
    setViewMode("edit");
  };

  const handleOpenReadChapter = (ch: Chapter) => {
    const normalizedHtml = normalizeSummaryToHtml(ch.summaryHtml, ch.summaryPlainText);
    setDraftChapter({
      ...structuredClone(ch),
      summaryHtml: normalizedHtml,
    });
    setIsDirty(false);
    setViewMode("read");
  };

  const handleSaveChapterNow = () => {
    if (!draftChapter) return;
    const toSave: Chapter = {
      ...draftChapter,
      title: draftChapter.title.trim() || `Capítulo ${draftChapter.number}`,
      summaryHtml: sanitizeRichHtml(draftChapter.summaryHtml),
      summaryPlainText: extractPlainTextFromHtml(draftChapter.summaryHtml),
    };
    actions.saveChapter(toSave);
    setDraftChapter(toSave);
    setIsDirty(false);
    setSaveFeedback("Capítulo salvo com sucesso ✓");
  };

  const handleBackToHub = () => {
    if (viewMode === "edit" && isDirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    setViewMode("hub");
    setDraftChapter(null);
    setDiscardConfirmOpen(false);
  };

  const moveChapterDisplayOrder = (chapterId: string, direction: -1 | 1) => {
    if (!selectedBookId || selectedBookId === "ALL") return;
    const ordered = [...scopedChapters].sort(
      (a, b) => (a.displayOrder || a.number) - (b.displayOrder || b.number),
    );
    const idx = ordered.findIndex((c) => c.id === chapterId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= ordered.length) return;
    const temp = ordered[idx]!;
    ordered[idx] = ordered[targetIdx]!;
    ordered[targetIdx] = temp;
    actions.reorderBookChapters(
      selectedBookId,
      ordered.map((c) => c.id),
    );
    setSortBy("displayOrder");
  };

  // Helpers para atualizar o draftChapter no formulário
  const updateDraft = <K extends keyof Chapter>(key: K, value: Chapter[K]) => {
    setDraftChapter((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
    setIsDirty(true);
    setSaveFeedback("Alterações pendentes…");
  };

  const toggleIdInDraftList = (
    key: "characterIds" | "worldRecordIds" | "organizationIds" | "historicalEventIds",
    id: string,
  ) => {
    setDraftChapter((prev) => {
      if (!prev) return prev;
      const list = prev[key] ?? [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [key]: next };
    });
    setIsDirty(true);
    setSaveFeedback("Alterações pendentes…");
  };

  // Acontecimentos importantes do capítulo (adicionar, editar, reorganizar, excluir)
  const addImportantEvent = () => {
    const text = newEventText.trim();
    if (!text || !draftChapter) return;
    const nextEvents: ChapterImportantEvent[] = [
      ...(draftChapter.importantEvents ?? []),
      {
        id: `cev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        description: text,
        order: (draftChapter.importantEvents?.length ?? 0) + 1,
      },
    ];
    updateDraft("importantEvents", nextEvents);
    setNewEventText("");
  };

  const saveEditedEvent = (evId: string) => {
    if (!draftChapter) return;
    const text = editingEventText.trim();
    if (!text) return;
    const nextEvents = (draftChapter.importantEvents ?? []).map((ev) =>
      ev.id === evId ? { ...ev, description: text } : ev,
    );
    updateDraft("importantEvents", nextEvents);
    setEditingEventId(null);
    setEditingEventText("");
  };

  const moveImportantEvent = (idx: number, dir: -1 | 1) => {
    if (!draftChapter) return;
    const list = [...(draftChapter.importantEvents ?? [])];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const temp = list[idx]!;
    list[idx] = list[target]!;
    list[target] = temp;
    const reindexed = list.map((ev, i) => ({ ...ev, order: i + 1 }));
    updateDraft("importantEvents", reindexed);
  };

  const removeImportantEvent = (evId: string) => {
    if (!draftChapter) return;
    const nextEvents = (draftChapter.importantEvents ?? [])
      .filter((ev) => ev.id !== evId)
      .map((ev, i) => ({ ...ev, order: i + 1 }));
    updateDraft("importantEvents", nextEvents);
  };

  // Estado vazio caso ainda não existam livros cadastrados na biblioteca
  if (books.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.25em] text-teal">
            Estrutura Narrativa & Escrita
          </p>
          <h1 className="mt-1 text-4xl">Capítulos e Sinopses</h1>
        </header>
        <div className="card-luxe p-8 text-center" data-testid="no-books-guidance">
          <BookOpen className="mx-auto h-10 w-10 text-teal" />
          <h2 className="mt-3 text-2xl">Nenhum livro cadastrado ainda</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Cada capítulo deve pertencer a um livro da sua biblioteca. Crie ou cadastre um livro na
            Biblioteca antes de organizar seus capítulos e sinopses.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="/biblioteca" className="btn">
              <BookOpen className="h-4 w-4" /> Ir para a Biblioteca
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // VISÃO DE LEITURA DO CAPÍTULO
  // ===========================================================================
  if (viewMode === "read" && draftChapter) {
    const chapterBook = books.find((b) => b.id === draftChapter.bookId);
    const presentChars = characters.filter((c) => (draftChapter.characterIds ?? []).includes(c.id));
    const presentPlaces = worldRecords.filter((r) =>
      (draftChapter.worldRecordIds ?? []).includes(r.id),
    );
    const presentOrgs = worldOrganizations.filter((o) =>
      (draftChapter.organizationIds ?? []).includes(o.id),
    );
    const presentHistEvents = allHistoricalEvents.filter((ev) =>
      (draftChapter.historicalEventIds ?? []).includes(ev.id),
    );

    const displayType =
      draftChapter.type === "Personalizado" && draftChapter.customType
        ? draftChapter.customType
        : draftChapter.type;

    return (
      <div className="mx-auto max-w-5xl space-y-6" data-testid="chapter-read-view">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBackToHub}
            data-testid="btn-back-to-chapters"
            className="btn-ghost !py-2 text-xs"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar para Capítulos
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Alterar status rápido"
              data-testid="read-status-select"
              value={draftChapter.status}
              onChange={(e) => {
                const nextSt = e.target.value as ChapterStatus;
                actions.updateChapterStatus(draftChapter.id, nextSt);
                setDraftChapter({ ...draftChapter, status: nextSt });
              }}
              className="!min-h-9 !w-auto !py-1 text-xs"
            >
              {CHAPTER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
            <button
              type="button"
              data-testid="btn-edit-from-read"
              onClick={() => handleOpenEditChapter(draftChapter)}
              className="btn !py-2 text-xs"
            >
              <Edit3 className="h-4 w-4" /> Editar Capítulo
            </button>
          </div>
        </div>

        <section className="card-luxe p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-teal">
              {chapterBook ? chapterBook.title : "Livro"}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {displayType} {draftChapter.number}
            </span>
            {draftChapter.partOrSection && (
              <>
                <span aria-hidden="true">·</span>
                <span>{draftChapter.partOrSection}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="text-primary">{draftChapter.status}</span>
            {draftChapter.storyChronologyDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>Cronologia: {draftChapter.storyChronologyDate}</span>
              </>
            )}
          </div>

          <h1 className="mt-2 text-3xl md:text-5xl">
            {draftChapter.title || `Capítulo ${draftChapter.number}`}
          </h1>

          {/* RESUMO FORMATADO */}
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teal">
              Resumo do Capítulo
            </h2>
            {draftChapter.summaryHtml ? (
              <div
                data-testid="read-chapter-summary-html"
                className="mt-3 text-base leading-relaxed text-foreground [&_a]:text-teal [&_a]:underline [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h3]:font-display [&_h3]:text-lg [&_h3]:italic [&_h3]:text-teal [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichHtml(draftChapter.summaryHtml),
                }}
              />
            ) : (
              <p className="mt-2 text-sm italic text-muted-foreground">
                Nenhum resumo escrito para este capítulo.
              </p>
            )}
          </div>

          {/* ACONTECIMENTOS IMPORTANTES */}
          {(draftChapter.importantEvents ?? []).length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-teal">
                Acontecimentos Importantes ({draftChapter.importantEvents.length})
              </h2>
              <ol className="mt-3 space-y-2">
                {draftChapter.importantEvents.map((ev, idx) => (
                  <li
                    key={ev.id}
                    className="flex items-start gap-3 rounded-xl bg-muted/40 px-3.5 py-2.5 text-sm"
                  >
                    <span className="font-mono text-xs text-teal">{idx + 1}.</span>
                    <span>{ev.description}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ESTRUTURA DRAMÁTICA */}
          <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            {draftChapter.narrativeObjective && (
              <div className="rounded-xl bg-muted/35 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Objetivo Narrativo
                </p>
                <p className="mt-1 text-sm">{draftChapter.narrativeObjective}</p>
              </div>
            )}
            {draftChapter.mainConflict && (
              <div className="rounded-xl bg-muted/35 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Conflito Principal
                </p>
                <p className="mt-1 text-sm">{draftChapter.mainConflict}</p>
              </div>
            )}
            {draftChapter.emotionOrAtmosphere && (
              <div className="rounded-xl bg-muted/35 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Emoção ou Atmosfera
                </p>
                <p className="mt-1 text-sm">{draftChapter.emotionOrAtmosphere}</p>
              </div>
            )}
            {draftChapter.finalHook && (
              <div className="rounded-xl bg-muted/35 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Gancho Final
                </p>
                <p className="mt-1 text-sm">{draftChapter.finalHook}</p>
              </div>
            )}
          </div>

          {/* CONEXÕES DO UNIVERSO */}
          <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Personagens Presentes ({presentChars.length})
              </p>
              {presentChars.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">Nenhum personagem associado.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {presentChars.map((c) => (
                    <Link
                      key={c.id}
                      to="/personagens/$id"
                      params={{ id: c.id }}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {c.name} ({resolveCharacterModel(c)})
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Locais, Países & Mundos ({presentPlaces.length})
              </p>
              {presentPlaces.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">Nenhum local associado.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  {presentPlaces.map((pl) => (
                    <span key={pl.id} className="text-teal">
                      {pl.name} ({pl.category})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {presentOrgs.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Organizações ({presentOrgs.length})
                </p>
                <p className="mt-1 text-sm">{presentOrgs.map((o) => o.name).join(" · ")}</p>
              </div>
            )}

            {presentHistEvents.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Eventos da Cronologia ({presentHistEvents.length})
                </p>
                <p className="mt-1 text-sm">{presentHistEvents.map((e) => e.name).join(" · ")}</p>
              </div>
            )}

            {(draftChapter.artifactNames ?? []).length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Artefatos e Objetos Importantes
                </p>
                <p className="mt-1 text-sm">{draftChapter.artifactNames.join(" · ")}</p>
              </div>
            )}
          </div>

          {draftChapter.privateNotes && (
            <div className="mt-6 rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Notas Privadas da Autora
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {draftChapter.privateNotes}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Criado em: {new Date(draftChapter.createdAt).toLocaleString("pt-BR")}</span>
            <span>
              Última atualização: {new Date(draftChapter.updatedAt).toLocaleString("pt-BR")}
            </span>
          </div>
        </section>
      </div>
    );
  }

  // ===========================================================================
  // VISÃO DE CRIAÇÃO / EDIÇÃO DO CAPÍTULO (17 CAMPOS + EDITOR WORD)
  // ===========================================================================
  if (viewMode === "edit" && draftChapter) {
    return (
      <div className="mx-auto max-w-5xl space-y-6" data-testid="chapter-edit-view">
        {/* TOPO FIXO DE AÇÕES */}
        <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="btn-return-chapter-list"
              onClick={handleBackToHub}
              className="btn-ghost !min-h-9 !px-3 !py-1.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Lista de Capítulos
            </button>
            <div>
              <p className="text-xs font-medium text-teal">
                {books.find((b) => b.id === draftChapter.bookId)?.title || "Livro"}
              </p>
              <p className="text-sm font-medium">
                {draftChapter.title || `Capítulo ${draftChapter.number}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {saveFeedback && (
              <span className="text-xs text-muted-foreground" data-testid="chapter-save-feedback">
                {saveFeedback}
              </span>
            )}
            <button
              type="button"
              data-testid="btn-preview-chapter"
              onClick={() => {
                handleSaveChapterNow();
                setViewMode("read");
              }}
              className="btn-ghost !min-h-9 !px-3 !py-1.5 text-xs"
            >
              <Eye className="h-3.5 w-3.5" /> Modo Leitura
            </button>
            <button
              type="button"
              data-testid="btn-save-chapter"
              onClick={handleSaveChapterNow}
              className="btn !min-h-9 !px-4 !py-1.5 text-xs"
            >
              <Save className="h-3.5 w-3.5" /> Salvar Capítulo
            </button>
          </div>
        </div>

        {/* CONFIRMAÇÃO DE DESCARTE DE ALTERAÇÕES NÃO SALVAS */}
        {discardConfirmOpen && (
          <div className="card-luxe border-destructive/50 p-4" data-testid="discard-changes-dialog">
            <p className="text-sm font-medium">
              Existem alterações recentes no capítulo. Deseja salvar antes de voltar à lista?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSaveChapterNow();
                  setDiscardConfirmOpen(false);
                  setViewMode("hub");
                  setDraftChapter(null);
                }}
                className="btn !min-h-9 !px-3 !py-1 text-xs"
              >
                Salvar e sair
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiscardConfirmOpen(false);
                  setIsDirty(false);
                  setViewMode("hub");
                  setDraftChapter(null);
                }}
                className="btn-ghost text-destructive !min-h-9 !px-3 !py-1 text-xs"
              >
                Descartar alterações
              </button>
              <button
                type="button"
                onClick={() => setDiscardConfirmOpen(false)}
                className="btn-ghost !min-h-9 !px-3 !py-1 text-xs"
              >
                Continuar editando
              </button>
            </div>
          </div>
        )}

        {/* SEÇÃO 1: IDENTIFICAÇÃO DO CAPÍTULO (CAMPOS 1, 2, 3, 4, 5, 10, 16) */}
        <section className="card-luxe space-y-4 p-5 md:p-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ScrollText className="h-4 w-4 text-teal" />
            <h2 className="text-xl">1. Identificação e Posição no Livro</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Livro */}
            <div className="sm:col-span-2">
              <label htmlFor="chap-book">1. Livro</label>
              <select
                id="chap-book"
                data-testid="select-chapter-book"
                value={draftChapter.bookId}
                onChange={(e) => {
                  const nextBookId = e.target.value;
                  updateDraft("bookId", nextBookId);
                  setSelectedBookId(nextBookId);
                }}
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    Livro {b.order} — {b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Número */}
            <div>
              <label htmlFor="chap-number">2. Número do capítulo</label>
              <input
                id="chap-number"
                data-testid="input-chapter-number"
                type="number"
                min={0}
                value={draftChapter.number}
                onChange={(e) => updateDraft("number", Math.max(0, Number(e.target.value) || 0))}
              />
            </div>

            {/* 16. Status */}
            <div>
              <label htmlFor="chap-status">16. Status</label>
              <select
                id="chap-status"
                data-testid="select-chapter-status"
                value={draftChapter.status}
                onChange={(e) => updateDraft("status", e.target.value as ChapterStatus)}
              >
                {CHAPTER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* 3. Título */}
            <div className="sm:col-span-2">
              <label htmlFor="chap-title">3. Título do capítulo</label>
              <input
                id="chap-title"
                data-testid="input-chapter-title"
                placeholder="Ex.: O Juramento sob as Cinzas"
                value={draftChapter.title}
                onChange={(e) => updateDraft("title", e.target.value)}
              />
            </div>

            {/* 4. Tipo */}
            <div>
              <label htmlFor="chap-type">4. Tipo</label>
              <select
                id="chap-type"
                data-testid="select-chapter-type"
                value={draftChapter.type}
                onChange={(e) => updateDraft("type", e.target.value as ChapterType)}
              >
                {CHAPTER_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {draftChapter.type === "Personalizado" && (
            <div>
              <label htmlFor="chap-custom-type">Nome do Tipo Personalizado</label>
              <input
                id="chap-custom-type"
                data-testid="input-chapter-custom-type"
                placeholder="Ex.: Crônica Real, Fragmento de Diário, Ato Especial..."
                value={draftChapter.customType ?? ""}
                onChange={(e) => updateDraft("customType", e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 5. Parte ou seção */}
            <div>
              <label htmlFor="chap-part">5. Parte ou seção narrativa</label>
              <input
                id="chap-part"
                data-testid="input-chapter-part"
                placeholder="Ex.: Parte I — A Queda de Solária"
                value={draftChapter.partOrSection}
                onChange={(e) => updateDraft("partOrSection", e.target.value)}
              />
            </div>

            {/* 10. Data na cronologia da história */}
            <div>
              <label htmlFor="chap-chronology">10. Data na cronologia da história</label>
              <input
                id="chap-chronology"
                data-testid="input-chapter-chronology"
                placeholder="Ex.: Outono do Ano 412 / Terceira Lua de Inverno"
                value={draftChapter.storyChronologyDate}
                onChange={(e) => updateDraft("storyChronologyDate", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: CAMPO 6 — RESUMO COM EDITOR RICO ESTILO MICROSOFT WORD */}
        <section className="card-luxe space-y-3 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl">6. Resumo do Capítulo (Editor Estilo Microsoft Word)</h2>
              <p className="text-xs text-muted-foreground">
                Formate livremente com negrito, itálico, fontes, tamanhos, cores, marca-texto,
                títulos, listas, alinhamentos e links.
              </p>
            </div>
          </div>

          <RichTextWordEditor
            valueHtml={draftChapter.summaryHtml}
            plainTextFallback={draftChapter.summaryPlainText}
            onChange={(nextHtml, nextPlain) => {
              setDraftChapter((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  summaryHtml: nextHtml,
                  summaryPlainText: nextPlain,
                };
              });
              setIsDirty(true);
              setSaveFeedback("Alterações pendentes…");
            }}
          />
        </section>

        {/* SEÇÃO 3: CAMPO 7 — ACONTECIMENTOS IMPORTANTES */}
        <section className="card-luxe space-y-4 p-5 md:p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-xl">7. Acontecimentos Importantes</h2>
              <p className="text-xs text-muted-foreground">
                Adicione, edite, reorganize a sequência e exclua os eventos que acontecem neste
                capítulo.
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {(draftChapter.importantEvents ?? []).length} evento(s)
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              aria-label="Novo acontecimento importante"
              data-testid="input-new-important-event"
              placeholder="Descreva um acontecimento importante deste capítulo..."
              value={newEventText}
              onChange={(e) => setNewEventText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImportantEvent();
                }
              }}
            />
            <button
              type="button"
              data-testid="btn-add-important-event"
              onClick={addImportantEvent}
              className="btn shrink-0"
            >
              <Plus className="h-4 w-4" /> Adicionar Evento
            </button>
          </div>

          {(draftChapter.importantEvents ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Nenhum acontecimento listado ainda. Adicione os marcos da cena acima.
            </p>
          ) : (
            <ul className="space-y-2" data-testid="important-events-list">
              {(draftChapter.importantEvents ?? []).map((ev, idx) => (
                <li
                  key={ev.id}
                  data-testid={`important-event-item-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm"
                >
                  {editingEventId === ev.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        data-testid={`edit-event-input-${idx}`}
                        value={editingEventText}
                        onChange={(e) => setEditingEventText(e.target.value)}
                        className="!min-h-8 !py-1 text-sm"
                      />
                      <button
                        type="button"
                        data-testid={`save-event-btn-${idx}`}
                        onClick={() => saveEditedEvent(ev.id)}
                        className="btn !min-h-8 !px-3 !py-1 text-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingEventId(null)}
                        className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex min-w-0 flex-1 items-start gap-2.5">
                        <span className="font-mono text-xs font-semibold text-teal">
                          #{idx + 1}
                        </span>
                        <span className="break-words">{ev.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Mover para cima"
                          aria-label="Mover evento para cima"
                          data-testid={`move-event-up-${idx}`}
                          disabled={idx === 0}
                          onClick={() => moveImportantEvent(idx, -1)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Mover para baixo"
                          aria-label="Mover evento para baixo"
                          data-testid={`move-event-down-${idx}`}
                          disabled={idx === (draftChapter.importantEvents ?? []).length - 1}
                          onClick={() => moveImportantEvent(idx, 1)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Editar acontecimento"
                          aria-label="Editar evento"
                          data-testid={`edit-event-btn-${idx}`}
                          onClick={() => {
                            setEditingEventId(ev.id);
                            setEditingEventText(ev.description);
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Excluir acontecimento"
                          aria-label="Excluir evento"
                          data-testid={`delete-event-btn-${idx}`}
                          onClick={() => removeImportantEvent(ev.id)}
                          className="rounded-lg p-1.5 text-destructive hover:bg-secondary"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* SEÇÃO 4: ARQUITETURA DRAMÁTICA (CAMPOS 11, 12, 13, 14, 15) */}
        <section className="card-luxe space-y-4 p-5 md:p-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Flame className="h-4 w-4 text-teal" />
            <h2 className="text-xl">Arquitetura Dramática, Atmosfera e Notas</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 11. Objetivo narrativo */}
            <div>
              <label htmlFor="chap-objective">11. Objetivo narrativo do capítulo</label>
              <textarea
                id="chap-objective"
                data-testid="input-chapter-objective"
                rows={3}
                placeholder="O que este capítulo precisa realizar na história?"
                value={draftChapter.narrativeObjective}
                onChange={(e) => updateDraft("narrativeObjective", e.target.value)}
              />
            </div>

            {/* 12. Conflito principal */}
            <div>
              <label htmlFor="chap-conflict">12. Conflito principal</label>
              <textarea
                id="chap-conflict"
                data-testid="input-chapter-conflict"
                rows={3}
                placeholder="Qual é o obstáculo, problema ou tensão central da cena?"
                value={draftChapter.mainConflict}
                onChange={(e) => updateDraft("mainConflict", e.target.value)}
              />
            </div>

            {/* 13. Emoção ou atmosfera */}
            <div>
              <label htmlFor="chap-emotion">13. Emoção ou atmosfera</label>
              <textarea
                id="chap-emotion"
                data-testid="input-chapter-emotion"
                rows={2}
                placeholder="Qual sentimento predominante deseja transmitir ao leitor?"
                value={draftChapter.emotionOrAtmosphere}
                onChange={(e) => updateDraft("emotionOrAtmosphere", e.target.value)}
              />
            </div>

            {/* 14. Gancho final */}
            <div>
              <label htmlFor="chap-hook">14. Gancho final</label>
              <textarea
                id="chap-hook"
                data-testid="input-chapter-hook"
                rows={2}
                placeholder="Que revelação, pergunta ou tensão conduz ao próximo capítulo?"
                value={draftChapter.finalHook}
                onChange={(e) => updateDraft("finalHook", e.target.value)}
              />
            </div>
          </div>

          {/* 15. Notas privadas */}
          <div>
            <label htmlFor="chap-private-notes">15. Notas privadas (uso exclusivo da autora)</label>
            <textarea
              id="chap-private-notes"
              data-testid="input-chapter-private-notes"
              rows={3}
              placeholder="Lembretes de revisão, ideias futuras, pistas ocultas (foreshadowing)..."
              value={draftChapter.privateNotes}
              onChange={(e) => updateDraft("privateNotes", e.target.value)}
            />
          </div>
        </section>

        {/* SEÇÃO 5: CONEXÕES COM PERSONAGENS, ENCICLOPÉDIA, ORGANIZAÇÕES, EVENTOS E ARTEFATOS (CAMPOS 8, 9 + INTEGRAÇÃO) */}
        <section className="card-luxe space-y-5 p-5 md:p-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Compass className="h-4 w-4 text-teal" />
            <div>
              <h2 className="text-xl">
                8 & 9. Personagens Presentes, Locais e Conexões do Universo
              </h2>
              <p className="text-xs text-muted-foreground">
                Relacione registros reais já cadastrados no Spectral Archive Studio sem duplicar
                fichas.
              </p>
            </div>
          </div>

          {/* 8. PERSONAGENS PRESENTES (Principais e Secundários) */}
          <div>
            <div className="flex items-center justify-between">
              <label>
                8. Personagens presentes ({(draftChapter.characterIds ?? []).length} selecionado(s))
              </label>
              <Link to="/personagens" className="text-xs text-primary hover:underline">
                Gerenciar Personagens
              </Link>
            </div>
            {characters.length === 0 ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Nenhum personagem cadastrado ainda no arquivo de personagens.
              </p>
            ) : (
              <div
                className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3"
                data-testid="chapter-characters-selector"
              >
                {characters.map((c) => {
                  const selected = (draftChapter.characterIds ?? []).includes(c.id);
                  const model = resolveCharacterModel(c);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-testid={`toggle-chap-char-${c.id}`}
                      onClick={() => toggleIdInDraftList("characterIds", c.id)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${
                        selected
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-muted/35 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="min-w-0 truncate">
                        <p className="truncate font-medium text-foreground">
                          {c.name || "Sem nome"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{model}</p>
                      </div>
                      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 9. LOCAIS, PAÍSES E MUNDOS DA ENCICLOPÉDIA */}
          <div>
            <div className="flex items-center justify-between">
              <label>
                9. Locais, Países e Mundos da Enciclopédia (
                {(draftChapter.worldRecordIds ?? []).length} selecionado(s))
              </label>
              <Link to="/universo" className="text-xs text-primary hover:underline">
                Abrir Enciclopédia
              </Link>
            </div>
            {worldRecords.length === 0 ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Nenhum local, país ou mundo cadastrado na Enciclopédia ainda.
              </p>
            ) : (
              <div
                className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3"
                data-testid="chapter-locations-selector"
              >
                {worldRecords.map((rec) => {
                  const selected = (draftChapter.worldRecordIds ?? []).includes(rec.id);
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      data-testid={`toggle-chap-loc-${rec.id}`}
                      onClick={() => toggleIdInDraftList("worldRecordIds", rec.id)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${
                        selected
                          ? "border-teal bg-teal/15 text-foreground"
                          : "border-border bg-muted/35 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="min-w-0 truncate">
                        <p className="truncate font-medium text-foreground">
                          {rec.name || "Sem nome"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{rec.category}</p>
                      </div>
                      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-teal" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ORGANIZAÇÕES E EVENTOS DA CRONOLOGIA */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label>
                Organizações Relacionadas ({(draftChapter.organizationIds ?? []).length})
              </label>
              {worldOrganizations.length === 0 ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Nenhuma organização cadastrada na Enciclopédia.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {worldOrganizations.map((org) => {
                    const selected = (draftChapter.organizationIds ?? []).includes(org.id);
                    return (
                      <button
                        key={org.id}
                        type="button"
                        data-testid={`toggle-chap-org-${org.id}`}
                        onClick={() => toggleIdInDraftList("organizationIds", org.id)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          selected
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {org.name || "Organização"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label>
                Eventos da Cronologia Geral ({(draftChapter.historicalEventIds ?? []).length})
              </label>
              {allHistoricalEvents.length === 0 ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Nenhum evento histórico cadastrado na Enciclopédia.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allHistoricalEvents.map((ev) => {
                    const selected = (draftChapter.historicalEventIds ?? []).includes(ev.id);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        data-testid={`toggle-chap-hist-${ev.id}`}
                        onClick={() => toggleIdInDraftList("historicalEventIds", ev.id)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          selected
                            ? "border-teal bg-teal/15 text-foreground"
                            : "border-border bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {ev.name} ({ev.recordName})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ARTEFATOS E OBJETOS IMPORTANTES */}
          <div>
            <label>Artefatos e Objetos Importantes no Capítulo</label>
            <div className="mt-1.5 flex gap-2">
              <input
                placeholder="Adicionar artefato ou objeto importante..."
                value={newArtifactText}
                onChange={(e) => setNewArtifactText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newArtifactText.trim()) {
                    e.preventDefault();
                    const clean = newArtifactText.trim();
                    if (!(draftChapter.artifactNames ?? []).includes(clean)) {
                      updateDraft("artifactNames", [...(draftChapter.artifactNames ?? []), clean]);
                    }
                    setNewArtifactText("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const clean = newArtifactText.trim();
                  if (!clean) return;
                  if (!(draftChapter.artifactNames ?? []).includes(clean)) {
                    updateDraft("artifactNames", [...(draftChapter.artifactNames ?? []), clean]);
                  }
                  setNewArtifactText("");
                }}
                className="btn shrink-0"
              >
                <Plus className="h-4 w-4" /> Incluir
              </button>
            </div>

            {registeredStrikingObjects.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Objetos de personagens:</span>
                {registeredStrikingObjects.map((obj) => {
                  const active = (draftChapter.artifactNames ?? []).includes(obj.name);
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => {
                        const list = draftChapter.artifactNames ?? [];
                        const next = active
                          ? list.filter((x) => x !== obj.name)
                          : [...list, obj.name];
                        updateDraft("artifactNames", next);
                      }}
                      className={`rounded-md border px-2 py-0.5 text-xs ${
                        active
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {obj.name} ({obj.ownerName})
                    </button>
                  );
                })}
              </div>
            )}

            {(draftChapter.artifactNames ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(draftChapter.artifactNames ?? []).map((art) => (
                  <span
                    key={art}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs"
                  >
                    {art}
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft(
                          "artifactNames",
                          (draftChapter.artifactNames ?? []).filter((x) => x !== art),
                        )
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 17. METADADOS */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>17. Criado em: {new Date(draftChapter.createdAt).toLocaleString("pt-BR")}</span>
            <span>
              Última atualização: {new Date(draftChapter.updatedAt).toLocaleString("pt-BR")}
            </span>
          </div>
        </section>
      </div>
    );
  }

  // ===========================================================================
  // VISÃO PRINCIPAL DO MÓDULO (SELEÇÃO DE LIVRO, PAINEL DE PROGRESSO, PESQUISA, FILTROS E LISTA/CARTÕES)
  // ===========================================================================
  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="chapters-hub-view">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-teal">Spectral Archive Studio</p>
          <h1 className="mt-1 text-4xl md:text-5xl">Capítulos e Sinopses</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Organize a estrutura de cada livro, acompanhe o progresso real da escrita e escreva
            resumos com formatação rica estilo Microsoft Word.
          </p>
        </div>
        <button
          type="button"
          data-testid="btn-new-chapter"
          onClick={handleStartNewChapter}
          className="btn"
        >
          <Plus className="h-4 w-4" /> Novo Capítulo
        </button>
      </div>

      {/* SELETOR DE LIVRO DA BIBLIOTECA */}
      <section className="card-luxe p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Selecionar Livro da Biblioteca
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Selecionar livro"
              data-testid="hub-book-selector"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="!min-h-9 !w-auto min-w-[220px] !py-1.5 text-sm font-medium"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  Livro {b.order}: {b.title}
                </option>
              ))}
              <option value="ALL">Todos os livros ({books.length})</option>
            </select>
            {currentBook && (
              <Link
                to="/livros/$id"
                params={{ id: currentBook.id }}
                className="btn-ghost !min-h-9 !px-3 !py-1.5 text-xs"
              >
                Ficha do Livro
              </Link>
            )}
          </div>
        </div>

        {/* BARRA VISUAL DOS LIVROS */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1.5">
          {books.map((b) => {
            const isSelected = selectedBookId === b.id;
            const count = chapters.filter((c) => c.bookId === b.id).length;
            return (
              <button
                key={b.id}
                type="button"
                data-testid={`book-tab-${b.id}`}
                onClick={() => setSelectedBookId(b.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-primary bg-secondary text-foreground shadow-sm"
                    : "border-border bg-muted/35 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: b.palette[1] }} />
                <div>
                  <p className="font-display text-sm font-semibold leading-tight text-foreground">
                    {b.order}. {b.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{count} cap(s)</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* SINOPSE DO LIVRO SELECIONADO */}
        {currentBook && (
          <div className="mt-4 rounded-xl border border-border/70 bg-background/40 p-3.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Sinopse de <strong className="text-foreground">{currentBook.title}</strong> ·{" "}
                {currentBook.status}
              </span>
              <span>Meta planejada no livro: {currentBook.chapters} capítulo(s)</span>
            </div>
            {currentBook.synopsis ? (
              <p className="mt-1.5 text-sm text-foreground/90">{currentBook.synopsis}</p>
            ) : (
              <p className="mt-1 text-xs italic text-muted-foreground">
                Sinopse do livro ainda não preenchida na ficha editorial.
              </p>
            )}
          </div>
        )}
      </section>

      {/* PAINEL DE PROGRESSO DA ESCRITA */}
      <section className="card-luxe p-5" data-testid="writing-progress-panel">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl">
              Painel de Progresso — {currentBook ? currentBook.title : "Todos os Livros"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Critério de conclusão: capítulos com status{" "}
              <strong className="text-foreground">Finalizado</strong> em relação ao total de
              capítulos cadastrados/planejados ({progressStats.finalizedCount} de{" "}
              {progressStats.plannedTarget}).
            </p>
          </div>
          <div className="text-right">
            <p
              className="font-display text-3xl font-bold text-primary"
              data-testid="progress-completion-percent"
            >
              {progressStats.completionPercent}%
            </p>
            <p className="text-[11px] text-muted-foreground">
              {progressStats.writtenPercent}% escritos ou em revisão
            </p>
          </div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressStats.completionPercent}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          <div className="rounded-xl border border-border bg-muted/35 p-3">
            <p className="text-[11px] text-muted-foreground">Total Cadastrados</p>
            <p
              className="mt-0.5 font-display text-2xl font-semibold"
              data-testid="stat-total-chapters"
            >
              {progressStats.totalRegistered}
            </p>
          </div>
          {CHAPTER_STATUSES.map((st) => (
            <div key={st} className="rounded-xl border border-border bg-muted/35 p-3">
              <p className="truncate text-[11px] text-muted-foreground">{st}</p>
              <p
                className="mt-0.5 font-display text-2xl font-semibold"
                data-testid={`stat-status-${st}`}
              >
                {progressStats.counts[st]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BARRA DE PESQUISA, FILTROS, ORDENAÇÃO E ALTERNÂNCIA DE VISUALIZAÇÃO */}
      <section className="card-luxe space-y-3 p-4 md:p-5">
        <div className="grid gap-2.5 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              aria-label="Pesquisar capítulos"
              data-testid="search-chapters-input"
              placeholder="Pesquisar por título, número, resumo, acontecimentos ou personagens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!pl-9"
            />
          </div>

          <select
            aria-label="Ordenar capítulos"
            data-testid="sort-chapters-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="!w-auto"
          >
            <option value="number">Ordenar: Número do capítulo</option>
            <option value="displayOrder">Ordenar: Ordem manual</option>
            <option value="title">Ordenar: Título (A–Z)</option>
            <option value="status">Ordenar: Status de escrita</option>
            <option value="updatedAt">Ordenar: Atualização recente</option>
          </select>

          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
            <button
              type="button"
              data-testid="view-mode-list"
              onClick={() => setLayoutMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                layoutMode === "list"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" /> Lista
            </button>
            <button
              type="button"
              data-testid="view-mode-cards"
              onClick={() => setLayoutMode("cards")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                layoutMode === "cards"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cartões
            </button>
          </div>
        </div>

        {/* FILTROS AVANÇADOS */}
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
          <select
            aria-label="Filtrar por status"
            data-testid="filter-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="!min-h-9 !py-1 text-xs"
          >
            <option value="">Todos os status</option>
            {CHAPTER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por tipo de capítulo"
            data-testid="filter-type-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="!min-h-9 !py-1 text-xs"
          >
            <option value="">Todos os tipos</option>
            {CHAPTER_TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por parte ou seção"
            data-testid="filter-part-select"
            value={filterPart}
            onChange={(e) => setFilterPart(e.target.value)}
            className="!min-h-9 !py-1 text-xs"
          >
            <option value="">Todas as partes/seções</option>
            {availableParts.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por personagem"
            data-testid="filter-character-select"
            value={filterCharacterId}
            onChange={(e) => setFilterCharacterId(e.target.value)}
            className="!min-h-9 !py-1 text-xs"
          >
            <option value="">Todos os personagens</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "Sem nome"}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por local da enciclopédia"
            data-testid="filter-location-select"
            value={filterLocationId}
            onChange={(e) => setFilterLocationId(e.target.value)}
            className="!min-h-9 !py-1 text-xs"
          >
            <option value="">Todos os locais</option>
            {worldRecords.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || "Sem nome"} ({r.category})
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
            <span className="text-muted-foreground">
              Exibindo {filteredChapters.length} de {scopedChapters.length} capítulo(s)
            </span>
            <button
              type="button"
              data-testid="btn-clear-chapter-filters"
              onClick={clearAllFilters}
              className="text-primary hover:underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </section>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteTargetChapter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          data-testid="confirm-delete-chapter-modal"
        >
          <div className="card-luxe w-full max-w-md space-y-4 p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-xl">Confirmar exclusão do capítulo</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir{" "}
              <strong className="text-foreground">
                {deleteTargetChapter.type} {deleteTargetChapter.number} —{" "}
                {deleteTargetChapter.title || "Sem título"}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                data-testid="cancel-delete-chapter-btn"
                onClick={() => setDeleteTargetChapter(null)}
                className="btn-ghost !min-h-9 !px-4 !py-1.5 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                data-testid="confirm-delete-chapter-btn"
                onClick={() => {
                  actions.deleteChapter(deleteTargetChapter.id);
                  setDeleteTargetChapter(null);
                }}
                className="btn !min-h-9 !bg-destructive !px-4 !py-1.5 text-xs !text-white"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LISTA OU CARTÕES DE CAPÍTULOS */}
      {filteredChapters.length === 0 ? (
        <div className="card-luxe p-10 text-center" data-testid="empty-chapters-state">
          <ScrollText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-2xl">
            {scopedChapters.length === 0
              ? `Nenhum capítulo cadastrado em ${currentBook?.title || "este livro"}`
              : "Nenhum capítulo corresponde aos filtros aplicados"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {scopedChapters.length === 0
              ? "Comece estruturando o primeiro capítulo, prólogo ou interlúdio com nosso editor rico estilo Microsoft Word."
              : "Tente ajustar os termos da busca ou limpar os filtros ativos."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {scopedChapters.length === 0 ? (
              <button
                type="button"
                data-testid="empty-create-first-chapter-btn"
                onClick={handleStartNewChapter}
                className="btn"
              >
                <Plus className="h-4 w-4" /> Criar Primeiro Capítulo
              </button>
            ) : (
              <button type="button" onClick={clearAllFilters} className="btn-ghost">
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      ) : layoutMode === "list" ? (
        <div className="space-y-3" data-testid="chapters-list-container">
          {filteredChapters.map((ch) => {
            const chBook = books.find((b) => b.id === ch.bookId);
            const chChars = characters.filter((c) => (ch.characterIds ?? []).includes(c.id));
            const chLocs = worldRecords.filter((r) => (ch.worldRecordIds ?? []).includes(r.id));
            const plainPreview =
              ch.summaryPlainText || extractPlainTextFromHtml(ch.summaryHtml || "");
            const typeLabel =
              ch.type === "Personalizado" && ch.customType ? ch.customType : ch.type;

            return (
              <article
                key={ch.id}
                data-testid={`chapter-item-${ch.id}`}
                className="card-luxe flex flex-col justify-between gap-4 p-4 transition hover:border-primary/50 md:flex-row md:items-center md:p-5"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {selectedBookId === "ALL" && chBook && (
                      <>
                        <span className="font-semibold text-teal">{chBook.title}</span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span className="font-semibold text-foreground">
                      {typeLabel} {ch.number}
                    </span>
                    {ch.partOrSection && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{ch.partOrSection}</span>
                      </>
                    )}
                    {ch.storyChronologyDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{ch.storyChronologyDate}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{(ch.importantEvents ?? []).length} acontecimento(s)</span>
                  </div>

                  <h3 className="font-display text-2xl leading-snug">
                    <button
                      type="button"
                      onClick={() => handleOpenReadChapter(ch)}
                      className="text-left hover:text-primary"
                    >
                      {ch.title || `Capítulo ${ch.number}`}
                    </button>
                  </h3>

                  {plainPreview && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{plainPreview}</p>
                  )}

                  {(chChars.length > 0 || chLocs.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                      {chChars.length > 0 && (
                        <span>Personagens: {chChars.map((c) => c.name).join(", ")}</span>
                      )}
                      {chChars.length > 0 && chLocs.length > 0 && <span aria-hidden="true">·</span>}
                      {chLocs.length > 0 && (
                        <span>Locais: {chLocs.map((l) => l.name).join(", ")}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* CONTROLES DE STATUS E AÇÕES DO CAPÍTULO */}
                <div className="flex flex-wrap items-center gap-2 md:shrink-0">
                  <select
                    aria-label={`Status do capítulo ${ch.title || ch.number}`}
                    data-testid={`quick-status-${ch.id}`}
                    value={ch.status}
                    onChange={(e) =>
                      actions.updateChapterStatus(ch.id, e.target.value as ChapterStatus)
                    }
                    className="!min-h-8 !w-auto !rounded-lg !px-2.5 !py-1 !text-xs"
                  >
                    {CHAPTER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  {selectedBookId !== "ALL" && (
                    <div className="flex items-center">
                      <button
                        type="button"
                        title="Subir na ordem de exibição"
                        aria-label="Subir capítulo"
                        data-testid={`reorder-up-${ch.id}`}
                        onClick={() => moveChapterDisplayOrder(ch.id, -1)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Descer na ordem de exibição"
                        aria-label="Descer capítulo"
                        data-testid={`reorder-down-${ch.id}`}
                        onClick={() => moveChapterDisplayOrder(ch.id, 1)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    title="Abrir modo leitura"
                    data-testid={`open-chapter-${ch.id}`}
                    onClick={() => handleOpenReadChapter(ch)}
                    className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" /> Abrir
                  </button>

                  <button
                    type="button"
                    title="Editar capítulo"
                    data-testid={`edit-chapter-${ch.id}`}
                    onClick={() => handleOpenEditChapter(ch)}
                    className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Editar
                  </button>

                  <button
                    type="button"
                    title="Duplicar capítulo"
                    data-testid={`duplicate-chapter-${ch.id}`}
                    onClick={() => actions.duplicateChapter(ch.id)}
                    className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Excluir capítulo"
                    data-testid={`delete-chapter-${ch.id}`}
                    onClick={() => setDeleteTargetChapter(ch)}
                    className="btn-ghost text-destructive !min-h-8 !px-2.5 !py-1 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="chapters-cards-container"
        >
          {filteredChapters.map((ch) => {
            const plainPreview =
              ch.summaryPlainText || extractPlainTextFromHtml(ch.summaryHtml || "");
            const typeLabel =
              ch.type === "Personalizado" && ch.customType ? ch.customType : ch.type;

            return (
              <article
                key={ch.id}
                data-testid={`chapter-card-${ch.id}`}
                className="card-luxe flex flex-col justify-between p-5 transition hover:border-primary/50"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-teal">
                      {typeLabel} {ch.number}
                    </span>
                    <span>{ch.status}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-2xl">
                    {ch.title || `Capítulo ${ch.number}`}
                  </h3>
                  {ch.partOrSection && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{ch.partOrSection}</p>
                  )}
                  {plainPreview ? (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {plainPreview}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs italic text-muted-foreground">
                      Sem resumo preenchido.
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenReadChapter(ch)}
                      className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                    >
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditChapter(ch)}
                      className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                    >
                      Editar
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Duplicar"
                      onClick={() => actions.duplicateChapter(ch.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      onClick={() => setDeleteTargetChapter(ch)}
                      className="rounded-lg p-1.5 text-destructive hover:bg-secondary"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

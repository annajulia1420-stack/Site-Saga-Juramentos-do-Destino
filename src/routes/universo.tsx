import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Globe2,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Save,
  ChevronLeft,
  Clock,
  Building2,
  Wand2,
  Sparkles,
  BookOpen,
  Users,
  MapPin,
  Images,
  Filter,
  Check,
  X,
} from "lucide-react";
import { useStore, actions } from "@/lib/store";
import {
  WORLD_RECORD_CATEGORIES,
  WORLD_RECORD_STATUSES,
  ENCYCLOPEDIA_SECTIONS_META,
  calculateOverallProgress,
  getSectionCompletionStatus,
  type WorldEncyclopediaRecord,
  type WorldNarrativeModality,
  type WorldRecordCategory,
  type WorldRecordStatus,
} from "@/lib/encyclopedia-types";
import { MediaImage } from "@/components/MediaImage";
import { EncyclopediaRecordSheet } from "@/components/encyclopedia/EncyclopediaRecordSheet";
import { EncyclopediaTimelineManager } from "@/components/encyclopedia/EncyclopediaTimelineManager";
import { EncyclopediaEntitiesHub } from "@/components/encyclopedia/EncyclopediaEntitiesHub";

export const Route = createFileRoute("/universo")({
  head: () => ({
    meta: [
      {
        title: "Enciclopédia de Países e Mundos — Spectral Archive Studio",
      },
      {
        name: "description",
        content:
          "Enciclopédia interativa de worldbuilding para países, mundos fictícios, reinos, impérios, cidades, organizações, sistemas mágicos e transformações.",
      },
      {
        property: "og:title",
        content: "Enciclopédia de Países e Mundos — Spectral Archive Studio",
      },
      {
        property: "og:description",
        content:
          "Enciclopédia interativa de worldbuilding para países, mundos fictícios, reinos, impérios, cidades, organizações, sistemas mágicos e transformações.",
      },
    ],
  }),
  component: EncyclopediaPage,
});

export function EncyclopediaPage() {
  const worldRecords = useStore((s) => s.worldRecords ?? []);
  const organizations = useStore((s) => s.worldOrganizations ?? []);
  const magicSystems = useStore((s) => s.worldMagicSystems ?? []);
  const transformations = useStore((s) => s.worldTransformations ?? []);
  const globalQuestions = useStore((s) => s.worldGlobalQuestions ?? []);
  const characters = useStore((s) => s.characters ?? []);
  const books = useStore((s) => s.books ?? []);

  // Modo da página:
  // "hub" = Listagem de registros | Linha do Tempo Geral | Hub de Organizações, Magia e Transformações
  // "edit" = Edição completa das 34 seções de um registro
  // "read" = Modo Leitura Enciclopédica
  const [pageMode, setPageMode] = useState<"hub" | "edit" | "read">("hub");
  const [hubTab, setHubTab] = useState<
    "records" | "globalTimeline" | "organizations" | "magic" | "transformations"
  >("records");

  // Rascunho ativo ao criar ou editar um registro
  const [draftRecord, setDraftRecord] = useState<WorldEncyclopediaRecord | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal de criação de novo registro enciclopédico
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newModality, setNewModality] = useState<WorldNarrativeModality>(
    "Fantasia — Medieval a Moderna",
  );
  const [newCategory, setNewCategory] = useState<WorldRecordCategory>("País");
  const [newName, setNewName] = useState("");
  const [newUniverse, setNewUniverse] = useState("Juramentos do Destino");

  // Filtros e busca da listagem de registros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("Todas");
  const [filterModality, setFilterModality] = useState<string>("Todas");
  const [filterBookId, setFilterBookId] = useState<string>("Todos");
  const [filterContinent, setFilterContinent] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [sortBy, setSortBy] = useState<
    "alphabetical" | "createdAt" | "updatedAt" | "category" | "book"
  >("updatedAt");

  const draftRef = useState<{ current: WorldEncyclopediaRecord | null }>({
    current: null,
  })[0];
  draftRef.current = draftRecord;

  const updateDraftRecord = (
    updaterOrNext:
      WorldEncyclopediaRecord | ((prev: WorldEncyclopediaRecord) => WorldEncyclopediaRecord),
  ) => {
    const base = draftRef.current;
    if (!base) return;
    const next = typeof updaterOrNext === "function" ? updaterOrNext(base) : updaterOrNext;
    draftRef.current = next;
    setDraftRecord(next);
    actions.saveWorldRecord(next);
  };
  useEffect(() => {
    if (draftRecord && pageMode === "read") {
      const latest = worldRecords.find((r) => r.id === draftRecord.id);
      if (latest) setDraftRecord(latest);
    }
  }, [worldRecords]);

  const handleStartNewRecord = () => {
    const rec = actions.newWorldRecord(newModality, newCategory);
    rec.name = newName.trim();
    rec.universeName = newUniverse.trim() || "Juramentos do Destino";
    actions.saveWorldRecord(rec);
    setDraftRecord(rec);
    setShowCreateModal(false);
    setNewName("");
    setPageMode("edit");
  };

  const handleOpenEdit = (rec: WorldEncyclopediaRecord) => {
    setDraftRecord(structuredClone(rec));
    setSaveMessage("");
    setPageMode("edit");
  };

  const handleOpenRead = (rec: WorldEncyclopediaRecord) => {
    setDraftRecord(structuredClone(rec));
    setSaveMessage("");
    setPageMode("read");
  };

  const handleSaveRecord = () => {
    if (!draftRecord) return;
    const updated: WorldEncyclopediaRecord = {
      ...draftRecord,
      name:
        draftRecord.name.trim() || draftRecord.sections.officialName.trim() || "Registro Sem Nome",
      updatedAt: new Date().toISOString(),
    };
    actions.upsertWorldRecord(updated);
    setDraftRecord(updated);
    setSaveMessage("Ficha enciclopédica salva com sucesso neste navegador.");
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const handleDuplicateRecord = (id: string) => {
    const copy = actions.duplicateWorldRecord(id);
    if (copy) {
      setDraftRecord(copy);
      setSaveMessage("Registro duplicado com sucesso.");
      setTimeout(() => setSaveMessage(""), 3500);
    }
  };

  const handleDeleteRecord = (id: string) => {
    actions.deleteWorldRecord(id);
    setConfirmDeleteId(null);
    if (draftRecord?.id === id) {
      setDraftRecord(null);
      setPageMode("hub");
    }
  };

  // Filtragem e busca global dos registros enciclopédicos
  const filteredRecords = worldRecords
    .filter((rec) => {
      if (filterCategory !== "Todas" && rec.category !== filterCategory) {
        return false;
      }
      if (filterModality !== "Todas" && rec.modality !== filterModality) {
        return false;
      }
      if (filterBookId !== "Todos" && !rec.relatedBookIds.includes(filterBookId)) {
        return false;
      }
      if (filterStatus !== "Todos" && rec.status !== (filterStatus as WorldRecordStatus)) {
        return false;
      }
      if (
        filterContinent.trim() &&
        !rec.continentFilter.toLowerCase().includes(filterContinent.toLowerCase()) &&
        !rec.regionFilter.toLowerCase().includes(filterContinent.toLowerCase()) &&
        !(rec.sections.continentName ?? "").toLowerCase().includes(filterContinent.toLowerCase())
      ) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inBasic =
        rec.name.toLowerCase().includes(q) ||
        rec.category.toLowerCase().includes(q) ||
        rec.universeName.toLowerCase().includes(q) ||
        rec.genre.toLowerCase().includes(q) ||
        rec.continentFilter.toLowerCase().includes(q) ||
        rec.regionFilter.toLowerCase().includes(q) ||
        (rec.sections.capitalCity ?? "").toLowerCase().includes(q) ||
        (rec.sections.governmentSystem ?? "").toLowerCase().includes(q) ||
        (rec.sections.predominantReligionsOrCults ?? "").toLowerCase().includes(q) ||
        (rec.sections.predominantClimateTypes ?? "").toLowerCase().includes(q);

      if (inBasic) return true;

      // Busca também em acontecimentos históricos, curiosidades e respostas personalizadas
      const inEvents = rec.historicalEvents.some(
        (ev) =>
          ev.name.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          ev.dateOrPeriod.toLowerCase().includes(q),
      );
      if (inEvents) return true;

      const inCuriosities = rec.curiosities.some(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
      );
      if (inCuriosities) return true;

      const inCustomAnswers = Object.values(rec.customAnswers ?? {}).some((ans) => {
        if (typeof ans === "string") return ans.toLowerCase().includes(q);
        if (Array.isArray(ans)) {
          return ans.some((i) => String(i).toLowerCase().includes(q));
        }
        return false;
      });
      if (inCustomAnswers) return true;

      // Busca no conteúdo de qualquer campo das 34 seções
      return Object.values(rec.sections).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(q),
      );
    })
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "createdAt") {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      }
      if (sortBy === "category") {
        return (a.category || "").localeCompare(b.category || "");
      }
      if (sortBy === "book") {
        const bA = a.relatedBookIds[0] ?? "";
        const bB = b.relatedBookIds[0] ?? "";
        return bA.localeCompare(bB);
      }
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });

  // Coleta todos os acontecimentos históricos de todos os registros para a Linha do Tempo Geral do Universo
  const allUniverseEvents = worldRecords.flatMap((r) =>
    r.historicalEvents.map((ev) => ({
      ...ev,
      location: ev.location ? `${ev.location} (${r.name || "Sem nome"})` : r.name || "Sem nome",
    })),
  );

  // =========================================================================
  // MODO 2: EDIÇÃO COMPLETA DA FICHA ENCICLOPÉDICA (34 SEÇÕES)
  // =========================================================================
  if (pageMode === "edit" && draftRecord) {
    return (
      <div className="mx-auto max-w-7xl space-y-6" data-testid="encyclopedia-edit-view">
        {/* Barra Superior de Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPageMode("hub")}
              className="btn-ghost text-xs"
              data-testid="btn-voltar-enciclopedia"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar à Enciclopédia
            </button>
            <span className="chip">{draftRecord.category}</span>
            <span className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-[0.7rem] font-medium text-teal">
              {draftRecord.modality}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleSaveRecord();
                setPageMode("read");
              }}
              className="btn-ghost text-xs"
              data-testid="btn-modo-leitura"
            >
              <Eye className="h-4 w-4" /> Modo Leitura Enciclopédica
            </button>

            <button
              type="button"
              onClick={() => handleDuplicateRecord(draftRecord.id)}
              className="btn-ghost text-xs"
              data-testid="btn-duplicar-registro"
            >
              <Copy className="h-4 w-4" /> Duplicar
            </button>

            <button
              type="button"
              onClick={() => setConfirmDeleteId(draftRecord.id)}
              className="btn-ghost text-xs text-destructive"
              data-testid="btn-excluir-registro-topo"
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </button>

            <button
              type="button"
              onClick={handleSaveRecord}
              className="btn text-xs"
              data-testid="btn-salvar-ficha-enciclopedica"
            >
              <Save className="h-4 w-4" /> Salvar Ficha Enciclopédica
            </button>
          </div>
        </div>

        {saveMessage && (
          <div
            role="status"
            data-testid="encyclopedia-save-status"
            className="rounded-2xl border border-teal/40 bg-teal/10 px-4 py-3 text-xs font-medium text-teal"
          >
            {saveMessage}
          </div>
        )}

        {confirmDeleteId === draftRecord.id && (
          <div
            className="card-luxe flex flex-wrap items-center justify-between gap-3 border-destructive/60 p-4"
            data-testid="confirm-delete-record-banner"
          >
            <p className="text-xs text-foreground">
              Tem certeza que deseja excluir permanentemente{" "}
              <strong>{draftRecord.name || "este registro"}</strong>? Os vínculos com outros
              registros serão limpos com segurança.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRecord(draftRecord.id)}
                className="btn !min-h-8 !bg-destructive !px-3 !py-1 text-xs !text-destructive-foreground"
                data-testid="btn-confirmar-exclusao-registro"
              >
                Confirmar exclusão
              </button>
            </div>
          </div>
        )}

        <EncyclopediaRecordSheet
          record={draftRecord}
          onChangeRecord={updateDraftRecord}
          onSave={handleSaveRecord}
          allRecords={worldRecords}
          characters={characters}
          books={books}
          organizations={organizations}
          magicSystems={magicSystems}
          transformations={transformations}
          globalQuestions={globalQuestions}
        />

        {/* Rodapé de Salvamento */}
        <div className="card-luxe flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="text-xs text-muted-foreground">
            Última atualização: {new Date(draftRecord.updatedAt).toLocaleString("pt-BR")}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                handleSaveRecord();
                setPageMode("read");
              }}
              className="btn-ghost text-xs"
            >
              <Eye className="h-4 w-4" /> Visualizar como artigo
            </button>
            <button
              type="button"
              onClick={handleSaveRecord}
              className="btn text-xs"
              data-testid="btn-salvar-ficha-enciclopedica-rodape"
            >
              <Save className="h-4 w-4" /> Salvar alterações
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO 3: MODO LEITURA ENCICLOPÉDICA (ARTIGO ORGANIZADO)
  // =========================================================================
  if (pageMode === "read" && draftRecord) {
    const progress = calculateOverallProgress(draftRecord);
    const linkedBooks = books.filter((b) => draftRecord.relatedBookIds.includes(b.id));
    const linkedChars = characters.filter((c) => draftRecord.relatedCharacterIds.includes(c.id));
    const linkedOrgs = organizations.filter(
      (o) =>
        draftRecord.relatedOrganizationIds.includes(o.id) ||
        o.originRecordId === draftRecord.id ||
        o.actingRecordIds.includes(draftRecord.id),
    );
    const linkedMagics = magicSystems.filter(
      (m) =>
        draftRecord.relatedMagicSystemIds.includes(m.id) ||
        m.affectedRegionIds.includes(draftRecord.id),
    );
    const linkedTrans = transformations.filter((t) =>
      draftRecord.relatedTransformationIds.includes(t.id),
    );

    return (
      <div className="mx-auto max-w-5xl space-y-8" data-testid="encyclopedia-reader-view">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <button type="button" onClick={() => setPageMode("hub")} className="btn-ghost text-xs">
            <ChevronLeft className="h-4 w-4" /> Voltar à Enciclopédia
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPageMode("edit")}
              className="btn text-xs"
              data-testid="btn-voltar-edicao"
            >
              <Edit3 className="h-4 w-4" /> Editar Ficha (34 Seções)
            </button>
          </div>
        </div>

        {/* Cabeçalho Editorial do Artigo Enciclopédico */}
        <article className="card-luxe overflow-hidden">
          {draftRecord.coverImageUrl && (
            <div className="relative h-64 w-full overflow-hidden border-b bg-secondary/40 sm:h-80">
              <MediaImage
                src={draftRecord.coverImageUrl}
                alt={draftRecord.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            </div>
          )}

          <div className="space-y-6 p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{draftRecord.category}</span>
              <span className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs text-teal">
                {draftRecord.modality}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                Status: {draftRecord.status} ({progress.percentage}% documentado)
              </span>
            </div>

            <div>
              <h1 className="font-display text-4xl sm:text-5xl">
                {draftRecord.name || draftRecord.sections.officialName || "Registro Enciclopédico"}
              </h1>
              {draftRecord.sections.nationalMotto && (
                <p className="mt-2 font-display text-xl italic text-gold">
                  “{draftRecord.sections.nationalMotto}”
                </p>
              )}
            </div>

            {/* Quadro de Dados Rápidos (Infobox Enciclopédica) */}
            <div className="grid gap-3 rounded-2xl border bg-background/60 p-4 sm:grid-cols-3 text-xs">
              {draftRecord.sections.capitalCity && (
                <div>
                  <span className="block text-muted-foreground">Capital</span>
                  <strong className="text-foreground">{draftRecord.sections.capitalCity}</strong>
                </div>
              )}
              {draftRecord.sections.governmentSystem && (
                <div>
                  <span className="block text-muted-foreground">Sistema de Governo</span>
                  <strong className="text-foreground">
                    {draftRecord.sections.governmentSystem}
                  </strong>
                </div>
              )}
              {draftRecord.sections.officialLanguages && (
                <div>
                  <span className="block text-muted-foreground">Idioma(s) Oficial(is)</span>
                  <strong className="text-foreground">
                    {draftRecord.sections.officialLanguages}
                  </strong>
                </div>
              )}
              {draftRecord.sections.officialCurrency && (
                <div>
                  <span className="block text-muted-foreground">Moeda</span>
                  <strong className="text-foreground">
                    {draftRecord.sections.officialCurrency}
                  </strong>
                </div>
              )}
              {draftRecord.sections.planetOrWorldName && (
                <div>
                  <span className="block text-muted-foreground">Mundo / Planeta</span>
                  <strong className="text-foreground">
                    {draftRecord.sections.planetOrWorldName}
                  </strong>
                </div>
              )}
              {draftRecord.sections.totalPopulationEstimate && (
                <div>
                  <span className="block text-muted-foreground">População</span>
                  <strong className="text-foreground">
                    {draftRecord.sections.totalPopulationEstimate}
                  </strong>
                </div>
              )}
            </div>

            {/* Resumo Enciclopédico (Seção 33) */}
            {draftRecord.sections.encyclopedicSummaryText && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <h2 className="mb-2 font-display text-2xl text-primary">Síntese Enciclopédica</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {draftRecord.sections.encyclopedicSummaryText}
                </p>
              </div>
            )}

            {/* Seções preenchidas em formato de leitura */}
            <div className="space-y-6">
              {ENCYCLOPEDIA_SECTIONS_META.map((sec) => {
                const st = getSectionCompletionStatus(draftRecord, sec.num);
                if (st === "empty") return null;

                const secAnswers = (draftRecord.customQuestions ?? [])
                  .filter((q) => q.sectionNumber === sec.num)
                  .map((q) => ({
                    q,
                    ans: draftRecord.customAnswers?.[q.id],
                  }))
                  .filter(({ ans }) => ans !== undefined && ans !== "");

                return (
                  <section key={sec.num} className="space-y-3 border-t pt-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal">
                        {String(sec.num).padStart(2, "0")}.
                      </span>
                      <h3 className="font-display text-2xl">{sec.title}</h3>
                    </div>

                    {draftRecord.sectionNotes[sec.num] && (
                      <p className="whitespace-pre-line text-sm text-muted-foreground">
                        {draftRecord.sectionNotes[sec.num]}
                      </p>
                    )}

                    {secAnswers.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {secAnswers.map(({ q, ans }) => (
                          <div
                            key={q.id}
                            className="rounded-xl border bg-background/40 p-3 text-xs"
                          >
                            <strong className="block text-foreground">{q.prompt}</strong>
                            {typeof ans === "string" && (
                              <p className="mt-1 whitespace-pre-line text-muted-foreground">
                                {ans}
                              </p>
                            )}
                            {Array.isArray(ans) && ans.length > 0 && (
                              <p className="mt-1 text-teal">{ans.join(" · ")}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Conexões com o Universo */}
            {(linkedBooks.length > 0 ||
              linkedChars.length > 0 ||
              linkedOrgs.length > 0 ||
              linkedMagics.length > 0 ||
              linkedTrans.length > 0) && (
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-display text-2xl">Conexões no Universo Literário</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {linkedBooks.map((b) => (
                    <span key={b.id} className="chip">
                      Livro: {b.title}
                    </span>
                  ))}
                  {linkedChars.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-foreground"
                    >
                      Personagem: {c.name}
                    </span>
                  ))}
                  {linkedOrgs.map((o) => (
                    <span
                      key={o.id}
                      className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-gold"
                    >
                      Organização: {o.name}
                    </span>
                  ))}
                  {linkedMagics.map((m) => (
                    <span
                      key={m.id}
                      className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-teal"
                    >
                      Magia: {m.name}
                    </span>
                  ))}
                  {linkedTrans.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full border bg-secondary px-3 py-1 text-foreground"
                    >
                      Transformação: {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    );
  }

  // =========================================================================
  // MODO 1: HUB CENTRAL DA ENCICLOPÉDIA DE PAÍSES E MUNDOS
  // =========================================================================
  return (
    <div className="mx-auto max-w-7xl space-y-7" data-testid="encyclopedia-hub-page">
      {/* Cabeçalho Principal */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip">Worldbuilding & Lore</span>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">
            Enciclopédia de Países e Mundos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Documente países, mundos fictícios, reinos, impérios, cidades, organizações, sistemas
            mágicos, transformações e linhas do tempo com 34 seções enciclopédicas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn"
          data-testid="btn-novo-registro-enciclopedico"
        >
          <Plus className="h-4 w-4" /> Novo Registro Enciclopédico
        </button>
      </header>

      {/* Modal de Criação de Novo Registro Enciclopédico */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          data-testid="modal-novo-registro-enciclopedico"
        >
          <div className="card-luxe w-full max-w-2xl space-y-5 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-display text-2xl">Criar Novo Registro na Enciclopédia</h2>
                <p className="text-xs text-muted-foreground">
                  Escolha a modalidade narrativa, a categoria do registro e o nome inicial. Todas as
                  34 seções estarão disponíveis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-ghost !min-h-9 !px-2.5 !py-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Seleção das 2 Modalidades Narrativas */}
            <div className="space-y-2">
              <label>1. Modalidade narrativa principal</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      mod: "Fantasia — Medieval a Moderna" as const,
                      subtitle:
                        "Fantasia medieval, clássica, sombria, urbana, contemporânea, moderna, histórica ou científica.",
                    },
                    {
                      mod: "Distopia / Ficção Científica" as const,
                      subtitle:
                        "Distopia política, tecnológica, ambiental, cyberpunk, biopunk, solarpunk, espacial ou pós-apocalíptica.",
                    },
                  ] as const
                ).map((item) => {
                  const active = newModality === item.mod;
                  return (
                    <button
                      key={item.mod}
                      type="button"
                      onClick={() => setNewModality(item.mod)}
                      data-testid={`modal-modality-${item.mod}`}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-teal bg-teal/15"
                          : "bg-background/50 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-display text-lg text-foreground">{item.mod}</strong>
                        {active && <Check className="h-4 w-4 text-teal" />}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="modal-new-category">2. Categoria do registro</label>
                <select
                  id="modal-new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as WorldRecordCategory)}
                  data-testid="modal-select-category"
                >
                  {WORLD_RECORD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Outro tipo personalizado">Outro tipo personalizado</option>
                </select>
              </div>

              <div>
                <label htmlFor="modal-new-universe">Universo literário</label>
                <input
                  id="modal-new-universe"
                  value={newUniverse}
                  onChange={(e) => setNewUniverse(e.target.value)}
                  placeholder="Ex: Juramentos do Destino"
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-new-name">
                3. Nome do país, mundo, reino, cidade ou registro
              </label>
              <input
                id="modal-new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Reino de Solária, Federação de Neo-Vespera…"
                data-testid="modal-input-record-name"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-ghost text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartNewRecord}
                className="btn text-xs"
                data-testid="btn-confirmar-criar-registro"
              >
                <Plus className="h-4 w-4" /> Abrir Ficha de 34 Seções
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abas Principais da Área da Enciclopédia */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <button
          type="button"
          onClick={() => setHubTab("records")}
          data-testid="enc-hub-tab-records"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition ${
            hubTab === "records"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-background/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe2 className="h-4 w-4" /> Registros Enciclopédicos ({worldRecords.length})
        </button>

        <button
          type="button"
          onClick={() => setHubTab("organizations")}
          data-testid="enc-hub-tab-organizations"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition ${
            hubTab === "organizations"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-background/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" /> Organizações ({organizations.length})
        </button>

        <button
          type="button"
          onClick={() => setHubTab("magic")}
          data-testid="enc-hub-tab-magic"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition ${
            hubTab === "magic"
              ? "border-teal bg-teal text-background"
              : "bg-background/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="h-4 w-4" /> Sistemas Mágicos ({magicSystems.length})
        </button>

        <button
          type="button"
          onClick={() => setHubTab("transformations")}
          data-testid="enc-hub-tab-transformations"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition ${
            hubTab === "transformations"
              ? "border-gold bg-gold text-background"
              : "bg-background/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" /> Transformações ({transformations.length})
        </button>

        <button
          type="button"
          onClick={() => setHubTab("globalTimeline")}
          data-testid="enc-hub-tab-timeline"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition ${
            hubTab === "globalTimeline"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-background/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" /> Linha do Tempo do Universo ({allUniverseEvents.length})
        </button>
      </div>

      {/* =================================================================== */}
      {/* ABA 1: LISTAGEM, BUSCA E FILTROS DE REGISTROS ENCICLOPÉDICOS         */}
      {/* =================================================================== */}
      {hubTab === "records" && (
        <div className="space-y-5">
          {/* Painel de Busca e Filtros */}
          <div className="card-luxe space-y-4 p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, capital, governo, religião, clima, história, curiosidade ou resposta…"
                  className="!pl-10 text-xs"
                  data-testid="input-search-encyclopedia"
                />
              </div>

              <div>
                <select
                  aria-label="Ordenar registros enciclopédicos"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs"
                  data-testid="select-sort-encyclopedia"
                >
                  <option value="updatedAt">Ordenar: Última edição</option>
                  <option value="alphabetical">Ordenar: Ordem alfabética (A–Z)</option>
                  <option value="createdAt">Ordenar: Data de criação</option>
                  <option value="category">Ordenar: Por categoria</option>
                  <option value="book">Ordenar: Por livro relacionado</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="text-[0.7rem]">Categoria</label>
                <select
                  aria-label="Filtrar por categoria"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="!min-h-9 text-xs"
                  data-testid="filter-encyclopedia-category"
                >
                  <option value="Todas">Todas as categorias</option>
                  {WORLD_RECORD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Outro tipo personalizado">Outro tipo personalizado</option>
                </select>
              </div>

              <div>
                <label className="text-[0.7rem]">Modalidade narrativa</label>
                <select
                  aria-label="Filtrar por modalidade"
                  value={filterModality}
                  onChange={(e) => setFilterModality(e.target.value)}
                  className="!min-h-9 text-xs"
                  data-testid="filter-encyclopedia-modality"
                >
                  <option value="Todas">Todas as modalidades</option>
                  <option value="Fantasia — Medieval a Moderna">
                    Fantasia — Medieval a Moderna
                  </option>
                  <option value="Distopia / Ficção Científica">Distopia / Ficção Científica</option>
                </select>
              </div>

              <div>
                <label className="text-[0.7rem]">Livro relacionado</label>
                <select
                  aria-label="Filtrar por livro"
                  value={filterBookId}
                  onChange={(e) => setFilterBookId(e.target.value)}
                  className="!min-h-9 text-xs"
                  data-testid="filter-encyclopedia-book"
                >
                  <option value="Todos">Todos os livros</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.order}. {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[0.7rem]">Continente ou Região</label>
                <input
                  value={filterContinent}
                  onChange={(e) => setFilterContinent(e.target.value)}
                  placeholder="Filtrar continente/região…"
                  className="!min-h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-[0.7rem]">Status da ficha</label>
                <select
                  aria-label="Filtrar por status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="!min-h-9 text-xs"
                >
                  <option value="Todos">Todos os status</option>
                  {WORLD_RECORD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Cartões de Registros Enciclopédicos */}
          {filteredRecords.length === 0 ? (
            <div className="card-luxe p-10 text-center" data-testid="empty-encyclopedia-records">
              <Globe2 className="mx-auto h-10 w-10 text-teal" />
              <h3 className="mt-3 font-display text-2xl">
                {worldRecords.length === 0
                  ? "Sua Enciclopédia de Países e Mundos está pronta para começar"
                  : "Nenhum registro encontrado com esses filtros"}
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                {worldRecords.length === 0
                  ? "Crie o primeiro país, mundo, reino, império ou cidade para documentar as 34 seções enciclopédicas, mapas, imagens e linha do tempo."
                  : "Ajuste os termos de busca ou limpe os filtros selecionados."}
              </p>
              {worldRecords.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="btn mt-4 text-xs"
                >
                  <Plus className="h-4 w-4" /> Criar Primeiro Registro
                </button>
              )}
            </div>
          ) : (
            <div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              data-testid="encyclopedia-records-grid"
            >
              {filteredRecords.map((rec) => {
                const prog = calculateOverallProgress(rec);
                const cover = rec.coverImageUrl || rec.images[0]?.imageUrl || "";

                return (
                  <div
                    key={rec.id}
                    className="card-luxe flex flex-col justify-between overflow-hidden transition hover:border-primary/40"
                    data-testid={`world-record-card-${rec.id}`}
                  >
                    <div>
                      <div className="relative h-36 w-full overflow-hidden border-b bg-secondary/40">
                        {cover ? (
                          <MediaImage
                            src={cover}
                            alt={rec.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground/40">
                            <Globe2 className="h-10 w-10" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[0.65rem] font-semibold text-teal backdrop-blur">
                            {rec.category}
                          </span>
                          <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[0.65rem] text-muted-foreground backdrop-blur">
                            {rec.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5 p-4">
                        <span className="text-[0.65rem] uppercase tracking-wider text-gold">
                          {rec.modality}
                        </span>
                        <h3 className="font-display text-2xl leading-tight text-foreground">
                          {rec.name || rec.sections.officialName || "Registro Sem Nome"}
                        </h3>

                        {(rec.sections.capitalCity || rec.continentFilter || rec.universeName) && (
                          <p className="text-xs text-muted-foreground">
                            {[
                              rec.sections.capitalCity
                                ? `Capital: ${rec.sections.capitalCity}`
                                : "",
                              rec.continentFilter,
                              rec.universeName,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}

                        {/* Barra de progresso no card */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
                            <span>
                              {prog.filledSections + prog.partialSections}/34 seções iniciadas
                            </span>
                            <span className="font-mono text-teal">{prog.percentage}%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-teal"
                              style={{ width: `${prog.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Indicadores rápidos */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[0.65rem] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Images className="h-3 w-3" /> {rec.images.length} imagens
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {rec.maps.length} mapas
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {rec.historicalEvents.length} eventos
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t bg-background/40 px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rec)}
                          className="btn !min-h-8 !px-3 !py-1 text-xs"
                          data-testid={`btn-editar-registro-${rec.id}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Editar Ficha
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRead(rec)}
                          className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                          title="Modo Leitura Enciclopédica"
                          data-testid={`btn-ler-registro-${rec.id}`}
                        >
                          <Eye className="h-3.5 w-3.5" /> Ler
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRecord(rec.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Duplicar registro"
                          data-testid={`btn-duplicar-card-${rec.id}`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        {confirmDeleteId === rec.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="rounded bg-destructive px-2 py-0.5 text-[0.65rem] font-semibold text-destructive-foreground"
                              data-testid={`btn-confirm-del-card-${rec.id}`}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[0.65rem] text-muted-foreground"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(rec.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                            title="Excluir registro"
                            data-testid={`btn-del-card-${rec.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* ABAS 2, 3 e 4: ORGANIZAÇÕES, SISTEMAS MÁGICOS E TRANSFORMAÇÕES      */}
      {/* =================================================================== */}
      {(hubTab === "organizations" || hubTab === "magic" || hubTab === "transformations") && (
        <div className="card-luxe p-5 sm:p-6">
          <EncyclopediaEntitiesHub
            key={hubTab}
            organizations={organizations}
            magicSystems={magicSystems}
            transformations={transformations}
            worldRecords={worldRecords}
            characters={characters}
            books={books}
            activeSubTab={hubTab}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* ABA 5: LINHA DO TEMPO GERAL DO UNIVERSO                             */}
      {/* =================================================================== */}
      {hubTab === "globalTimeline" && (
        <div className="card-luxe space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl">Linha do Tempo Unificada do Universo</h2>
            <p className="text-xs text-muted-foreground">
              Todos os acontecimentos históricos registrados nos países, mundos, reinos e cidades da
              enciclopédia.
            </p>
          </div>
          <EncyclopediaTimelineManager
            events={allUniverseEvents}
            onChangeEvents={() => {
              // Na visão unificada, a criação/edição principal ocorre dentro de cada registro,
              // ou se houver ao menos 1 registro, adiciona ao primeiro registro selecionado.
            }}
            characters={characters}
            books={books}
            worldRecords={worldRecords}
            organizations={organizations}
            currentRecordId={worldRecords[0]?.id ?? ""}
          />
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  ImagePlus,
  X,
  Check,
  ArrowUpDown,
} from "lucide-react";
import type {
  HistoricalEventItem,
  WorldEncyclopediaRecord,
  WorldOrganization,
} from "@/lib/encyclopedia-types";
import type { Character, Book } from "@/lib/store";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

const EVENT_CATEGORIES = [
  "Fundação",
  "Guerra / Batalha",
  "Tratado / Diplomacia",
  "Revolução / Golpe",
  "Descoberta Científica / Mágica",
  "Cataclismo / Desastre",
  "Ascensão / Queda de Líder",
  "Era / Período",
  "Outro",
];

export function EncyclopediaTimelineManager({
  events,
  onChangeEvents,
  characters,
  books,
  worldRecords,
  organizations,
  currentRecordId,
}: {
  events: HistoricalEventItem[];
  onChangeEvents: (next: HistoricalEventItem[]) => void;
  characters: Character[];
  books: Book[];
  worldRecords: WorldEncyclopediaRecord[];
  organizations: WorldOrganization[];
  currentRecordId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtros da Linha do Tempo
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCharacterId, setFilterCharacterId] = useState("");
  const [filterBookId, setFilterBookId] = useState("");
  const [filterRecordId, setFilterRecordId] = useState("");
  const [filterPeriodQuery, setFilterPeriodQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Estado do formulário
  const [name, setName] = useState("");
  const [dateOrPeriod, setDateOrPeriod] = useState("");
  const [fictionalCalendarDate, setFictionalCalendarDate] = useState("");
  const [realCalendarEquivalent, setRealCalendarEquivalent] = useState("");
  const [chronologicalOrder, setChronologicalOrder] = useState<number>(events.length + 1);
  const [isApproximateDate, setIsApproximateDate] = useState(false);
  const [isUndefinedDate, setIsUndefinedDate] = useState(false);
  const [category, setCategory] = useState("Fundação");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [causes, setCauses] = useState("");
  const [development, setDevelopment] = useState("");
  const [consequences, setConsequences] = useState("");
  const [politicalImpacts, setPoliticalImpacts] = useState("");
  const [economicImpacts, setEconomicImpacts] = useState("");
  const [socialImpacts, setSocialImpacts] = useState("");
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [worldRecordIds, setWorldRecordIds] = useState<string[]>([currentRecordId]);
  const [organizationIds, setOrganizationIds] = useState<string[]>([]);
  const [bookIds, setBookIds] = useState<string[]>([]);
  const [narrativeArcs, setNarrativeArcs] = useState("");
  const [sourcesAndDocuments, setSourcesAndDocuments] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDateOrPeriod("");
    setFictionalCalendarDate("");
    setRealCalendarEquivalent("");
    setChronologicalOrder(events.length + 1);
    setIsApproximateDate(false);
    setIsUndefinedDate(false);
    setCategory("Fundação");
    setLocation("");
    setDescription("");
    setCauses("");
    setDevelopment("");
    setConsequences("");
    setPoliticalImpacts("");
    setEconomicImpacts("");
    setSocialImpacts("");
    setCharacterIds([]);
    setWorldRecordIds([currentRecordId]);
    setOrganizationIds([]);
    setBookIds([]);
    setNarrativeArcs("");
    setSourcesAndDocuments("");
    setImageUrl(undefined);
    setNotes("");
    setShowForm(false);
  };

  const openEdit = (ev: HistoricalEventItem) => {
    setEditingId(ev.id);
    setName(ev.name);
    setDateOrPeriod(ev.dateOrPeriod);
    setFictionalCalendarDate(ev.fictionalCalendarDate ?? "");
    setRealCalendarEquivalent(ev.realCalendarEquivalent ?? "");
    setChronologicalOrder(ev.chronologicalOrder);
    setIsApproximateDate(ev.isApproximateDate);
    setIsUndefinedDate(ev.isUndefinedDate);
    setCategory(ev.category || "Fundação");
    setLocation(ev.location);
    setDescription(ev.description);
    setCauses(ev.causes);
    setDevelopment(ev.development);
    setConsequences(ev.consequences);
    setPoliticalImpacts(ev.politicalImpacts);
    setEconomicImpacts(ev.economicImpacts);
    setSocialImpacts(ev.socialImpacts);
    setCharacterIds([...(ev.characterIds ?? [])]);
    setWorldRecordIds([...(ev.worldRecordIds ?? [])]);
    setOrganizationIds([...(ev.organizationIds ?? [])]);
    setBookIds([...(ev.bookIds ?? [])]);
    setNarrativeArcs(ev.narrativeArcs);
    setSourcesAndDocuments(ev.sourcesAndDocuments);
    setImageUrl(ev.imageUrl);
    setNotes(ev.notes);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const itemData: HistoricalEventItem = {
      id: editingId ?? `wev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      dateOrPeriod: isUndefinedDate
        ? "Data indefinida"
        : dateOrPeriod.trim() || "Período não especificado",
      fictionalCalendarDate: fictionalCalendarDate.trim() || undefined,
      realCalendarEquivalent: realCalendarEquivalent.trim() || undefined,
      chronologicalOrder: Number.isNaN(chronologicalOrder) ? events.length + 1 : chronologicalOrder,
      isApproximateDate,
      isUndefinedDate,
      category,
      location: location.trim(),
      description: description.trim(),
      causes: causes.trim(),
      development: development.trim(),
      consequences: consequences.trim(),
      politicalImpacts: politicalImpacts.trim(),
      economicImpacts: economicImpacts.trim(),
      socialImpacts: socialImpacts.trim(),
      characterIds,
      worldRecordIds,
      organizationIds,
      bookIds,
      narrativeArcs: narrativeArcs.trim(),
      sourcesAndDocuments: sourcesAndDocuments.trim(),
      imageUrl,
      notes: notes.trim(),
    };

    if (editingId) {
      onChangeEvents(events.map((e) => (e.id === editingId ? itemData : e)));
    } else {
      onChangeEvents([...events, itemData]);
    }
    resetForm();
  };

  const toggleIdInList = (list: string[], id: string, setter: (next: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const filteredAndSorted = events
    .filter((ev) => !filterCategory || ev.category === filterCategory)
    .filter((ev) => !filterCharacterId || ev.characterIds.includes(filterCharacterId))
    .filter((ev) => !filterBookId || ev.bookIds.includes(filterBookId))
    .filter((ev) => !filterRecordId || ev.worldRecordIds.includes(filterRecordId))
    .filter((ev) => {
      if (!filterPeriodQuery.trim()) return true;
      const q = filterPeriodQuery.toLowerCase();
      return (
        ev.dateOrPeriod.toLowerCase().includes(q) ||
        (ev.fictionalCalendarDate ?? "").toLowerCase().includes(q) ||
        ev.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sortDirection === "asc"
        ? a.chronologicalOrder - b.chronologicalOrder
        : b.chronologicalOrder - a.chronologicalOrder,
    );

  return (
    <div
      className="space-y-4 rounded-2xl border bg-background/40 p-4 sm:p-5"
      data-testid="encyclopedia-timeline-manager"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-display text-xl">
            Acontecimentos Históricos & Linha do Tempo ({events.length})
          </h4>
          <p className="text-xs text-muted-foreground">
            Registre guerras, tratados, fundações e eras. Suporta datas exatas, aproximadas,
            indefinidas e calendários fictícios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn text-xs"
          data-testid="btn-adicionar-acontecimento"
        >
          <Plus className="h-4 w-4" /> Adicionar acontecimento histórico
        </button>
      </div>

      {/* Formulário completo de Acontecimento Histórico */}
      {showForm && (
        <div
          className="card-luxe space-y-4 border-primary/50 p-4 sm:p-5"
          data-testid="historical-event-modal"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="font-display text-lg">
              {editingId ? "Editar acontecimento histórico" : "Novo acontecimento histórico"}
            </h5>
            <button
              type="button"
              onClick={resetForm}
              className="btn-ghost !min-h-7 !px-2 !py-0.5 text-xs"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="wev-name">Nome do acontecimento</label>
              <input
                id="wev-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tratado das Três Coroas, Queda de Aethelgard…"
                data-testid="input-event-name"
              />
            </div>

            <div>
              <label htmlFor="wev-cat">Categoria</label>
              <select
                id="wev-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-testid="select-event-category"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datas, Calendário Fictício e Ordem Cronológica */}
          <div className="grid gap-3 rounded-xl border bg-secondary/20 p-3.5 sm:grid-cols-4">
            <div>
              <label htmlFor="wev-date">Data ou período</label>
              <input
                id="wev-date"
                disabled={isUndefinedDate}
                value={dateOrPeriod}
                onChange={(e) => setDateOrPeriod(e.target.value)}
                placeholder="Ex: Ano 412, Século III…"
                data-testid="input-event-date"
              />
            </div>

            <div>
              <label htmlFor="wev-fic-cal">Data no calendário fictício (opcional)</label>
              <input
                id="wev-fic-cal"
                value={fictionalCalendarDate}
                onChange={(e) => setFictionalCalendarDate(e.target.value)}
                placeholder="Ex: 14ª Lua da Era da Chama"
                data-testid="input-event-fictional-date"
              />
            </div>

            <div>
              <label htmlFor="wev-real-eq">Correspondência no calendário real (opcional)</label>
              <input
                id="wev-real-eq"
                value={realCalendarEquivalent}
                onChange={(e) => setRealCalendarEquivalent(e.target.value)}
                placeholder="Ex: Outono de 1889 (manual)"
              />
            </div>

            <div>
              <label htmlFor="wev-order">Ordem cronológica (número)</label>
              <input
                id="wev-order"
                type="number"
                value={chronologicalOrder}
                onChange={(e) => setChronologicalOrder(Number(e.target.value))}
                data-testid="input-event-order"
              />
            </div>

            <div className="flex flex-wrap gap-4 sm:col-span-4">
              <label className="inline-flex cursor-pointer items-center gap-2 !text-xs !normal-case !tracking-normal text-foreground">
                <input
                  type="checkbox"
                  checked={isApproximateDate}
                  onChange={(e) => setIsApproximateDate(e.target.checked)}
                  className="!min-h-4 !w-4 accent-primary"
                />
                Data aproximada (cerca de / c.)
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 !text-xs !normal-case !tracking-normal text-foreground">
                <input
                  type="checkbox"
                  checked={isUndefinedDate}
                  onChange={(e) => setIsUndefinedDate(e.target.checked)}
                  className="!min-h-4 !w-4 accent-primary"
                />
                Sem data definida
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wev-loc">Local</label>
              <input
                id="wev-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cidade, fortaleza, região ou planeta onde ocorreu…"
                data-testid="input-event-location"
              />
            </div>

            <div>
              <label htmlFor="wev-arcs">Arcos narrativos relacionados</label>
              <input
                id="wev-arcs"
                value={narrativeArcs}
                onChange={(e) => setNarrativeArcs(e.target.value)}
                placeholder="Ex: Arco da Rebelião de Prata…"
              />
            </div>
          </div>

          <div>
            <label htmlFor="wev-desc">Descrição geral do acontecimento</label>
            <textarea
              id="wev-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumo do que aconteceu…"
              data-testid="input-event-description"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="wev-causes">Causas</label>
              <textarea
                id="wev-causes"
                rows={2}
                value={causes}
                onChange={(e) => setCauses(e.target.value)}
                placeholder="O que desencadeou o evento…"
              />
            </div>
            <div>
              <label htmlFor="wev-dev">Desenvolvimento</label>
              <textarea
                id="wev-dev"
                rows={2}
                value={development}
                onChange={(e) => setDevelopment(e.target.value)}
                placeholder="Como se desenrolou…"
              />
            </div>
            <div>
              <label htmlFor="wev-conseq">Consequências</label>
              <textarea
                id="wev-conseq"
                rows={2}
                value={consequences}
                onChange={(e) => setConsequences(e.target.value)}
                placeholder="Desdobramentos diretos…"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="wev-pol">Impactos políticos</label>
              <textarea
                id="wev-pol"
                rows={2}
                value={politicalImpacts}
                onChange={(e) => setPoliticalImpacts(e.target.value)}
                placeholder="Mudanças de poder, fronteiras ou leis…"
              />
            </div>
            <div>
              <label htmlFor="wev-eco">Impactos econômicos</label>
              <textarea
                id="wev-eco"
                rows={2}
                value={economicImpacts}
                onChange={(e) => setEconomicImpacts(e.target.value)}
                placeholder="Comércio, recursos, reconstrução…"
              />
            </div>
            <div>
              <label htmlFor="wev-soc">Impactos sociais</label>
              <textarea
                id="wev-soc"
                rows={2}
                value={socialImpacts}
                onChange={(e) => setSocialImpacts(e.target.value)}
                placeholder="Migrações, cultura, memória coletiva…"
              />
            </div>
          </div>

          {/* Vínculos por ID: Personagens, Livros, Países/Mundos e Organizações */}
          <div className="space-y-3 rounded-xl border bg-background/50 p-3.5">
            {characters.length > 0 && (
              <div>
                <label className="mb-1.5 block">
                  Personagens envolvidos (clique para selecionar)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {characters.map((c) => {
                    const active = characterIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleIdInList(characterIds, c.id, setCharacterIds)}
                        data-testid={`event-link-char-${c.id}`}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          active
                            ? "border-primary bg-primary/20 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.name || "Sem nome"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {books.length > 0 && (
              <div>
                <label className="mb-1.5 block">Livros relacionados (clique para selecionar)</label>
                <div className="flex flex-wrap gap-1.5">
                  {books.map((b) => {
                    const active = bookIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleIdInList(bookIds, b.id, setBookIds)}
                        data-testid={`event-link-book-${b.id}`}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          active
                            ? "border-teal bg-teal/20 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {b.order}. {b.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {worldRecords.length > 0 && (
              <div>
                <label className="mb-1.5 block">Países ou mundos envolvidos</label>
                <div className="flex flex-wrap gap-1.5">
                  {worldRecords.map((r) => {
                    const active = worldRecordIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleIdInList(worldRecordIds, r.id, setWorldRecordIds)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          active
                            ? "border-gold bg-gold/20 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r.name || "Registro atual"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {organizations.length > 0 && (
              <div>
                <label className="mb-1.5 block">Organizações relacionadas</label>
                <div className="flex flex-wrap gap-1.5">
                  {organizations.map((org) => {
                    const active = organizationIds.includes(org.id);
                    return (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => toggleIdInList(organizationIds, org.id, setOrganizationIds)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          active
                            ? "border-primary bg-primary/20 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {org.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wev-sources">Fontes e documentos</label>
              <input
                id="wev-sources"
                value={sourcesAndDocuments}
                onChange={(e) => setSourcesAndDocuments(e.target.value)}
                placeholder="Pergaminhos, registros imperiais, arquivos digitais…"
              />
            </div>
            <div>
              <label htmlFor="wev-notes">Notas adicionais</label>
              <input
                id="wev-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Segredos de bastidores sobre este evento…"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const dataUrl = await processImageFile(file);
                  const stored = await storeMediaDataUrl(`evimg_${Date.now()}`, dataUrl);
                  setImageUrl(stored);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-ghost text-xs"
              >
                <ImagePlus className="h-4 w-4" />{" "}
                {imageUrl ? "Trocar imagem" : "Imagem relacionada"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="btn text-xs"
              data-testid="btn-salvar-acontecimento"
            >
              <Check className="h-4 w-4" />{" "}
              {editingId ? "Salvar alterações" : "Salvar acontecimento"}
            </button>
          </div>
        </div>
      )}

      {/* Filtros da Linha do Tempo */}
      {events.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={filterPeriodQuery}
            onChange={(e) => setFilterPeriodQuery(e.target.value)}
            placeholder="Filtrar por período ou nome…"
          />

          <select
            aria-label="Filtrar linha do tempo por categoria"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar linha do tempo por personagem"
            value={filterCharacterId}
            onChange={(e) => setFilterCharacterId(e.target.value)}
          >
            <option value="">Todos os personagens</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar linha do tempo por livro"
            value={filterBookId}
            onChange={(e) => setFilterBookId(e.target.value)}
          >
            <option value="">Todos os livros</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
            className="btn-ghost text-xs"
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Ordem:{" "}
            {sortDirection === "asc" ? "Mais antigos" : "Mais recentes"}
          </button>
        </div>
      )}

      {/* Visualização da Linha do Tempo */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-xs text-muted-foreground">
          <Clock className="mx-auto mb-2 h-6 w-6 text-teal" />
          Nenhum acontecimento histórico registrado para os filtros atuais.
        </div>
      ) : (
        <div
          className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-primary/40"
          data-testid="visual-timeline-list"
        >
          {filteredAndSorted.map((ev) => {
            const linkedChars = characters.filter((c) => ev.characterIds.includes(c.id));
            const linkedBooks = books.filter((b) => ev.bookIds.includes(b.id));
            return (
              <div
                key={ev.id}
                className="relative rounded-2xl border bg-background/70 p-4"
                data-testid={`timeline-event-card-${ev.id}`}
              >
                <span className="absolute -left-[21px] top-5 h-3 w-3 rounded-full border-2 border-primary bg-background" />

                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-teal">
                        <Calendar className="h-3.5 w-3.5" />
                        {ev.isApproximateDate ? "c. " : ""}
                        {ev.dateOrPeriod}
                      </span>
                      {ev.fictionalCalendarDate && (
                        <span className="rounded bg-teal/15 px-2 py-0.5 text-[0.7rem] text-teal">
                          Calendário Fictício: {ev.fictionalCalendarDate}
                        </span>
                      )}
                      <span className="rounded bg-secondary px-2 py-0.5 text-[0.7rem] text-muted-foreground">
                        {ev.category}
                      </span>
                      {ev.location && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {ev.location}
                        </span>
                      )}
                    </div>

                    <h5 className="mt-1 font-display text-xl text-foreground">{ev.name}</h5>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(ev)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Editar ${ev.name}`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeEvents(events.filter((x) => x.id !== ev.id))}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label={`Excluir ${ev.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {ev.description && (
                  <p className="mt-2 text-xs text-muted-foreground">{ev.description}</p>
                )}

                {(ev.causes ||
                  ev.consequences ||
                  ev.politicalImpacts ||
                  ev.economicImpacts ||
                  ev.socialImpacts) && (
                  <div className="mt-3 grid gap-2 rounded-xl border bg-secondary/20 p-2.5 text-xs sm:grid-cols-2">
                    {ev.causes && (
                      <div>
                        <strong className="text-foreground">Causas:</strong> {ev.causes}
                      </div>
                    )}
                    {ev.consequences && (
                      <div>
                        <strong className="text-foreground">Consequências:</strong>{" "}
                        {ev.consequences}
                      </div>
                    )}
                    {ev.politicalImpacts && (
                      <div>
                        <strong className="text-foreground">Impacto Político:</strong>{" "}
                        {ev.politicalImpacts}
                      </div>
                    )}
                    {ev.socialImpacts && (
                      <div>
                        <strong className="text-foreground">Impacto Social:</strong>{" "}
                        {ev.socialImpacts}
                      </div>
                    )}
                  </div>
                )}

                {(linkedChars.length > 0 || linkedBooks.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-1 text-[0.7rem]">
                    {linkedChars.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-foreground"
                      >
                        <Users className="h-3 w-3 text-primary" /> {c.name}
                      </span>
                    ))}
                    {linkedBooks.map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2.5 py-0.5 text-foreground"
                      >
                        <BookOpen className="h-3 w-3 text-teal" /> {b.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

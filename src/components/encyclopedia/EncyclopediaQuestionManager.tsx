import { useState, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  AlertTriangle,
  ImagePlus,
  ExternalLink,
} from "lucide-react";
import { actions, type CustomQuestionType, type CustomQuestionAnswer } from "@/lib/store";
import type { EncyclopediaCustomQuestion } from "@/lib/encyclopedia-types";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

const QUESTION_TYPE_LABELS: Record<CustomQuestionType, string> = {
  short_text: "Texto curto",
  long_text: "Texto longo",
  number: "Número",
  date: "Data",
  boolean: "Sim ou não",
  single_select: "Seleção única",
  multi_select: "Seleção múltipla",
  custom_options: "Lista de opções personalizadas",
  numeric_scale: "Escala numérica",
  star_rating: "Avaliação por estrelas",
  color: "Cor",
  item_list: "Lista de itens",
  image: "Imagem ou referência visual",
  link: "Link",
  time: "Hora",
};

function isTypeCompatible(oldType: CustomQuestionType, newType: CustomQuestionType): boolean {
  if (oldType === newType) return true;
  const textGroup: CustomQuestionType[] = [
    "short_text",
    "long_text",
    "link",
    "date",
    "time",
    "color",
    "single_select",
  ];
  const numberGroup: CustomQuestionType[] = ["number", "numeric_scale", "star_rating"];
  const arrayGroup: CustomQuestionType[] = ["multi_select", "custom_options", "item_list"];
  if (textGroup.includes(oldType) && textGroup.includes(newType)) return true;
  if (numberGroup.includes(oldType) && numberGroup.includes(newType)) return true;
  if (arrayGroup.includes(oldType) && arrayGroup.includes(newType)) return true;
  return false;
}

const DEFAULT_SECTION_QUESTIONS: Record<
  number,
  { id: string; prompt: string; type: CustomQuestionType; options?: string[] }[]
> = {
  1: [
    {
      id: "def_sec1_1",
      prompt: "Qual é o significado simbólico das cores nacionais?",
      type: "long_text",
    },
  ],
  4: [
    {
      id: "def_sec4_1",
      prompt: "Qual acontecimento histórico ainda divide a opinião pública?",
      type: "long_text",
    },
  ],
  5: [
    {
      id: "def_sec5_1",
      prompt: "Nível de estabilidade política atual (1 a 10)",
      type: "numeric_scale",
    },
  ],
  14: [
    {
      id: "def_sec14_1",
      prompt: "Qual gesto cotidiano identifica imediatamente um nativo?",
      type: "short_text",
    },
  ],
  28: [
    {
      id: "def_sec28_1",
      prompt: "Qual lenda urbana ou mito popular os viajantes mais comentam?",
      type: "long_text",
    },
  ],
  31: [
    {
      id: "def_sec31_1",
      prompt: "O uso de magia/tecnologia avançada exige registro governamental?",
      type: "boolean",
    },
  ],
};

export function EncyclopediaQuestionManager({
  sectionNumber,
  sectionTitle,
  recordQuestions,
  globalQuestions,
  answers,
  removedDefaultIds,
  onChangeQuestions,
  onChangeAnswers,
  onChangeRemovedDefaults,
}: {
  sectionNumber: number;
  sectionTitle: string;
  recordQuestions: EncyclopediaCustomQuestion[];
  globalQuestions: EncyclopediaCustomQuestion[];
  answers: Record<string, CustomQuestionAnswer>;
  removedDefaultIds: string[];
  onChangeQuestions: (next: EncyclopediaCustomQuestion[]) => void;
  onChangeAnswers: (next: Record<string, CustomQuestionAnswer>) => void;
  onChangeRemovedDefaults: (next: string[]) => void;
}) {
  const [manageOpen, setManageOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [qType, setQType] = useState<CustomQuestionType>("short_text");
  const [required, setRequired] = useState(false);
  const [scope, setScope] = useState<"character" | "global">("character");
  const [favorite, setFavorite] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [optInput, setOptInput] = useState("");
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(10);
  const [formError, setFormError] = useState("");
  const [confirmDeleteQ, setConfirmDeleteQ] = useState<EncyclopediaCustomQuestion | null>(null);
  const [listItemInput, setListItemInput] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Perguntas padrão da seção que não foram removidas nem sobrescritas
  const defaultsForSec = (DEFAULT_SECTION_QUESTIONS[sectionNumber] ?? [])
    .filter((d) => !removedDefaultIds.includes(d.id))
    .filter((d) => !recordQuestions.some((rq) => rq.id === d.id))
    .map((d): EncyclopediaCustomQuestion => ({
      id: d.id,
      sectionNumber,
      prompt: d.prompt,
      type: d.type,
      required: false,
      options: d.options ?? [],
      scope: "character",
      favorite: false,
      scaleMin: 1,
      scaleMax: 10,
    }));

  const recSecQuestions = recordQuestions.filter((q) => q.sectionNumber === sectionNumber);
  const globSecQuestions = globalQuestions.filter(
    (q) => q.sectionNumber === sectionNumber && !recSecQuestions.some((rq) => rq.id === q.id),
  );

  const allSectionQuestions: EncyclopediaCustomQuestion[] = [
    ...defaultsForSec,
    ...recSecQuestions,
    ...globSecQuestions,
  ];

  const resetForm = () => {
    setEditingId(null);
    setPrompt("");
    setQType("short_text");
    setRequired(false);
    setScope("character");
    setFavorite(false);
    setOptions([]);
    setOptInput("");
    setScaleMin(1);
    setScaleMax(10);
    setFormError("");
  };

  const openEditQuestion = (q: EncyclopediaCustomQuestion) => {
    setEditingId(q.id);
    setPrompt(q.prompt);
    setQType(q.type);
    setRequired(q.required);
    setScope(q.scope);
    setFavorite(Boolean(q.favorite));
    setOptions([...(q.options ?? [])]);
    setOptInput("");
    setScaleMin(q.scaleMin ?? 1);
    setScaleMax(q.scaleMax ?? 10);
    setFormError("");
    setManageOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!prompt.trim()) {
      setFormError("Digite o texto da pergunta.");
      return;
    }
    const needsOpts =
      qType === "single_select" || qType === "multi_select" || qType === "custom_options";
    if (needsOpts && options.length === 0) {
      setFormError("Adicione pelo menos uma opção de resposta.");
      return;
    }

    const qId = editingId ?? `wq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const prevQ = allSectionQuestions.find((x) => x.id === qId);

    const def: EncyclopediaCustomQuestion = {
      id: qId,
      sectionNumber,
      prompt: prompt.trim(),
      type: qType,
      required,
      options: needsOpts ? options : [],
      scope,
      favorite,
      scaleMin: qType === "numeric_scale" ? scaleMin : undefined,
      scaleMax: qType === "numeric_scale" ? scaleMax : undefined,
    };

    if (scope === "global") {
      actions.saveWorldGlobalQuestion(def);
      onChangeQuestions(recordQuestions.filter((x) => x.id !== qId));
    } else {
      if (prevQ?.scope === "global") {
        actions.deleteWorldGlobalQuestion(qId);
      }
      const exists = recordQuestions.some((x) => x.id === qId);
      const next = exists
        ? recordQuestions.map((x) => (x.id === qId ? def : x))
        : [...recordQuestions, def];
      onChangeQuestions(next);
    }

    // Preserva a resposta se o tipo continuar compatível
    if (prevQ && !isTypeCompatible(prevQ.type, def.type)) {
      const nextAns = { ...answers };
      delete nextAns[qId];
      onChangeAnswers(nextAns);
    }

    resetForm();
  };

  const toggleFavoriteQuestion = (q: EncyclopediaCustomQuestion) => {
    const updated: EncyclopediaCustomQuestion = {
      ...q,
      favorite: !q.favorite,
    };
    if (q.scope === "global") {
      actions.saveWorldGlobalQuestion(updated);
    } else {
      const exists = recordQuestions.some((x) => x.id === q.id);
      if (exists) {
        onChangeQuestions(recordQuestions.map((x) => (x.id === q.id ? updated : x)));
      } else {
        onChangeQuestions([...recordQuestions, updated]);
      }
    }
  };

  const moveQuestion = (qId: string, dir: -1 | 1) => {
    // Materializa as perguntas da seção na lista do registro para permitir reordenar livremente
    const currentSecIds = allSectionQuestions.map((q) => q.id);
    const idx = currentSecIds.indexOf(qId);
    const targetIdx = idx + dir;
    if (idx === -1 || targetIdx < 0 || targetIdx >= allSectionQuestions.length) {
      return;
    }
    const orderedSec = [...allSectionQuestions];
    const tmp = orderedSec[idx]!;
    orderedSec[idx] = orderedSec[targetIdx]!;
    orderedSec[targetIdx] = tmp;

    const otherSecs = recordQuestions.filter((q) => q.sectionNumber !== sectionNumber);
    onChangeQuestions([...otherSecs, ...orderedSec]);
  };

  const requestDeleteQuestion = (q: EncyclopediaCustomQuestion) => {
    const hasAns =
      answers[q.id] !== undefined &&
      answers[q.id] !== null &&
      answers[q.id] !== "" &&
      !(Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0);

    if (hasAns) {
      setConfirmDeleteQ(q);
    } else {
      executeDeleteQuestion(q);
    }
  };

  const executeDeleteQuestion = (q: EncyclopediaCustomQuestion) => {
    if (q.id.startsWith("def_sec")) {
      if (!removedDefaultIds.includes(q.id)) {
        onChangeRemovedDefaults([...removedDefaultIds, q.id]);
      }
    }
    if (q.scope === "global") {
      actions.deleteWorldGlobalQuestion(q.id);
    }
    onChangeQuestions(recordQuestions.filter((x) => x.id !== q.id));
    const nextAns = { ...answers };
    delete nextAns[q.id];
    onChangeAnswers(nextAns);
    setConfirmDeleteQ(null);
  };

  const restoreDefaultQuestions = () => {
    const defaultIdsForSec = (DEFAULT_SECTION_QUESTIONS[sectionNumber] ?? []).map((d) => d.id);
    onChangeRemovedDefaults(removedDefaultIds.filter((id) => !defaultIdsForSec.includes(id)));
  };

  const setAnswer = (qId: string, val: CustomQuestionAnswer) => {
    onChangeAnswers({ ...answers, [qId]: val });
  };

  const hasRemovedDefaults = (DEFAULT_SECTION_QUESTIONS[sectionNumber] ?? []).some((d) =>
    removedDefaultIds.includes(d.id),
  );

  return (
    <div
      className="mt-5 space-y-3 border-t border-border/60 pt-4"
      data-testid={`sec-questions-block-${sectionNumber}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-teal" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Perguntas da Seção ({allSectionQuestions.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasRemovedDefaults && (
            <button
              type="button"
              onClick={restoreDefaultQuestions}
              className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
              data-testid={`btn-restaurar-perguntas-sec-${sectionNumber}`}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar predefinidas
            </button>
          )}
          <button
            type="button"
            onClick={() => setManageOpen((v) => !v)}
            className="btn-ghost !min-h-8 !px-3 !py-1 text-xs text-teal"
            data-testid={`btn-gerenciar-perguntas-sec-${sectionNumber}`}
          >
            <Plus className="h-3.5 w-3.5" />{" "}
            {manageOpen ? "Fechar gerenciador de perguntas" : "Gerenciar perguntas"}
          </button>
        </div>
      </div>

      {/* Painel de criação/edição de perguntas da seção */}
      {manageOpen && (
        <div
          className="rounded-2xl border border-primary/50 bg-background/80 p-4 space-y-4"
          data-testid={`question-manager-modal-sec-${sectionNumber}`}
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-display text-lg">
              {editingId
                ? `Editar pergunta — ${sectionTitle}`
                : `Adicionar pergunta em ${sectionTitle}`}
            </h4>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setManageOpen(false);
              }}
              className="btn-ghost !min-h-7 !px-2 !py-0.5 text-xs"
            >
              <X className="h-3.5 w-3.5" /> Fechar
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={`wq-prompt-${sectionNumber}`}>Texto da pergunta</label>
              <input
                id={`wq-prompt-${sectionNumber}`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Digite a pergunta personalizada para esta seção…"
                data-testid={`input-wq-prompt-sec-${sectionNumber}`}
              />
            </div>

            <div>
              <label htmlFor={`wq-type-${sectionNumber}`}>Tipo de resposta</label>
              <select
                id={`wq-type-${sectionNumber}`}
                value={qType}
                onChange={(e) => setQType(e.target.value as CustomQuestionType)}
                data-testid={`select-wq-type-sec-${sectionNumber}`}
              >
                {(Object.keys(QUESTION_TYPE_LABELS) as CustomQuestionType[]).map((t) => (
                  <option key={t} value={t}>
                    {QUESTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`wq-scope-${sectionNumber}`}>Escopo de reutilização</label>
              <select
                id={`wq-scope-${sectionNumber}`}
                value={scope}
                onChange={(e) => setScope(e.target.value as "character" | "global")}
              >
                <option value="character">Exclusiva deste registro</option>
                <option value="global">Reutilizável em outros registros da enciclopédia</option>
              </select>
            </div>
          </div>

          {(qType === "single_select" ||
            qType === "multi_select" ||
            qType === "custom_options") && (
            <div className="space-y-2 rounded-xl border bg-secondary/30 p-3">
              <label htmlFor={`wq-opt-input-${sectionNumber}`}>
                Opções personalizadas de resposta
              </label>
              <div className="flex gap-2">
                <input
                  id={`wq-opt-input-${sectionNumber}`}
                  value={optInput}
                  onChange={(e) => setOptInput(e.target.value)}
                  placeholder="Digite uma opção…"
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = optInput.trim();
                    if (clean && !options.includes(clean)) {
                      setOptions([...options, clean]);
                      setOptInput("");
                    }
                  }}
                  className="btn-ghost text-xs"
                  data-testid={`btn-add-wq-opt-sec-${sectionNumber}`}
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar opção
                </button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {options.map((o, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs"
                    >
                      {o}
                      <button
                        type="button"
                        onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {qType === "numeric_scale" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>Mínimo da escala</label>
                <input
                  type="number"
                  value={scaleMin}
                  onChange={(e) => setScaleMin(Number(e.target.value))}
                />
              </div>
              <div>
                <label>Máximo da escala</label>
                <input
                  type="number"
                  value={scaleMax}
                  onChange={(e) => setScaleMax(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 !text-xs !normal-case !tracking-normal text-foreground">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="!min-h-4 !w-4 accent-primary"
                />
                Marcar como pergunta favorita ⭐
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 !text-xs !normal-case !tracking-normal text-foreground">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="!min-h-4 !w-4 accent-primary"
                />
                Resposta destacada
              </label>
            </div>

            <div className="flex gap-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-ghost text-xs">
                  Cancelar edição
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="btn text-xs"
                data-testid={`btn-salvar-wq-sec-${sectionNumber}`}
              >
                <Check className="h-3.5 w-3.5" />{" "}
                {editingId ? "Salvar alterações da pergunta" : "Salvar pergunta"}
              </button>
            </div>
          </div>

          {formError && <p className="text-xs text-destructive">{formError}</p>}
        </div>
      )}

      {/* Modal de confirmação antes de excluir pergunta já respondida */}
      {confirmDeleteQ && (
        <div
          className="rounded-2xl border border-destructive bg-destructive/10 p-4 space-y-2"
          data-testid={`confirm-delete-wq-modal-sec-${sectionNumber}`}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">
                Excluir a pergunta “{confirmDeleteQ.prompt}”?
              </p>
              <p className="mt-1 text-muted-foreground">
                Esta pergunta já possui uma resposta registrada. Ao confirmar a exclusão, a pergunta
                e a resposta associada a ela serão removidas deste registro.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteQ(null)}
              className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => executeDeleteQuestion(confirmDeleteQ)}
              className="btn !min-h-8 !bg-destructive !px-3 !py-1 text-xs"
              data-testid={`btn-confirmar-exclusao-wq-sec-${sectionNumber}`}
            >
              Confirmar exclusão
            </button>
          </div>
        </div>
      )}

      {/* Lista de perguntas e campos de resposta */}
      {allSectionQuestions.length > 0 && (
        <div className="space-y-3">
          {allSectionQuestions.map((q, idx) => {
            const ans = answers[q.id];
            const isDef = q.id.startsWith("def_sec");
            return (
              <div
                key={q.id}
                className="rounded-xl border bg-background/50 p-3.5 space-y-2"
                data-testid={`wq-card-${q.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {q.favorite && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                      <span className="text-sm font-medium text-foreground">{q.prompt}</span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                        {isDef ? "Predefinida" : "Personalizada"} · {QUESTION_TYPE_LABELS[q.type]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleFavoriteQuestion(q)}
                      aria-label={`Favoritar pergunta ${q.prompt}`}
                      className="rounded p-1 text-muted-foreground hover:text-gold"
                      title="Marcar/desmarcar pergunta favorita"
                    >
                      <Star className={`h-3.5 w-3.5 ${q.favorite ? "fill-gold text-gold" : ""}`} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveQuestion(q.id, -1)}
                      aria-label="Mover pergunta para cima"
                      className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === allSectionQuestions.length - 1}
                      onClick={() => moveQuestion(q.id, 1)}
                      aria-label="Mover pergunta para baixo"
                      className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditQuestion(q)}
                      aria-label={`Editar pergunta ${q.prompt}`}
                      data-testid={`btn-edit-wq-${q.id}`}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteQuestion(q)}
                      aria-label={`Excluir pergunta ${q.prompt}`}
                      data-testid={`btn-delete-wq-${q.id}`}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Renderização do campo de acordo com os 15 tipos de resposta */}
                {q.type === "short_text" && (
                  <input
                    aria-label={q.prompt}
                    value={typeof ans === "string" ? ans : ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Sua resposta…"
                  />
                )}

                {q.type === "long_text" && (
                  <textarea
                    aria-label={q.prompt}
                    rows={3}
                    value={typeof ans === "string" ? ans : ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Descreva detalhadamente…"
                  />
                )}

                {q.type === "number" && (
                  <input
                    type="number"
                    aria-label={q.prompt}
                    value={typeof ans === "number" || typeof ans === "string" ? ans : ""}
                    onChange={(e) =>
                      setAnswer(q.id, e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                )}

                {q.type === "date" && (
                  <input
                    type="date"
                    aria-label={q.prompt}
                    value={typeof ans === "string" ? ans : ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}

                {q.type === "time" && (
                  <input
                    type="time"
                    aria-label={q.prompt}
                    value={typeof ans === "string" ? ans : ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}

                {q.type === "boolean" && (
                  <div className="flex gap-2">
                    {[
                      { label: "Sim", val: true },
                      { label: "Não", val: false },
                    ].map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setAnswer(q.id, b.val)}
                        className={`rounded-lg border px-3 py-1 text-xs ${
                          ans === b.val
                            ? "border-primary bg-primary/20 text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "single_select" && (
                  <select
                    aria-label={q.prompt}
                    value={typeof ans === "string" ? ans : ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  >
                    <option value="">Selecione…</option>
                    {q.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}

                {(q.type === "multi_select" || q.type === "custom_options") && (
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((o) => {
                      const arr = Array.isArray(ans) ? ans : [];
                      const active = arr.includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() =>
                            setAnswer(q.id, active ? arr.filter((x) => x !== o) : [...arr, o])
                          }
                          className={`rounded-lg border px-2.5 py-1 text-xs ${
                            active
                              ? "border-primary bg-primary/20 text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "numeric_scale" && (
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={q.scaleMin ?? 1}
                      max={q.scaleMax ?? 10}
                      value={typeof ans === "number" ? ans : (q.scaleMin ?? 1)}
                      onChange={(e) => setAnswer(q.id, Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="font-mono text-xs text-teal">
                      {typeof ans === "number" ? ans : (q.scaleMin ?? 1)} / {q.scaleMax ?? 10}
                    </span>
                  </div>
                )}

                {q.type === "star_rating" && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((st) => {
                      const active = (typeof ans === "number" ? ans : 0) >= st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAnswer(q.id, st)}
                          className="p-1"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              active ? "fill-gold text-gold" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "color" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        typeof ans === "string" && /^#[0-9A-Fa-f]{6}$/.test(ans) ? ans : "#5CC8C0"
                      }
                      onChange={(e) => setAnswer(q.id, e.target.value.toUpperCase())}
                      className="!h-9 !w-12 cursor-pointer !p-1"
                    />
                    <input
                      aria-label={`Hexadecimal para ${q.prompt}`}
                      value={typeof ans === "string" ? ans : "#5CC8C0"}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                )}

                {q.type === "item_list" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={listItemInput[q.id] ?? ""}
                        onChange={(e) =>
                          setListItemInput({
                            ...listItemInput,
                            [q.id]: e.target.value,
                          })
                        }
                        placeholder="Adicionar item…"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const v = (listItemInput[q.id] ?? "").trim();
                          if (!v) return;
                          const curr = Array.isArray(ans) ? ans : [];
                          setAnswer(q.id, [...curr, v]);
                          setListItemInput({ ...listItemInput, [q.id]: "" });
                        }}
                        className="btn-ghost text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Incluir
                      </button>
                    </div>
                    {Array.isArray(ans) && ans.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ans.map((it, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-lg border bg-secondary px-2 py-0.5 text-xs"
                          >
                            {it}
                            <button
                              type="button"
                              onClick={() =>
                                setAnswer(
                                  q.id,
                                  ans.filter((_, idx2) => idx2 !== i),
                                )
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {q.type === "link" && (
                  <div className="flex gap-2">
                    <input
                      aria-label={q.prompt}
                      value={typeof ans === "string" ? ans : ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="https://…"
                    />
                    {typeof ans === "string" && ans.trim() && (
                      <a href={ans} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {q.type === "image" && (
                  <div className="space-y-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[q.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const dataUrl = await processImageFile(file);
                        const stored = await storeMediaDataUrl(`wqimg_${q.id}`, dataUrl);
                        setAnswer(q.id, { imageUrl: stored, caption: file.name });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[q.id]?.click()}
                      className="btn-ghost text-xs"
                    >
                      <ImagePlus className="h-3.5 w-3.5" /> Selecionar imagem
                    </button>
                    {ans && typeof ans === "object" && !Array.isArray(ans) && "imageUrl" in ans && (
                      <div className="h-28 w-40 overflow-hidden rounded-xl border">
                        <MediaImage
                          src={ans.imageUrl}
                          alt={ans.caption || q.prompt}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
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

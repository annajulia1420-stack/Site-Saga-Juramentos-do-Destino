import { useState, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Star,
  ExternalLink,
  Check,
  X,
  HelpCircle,
  AlertTriangle,
  ImagePlus,
} from "lucide-react";
import {
  type CustomQuestionDefinition,
  type CustomQuestionType,
  type CustomQuestionAnswer,
  actions,
} from "@/lib/store";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

export const QUESTION_TYPE_LABELS: Record<CustomQuestionType, string> = {
  short_text: "Texto curto",
  long_text: "Texto longo",
  number: "Número",
  date: "Data",
  boolean: "Resposta de sim ou não",
  single_select: "Seleção de uma opção",
  multi_select: "Seleção de várias opções",
  custom_options: "Lista de opções personalizável",
  numeric_scale: "Escala numérica",
  star_rating: "Avaliação por estrelas",
  color: "Cor",
  item_list: "Lista de itens (várias respostas)",
  image: "Imagem ou referência visual",
  link: "Campo de link",
  time: "Campo de hora",
};

const SUGGESTED_QUESTIONS: string[] = [
  "Qual é sua peça de teatro favorita?",
  "Qual é o apelido mais estranho que já recebeu?",
  "Qual é a memória mais engraçada da infância?",
  "Qual objeto jamais emprestaria?",
  "Qual é seu maior arrependimento?",
  "Que música cantaria em um karaokê?",
  "Qual é seu talento mais inútil?",
];

function isTypeGroupCompatible(a: CustomQuestionType, b: CustomQuestionType): boolean {
  if (a === b) return true;
  const textTypes: CustomQuestionType[] = ["short_text", "long_text", "link", "single_select"];
  if (textTypes.includes(a) && textTypes.includes(b)) return true;
  const arrayTypes: CustomQuestionType[] = ["multi_select", "custom_options", "item_list"];
  if (arrayTypes.includes(a) && arrayTypes.includes(b)) return true;
  const numTypes: CustomQuestionType[] = ["number", "numeric_scale", "star_rating"];
  if (numTypes.includes(a) && numTypes.includes(b)) return true;
  return false;
}

function hasAnswerValue(ans: CustomQuestionAnswer | undefined): boolean {
  if (ans === null || ans === undefined) return false;
  if (typeof ans === "string") return ans.trim().length > 0;
  if (typeof ans === "number") return true;
  if (typeof ans === "boolean") return true;
  if (Array.isArray(ans)) return ans.length > 0;
  if (typeof ans === "object" && "imageUrl" in ans) return Boolean(ans.imageUrl);
  return false;
}

export function CustomQuestionsManager({
  characterQuestions,
  globalQuestions,
  answers,
  onChangeQuestions,
  onChangeAnswers,
}: {
  characterQuestions: CustomQuestionDefinition[];
  globalQuestions: CustomQuestionDefinition[];
  answers: Record<string, CustomQuestionAnswer>;
  onChangeQuestions: (next: CustomQuestionDefinition[]) => void;
  onChangeAnswers: (next: Record<string, CustomQuestionAnswer>) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [qType, setQType] = useState<CustomQuestionType>("short_text");
  const [required, setRequired] = useState(false);
  const [scope, setScope] = useState<"character" | "global">("character");
  const [optionsText, setOptionsText] = useState("");
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(10);
  const [formError, setFormError] = useState("");

  // Confirmação de mudança de tipo incompatível e confirmação de exclusão
  const [pendingTypeChangeWarning, setPendingTypeChangeWarning] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Inputs auxiliares para responder tipos de lista/opções
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Unifica perguntas globais e perguntas exclusivas do personagem sem duplicar IDs
  const allQuestions: CustomQuestionDefinition[] = [
    ...characterQuestions,
    ...globalQuestions.filter((gq) => !characterQuestions.some((cq) => cq.id === gq.id)),
  ];

  const needsOptions = (t: CustomQuestionType) =>
    t === "single_select" || t === "multi_select" || t === "custom_options";

  const openNewQuestionModal = () => {
    setEditingId(null);
    setPrompt("");
    setQType("short_text");
    setRequired(false);
    setScope("character");
    setOptionsList(["Opção 1", "Opção 2"]);
    setOptionsText("");
    setScaleMin(1);
    setScaleMax(10);
    setFormError("");
    setPendingTypeChangeWarning(false);
    setModalOpen(true);
  };

  const openEditQuestionModal = (q: CustomQuestionDefinition) => {
    setEditingId(q.id);
    setPrompt(q.prompt);
    setQType(q.type);
    setRequired(q.required);
    setScope(q.scope);
    setOptionsList([...(q.options ?? [])]);
    setOptionsText("");
    setScaleMin(q.scaleMin ?? 1);
    setScaleMax(q.scaleMax ?? 10);
    setFormError("");
    setPendingTypeChangeWarning(false);
    setModalOpen(true);
  };

  const addOptionToDraft = () => {
    const val = optionsText.trim();
    if (!val) return;
    if (!optionsList.includes(val)) {
      setOptionsList([...optionsList, val]);
    }
    setOptionsText("");
  };

  const removeOptionFromDraft = (opt: string) => {
    setOptionsList(optionsList.filter((x) => x !== opt));
  };

  const handleSaveQuestion = (forceIncompatibleChange = false) => {
    if (!prompt.trim()) {
      setFormError("Informe o texto da pergunta.");
      return;
    }
    if (needsOptions(qType) && optionsList.length === 0) {
      setFormError("Adicione pelo menos uma opção de resposta para este tipo de pergunta.");
      return;
    }

    const existingQ = editingId ? allQuestions.find((q) => q.id === editingId) : undefined;
    const existingAns = editingId ? answers[editingId] : undefined;

    if (
      existingQ &&
      existingQ.type !== qType &&
      hasAnswerValue(existingAns) &&
      !isTypeGroupCompatible(existingQ.type, qType) &&
      !forceIncompatibleChange
    ) {
      setPendingTypeChangeWarning(true);
      return;
    }

    const def: CustomQuestionDefinition = {
      id: editingId ?? `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      prompt: prompt.trim(),
      type: qType,
      required,
      options: needsOptions(qType) ? optionsList : [],
      scope,
      scaleMin: qType === "numeric_scale" ? scaleMin : undefined,
      scaleMax: qType === "numeric_scale" ? scaleMax : undefined,
    };

    if (scope === "global") {
      actions.saveGlobalQuestion(def);
    }

    if (editingId) {
      const inChar = characterQuestions.some((x) => x.id === editingId);
      if (inChar) {
        onChangeQuestions(characterQuestions.map((x) => (x.id === editingId ? def : x)));
      } else {
        onChangeQuestions([...characterQuestions, def]);
      }

      // Se a mudança de tipo foi compatível, preserva a resposta existente!
      // Se foi incompatível e o usuário confirmou, adapta ou reinicia com segurança.
      if (existingQ && existingQ.type !== qType && !isTypeGroupCompatible(existingQ.type, qType)) {
        const nextAnswers = { ...answers };
        delete nextAnswers[def.id];
        onChangeAnswers(nextAnswers);
      }
    } else {
      onChangeQuestions([...characterQuestions, def]);
      if (qType === "color") {
        onChangeAnswers({ ...answers, [def.id]: "#E8475F" });
      }
    }

    setPendingTypeChangeWarning(false);
    setModalOpen(false);
    setEditingId(null);
  };

  const confirmDeleteQuestion = (qid: string) => {
    onChangeQuestions(characterQuestions.filter((q) => q.id !== qid));
    actions.deleteGlobalQuestion(qid);
    const nextAns = { ...answers };
    delete nextAns[qid];
    onChangeAnswers(nextAns);
    setDeleteConfirmId(null);
  };

  const setAnswer = (qid: string, val: CustomQuestionAnswer) => {
    onChangeAnswers({ ...answers, [qid]: val });
  };

  // Permite adicionar opção personalizada diretamente ao responder pergunta do tipo custom_options
  const appendCustomOptionToQuestion = (q: CustomQuestionDefinition, newOpt: string) => {
    const clean = newOpt.trim();
    if (!clean) return;
    const updatedQ: CustomQuestionDefinition = {
      ...q,
      options: q.options.includes(clean) ? q.options : [...q.options, clean],
    };
    if (q.scope === "global") actions.saveGlobalQuestion(updatedQ);
    onChangeQuestions(
      characterQuestions.some((x) => x.id === q.id)
        ? characterQuestions.map((x) => (x.id === q.id ? updatedQ : x))
        : [...characterQuestions, updatedQ],
    );
    const curr = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
    if (!curr.includes(clean)) {
      setAnswer(q.id, [...curr, clean]);
    }
    setItemDrafts({ ...itemDrafts, [q.id]: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl">Perguntas Personalizadas da Ficha</h3>
          <p className="text-xs text-muted-foreground">
            Crie suas próprias perguntas e escolha o formato ideal de resposta para aprofundar o
            personagem.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewQuestionModal}
          className="btn"
          data-testid="btn-adicionar-pergunta"
        >
          <Plus className="h-4 w-4" /> Adicionar pergunta
        </button>
      </div>

      {/* Modal de Criação / Edição de Pergunta */}
      {modalOpen && (
        <div
          className="card-luxe space-y-4 border-primary/60 p-4 sm:p-6"
          data-testid="question-builder-modal"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="font-display text-xl">
              {editingId ? "Editar pergunta personalizada" : "Nova pergunta personalizada"}
            </h4>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
            >
              <X className="h-4 w-4" /> Fechar
            </button>
          </div>

          {/* Sugestões rápidas de inspiração */}
          {!editingId && (
            <div>
              <label>Sugestões rápidas (clique para usar ou escreva a sua abaixo)</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setPrompt(sug)}
                    className="rounded-lg border bg-secondary/40 px-2.5 py-1 text-left text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="question-prompt-input">1. Texto da pergunta</label>
              <input
                id="question-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Qual objeto jamais emprestaria?"
              />
            </div>

            <div>
              <label htmlFor="question-type-select">2. Tipo de resposta</label>
              <select
                id="question-type-select"
                value={qType}
                onChange={(e) => {
                  setQType(e.target.value as CustomQuestionType);
                  setPendingTypeChangeWarning(false);
                }}
              >
                {(Object.keys(QUESTION_TYPE_LABELS) as CustomQuestionType[]).map((k) => (
                  <option key={k} value={k}>
                    {QUESTION_TYPE_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="question-scope-select">5. Escopo da pergunta</label>
              <select
                id="question-scope-select"
                value={scope}
                onChange={(e) => setScope(e.target.value as "character" | "global")}
              >
                <option value="character">Pertence apenas a este personagem</option>
                <option value="global">Reutilizável em outras fichas da saga</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 !normal-case !tracking-normal text-sm text-foreground">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="!h-4 !w-4"
              />
              <span>3. Resposta obrigatória na ficha</span>
            </label>
          </div>

          {/* Configuração de opções quando aplicável */}
          {needsOptions(qType) && (
            <div className="space-y-2 rounded-xl border bg-background/50 p-3.5">
              <label>4. Opções de resposta</label>
              <div className="flex gap-2">
                <input
                  aria-label="Nova opção de resposta"
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOptionToDraft();
                    }
                  }}
                  placeholder="Digite uma opção e clique em Adicionar…"
                />
                <button
                  type="button"
                  onClick={addOptionToDraft}
                  className="btn-ghost shrink-0 text-xs"
                  data-testid="btn-add-question-option"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar opção
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {optionsList.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-secondary px-2.5 py-1 text-xs"
                  >
                    {opt}
                    <button
                      type="button"
                      onClick={() => removeOptionFromDraft(opt)}
                      aria-label={`Remover opção ${opt}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Configuração de escala numérica */}
          {qType === "numeric_scale" && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border bg-background/50 p-3.5">
              <div>
                <label htmlFor="scale-min-input">Valor mínimo</label>
                <input
                  id="scale-min-input"
                  type="number"
                  value={scaleMin}
                  onChange={(e) => setScaleMin(Number(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="scale-max-input">Valor máximo</label>
                <input
                  id="scale-max-input"
                  type="number"
                  value={scaleMax}
                  onChange={(e) => setScaleMax(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Alerta de confirmação caso mudança de tipo possa causar perda de resposta */}
          {pendingTypeChangeWarning && (
            <div
              className="rounded-xl border border-destructive bg-destructive/10 p-3.5 text-xs"
              data-testid="type-change-warning"
            >
              <div className="flex items-center gap-2 font-medium text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Atenção: Esta pergunta já possui uma resposta salva. Mudar para “
                  {QUESTION_TYPE_LABELS[qType]}” pode substituir o formato da resposta atual.
                </span>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingTypeChangeWarning(false)}
                  className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
                >
                  Manter tipo anterior
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuestion(true)}
                  className="btn !min-h-8 !bg-destructive !px-3 !py-1 text-xs"
                  data-testid="btn-confirm-type-change"
                >
                  Confirmar mudança de tipo
                </button>
              </div>
            </div>
          )}

          {formError && <p className="text-xs text-destructive">{formError}</p>}

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost text-xs">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSaveQuestion(false)}
              className="btn text-xs"
              data-testid="btn-salvar-pergunta"
            >
              <Check className="h-4 w-4" /> Salvar pergunta
            </button>
          </div>
        </div>
      )}

      {/* Listagem de perguntas personalizadas e seus componentes de resposta */}
      {allQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center">
          <HelpCircle className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma pergunta personalizada adicionada ainda.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clique em “Adicionar pergunta” para criar campos sob medida para este personagem.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allQuestions.map((q) => {
            const ans = answers[q.id];
            return (
              <div
                key={q.id}
                className="rounded-2xl border bg-background/50 p-4"
                data-testid={`custom-question-card-${q.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-display text-lg font-medium text-foreground">
                        {q.prompt}
                      </h5>
                      {q.required && (
                        <span className="text-xs font-medium text-primary">* Obrigatória</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {QUESTION_TYPE_LABELS[q.type]} ·{" "}
                      {q.scope === "global" ? "Reutilizável na saga" : "Exclusiva desta ficha"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditQuestionModal(q)}
                      className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                      data-testid={`btn-edit-question-${q.id}`}
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(q.id)}
                      aria-label={`Excluir pergunta ${q.prompt}`}
                      className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs text-destructive"
                      data-testid={`btn-delete-question-${q.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confirmação de exclusão */}
                {deleteConfirmId === q.id && (
                  <div
                    className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive bg-destructive/10 p-3 text-xs"
                    data-testid={`confirm-delete-question-${q.id}`}
                  >
                    <span>Tem certeza que deseja excluir esta pergunta e sua resposta?</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="btn-ghost !min-h-7 !px-2.5 !py-1 text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDeleteQuestion(q.id)}
                        className="btn !min-h-7 !bg-destructive !px-2.5 !py-1 text-xs"
                        data-testid={`btn-confirm-delete-question-${q.id}`}
                      >
                        Confirmar exclusão
                      </button>
                    </div>
                  </div>
                )}

                {/* Componente apropriado para cada tipo de resposta */}
                <div className="mt-3">
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
                      placeholder="Escreva detalhadamente…"
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
                      placeholder="0"
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
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setAnswer(q.id, opt.val)}
                          className={`min-h-10 rounded-xl border px-4 text-sm font-medium transition ${
                            ans === opt.val
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === "single_select" && (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(q.id, opt)}
                          className={`min-h-10 rounded-xl border px-3.5 py-1.5 text-xs font-medium transition ${
                            ans === opt
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {(q.type === "multi_select" || q.type === "custom_options") && (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt) => {
                          const selected = Array.isArray(ans) && ans.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const curr = Array.isArray(ans) ? ans : [];
                                setAnswer(
                                  q.id,
                                  selected ? curr.filter((x) => x !== opt) : [...curr, opt],
                                );
                              }}
                              className={`min-h-9 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {q.type === "custom_options" && (
                        <div className="flex gap-2">
                          <input
                            aria-label={`Nova opção para ${q.prompt}`}
                            value={itemDrafts[q.id] ?? ""}
                            onChange={(e) =>
                              setItemDrafts({ ...itemDrafts, [q.id]: e.target.value })
                            }
                            placeholder="Adicionar nova opção personalizada…"
                            className="!min-h-9 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => appendCustomOptionToQuestion(q, itemDrafts[q.id] ?? "")}
                            className="btn-ghost !min-h-9 shrink-0 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" /> Incluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {q.type === "numeric_scale" && (
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        aria-label={q.prompt}
                        min={q.scaleMin ?? 1}
                        max={q.scaleMax ?? 10}
                        value={typeof ans === "number" ? ans : (q.scaleMin ?? 1)}
                        onChange={(e) => setAnswer(q.id, Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="min-w-12 rounded-lg border bg-secondary px-2.5 py-1 text-center font-mono text-sm">
                        {typeof ans === "number" ? ans : (q.scaleMin ?? 1)} / {q.scaleMax ?? 10}
                      </span>
                    </div>
                  )}

                  {q.type === "star_rating" && (
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (typeof ans === "number" ? ans : 0) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setAnswer(q.id, star)}
                            aria-label={`${star} estrelas`}
                            className="rounded-lg p-1.5 transition hover:bg-secondary"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                active ? "fill-primary text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        );
                      })}
                      {typeof ans === "number" && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {ans} de 5 estrelas
                        </span>
                      )}
                    </div>
                  )}

                  {q.type === "color" && (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        aria-label={`Seletor de cor para ${q.prompt}`}
                        value={
                          typeof ans === "string" && /^#[0-9A-Fa-f]{6}$/.test(ans) ? ans : "#E8475F"
                        }
                        onChange={(e) => setAnswer(q.id, e.target.value.toUpperCase())}
                        className="!h-11 !w-16 cursor-pointer !p-1"
                      />
                      <input
                        aria-label={`Hexadecimal para ${q.prompt}`}
                        value={typeof ans === "string" ? ans : "#E8475F"}
                        onChange={(e) => setAnswer(q.id, e.target.value.toUpperCase())}
                        className="!w-36 font-mono text-sm uppercase"
                      />
                    </div>
                  )}

                  {q.type === "item_list" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          aria-label={`Adicionar item em ${q.prompt}`}
                          value={itemDrafts[q.id] ?? ""}
                          onChange={(e) => setItemDrafts({ ...itemDrafts, [q.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = (itemDrafts[q.id] ?? "").trim();
                              if (!val) return;
                              const curr = Array.isArray(ans) ? ans : [];
                              setAnswer(q.id, [...curr, val]);
                              setItemDrafts({ ...itemDrafts, [q.id]: "" });
                            }
                          }}
                          placeholder="Digite um item e clique em Adicionar…"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (itemDrafts[q.id] ?? "").trim();
                            if (!val) return;
                            const curr = Array.isArray(ans) ? ans : [];
                            setAnswer(q.id, [...curr, val]);
                            setItemDrafts({ ...itemDrafts, [q.id]: "" });
                          }}
                          className="btn-ghost shrink-0 text-xs"
                        >
                          <Plus className="h-4 w-4" /> Adicionar
                        </button>
                      </div>
                      {Array.isArray(ans) && ans.length > 0 && (
                        <ul className="flex flex-wrap gap-2 pt-1">
                          {ans.map((it, idx) => (
                            <li
                              key={`${it}-${idx}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border bg-secondary/70 px-3 py-1 text-xs"
                            >
                              <span>{it}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAnswer(
                                    q.id,
                                    ans.filter((_, i) => i !== idx),
                                  )
                                }
                                aria-label={`Remover ${it}`}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {q.type === "link" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        aria-label={q.prompt}
                        value={typeof ans === "string" ? ans : ""}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        placeholder="https://exemplo.com/referencia"
                      />
                      {typeof ans === "string" && ans.startsWith("http") && (
                        <a
                          href={ans}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost shrink-0 text-xs"
                        >
                          <ExternalLink className="h-4 w-4" /> Abrir
                        </a>
                      )}
                    </div>
                  )}

                  {q.type === "image" && (
                    <div className="space-y-2">
                      <input
                        ref={(el) => {
                          fileRefs.current[q.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const dataUrl = await processImageFile(file);
                          const stored = await storeMediaDataUrl(
                            `qimg_${q.id}_${Date.now()}`,
                            dataUrl,
                          );
                          setAnswer(q.id, { imageUrl: stored, caption: file.name });
                        }}
                      />
                      {ans && typeof ans === "object" && "imageUrl" in ans ? (
                        <div className="flex items-center gap-4">
                          <MediaImage
                            src={ans.imageUrl}
                            alt={q.prompt}
                            className="h-24 w-24 rounded-xl border object-cover"
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => fileRefs.current[q.id]?.click()}
                              className="btn-ghost !min-h-8 text-xs"
                            >
                              Trocar imagem
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnswer(q.id, null)}
                              className="btn-ghost !min-h-8 text-xs text-destructive"
                            >
                              Remover imagem
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileRefs.current[q.id]?.click()}
                          className="btn-ghost text-xs"
                        >
                          <ImagePlus className="h-4 w-4" /> Selecionar imagem de resposta
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import {
  Palette,
  Plus,
  Trash2,
  Copy,
  Check,
  Edit3,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import type { CharacterPalette } from "@/lib/store";

const PRESET_PALETTES: { name: string; colors: string[] }[] = [
  { name: "Chama Imperial", colors: ["#7A0F2B", "#E8475F", "#F6B26B", "#1E0B12"] },
  { name: "Abismo Oceânico", colors: ["#06243A", "#1A6F8F", "#5CC8C0", "#E0F7F5"] },
  { name: "Noite de Veludo", colors: ["#14142E", "#4A2574", "#A01652", "#D9D4F5"] },
  { name: "Aurora Dourada", colors: ["#3A2A5C", "#C2843E", "#F2D27A", "#FFF4D6"] },
];

const QUICK_COLOR_SWATCHES: { label: string; hex: string }[] = [
  { label: "Verde", hex: "#22C55E" },
  { label: "Verde Esmeralda", hex: "#10B981" },
  { label: "Laranja", hex: "#F97316" },
  { label: "Laranja Âmbar", hex: "#F59E0B" },
  { label: "Rosa", hex: "#FF69B4" },
  { label: "Rosa Choque", hex: "#EC4899" },
  { label: "Vermelho", hex: "#EF4444" },
  { label: "Vinho", hex: "#7A0F2B" },
  { label: "Lilás", hex: "#C084FC" },
  { label: "Roxo", hex: "#7C3AED" },
  { label: "Azul", hex: "#3B82F6" },
  { label: "Turquesa", hex: "#5CC8C0" },
];

export function normalizeHex(input: string): string | null {
  const clean = input.trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(clean)) return `#${clean.toUpperCase()}`;
  if (/^[0-9A-Fa-f]{3}$/.test(clean)) {
    const expanded = clean
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }
  return null;
}

interface EditableColorSlot {
  id: string;
  hex: string;
  draftHex: string;
}

function makeSlot(hex: string): EditableColorSlot {
  const normalized = normalizeHex(hex) ?? "#FF69B4";
  return {
    id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    hex: normalized,
    draftHex: normalized,
  };
}

export function PaletteStudio({
  palettes,
  savedGlobalPalettes,
  onChange,
}: {
  palettes: CharacterPalette[];
  savedGlobalPalettes: CharacterPalette[];
  onChange: (next: CharacterPalette[]) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paletteName, setPaletteName] = useState("");
  const [colorSlots, setColorSlots] = useState<EditableColorSlot[]>(() => [
    makeSlot("#E8475F"),
    makeSlot("#3A1238"),
    makeSlot("#5CC8C0"),
  ]);

  // Estado para adicionar nova cor
  const [pickerColor, setPickerColor] = useState("#FF69B4");
  const [hexInput, setHexInput] = useState("#FF69B4");
  const [hexError, setHexError] = useState("");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Estado persistente de edição individual de uma cor existente (não fecha sozinho ao mudar a cor!)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [originalSlotHex, setOriginalSlotHex] = useState<string>("#FF69B4");
  const [editingSlotDraft, setEditingSlotDraft] = useState<string>("#FF69B4");
  const [slotEditError, setSlotEditError] = useState<string>("");

  const openNewEditor = () => {
    setEditingId(null);
    setPaletteName("");
    setColorSlots([makeSlot("#E8475F"), makeSlot("#3A1238"), makeSlot("#5CC8C0")]);
    setPickerColor("#FF69B4");
    setHexInput("#FF69B4");
    setHexError("");
    setActiveSlotId(null);
    setSlotEditError("");
    setEditorOpen(true);
  };

  const openEditPalette = (p: CharacterPalette) => {
    setEditingId(p.id);
    setPaletteName(p.name);
    const slots = p.colors.map((c) => makeSlot(c));
    setColorSlots(slots);
    setPickerColor(p.colors[0] ?? "#FF69B4");
    setHexInput(p.colors[0] ?? "#FF69B4");
    setHexError("");
    setActiveSlotId(null);
    setSlotEditError("");
    setEditorOpen(true);
  };

  const startEditingExistingColor = (slot: EditableColorSlot) => {
    setActiveSlotId(slot.id);
    setOriginalSlotHex(slot.hex);
    setEditingSlotDraft(slot.hex);
    setSlotEditError("");
  };

  const previewColorInActiveSlot = (rawColor: string) => {
    setEditingSlotDraft(rawColor.toUpperCase());
    const valid = normalizeHex(rawColor);
    if (valid && activeSlotId) {
      setSlotEditError("");
      setColorSlots((prev) =>
        prev.map((s) => (s.id === activeSlotId ? { ...s, hex: valid, draftHex: valid } : s)),
      );
    }
  };

  const confirmActiveSlotEdit = () => {
    if (!activeSlotId) return;
    const valid = normalizeHex(editingSlotDraft);
    if (!valid) {
      setSlotEditError("Informe um código hexadecimal válido (ex: #FF8800).");
      return;
    }
    setColorSlots((prev) =>
      prev.map((s) => (s.id === activeSlotId ? { ...s, hex: valid, draftHex: valid } : s)),
    );
    setSlotEditError("");
    setActiveSlotId(null);
  };

  const cancelActiveSlotEdit = () => {
    if (!activeSlotId) return;
    setColorSlots((prev) =>
      prev.map((s) =>
        s.id === activeSlotId ? { ...s, hex: originalSlotHex, draftHex: originalSlotHex } : s,
      ),
    );
    setSlotEditError("");
    setActiveSlotId(null);
  };

  const handleAddColorFromHex = () => {
    const valid = normalizeHex(hexInput);
    if (!valid) {
      setHexError("Informe um código hexadecimal válido (ex: #FF69B4).");
      return;
    }
    setHexError("");
    setColorSlots((prev) => [...prev, makeSlot(valid)]);
    setPickerColor(valid);
  };

  const handleAddColorFromPicker = () => {
    const valid = normalizeHex(pickerColor) ?? "#FF69B4";
    setHexError("");
    setColorSlots((prev) => [...prev, makeSlot(valid)]);
  };

  const updateSlotColorById = (slotId: string, newValue: string) => {
    const valid = normalizeHex(newValue);
    setColorSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        return {
          ...s,
          draftHex: newValue.toUpperCase(),
          hex: valid ?? s.hex,
        };
      }),
    );
    if (activeSlotId === slotId) {
      setEditingSlotDraft(newValue.toUpperCase());
    }
  };

  const removeColorById = (slotId: string) => {
    if (activeSlotId === slotId) {
      setActiveSlotId(null);
    }
    setColorSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const moveColor = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= colorSlots.length) return;
    const next = [...colorSlots];
    const tmp = next[idx]!;
    next[idx] = next[target]!;
    next[target] = tmp;
    setColorSlots(next);
  };

  const saveCurrentPalette = () => {
    if (colorSlots.length === 0) {
      setHexError("Adicione pelo menos uma cor à paleta.");
      return;
    }
    const finalColors = colorSlots.map((s) => s.hex);
    const finalName = paletteName.trim() || `Paleta ${palettes.length + 1}`;
    if (editingId) {
      onChange(
        palettes.map((p) =>
          p.id === editingId ? { ...p, name: finalName, colors: finalColors } : p,
        ),
      );
    } else {
      const newPal: CharacterPalette = {
        id: `pal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: finalName,
        colors: finalColors,
      };
      onChange([...palettes, newPal]);
    }
    setActiveSlotId(null);
    setEditorOpen(false);
    setEditingId(null);
  };

  const deletePalette = (id: string) => {
    onChange(palettes.filter((p) => p.id !== id));
  };

  const reusePalette = (p: { name: string; colors: string[] }) => {
    const cloned: CharacterPalette = {
      id: `pal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: p.name,
      colors: [...p.colors],
    };
    onChange([...palettes, cloned]);
  };

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard?.writeText(hex);
    } catch {
      // Fallback silencioso se clipboard API não estiver disponível no contexto
    }
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex((curr) => (curr === hex ? null : curr)), 1800);
  };

  // Filtra paletas de outros personagens que ainda não estão idênticas neste personagem
  const reusableFromOthers = savedGlobalPalettes.filter(
    (gp) => !palettes.some((p) => p.name === gp.name && p.colors.join(",") === gp.colors.join(",")),
  );

  const activeSlotIndex = activeSlotId ? colorSlots.findIndex((s) => s.id === activeSlotId) : -1;
  const activeSlot = activeSlotIndex >= 0 ? colorSlots[activeSlotIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block">Paletas de Cores do Personagem</label>
          <p className="text-xs text-muted-foreground">
            Crie, edite, reorganize e copie códigos hexadecimais para manter a identidade cromática.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewEditor}
          className="btn"
          data-testid="btn-criar-paleta"
        >
          <Palette className="h-4 w-4" /> Criar paleta
        </button>
      </div>

      {/* Editor Interativo de Paletas */}
      {editorOpen && (
        <div
          className="card-luxe space-y-4 border-primary/50 p-4 sm:p-5"
          data-testid="palette-editor-modal"
        >
          <div className="flex items-center justify-between gap-2 border-b pb-3">
            <h4 className="font-display text-xl">
              {editingId ? "Editar paleta de cores" : "Nova paleta de cores"}
            </h4>
            <button
              type="button"
              onClick={() => {
                setActiveSlotId(null);
                setEditorOpen(false);
              }}
              className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
            >
              <X className="h-4 w-4" /> Fechar
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="palette-name-input">Nome da paleta</label>
              <input
                id="palette-name-input"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="Ex: Traje de Gala Nocturne, Aura de Fogo…"
              />
            </div>

            <div>
              <label>Adicionar cor (Seletor visual ou Hexadecimal)</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  aria-label="Seletor visual de cor"
                  value={pickerColor}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setPickerColor(val);
                    setHexInput(val);
                  }}
                  className="!h-11 !w-14 shrink-0 cursor-pointer !p-1"
                />
                <input
                  aria-label="Código hexadecimal da cor"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder="#FF69B4"
                  className="!w-32 font-mono text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddColorFromHex}
                  className="btn-ghost !py-2 text-xs whitespace-nowrap"
                  data-testid="btn-add-hex-color"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar cor
                </button>
                <button
                  type="button"
                  onClick={handleAddColorFromPicker}
                  className="btn-ghost !py-2 text-xs whitespace-nowrap"
                >
                  Usar seletor
                </button>
              </div>
              {hexError && <p className="mt-1 text-xs text-destructive">{hexError}</p>}
            </div>
          </div>

          {/* Amostras visuais da paleta sendo editada */}
          <div>
            <label>
              Cores na paleta ({colorSlots.length}) — clique em uma cor para abrir o seletor e
              alterá-la
            </label>
            {colorSlots.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Nenhuma cor adicionada ainda. Use o seletor ou digite um código hexadecimal acima.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {colorSlots.map((slot, idx) => {
                  const isSlotEditing = activeSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      data-testid={`palette-slot-${idx}`}
                      className={`flex flex-col justify-between rounded-xl border bg-background/70 p-2.5 transition ${
                        isSlotEditing ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                    >
                      <div className="relative flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingExistingColor(slot)}
                          aria-label={`Selecionar e editar cor ${idx + 1} (${slot.hex})`}
                          data-testid={`swatch-trigger-${idx}`}
                          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-white/20 shadow-inner transition hover:scale-105 focus:outline-2 focus:outline-primary"
                          style={{ backgroundColor: slot.hex }}
                          title="Clique para abrir o seletor desta cor"
                        />
                        <div className="min-w-0 flex-1">
                          <input
                            aria-label={`Editar hexadecimal da cor ${idx + 1}`}
                            data-testid={`swatch-hex-input-${idx}`}
                            value={slot.draftHex}
                            onFocus={() => {
                              if (activeSlotId !== slot.id) {
                                startEditingExistingColor(slot);
                              }
                            }}
                            onChange={(e) => updateSlotColorById(slot.id, e.target.value)}
                            onBlur={() => {
                              // Restaura formatação limpa caso usuário tenha deixado texto incompleto
                              const valid = normalizeHex(slot.draftHex);
                              if (!valid) {
                                setColorSlots((prev) =>
                                  prev.map((s) =>
                                    s.id === slot.id ? { ...s, draftHex: s.hex } : s,
                                  ),
                                );
                              }
                            }}
                            className="!min-h-8 !px-2 !py-1 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-1 border-t pt-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveColor(idx, -1)}
                            disabled={idx === 0}
                            aria-label="Mover cor para a esquerda"
                            className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveColor(idx, 1)}
                            disabled={idx === colorSlots.length - 1}
                            aria-label="Mover cor para a direita"
                            className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditingExistingColor(slot)}
                            aria-label={`Abrir seletor para cor ${idx + 1}`}
                            data-testid={`btn-open-slot-picker-${idx}`}
                            className={`rounded p-1 text-xs transition ${
                              isSlotEditing
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                            title="Alterar esta cor"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyHex(slot.hex)}
                            aria-label={`Copiar código ${slot.hex}`}
                            className="rounded p-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                            title="Copiar código hexadecimal"
                          >
                            {copiedHex === slot.hex ? (
                              <Check className="h-3.5 w-3.5 text-teal" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeColorById(slot.id)}
                            aria-label={`Remover cor ${slot.hex}`}
                            className="rounded p-1 text-destructive hover:bg-destructive/15"
                            title="Remover cor"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seletor de Edição de Cor Individual Persistente (Não desaparece durante a escolha!) */}
          {activeSlot && (
            <div
              className="rounded-2xl border border-primary/60 bg-secondary/40 p-4 space-y-3"
              data-testid="active-color-picker-panel"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border border-white/25"
                    style={{ backgroundColor: activeSlot.hex }}
                  />
                  <h5 className="font-display text-lg">
                    Editando Cor #{activeSlotIndex + 1} da Paleta
                  </h5>
                  <span className="text-xs text-muted-foreground">
                    (Original: <code className="font-mono">{originalSlotHex}</code> → Atual:{" "}
                    <code className="font-mono text-foreground">{activeSlot.hex}</code>)
                  </span>
                </div>
                <span className="text-xs text-teal">
                  Escolha livremente — o seletor permanece aberto até você confirmar ou cancelar
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 !normal-case !tracking-normal text-xs text-foreground">
                  <span>Seletor visual:</span>
                  <input
                    type="color"
                    aria-label={`Seletor de cor para a cor ${activeSlotIndex + 1}`}
                    data-testid="active-slot-color-input"
                    value={activeSlot.hex}
                    onChange={(e) => previewColorInActiveSlot(e.target.value)}
                    className="!h-11 !w-16 shrink-0 cursor-pointer !p-1"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <label htmlFor="active-slot-hex-input" className="sr-only">
                    Hexadecimal da cor selecionada
                  </label>
                  <input
                    id="active-slot-hex-input"
                    aria-label="Hexadecimal da cor em edição"
                    data-testid="active-slot-hex-input"
                    value={editingSlotDraft}
                    onChange={(e) => previewColorInActiveSlot(e.target.value)}
                    placeholder="#FF8800"
                    className="!h-11 !w-32 font-mono text-sm uppercase"
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={cancelActiveSlotEdit}
                    data-testid="btn-cancel-color-edit"
                    className="btn-ghost !min-h-9 !px-3.5 !py-1.5 text-xs"
                  >
                    Cancelar alteração
                  </button>
                  <button
                    type="button"
                    onClick={confirmActiveSlotEdit}
                    data-testid="btn-confirm-color-edit"
                    className="btn !min-h-9 !px-4 !py-1.5 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" /> Confirmar cor
                  </button>
                </div>
              </div>

              {/* Amostras rápidas de apoio (Verde, Laranja, Rosa, Vermelho, Lilás, etc.) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                  Cores rápidas (ou use o seletor / código hexadecimal acima):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLOR_SWATCHES.map((sw) => (
                    <button
                      key={sw.hex}
                      type="button"
                      onClick={() => previewColorInActiveSlot(sw.hex)}
                      data-testid={`quick-swatch-${sw.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                        activeSlot.hex === sw.hex
                          ? "border-primary bg-primary/20 text-foreground font-medium"
                          : "bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white/20"
                        style={{ backgroundColor: sw.hex }}
                      />
                      <span>{sw.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {slotEditError && <p className="text-xs text-destructive">{slotEditError}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={() => {
                setActiveSlotId(null);
                setEditorOpen(false);
              }}
              className="btn-ghost text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveCurrentPalette}
              className="btn text-xs"
              data-testid="btn-salvar-paleta"
            >
              <Check className="h-4 w-4" /> Salvar paleta no personagem
            </button>
          </div>
        </div>
      )}

      {/* Lista de paletas salvas no personagem */}
      {palettes.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center">
          <Palette className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma paleta cadastrada para este personagem.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clique em “Criar paleta” acima ou reutilize uma sugestão abaixo.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {palettes.map((pal) => (
            <div
              key={pal.id}
              className="rounded-2xl border bg-background/50 p-4"
              data-testid="saved-palette-card"
            >
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-display text-lg font-medium">{pal.name}</h5>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditPalette(pal)}
                    className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                    data-testid={`edit-palette-${pal.id}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePalette(pal.id)}
                    aria-label={`Remover paleta ${pal.name}`}
                    className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Barra cromática contínua */}
              <div className="mt-3 flex h-8 overflow-hidden rounded-lg border">
                {pal.colors.map((hex, i) => (
                  <div
                    key={`${pal.id}-bar-${i}`}
                    className="h-full flex-1 transition-all"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>

              {/* Amostras individuais com código hexadecimal e botão de copiar */}
              <div className="mt-3 flex flex-wrap gap-2">
                {pal.colors.map((hex, i) => (
                  <button
                    key={`${pal.id}-swatch-${i}`}
                    type="button"
                    onClick={() => copyHex(hex)}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-secondary/50 px-2 py-1 font-mono text-xs transition hover:border-primary"
                    title="Clique para copiar o código hexadecimal"
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: hex }}
                    />
                    <span>{hex}</span>
                    {copiedHex === hex ? (
                      <Check className="h-3 w-3 text-teal" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reutilizar paletas salvas na saga ou predefinidas */}
      <div className="pt-2">
        <label className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-teal" /> Reutilizar paletas salvas ou modelos
          editoriais
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[...reusableFromOthers, ...PRESET_PALETTES].slice(0, 6).map((preset, idx) => (
            <button
              key={`${preset.name}-${idx}`}
              type="button"
              onClick={() => reusePalette(preset)}
              className="flex items-center gap-2 rounded-full border bg-secondary/40 px-3 py-1.5 text-xs transition hover:border-primary"
            >
              <span className="flex overflow-hidden rounded-full border border-white/15">
                {preset.colors.slice(0, 4).map((c, i) => (
                  <span key={i} className="h-3 w-3" style={{ backgroundColor: c }} />
                ))}
              </span>
              <span>+ {preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

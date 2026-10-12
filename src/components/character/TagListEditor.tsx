import { useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";

/**
 * Componente para listas onde o usuário adiciona e remove itens individualmente
 * (ex: Características, Pontos fortes, Fraquezas, Medos, Desejos, Gostos, Hobbies).
 */
export function TagListEditor({
  label,
  items,
  onChange,
  placeholder = "Adicionar item…",
  suggestions = [],
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  const add = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    if (!items.includes(clean)) {
      onChange([...items, clean]);
    }
    setDraft("");
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const unusedSuggestions = suggestions.filter((s) => !items.includes(s));

  return (
    <div className="space-y-2">
      <label>{label}</label>
      <div className="flex gap-2">
        <input
          aria-label={label}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" onClick={() => add(draft)} className="btn-ghost shrink-0 text-xs">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[0.7rem] text-muted-foreground">Sugestões:</span>
          {unusedSuggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => add(sug)}
              className="rounded-lg border border-dashed px-2 py-0.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              + {sug}
            </button>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1.5 rounded-xl border bg-secondary/80 px-3 py-1 text-xs text-foreground"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label={`Remover ${item}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Seletor visual de múltiplas opções com suporte para:
 * - Opções predefinidas
 * - Opções personalizadas adicionais (cards/tags criados pelo usuário)
 * - Alternativa explícita "Personalizado" na grade que revela um campo de texto livre para descrever sua própria resposta
 */
export function SelectableCards({
  label,
  subtitle,
  presets,
  customOptions = [],
  selected,
  onChangeSelected,
  onAddCustomOption,
  placeholderCustom = "Outras opções personalizadas…",
  enableCustomOptionCard = false,
  customOptionCardDesc = "Escreva sua própria resposta personalizada.",
  customDescriptionValue = "",
  onChangeCustomDescription,
  customDescriptionLabel,
  customDescriptionPlaceholder = "Descreva livremente sua opção personalizada…",
  fieldTestIdPrefix,
}: {
  label: string;
  subtitle?: string;
  presets: { title: string; desc?: string }[];
  customOptions?: string[];
  selected: string[];
  onChangeSelected: (next: string[]) => void;
  onAddCustomOption?: (opt: string) => void;
  placeholderCustom?: string;
  enableCustomOptionCard?: boolean;
  customOptionCardDesc?: string;
  customDescriptionValue?: string;
  onChangeCustomDescription?: (val: string) => void;
  customDescriptionLabel?: string;
  customDescriptionPlaceholder?: string;
  fieldTestIdPrefix?: string;
}) {
  const [customDraft, setCustomDraft] = useState("");

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChangeSelected(selected.filter((x) => x !== val));
    } else {
      onChangeSelected([...selected, val]);
    }
  };

  const handleAddCustom = () => {
    const clean = customDraft.trim();
    if (!clean) return;
    onAddCustomOption?.(clean);
    if (!selected.includes(clean)) {
      onChangeSelected([...selected, clean]);
    }
    setCustomDraft("");
  };

  const allCustom = customOptions.filter(
    (c) =>
      c.toLowerCase() !== "personalizado" &&
      !presets.some((p) => p.title.toLowerCase() === c.toLowerCase()),
  );

  // A opção "Personalizado" fica ativa se estiver marcada em `selected`
  const isCustomCardActive = selected.includes("Personalizado");

  return (
    <div
      className="space-y-2.5"
      data-testid={fieldTestIdPrefix ? `selectable-group-${fieldTestIdPrefix}` : undefined}
    >
      <div>
        <label className="block">{label}</label>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {presets.map((p) => {
          const active = selected.includes(p.title);
          return (
            <button
              key={p.title}
              type="button"
              onClick={() => toggle(p.title)}
              data-testid={fieldTestIdPrefix ? `${fieldTestIdPrefix}-preset-${p.title}` : undefined}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                active
                  ? "border-primary bg-primary/15 text-foreground shadow-sm"
                  : "bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <span className="font-display text-base font-medium text-foreground">{p.title}</span>
              {p.desc && <span className="mt-0.5 text-xs text-muted-foreground">{p.desc}</span>}
            </button>
          );
        })}

        {allCustom.map((c) => {
          const active = selected.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                active
                  ? "border-primary bg-primary/15 text-foreground shadow-sm"
                  : "bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <span className="font-display text-base font-medium text-foreground">{c}</span>
              <span className="mt-0.5 text-xs text-teal">Opção adicionada</span>
            </button>
          );
        })}

        {enableCustomOptionCard && (
          <button
            type="button"
            onClick={() => toggle("Personalizado")}
            data-testid={
              fieldTestIdPrefix ? `${fieldTestIdPrefix}-option-personalizado` : undefined
            }
            className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
              isCustomCardActive
                ? "border-primary bg-primary/15 text-foreground shadow-sm"
                : "border-dashed bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5 font-display text-base font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-teal shrink-0" />
              Personalizado
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">{customOptionCardDesc}</span>
          </button>
        )}
      </div>

      {/* Quando "Personalizado" está selecionado, exibe o campo de texto livre para descrever a opção personalizada */}
      {enableCustomOptionCard && isCustomCardActive && (
        <div
          className="rounded-2xl border border-primary/50 bg-background/60 p-4 space-y-2.5"
          data-testid={fieldTestIdPrefix ? `${fieldTestIdPrefix}-custom-panel` : undefined}
        >
          <label
            htmlFor={fieldTestIdPrefix ? `${fieldTestIdPrefix}-custom-textarea` : undefined}
            className="block text-teal"
          >
            {customDescriptionLabel ?? `${label} — Personalizado`}
          </label>
          <textarea
            id={fieldTestIdPrefix ? `${fieldTestIdPrefix}-custom-textarea` : undefined}
            aria-label={customDescriptionLabel ?? `${label} — Personalizado`}
            data-testid={fieldTestIdPrefix ? `${fieldTestIdPrefix}-custom-textarea` : undefined}
            rows={3}
            value={customDescriptionValue}
            onChange={(e) => onChangeCustomDescription?.(e.target.value)}
            placeholder={customDescriptionPlaceholder}
          />

          {onAddCustomOption && (
            <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-1">
              <input
                aria-label={`Adicionar cartão personalizado em ${label}`}
                data-testid={
                  fieldTestIdPrefix ? `${fieldTestIdPrefix}-custom-card-input` : undefined
                }
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                placeholder={placeholderCustom}
                className="!min-h-9 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                data-testid={
                  fieldTestIdPrefix ? `${fieldTestIdPrefix}-add-custom-card-btn` : undefined
                }
                className="btn-ghost !min-h-9 shrink-0 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar como opção
              </button>
            </div>
          )}
        </div>
      )}

      {/* Para outros campos que usam onAddCustomOption sem enableCustomOptionCard */}
      {!enableCustomOptionCard && onAddCustomOption && (
        <div className="flex gap-2 pt-1">
          <input
            aria-label={`Personalizar ${label}`}
            value={customDraft}
            onChange={(e) => setCustomDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder={placeholderCustom}
            className="!min-h-9 text-xs"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="btn-ghost !min-h-9 shrink-0 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Complementar
          </button>
        </div>
      )}
    </div>
  );
}

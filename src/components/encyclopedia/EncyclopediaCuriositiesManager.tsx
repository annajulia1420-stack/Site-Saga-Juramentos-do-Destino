import { useState, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  X,
  Check,
  Lightbulb,
} from "lucide-react";
import type { EncyclopediaCuriosityItem } from "@/lib/encyclopedia-types";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

export function EncyclopediaCuriositiesManager({
  items,
  onChange,
}: {
  items: EncyclopediaCuriosityItem[];
  onChange: (next: EncyclopediaCuriosityItem[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [sourceOrReference, setSourceOrReference] = useState("");
  const [isHighlight, setIsHighlight] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setImageUrl(undefined);
    setSourceOrReference("");
    setIsHighlight(false);
    setShowForm(false);
  };

  const openEdit = (item: EncyclopediaCuriosityItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category ?? "");
    setImageUrl(item.imageUrl);
    setSourceOrReference(item.sourceOrReference ?? "");
    setIsHighlight(item.isHighlight);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title.trim() && !description.trim()) return;
    if (editingId) {
      onChange(
        items.map((x) =>
          x.id === editingId
            ? {
                ...x,
                title: title.trim() || "Curiosidade sem título",
                description: description.trim(),
                category: category.trim() || undefined,
                imageUrl,
                sourceOrReference: sourceOrReference.trim() || undefined,
                isHighlight,
              }
            : x,
        ),
      );
    } else {
      const next: EncyclopediaCuriosityItem = {
        id: `wcur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: title.trim() || "Curiosidade sem título",
        description: description.trim(),
        category: category.trim() || undefined,
        imageUrl,
        sourceOrReference: sourceOrReference.trim() || undefined,
        isHighlight,
      };
      onChange([...items, next]);
    }
    resetForm();
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const tmp = next[idx]!;
    next[idx] = next[target]!;
    next[target] = tmp;
    onChange(next);
  };

  return (
    <div className="space-y-4" data-testid="encyclopedia-curiosities-manager">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-lg">Acervo de Curiosidades ({items.length})</h4>
          <p className="text-xs text-muted-foreground">
            Adicione fatos históricos incomuns, peculiaridades culturais, mistérios locais ou
            segredos do mundo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn text-xs"
          data-testid="btn-adicionar-curiosidade"
        >
          <Plus className="h-4 w-4" /> Adicionar curiosidade
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-2xl border border-primary/50 bg-background/80 p-4 space-y-3"
          data-testid="curiosity-form-modal"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="font-display text-lg">
              {editingId ? "Editar curiosidade" : "Nova curiosidade"}
            </h5>
            <button
              type="button"
              onClick={resetForm}
              className="btn-ghost !min-h-7 !px-2 !py-0.5 text-xs"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wcur-title">Título da curiosidade</label>
              <input
                id="wcur-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: A Noite dos Dois Sóis…"
                data-testid="input-curiosity-title"
              />
            </div>
            <div>
              <label htmlFor="wcur-category">Categoria (opcional)</label>
              <input
                id="wcur-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Folclore, Geografia, Arquitetura, Lei antiga…"
                data-testid="input-curiosity-category"
              />
            </div>
          </div>

          <div>
            <label htmlFor="wcur-desc">Descrição</label>
            <textarea
              id="wcur-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os detalhes desta curiosidade…"
              data-testid="input-curiosity-description"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wcur-source">Fonte ou referência (opcional)</label>
              <input
                id="wcur-source"
                value={sourceOrReference}
                onChange={(e) => setSourceOrReference(e.target.value)}
                placeholder="Ex: Crônicas da Biblioteca de Ferro, cap. III…"
              />
            </div>

            <div className="flex items-end gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const dataUrl = await processImageFile(file, 800);
                  const stored = await storeMediaDataUrl(`curimg_${Date.now()}`, dataUrl);
                  setImageUrl(stored);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-ghost text-xs"
              >
                <ImagePlus className="h-4 w-4" /> {imageUrl ? "Trocar imagem" : "Imagem opcional"}
              </button>
              {imageUrl && (
                <div className="h-10 w-12 overflow-hidden rounded-lg border">
                  <MediaImage src={imageUrl} alt="Prévia" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 !text-xs !normal-case !tracking-normal text-foreground">
              <input
                type="checkbox"
                checked={isHighlight}
                onChange={(e) => setIsHighlight(e.target.checked)}
                className="!min-h-4 !w-4 accent-primary"
                data-testid="checkbox-curiosity-highlight"
              />
              Marcar como destaque nacional ⭐
            </label>

            <button
              type="button"
              onClick={handleSave}
              className="btn text-xs"
              data-testid="btn-salvar-curiosidade"
            >
              <Check className="h-4 w-4" /> {editingId ? "Salvar alterações" : "Salvar curiosidade"}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-xs text-muted-foreground">
          <Lightbulb className="mx-auto mb-2 h-6 w-6 text-teal" />
          Nenhuma curiosidade cadastrada ainda. Clique em “Adicionar curiosidade” para registrar
          fatos marcantes.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition ${
                item.isHighlight ? "border-gold/50 bg-gold/5" : "bg-background/50"
              }`}
              data-testid={`curiosity-card-${item.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  {item.imageUrl && (
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border">
                      <MediaImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-teal">#{idx + 1}</span>
                      {item.isHighlight && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[0.65rem] font-semibold text-gold">
                          <Star className="h-3 w-3 fill-gold" /> Destaque
                        </span>
                      )}
                      {item.category && (
                        <span className="rounded bg-secondary px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <h5 className="font-display text-lg font-medium text-foreground">
                      {item.title}
                    </h5>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">
                      {item.description}
                    </p>
                    {item.sourceOrReference && (
                      <p className="text-[0.7rem] italic text-teal">
                        Fonte / Referência: {item.sourceOrReference}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        items.map((x) =>
                          x.id === item.id ? { ...x, isHighlight: !x.isHighlight } : x,
                        ),
                      )
                    }
                    aria-label={`Destacar ${item.title}`}
                    className="rounded p-1 text-muted-foreground hover:text-gold"
                    title="Alternar destaque"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${item.isHighlight ? "fill-gold text-gold" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    aria-label={`Mover ${item.title} para cima`}
                    data-testid={`btn-up-curiosity-${idx}`}
                    className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    aria-label={`Mover ${item.title} para baixo`}
                    data-testid={`btn-down-curiosity-${idx}`}
                    className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    aria-label={`Editar ${item.title}`}
                    data-testid={`btn-edit-curiosity-${item.id}`}
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(item.id)}
                    aria-label={`Excluir ${item.title}`}
                    data-testid={`btn-delete-curiosity-${item.id}`}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {confirmDeleteId === item.id && (
                <div
                  className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive bg-destructive/10 p-2.5 text-xs"
                  data-testid={`confirm-delete-curiosity-${item.id}`}
                >
                  <span>
                    Confirmar exclusão da curiosidade <strong>“{item.title}”</strong>?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="btn-ghost !min-h-7 !px-2.5 !py-0.5 text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(items.filter((x) => x.id !== item.id));
                        setConfirmDeleteId(null);
                      }}
                      className="btn !min-h-7 !bg-destructive !px-2.5 !py-0.5 text-xs"
                      data-testid={`btn-confirm-delete-curiosity-${item.id}`}
                    >
                      Confirmar exclusão
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

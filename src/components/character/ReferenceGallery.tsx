import { useState, useRef } from "react";
import {
  ImagePlus,
  Trash2,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  X,
  Images,
  Check,
  Plus,
} from "lucide-react";
import {
  VISUAL_REF_CATEGORIES,
  type VisualReferenceItem,
  type VisualRefCategory,
} from "@/lib/store";
import { processImageFile, storeMediaDataUrl, deleteMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

export function ReferenceGallery({
  items,
  onChange,
  defaultCategory = "Personagens",
  compactTitle,
  categories,
  customCategories = [],
  onAddCustomCategory,
}: {
  items: VisualReferenceItem[];
  onChange: (next: VisualReferenceItem[]) => void;
  defaultCategory?: VisualRefCategory;
  compactTitle?: string;
  categories?: string[];
  customCategories?: string[];
  onAddCustomCategory?: (cat: string) => void;
}) {
  const baseCategories = categories ?? VISUAL_REF_CATEGORIES;
  const allCategories = [
    ...baseCategories,
    ...customCategories.filter(
      (c) => !baseCategories.some((b) => b.toLowerCase() === c.toLowerCase()),
    ),
  ];

  const [filterCat, setFilterCat] = useState<string>("Todas");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [customCatDraft, setCustomCatDraft] = useState("");
  const [pendingImage, setPendingImage] = useState<{
    dataUrl: string;
    title: string;
    category: VisualRefCategory;
    notes: string;
  } | null>(null);
  const [lightboxItem, setLightboxItem] = useState<VisualReferenceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddCategory = () => {
    const clean = customCatDraft.trim();
    if (!clean) return;
    onAddCustomCategory?.(clean);
    setCustomCatDraft("");
    if (pendingImage) {
      setPendingImage({ ...pendingImage, category: clean });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Selecione um arquivo de imagem válido (PNG, JPEG, WebP).");
      return;
    }
    setErrorMsg("");
    setUploading(true);
    try {
      const dataUrl = await processImageFile(file);
      const baseTitle = file.name.replace(/\.[^/.]+$/, "");
      setPendingImage({
        dataUrl,
        title: baseTitle || "Referência visual",
        category: allCategories[0] ?? defaultCategory,
        notes: "",
      });
    } catch {
      setErrorMsg("Não foi possível carregar a imagem selecionada.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmAddReference = async () => {
    if (!pendingImage) return;
    const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const storedRef = await storeMediaDataUrl(id, pendingImage.dataUrl);
    const newItem: VisualReferenceItem = {
      id,
      imageUrl: storedRef,
      title: pendingImage.title.trim() || "Referência sem título",
      category: pendingImage.category,
      notes: pendingImage.notes.trim(),
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    onChange([...items, newItem]);
    setPendingImage(null);
  };

  const updateItem = (id: string, patch: Partial<VisualReferenceItem>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (item: VisualReferenceItem) => {
    void deleteMediaDataUrl(item.imageUrl);
    onChange(items.filter((it) => it.id !== item.id));
    if (lightboxItem?.id === item.id) setLightboxItem(null);
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

  const filteredItems = items.filter((it) => filterCat === "Todas" || it.category === filterCat);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="block">{compactTitle ?? "Galeria de Referências Visuais"}</label>
          <p className="text-xs text-muted-foreground">
            Adicione imagens do dispositivo (PNG, JPEG, WebP). Armazenamento otimizado via IndexedDB
            local.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-file-referencia"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn"
            data-testid="btn-adicionar-imagem"
          >
            <ImagePlus className="h-4 w-4" /> {uploading ? "Carregando…" : "Adicionar imagem"}
          </button>
        </div>
      </div>

      {/* Criação opcional de categoria personalizada */}
      {onAddCustomCategory && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-background/40 p-3">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="custom-ref-cat-input">
              Adicionar categoria personalizada de referência
            </label>
            <input
              id="custom-ref-cat-input"
              value={customCatDraft}
              onChange={(e) => setCustomCatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              placeholder="Ex: Armas & Artefatos, Cabelo, Cenário…"
              data-testid="input-custom-ref-category"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            className="btn-ghost text-xs"
            data-testid="btn-add-custom-ref-category"
          >
            <Plus className="h-4 w-4" /> Criar categoria
          </button>
        </div>
      )}

      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

      {/* Painel de prévia e metadados ao selecionar uma nova imagem */}
      {pendingImage && (
        <div
          className="card-luxe space-y-4 border-primary/50 p-4 sm:p-5"
          data-testid="pending-image-panel"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-display text-lg">Configurar nova imagem de referência</h4>
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="btn-ghost !min-h-8 !px-2 !py-1 text-xs"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <div className="overflow-hidden rounded-xl border bg-secondary">
              <img
                src={pendingImage.dataUrl}
                alt="Prévia da referência"
                className="h-40 w-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="ref-title-input">Título ou legenda</label>
                  <input
                    id="ref-title-input"
                    value={pendingImage.title}
                    onChange={(e) => setPendingImage({ ...pendingImage, title: e.target.value })}
                    placeholder="Ex: Iluminação de cena noturna, Casaco de couro…"
                  />
                </div>
                <div>
                  <label htmlFor="ref-cat-select">Categoria da referência</label>
                  <select
                    id="ref-cat-select"
                    value={pendingImage.category}
                    onChange={(e) =>
                      setPendingImage({
                        ...pendingImage,
                        category: e.target.value as VisualRefCategory,
                      })
                    }
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ref-notes-input">
                  Notas sobre o que inspira o personagem nesta imagem
                </label>
                <textarea
                  id="ref-notes-input"
                  rows={2}
                  value={pendingImage.notes}
                  onChange={(e) => setPendingImage({ ...pendingImage, notes: e.target.value })}
                  placeholder="Descreva os detalhes relevantes (textura, expressão, atmosfera)…"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={confirmAddReference}
                  className="btn text-xs"
                  data-testid="btn-confirmar-imagem"
                >
                  <Check className="h-4 w-4" /> Salvar na galeria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros por categoria */}
      {(items.length > 0 || allCategories.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {["Todas", ...allCategories].map((cat) => {
            const count =
              cat === "Todas" ? items.length : items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCat(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs transition ${
                  filterCat === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grade da Galeria */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Images className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {items.length === 0
              ? "Nenhuma imagem de referência adicionada ainda."
              : "Nenhuma imagem nesta categoria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const realIdx = items.findIndex((x) => x.id === item.id);
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border bg-background/60"
                data-testid="reference-card"
              >
                <div className="group relative h-48 w-full overflow-hidden bg-secondary">
                  <MediaImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full cursor-pointer object-cover transition duration-200 group-hover:scale-105"
                    onClick={() => setLightboxItem(item)}
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxItem(item)}
                    aria-label={`Ampliar ${item.title}`}
                    className="absolute right-2 top-2 rounded-lg bg-background/80 p-1.5 text-foreground backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
                    title="Visualizar em tamanho maior"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-2 p-3.5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <select
                        aria-label="Categoria da imagem"
                        value={item.category}
                        onChange={(e) =>
                          updateItem(item.id, {
                            category: e.target.value as VisualRefCategory,
                          })
                        }
                        className="!min-h-7 !w-auto !px-2 !py-0.5 text-xs"
                      >
                        {allCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        {!allCategories.includes(item.category) && (
                          <option value={item.category}>{item.category}</option>
                        )}
                      </select>
                      <span>{item.createdAt}</span>
                    </div>

                    <input
                      aria-label="Título da imagem"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      className="!min-h-8 !px-2.5 !py-1 text-sm font-medium"
                      placeholder="Título / legenda"
                    />

                    <textarea
                      aria-label="Notas de inspiração"
                      rows={2}
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                      className="!px-2.5 !py-1 text-xs"
                      placeholder="O que inspira o personagem nesta imagem…"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(realIdx, -1)}
                        disabled={realIdx <= 0}
                        aria-label="Mover referência para trás"
                        className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(realIdx, 1)}
                        disabled={realIdx === -1 || realIdx >= items.length - 1}
                        aria-label="Mover referência para frente"
                        className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      aria-label={`Remover ${item.title}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/15"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Lightbox para visualização em tamanho maior */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightboxItem(null)}
          data-testid="reference-lightbox"
        >
          <div
            className="card-luxe relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b pb-3">
              <div>
                <h4 className="font-display text-2xl">{lightboxItem.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {lightboxItem.category} · Adicionada em {lightboxItem.createdAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="btn-ghost !min-h-9 !px-3 !py-1 text-xs"
              >
                <X className="h-4 w-4" /> Fechar
              </button>
            </div>

            <div className="mt-4 flex justify-center overflow-hidden rounded-xl bg-black/50">
              <MediaImage
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            {lightboxItem.notes && (
              <p className="mt-4 text-sm text-muted-foreground">
                <strong className="text-foreground">Notas de inspiração:</strong>{" "}
                {lightboxItem.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from "react";
import {
  ImagePlus,
  Trash2,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  Star,
  Plus,
  X,
  Check,
  Images,
} from "lucide-react";
import {
  ENCYCLOPEDIA_IMAGE_CATEGORIES,
  ENCYCLOPEDIA_SECTIONS_META,
  type EncyclopediaImageItem,
} from "@/lib/encyclopedia-types";
import { processImageFile, storeMediaDataUrl, deleteMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

export function EncyclopediaImageGallery({
  images,
  customCategories,
  coverImageUrl,
  onChangeImages,
  onChangeCustomCategories,
  onChangeCoverImage,
  filterSectionNumber,
}: {
  images: EncyclopediaImageItem[];
  customCategories: string[];
  coverImageUrl?: string | undefined;
  onChangeImages: (next: EncyclopediaImageItem[]) => void;
  onChangeCustomCategories: (next: string[]) => void;
  onChangeCoverImage: (url: string | undefined) => void;
  filterSectionNumber?: number | undefined;
}) {
  const allCategories = [
    ...ENCYCLOPEDIA_IMAGE_CATEGORIES,
    ...customCategories.filter(
      (c) => !ENCYCLOPEDIA_IMAGE_CATEGORIES.some((b) => b.toLowerCase() === c.toLowerCase()),
    ),
  ];

  const [catFilter, setCatFilter] = useState<string>("Todas");
  const [secFilter, setSecFilter] = useState<string>(
    filterSectionNumber ? String(filterSectionNumber) : "Todas",
  );
  const [newCatInput, setNewCatInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<{
    dataUrl: string;
    title: string;
    caption: string;
    description: string;
    category: string;
    notes: string;
    sectionNumber?: number | undefined;
    makeCover: boolean;
  } | null>(null);
  const [lightbox, setLightbox] = useState<EncyclopediaImageItem | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleAddCategory = () => {
    const clean = newCatInput.trim();
    if (!clean) return;
    if (!allCategories.includes(clean)) {
      onChangeCustomCategories([...customCategories, clean]);
    }
    if (pending) {
      setPending({ ...pending, category: clean });
    }
    setNewCatInput("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await processImageFile(file);
      const baseTitle = file.name.replace(/\.[^/.]+$/, "");
      setPending({
        dataUrl,
        title: baseTitle || "Imagem da Enciclopédia",
        caption: "",
        description: "",
        category: allCategories[0] ?? "Paisagem",
        notes: "",
        sectionNumber: filterSectionNumber,
        makeCover: !coverImageUrl,
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const confirmSaveImage = async () => {
    if (!pending) return;
    const id = `wimg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const storedUrl = await storeMediaDataUrl(id, pending.dataUrl);
    const newItem: EncyclopediaImageItem = {
      id,
      imageUrl: storedUrl,
      title: pending.title.trim() || "Sem título",
      caption: pending.caption.trim(),
      description: pending.description.trim(),
      category: pending.category,
      notes: pending.notes.trim(),
      sectionNumber: pending.sectionNumber,
      isCover: pending.makeCover,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    const nextList = pending.makeCover
      ? [...images.map((i) => ({ ...i, isCover: false })), newItem]
      : [...images, newItem];
    onChangeImages(nextList);
    if (pending.makeCover) {
      onChangeCoverImage(storedUrl);
    }
    setPending(null);
  };

  const updateItem = (id: string, patch: Partial<EncyclopediaImageItem>) => {
    onChangeImages(images.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const setAsCover = (item: EncyclopediaImageItem) => {
    onChangeImages(images.map((it) => ({ ...it, isCover: it.id === item.id })));
    onChangeCoverImage(item.imageUrl);
  };

  const removeItem = (item: EncyclopediaImageItem) => {
    void deleteMediaDataUrl(item.imageUrl);
    const remaining = images.filter((it) => it.id !== item.id);
    onChangeImages(remaining);
    if (coverImageUrl === item.imageUrl) {
      onChangeCoverImage(remaining[0]?.imageUrl);
    }
    if (lightbox?.id === item.id) setLightbox(null);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const tmp = next[idx]!;
    next[idx] = next[target]!;
    next[target] = tmp;
    onChangeImages(next);
  };

  const visibleImages = images.filter((img) => {
    if (catFilter !== "Todas" && img.category !== catFilter) return false;
    if (secFilter !== "Todas" && String(img.sectionNumber ?? "") !== secFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4" data-testid="encyclopedia-image-gallery">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl">
            Galeria de Imagens e Identidade Visual ({images.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Bandeiras, brasões, mapas, paisagens, capitais, arquitetura, fauna, flora, trajes e
            documentos históricos. Armazenamento otimizado via IndexedDB.
          </p>
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-file-enc-image"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn text-xs"
            data-testid="btn-add-enc-image"
          >
            <ImagePlus className="h-4 w-4" /> {uploading ? "Carregando…" : "Adicionar imagem"}
          </button>
        </div>
      </div>

      {/* Criar nova categoria e filtrar */}
      <div className="grid gap-3 rounded-2xl border bg-background/40 p-3.5 sm:grid-cols-3">
        <div>
          <label htmlFor="enc-img-cat-filter">Filtrar por categoria</label>
          <select
            id="enc-img-cat-filter"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="Todas">Todas as categorias ({images.length})</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enc-img-sec-filter">Filtrar por seção associada</label>
          <select
            id="enc-img-sec-filter"
            value={secFilter}
            onChange={(e) => setSecFilter(e.target.value)}
          >
            <option value="Todas">Todas as seções</option>
            {ENCYCLOPEDIA_SECTIONS_META.map((s) => (
              <option key={s.num} value={String(s.num)}>
                Seção {String(s.num).padStart(2, "0")} — {s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enc-img-new-cat">Criar categoria personalizada</label>
          <div className="flex gap-1.5">
            <input
              id="enc-img-new-cat"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Nova categoria…"
              data-testid="input-new-enc-img-category"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="btn-ghost shrink-0 text-xs"
              data-testid="btn-create-enc-img-category"
            >
              <Plus className="h-3.5 w-3.5" /> Criar
            </button>
          </div>
        </div>
      </div>

      {/* Painel de configuração ao selecionar nova imagem */}
      {pending && (
        <div
          className="card-luxe space-y-4 border-primary/50 p-4 sm:p-5"
          data-testid="enc-pending-image-panel"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-display text-lg">Configurar nova imagem da enciclopédia</h4>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div className="overflow-hidden rounded-xl border bg-secondary">
              <img src={pending.dataUrl} alt="Prévia" className="h-44 w-full object-cover" />
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="enc-pending-title">Título</label>
                  <input
                    id="enc-pending-title"
                    value={pending.title}
                    onChange={(e) => setPending({ ...pending, title: e.target.value })}
                    placeholder="Ex: Bandeira Imperial de Valdoria…"
                    data-testid="input-enc-img-title"
                  />
                </div>
                <div>
                  <label htmlFor="enc-pending-cat">Categoria</label>
                  <select
                    id="enc-pending-cat"
                    value={pending.category}
                    onChange={(e) => setPending({ ...pending, category: e.target.value })}
                    data-testid="select-enc-img-category"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="enc-pending-sec">Associar à seção (opcional)</label>
                  <select
                    id="enc-pending-sec"
                    value={pending.sectionNumber ? String(pending.sectionNumber) : ""}
                    onChange={(e) =>
                      setPending({
                        ...pending,
                        sectionNumber: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  >
                    <option value="">Geral (todo o registro)</option>
                    {ENCYCLOPEDIA_SECTIONS_META.map((s) => (
                      <option key={s.num} value={String(s.num)}>
                        {String(s.num).padStart(2, "0")}. {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="enc-pending-caption">Legenda curta</label>
                  <input
                    id="enc-pending-caption"
                    value={pending.caption}
                    onChange={(e) => setPending({ ...pending, caption: e.target.value })}
                    placeholder="Ex: Estandarte usado após o Tratado das Cinzas"
                  />
                </div>
                <div>
                  <label htmlFor="enc-pending-desc">Descrição</label>
                  <input
                    id="enc-pending-desc"
                    value={pending.description}
                    onChange={(e) => setPending({ ...pending, description: e.target.value })}
                    placeholder="Descrição visual da imagem…"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="enc-pending-notes">Notas criativas</label>
                <textarea
                  id="enc-pending-notes"
                  rows={2}
                  value={pending.notes}
                  onChange={(e) => setPending({ ...pending, notes: e.target.value })}
                  placeholder="Anotações sobre simbolismo, inspiração ou uso na história…"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 !text-xs !normal-case !tracking-normal text-foreground">
                  <input
                    type="checkbox"
                    checked={pending.makeCover}
                    onChange={(e) => setPending({ ...pending, makeCover: e.target.checked })}
                    className="!min-h-4 !w-4 accent-primary"
                    data-testid="checkbox-enc-img-cover"
                  />
                  Definir como imagem de capa deste registro ⭐
                </label>

                <button
                  type="button"
                  onClick={confirmSaveImage}
                  className="btn text-xs"
                  data-testid="btn-confirm-enc-image"
                >
                  <Check className="h-4 w-4" /> Salvar imagem na galeria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade de imagens */}
      {visibleImages.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Images className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">
            Nenhuma imagem encontrada nesta visualização.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleImages.map((img) => {
            const realIdx = images.findIndex((x) => x.id === img.id);
            const isCurrentCover = coverImageUrl === img.imageUrl || img.isCover;
            return (
              <div
                key={img.id}
                className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-background/60 ${
                  isCurrentCover ? "border-gold/70" : ""
                }`}
                data-testid="enc-gallery-card"
              >
                <div className="group relative h-44 w-full overflow-hidden bg-secondary">
                  <MediaImage
                    src={img.imageUrl}
                    alt={img.title}
                    className="h-full w-full cursor-pointer object-cover transition group-hover:scale-105"
                    onClick={() => setLightbox(img)}
                  />
                  {isCurrentCover && (
                    <span
                      className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-0.5 text-[0.65rem] font-semibold text-background"
                      data-testid="enc-cover-badge"
                    >
                      Capa do Registro
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setLightbox(img)}
                    aria-label={`Ampliar ${img.title}`}
                    className="absolute right-2 top-2 rounded-lg bg-background/80 p-1.5 text-foreground backdrop-blur hover:bg-primary hover:text-primary-foreground"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-2 p-3.5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <select
                        aria-label="Categoria da imagem"
                        value={img.category}
                        onChange={(e) => updateItem(img.id, { category: e.target.value })}
                        className="!min-h-7 !w-auto !px-2 !py-0.5 text-xs"
                      >
                        {allCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setAsCover(img)}
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[0.7rem] ${
                          isCurrentCover
                            ? "bg-gold/20 text-gold font-semibold"
                            : "text-muted-foreground hover:text-gold"
                        }`}
                        data-testid={`btn-set-cover-${img.id}`}
                      >
                        <Star className="h-3 w-3" />{" "}
                        {isCurrentCover ? "Capa ativa" : "Usar como capa"}
                      </button>
                    </div>

                    <input
                      aria-label="Título da imagem"
                      value={img.title}
                      onChange={(e) => updateItem(img.id, { title: e.target.value })}
                      className="!min-h-8 !px-2.5 !py-1 text-sm font-medium"
                    />

                    <input
                      aria-label="Legenda da imagem"
                      value={img.caption}
                      onChange={(e) => updateItem(img.id, { caption: e.target.value })}
                      placeholder="Legenda…"
                      className="!min-h-7 !px-2.5 !py-1 text-xs"
                    />

                    <textarea
                      aria-label="Notas da imagem"
                      rows={2}
                      value={img.notes}
                      onChange={(e) => updateItem(img.id, { notes: e.target.value })}
                      placeholder="Descrição / notas…"
                      className="!px-2.5 !py-1 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={realIdx <= 0}
                        onClick={() => moveItem(realIdx, -1)}
                        className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={realIdx === -1 || realIdx >= images.length - 1}
                        onClick={() => moveItem(realIdx, 1)}
                        className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(img)}
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

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          data-testid="enc-image-lightbox"
        >
          <div
            className="card-luxe relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-display text-2xl">{lightbox.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {lightbox.category}
                  {lightbox.caption ? ` · ${lightbox.caption}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
              >
                <X className="h-4 w-4" /> Fechar
              </button>
            </div>
            <div className="mt-4 flex justify-center overflow-hidden rounded-xl bg-black/50">
              <MediaImage
                src={lightbox.imageUrl}
                alt={lightbox.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
            {(lightbox.description || lightbox.notes) && (
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                {lightbox.description && <p>{lightbox.description}</p>}
                {lightbox.notes && <p className="text-teal">{lightbox.notes}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

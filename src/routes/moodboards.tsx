import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Images,
  Plus,
  Search,
  Star,
  BookOpen,
  Shirt,
  Palette,
  Gem,
  Users,
  Heart,
  Globe2,
  Sparkles,
  Wand2,
  LayoutGrid,
  Columns3,
  FolderOpen,
  Tag,
  Edit3,
  Trash2,
  Copy,
  Eye,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Upload,
  Link2,
  ScrollText,
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  Layers,
} from "lucide-react";
import {
  useStore,
  actions,
  MOODBOARD_DEFAULT_CATEGORIES,
  type Moodboard,
  type MoodboardReferenceItem,
  type MoodboardAspectRatio,
} from "@/lib/store";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

export const Route = createFileRoute("/moodboards")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    moodboard?: string;
    categoria?: string;
    livro?: string;
    personagem?: string;
    casal?: string;
    mundo?: string;
    capitulo?: string;
  } => {
    return {
      ...(typeof search?.moodboard === "string" ? { moodboard: search.moodboard } : {}),
      ...(typeof search?.categoria === "string" ? { categoria: search.categoria } : {}),
      ...(typeof search?.livro === "string" ? { livro: search.livro } : {}),
      ...(typeof search?.personagem === "string" ? { personagem: search.personagem } : {}),
      ...(typeof search?.casal === "string" ? { casal: search.casal } : {}),
      ...(typeof search?.mundo === "string" ? { mundo: search.mundo } : {}),
      ...(typeof search?.capitulo === "string" ? { capitulo: search.capitulo } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Moodboards — Juramentos Studio" },
      {
        name: "description",
        content: "Reúna inspirações, organize referências e dê vida à estética das suas histórias.",
      },
      { property: "og:title", content: "Moodboards — Juramentos Studio" },
      {
        property: "og:description",
        content: "Reúna inspirações, organize referências e dê vida à estética das suas histórias.",
      },
    ],
  }),
  component: MoodboardsPage,
});

const CATEGORY_META: Record<
  string,
  {
    icon: typeof Images;
    subtitle: string;
    badgeTone: "primary" | "accent" | "gold";
  }
> = {
  "Capas de livros": {
    icon: BookOpen,
    subtitle: "Tipografia editorial, composições de capa e sobrecapas",
    badgeTone: "primary",
  },
  "Figurinos e moda": {
    icon: Shirt,
    subtitle: "Silhuetas, tecidos, armaduras, trajes de gala e estilo pessoal",
    badgeTone: "accent",
  },
  "Paletas de cores": {
    icon: Palette,
    subtitle: "Harmonias cromáticas, atmosferas de cor e contrastes",
    badgeTone: "gold",
  },
  "Objetos e acessórios": {
    icon: Gem,
    subtitle: "Artefatos, joias, relíquias, armas e detalhes simbólicos",
    badgeTone: "primary",
  },
  Personagens: {
    icon: Users,
    subtitle: "Fisionomia, expressões, retratos e presença dos personagens",
    badgeTone: "accent",
  },
  Casais: {
    icon: Heart,
    subtitle: "Química romântica, dinâmicas, encontros e olhares",
    badgeTone: "primary",
  },
  "Cenários e lugares": {
    icon: Globe2,
    subtitle: "Arquitetura, reinos, cidades, natureza e interiores",
    badgeTone: "accent",
  },
  "Cenas e atmosferas": {
    icon: Sparkles,
    subtitle: "Iluminação dramática, clima emocional e fotografia cinematográfica",
    badgeTone: "gold",
  },
  "Magia e transformações": {
    icon: Wand2,
    subtitle: "Auras, feitiços, rituais, formas despertas e energia",
    badgeTone: "primary",
  },
  Colagens: {
    icon: Layers,
    subtitle: "Composições estéticas, estética de arco e painéis conceituais",
    badgeTone: "accent",
  },
  "Referências diversas": {
    icon: Images,
    subtitle: "Inspirações livres, texturas, citações visuais e detalhes",
    badgeTone: "gold",
  },
  Personalizada: {
    icon: FolderOpen,
    subtitle: "Suas categorias autorais exclusivas para este universo",
    badgeTone: "primary",
  },
};

function getCategoryMeta(cat: string) {
  return (
    CATEGORY_META[cat] ?? {
      icon: Bookmark,
      subtitle: "Galeria personalizada de referências visuais",
      badgeTone: "primary" as const,
    }
  );
}

const ASPECT_LABELS: { value: MoodboardAspectRatio; label: string; css: string }[] = [
  { value: "original", label: "Proporção original", css: "" },
  { value: "vertical", label: "Vertical (Retrato 3:4)", css: "aspect-[3/4] object-cover" },
  { value: "square", label: "Quadrada (1:1)", css: "aspect-square object-cover" },
  { value: "horizontal", label: "Horizontal (16:10)", css: "aspect-[16/10] object-cover" },
];

export function MoodboardsPage() {
  const routeSearch = Route.useSearch();
  const moodboards = useStore((s) => s.moodboards ?? []);
  const moodboardItems = useStore((s) => s.moodboardItems ?? []);
  const customCategories = useStore((s) => s.moodboardCustomCategories ?? []);
  const books = useStore((s) => s.books ?? []);
  const characters = useStore((s) => s.characters ?? []);
  const worldRecords = useStore((s) => s.worldRecords ?? []);
  const chapters = useStore((s) => s.chapters ?? []);

  // Lista de casais cadastrados (pares recíprocos de personagens)
  const couples = useMemo(() => {
    return characters
      .filter((c) => c.partnerId && c.id < c.partnerId)
      .map((a) => {
        const b = characters.find((c) => c.id === a.partnerId);
        if (!b) return null;
        return {
          id: `${a.id}::${b.id}`,
          label: `${a.name || "Sem nome"} ♥ ${b.name || "Sem nome"}`,
          charA: a,
          charB: b,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [characters]);

  // Todas as categorias disponíveis (12 iniciais + personalizadas salvas)
  const allCategories = useMemo(() => {
    const base = MOODBOARD_DEFAULT_CATEGORIES.filter((c) => c !== "Personalizada");
    const extras = customCategories.filter((c) => !base.includes(c as never));
    return [...base, ...extras, "Personalizada"];
  }, [customCategories]);

  // Navegação interna da página:
  // "home" = página inicial dos Moodboards
  // "board" = visualização de um Moodboard específico em mural Pinterest / Grade
  // "category" = visualização de uma Galeria de Categoria em mural Pinterest / Grade
  const [activeView, setActiveView] = useState<"home" | "board" | "category">("home");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedCategoryGallery, setSelectedCategoryGallery] = useState<string | null>(null);

  // Filtros e Pesquisa Globais / Locais
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("Todas");
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterColor, setFilterColor] = useState<string>("");
  const [filterBookId, setFilterBookId] = useState<string>("");
  const [filterCharacterId, setFilterCharacterId] = useState<string>("");
  const [filterCoupleId, setFilterCoupleId] = useState<string>("");
  const [filterWorldId, setFilterWorldId] = useState<string>("");
  const [filterChapterId, setFilterChapterId] = useState<string>("");
  const [filterOnlyFavorites, setFilterOnlyFavorites] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alpha" | "manual">("recent");
  const [wallLayout, setWallLayout] = useState<"pinterest" | "grid">("pinterest");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sincroniza parâmetros de URL caso o usuário venha de Livro, Personagem, Casal, Mundo ou Capítulo
  useEffect(() => {
    if (routeSearch.moodboard) {
      const exists = moodboards.find((m) => m.id === routeSearch.moodboard);
      if (exists) {
        setSelectedBoardId(exists.id);
        setWallLayout(exists.layoutMode || "pinterest");
        setActiveView("board");
      }
    } else if (routeSearch.categoria) {
      setSelectedCategoryGallery(routeSearch.categoria);
      setActiveView("category");
    }
    if (routeSearch.livro) {
      setFilterBookId(routeSearch.livro);
      setShowAdvancedFilters(true);
    }
    if (routeSearch.personagem) {
      setFilterCharacterId(routeSearch.personagem);
      setShowAdvancedFilters(true);
    }
    if (routeSearch.casal) {
      setFilterCoupleId(routeSearch.casal);
      setShowAdvancedFilters(true);
    }
    if (routeSearch.mundo) {
      setFilterWorldId(routeSearch.mundo);
      setShowAdvancedFilters(true);
    }
    if (routeSearch.capitulo) {
      setFilterChapterId(routeSearch.capitulo);
      setShowAdvancedFilters(true);
    }
  }, [
    routeSearch.moodboard,
    routeSearch.categoria,
    routeSearch.livro,
    routeSearch.personagem,
    routeSearch.casal,
    routeSearch.mundo,
    routeSearch.capitulo,
  ]);

  // Modais de Criação/Edição de Moodboard
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [boardDraft, setBoardDraft] = useState<Moodboard | null>(null);
  const [boardTagInput, setBoardTagInput] = useState("");
  const [boardColorInput, setBoardColorInput] = useState("#e01e8c");
  const [boardError, setBoardError] = useState("");

  // Modal de Nova Categoria Personalizada
  const [customCatModalOpen, setCustomCatModalOpen] = useState(false);
  const [newCustomCatInput, setNewCustomCatInput] = useState("");

  // Modal de Adição/Edição de Referência (Imagem / Pin)
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemDraft, setItemDraft] = useState<MoodboardReferenceItem | null>(null);
  const [itemTagInput, setItemTagInput] = useState("");
  const [itemColorInput, setItemColorInput] = useState("#5cc8c0");
  const [itemInputMode, setItemInputMode] = useState<"upload" | "url">("upload");
  const [itemError, setItemError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Lightbox (Visualização Ampliada estilo Pinterest)
  const [lightboxItemId, setLightboxItemId] = useState<string | null>(null);

  // Confirmações de exclusão
  const [deleteBoardTarget, setDeleteBoardTarget] = useState<Moodboard | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<MoodboardReferenceItem | null>(null);

  // Feedback temporário
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Coleta todas as tags e cores únicas para filtros rápidos
  const allAvailableTags = useMemo(() => {
    const s = new Set<string>();
    moodboards.forEach((m) => (m.tags ?? []).forEach((t) => s.add(t)));
    moodboardItems.forEach((it) => (it.tags ?? []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [moodboards, moodboardItems]);

  const allAvailableColors = useMemo(() => {
    const s = new Set<string>();
    moodboards.forEach((m) => (m.paletteColors ?? []).forEach((c) => s.add(c.toLowerCase())));
    moodboardItems.forEach((it) => (it.paletteColors ?? []).forEach((c) => s.add(c.toLowerCase())));
    return Array.from(s);
  }, [moodboards, moodboardItems]);

  // Moodboard ativo quando em activeView === "board"
  const currentBoard = useMemo(
    () => moodboards.find((m) => m.id === selectedBoardId) ?? null,
    [moodboards, selectedBoardId],
  );

  // Filtragem de Moodboards
  const filteredMoodboards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return moodboards
      .filter((mb) => {
        if (filterCategory !== "Todas") {
          if (filterCategory === "Personalizada") {
            const isDefault = MOODBOARD_DEFAULT_CATEGORIES.filter(
              (c) => c !== "Personalizada",
            ).includes(mb.category as never);
            if (isDefault && mb.category !== "Personalizada") return false;
          } else if (mb.category !== filterCategory) {
            return false;
          }
        }
        if (filterOnlyFavorites && !mb.isFavorite) return false;
        if (filterTag && !(mb.tags ?? []).includes(filterTag)) return false;
        if (
          filterColor &&
          !(mb.paletteColors ?? []).some((c) => c.toLowerCase() === filterColor.toLowerCase())
        ) {
          return false;
        }
        if (filterBookId && !(mb.bookIds ?? []).includes(filterBookId)) return false;
        if (filterCharacterId && !(mb.characterIds ?? []).includes(filterCharacterId)) return false;
        if (filterCoupleId && !(mb.coupleIds ?? []).includes(filterCoupleId)) return false;
        if (filterWorldId && !(mb.worldRecordIds ?? []).includes(filterWorldId)) return false;
        if (filterChapterId && !(mb.chapterIds ?? []).includes(filterChapterId)) return false;

        if (!q) return true;
        const inName = (mb.name || "").toLowerCase().includes(q);
        const inDesc = (mb.description || "").toLowerCase().includes(q);
        const inCat = (mb.category || "").toLowerCase().includes(q);
        const inTags = (mb.tags ?? []).some((t) => t.toLowerCase().includes(q));
        const inChars = (mb.characterIds ?? []).some((cid) => {
          const ch = characters.find((c) => c.id === cid);
          return ch && ch.name.toLowerCase().includes(q);
        });
        const inBooks = (mb.bookIds ?? []).some((bid) => {
          const bk = books.find((b) => b.id === bid);
          return bk && bk.title.toLowerCase().includes(q);
        });
        const inWorlds = (mb.worldRecordIds ?? []).some((wid) => {
          const wr = worldRecords.find((w) => w.id === wid);
          return wr && wr.name.toLowerCase().includes(q);
        });
        return inName || inDesc || inCat || inTags || inChars || inBooks || inWorlds;
      })
      .sort((a, b) => {
        if (sortBy === "alpha") return (a.name || "").localeCompare(b.name || "", "pt-BR");
        if (sortBy === "oldest") return (a.createdAt || "").localeCompare(b.createdAt || "");
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      });
  }, [
    moodboards,
    searchQuery,
    filterCategory,
    filterOnlyFavorites,
    filterTag,
    filterColor,
    filterBookId,
    filterCharacterId,
    filterCoupleId,
    filterWorldId,
    filterChapterId,
    sortBy,
    characters,
    books,
    worldRecords,
  ]);

  // Filtragem de Referências Visuais (Pins)
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return moodboardItems
      .filter((it) => {
        // Se estiver dentro de um moodboard específico:
        if (activeView === "board" && selectedBoardId) {
          if (!(it.moodboardIds ?? []).includes(selectedBoardId)) return false;
        }
        // Se estiver dentro de uma galeria de categoria:
        if (activeView === "category" && selectedCategoryGallery) {
          if (selectedCategoryGallery === "Personalizada") {
            const isStandard = MOODBOARD_DEFAULT_CATEGORIES.filter(
              (c) => c !== "Personalizada",
            ).includes(it.category as never);
            if (isStandard && it.category !== "Personalizada") return false;
          } else if (it.category !== selectedCategoryGallery) {
            return false;
          }
        }
        // Filtros ativos na barra
        if (activeView === "home" && filterCategory !== "Todas") {
          if (filterCategory === "Personalizada") {
            const isStandard = MOODBOARD_DEFAULT_CATEGORIES.filter(
              (c) => c !== "Personalizada",
            ).includes(it.category as never);
            if (isStandard && it.category !== "Personalizada") return false;
          } else if (it.category !== filterCategory) {
            return false;
          }
        }
        if (filterOnlyFavorites && !it.isFavorite) return false;
        if (filterTag && !(it.tags ?? []).includes(filterTag)) return false;
        if (
          filterColor &&
          !(it.paletteColors ?? []).some((c) => c.toLowerCase() === filterColor.toLowerCase())
        ) {
          return false;
        }
        if (filterBookId && !(it.bookIds ?? []).includes(filterBookId)) return false;
        if (filterCharacterId && !(it.characterIds ?? []).includes(filterCharacterId)) return false;
        if (filterCoupleId && !(it.coupleIds ?? []).includes(filterCoupleId)) return false;
        if (filterWorldId && !(it.worldRecordIds ?? []).includes(filterWorldId)) return false;
        if (filterChapterId && !(it.chapterIds ?? []).includes(filterChapterId)) return false;

        if (!q) return true;
        const inTitle = (it.title || "").toLowerCase().includes(q);
        const inCaption = (it.caption || "").toLowerCase().includes(q);
        const inCat = (it.category || "").toLowerCase().includes(q);
        const inTags = (it.tags ?? []).some((t) => t.toLowerCase().includes(q));
        const inChars = (it.characterIds ?? []).some((cid) => {
          const ch = characters.find((c) => c.id === cid);
          return ch && ch.name.toLowerCase().includes(q);
        });
        const inBooks = (it.bookIds ?? []).some((bid) => {
          const bk = books.find((b) => b.id === bid);
          return bk && bk.title.toLowerCase().includes(q);
        });
        const inWorlds = (it.worldRecordIds ?? []).some((wid) => {
          const wr = worldRecords.find((w) => w.id === wid);
          return wr && wr.name.toLowerCase().includes(q);
        });
        return inTitle || inCaption || inCat || inTags || inChars || inBooks || inWorlds;
      })
      .sort((a, b) => {
        if (sortBy === "manual") return (a.displayOrder || 0) - (b.displayOrder || 0);
        if (sortBy === "alpha")
          return (a.title || a.caption || "").localeCompare(b.title || b.caption || "", "pt-BR");
        if (sortBy === "oldest") return (a.createdAt || "").localeCompare(b.createdAt || "");
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      });
  }, [
    moodboardItems,
    activeView,
    selectedBoardId,
    selectedCategoryGallery,
    searchQuery,
    filterCategory,
    filterOnlyFavorites,
    filterTag,
    filterColor,
    filterBookId,
    filterCharacterId,
    filterCoupleId,
    filterWorldId,
    filterChapterId,
    sortBy,
    characters,
    books,
    worldRecords,
  ]);

  const recentMoodboards = useMemo(
    () =>
      [...moodboards]
        .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
        .slice(0, 6),
    [moodboards],
  );

  const favoriteMoodboards = useMemo(() => moodboards.filter((m) => m.isFavorite), [moodboards]);

  const hasActiveFilter = Boolean(
    searchQuery.trim() ||
    filterCategory !== "Todas" ||
    filterTag ||
    filterColor ||
    filterBookId ||
    filterCharacterId ||
    filterCoupleId ||
    filterWorldId ||
    filterChapterId ||
    filterOnlyFavorites,
  );

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterCategory("Todas");
    setFilterTag("");
    setFilterColor("");
    setFilterBookId("");
    setFilterCharacterId("");
    setFilterCoupleId("");
    setFilterWorldId("");
    setFilterChapterId("");
    setFilterOnlyFavorites(false);
  };

  // Abertura de modal para Novo ou Editar Moodboard
  const openCreateBoardModal = (defaultCat = "Referências diversas") => {
    const fresh = actions.newMoodboard(defaultCat);
    if (filterBookId) fresh.bookIds = [filterBookId];
    if (filterCharacterId) fresh.characterIds = [filterCharacterId];
    if (filterCoupleId) fresh.coupleIds = [filterCoupleId];
    if (filterWorldId) fresh.worldRecordIds = [filterWorldId];
    if (filterChapterId) fresh.chapterIds = [filterChapterId];
    setBoardDraft(fresh);
    setBoardTagInput("");
    setBoardError("");
    setBoardModalOpen(true);
  };

  const openEditBoardModal = (mb: Moodboard) => {
    const cloned = structuredClone(mb);
    const isStandard = MOODBOARD_DEFAULT_CATEGORIES.includes(cloned.category as never);
    if (!isStandard) {
      cloned.customCategoryName = cloned.category;
      cloned.category = "Personalizada";
    }
    setBoardDraft(cloned);
    setBoardTagInput("");
    setBoardError("");
    setBoardModalOpen(true);
  };

  const handleSaveBoard = () => {
    if (!boardDraft) return;
    if (!boardDraft.name.trim()) {
      setBoardError("Informe um nome para o moodboard.");
      return;
    }
    if (boardDraft.category === "Personalizada" && !boardDraft.customCategoryName?.trim()) {
      setBoardError("Informe o nome da categoria personalizada.");
      return;
    }
    actions.saveMoodboard({
      ...boardDraft,
      name: boardDraft.name.trim(),
    });
    setBoardModalOpen(false);
    showToast("Moodboard salvo com sucesso!");
  };

  // Abertura de modal para Nova ou Editar Referência (Imagem / Pin)
  const openCreateItemModal = (opts?: { category?: string; moodboardId?: string }) => {
    const cat =
      opts?.category ||
      (activeView === "category" && selectedCategoryGallery
        ? selectedCategoryGallery
        : currentBoard?.category || "Referências diversas");
    const mbId =
      opts?.moodboardId || (activeView === "board" && selectedBoardId ? selectedBoardId : "");
    const fresh = actions.newMoodboardItem(cat, mbId || undefined);
    // Herda vínculos do moodboard atual ou filtros ativos
    if (currentBoard && activeView === "board") {
      fresh.bookIds = [...(currentBoard.bookIds ?? [])];
      fresh.characterIds = [...(currentBoard.characterIds ?? [])];
      fresh.coupleIds = [...(currentBoard.coupleIds ?? [])];
      fresh.worldRecordIds = [...(currentBoard.worldRecordIds ?? [])];
      fresh.chapterIds = [...(currentBoard.chapterIds ?? [])];
    } else {
      if (filterBookId) fresh.bookIds = [filterBookId];
      if (filterCharacterId) fresh.characterIds = [filterCharacterId];
      if (filterCoupleId) fresh.coupleIds = [filterCoupleId];
      if (filterWorldId) fresh.worldRecordIds = [filterWorldId];
      if (filterChapterId) fresh.chapterIds = [filterChapterId];
    }
    setItemDraft(fresh);
    setItemTagInput("");
    setItemError("");
    setItemInputMode("upload");
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: MoodboardReferenceItem) => {
    const cloned = structuredClone(item);
    const isStandard = MOODBOARD_DEFAULT_CATEGORIES.includes(cloned.category as never);
    if (!isStandard) {
      cloned.customCategoryName = cloned.category;
      cloned.category = "Personalizada";
    }
    setItemDraft(cloned);
    setItemTagInput("");
    setItemError("");
    setItemInputMode(
      cloned.imageUrl.startsWith("http://") || cloned.imageUrl.startsWith("https://")
        ? "url"
        : "upload",
    );
    setItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemDraft) return;
    if (!itemDraft.imageUrl.trim()) {
      setItemError("Adicione uma imagem do dispositivo ou informe um endereço de imagem válido.");
      return;
    }
    if (itemDraft.category === "Personalizada" && !itemDraft.customCategoryName?.trim()) {
      setItemError("Informe o nome da categoria personalizada.");
      return;
    }
    actions.saveMoodboardItem({
      ...itemDraft,
      title: itemDraft.title.trim() || itemDraft.caption.trim().slice(0, 48) || "Referência visual",
    });
    setItemModalOpen(false);
    showToast("Referência salva na galeria!");
  };

  const handleUploadItemImage = async (file: File) => {
    if (!itemDraft) return;
    setUploadingImage(true);
    setItemError("");
    try {
      const dataUrl = await processImageFile(file, 1400);
      const storedRef = await storeMediaDataUrl(`mb_img_${itemDraft.id}_${Date.now()}`, dataUrl);
      setItemDraft((prev) =>
        prev
          ? {
              ...prev,
              imageUrl: storedRef,
              title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            }
          : prev,
      );
    } catch {
      setItemError("Não foi possível processar a imagem selecionada.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadBoardCover = async (file: File) => {
    if (!boardDraft) return;
    try {
      const dataUrl = await processImageFile(file, 1200);
      const storedRef = await storeMediaDataUrl(`mb_cov_${boardDraft.id}_${Date.now()}`, dataUrl);
      setBoardDraft((prev) => (prev ? { ...prev, coverImageUrl: storedRef } : prev));
    } catch {
      setBoardError("Falha ao carregar imagem de capa.");
    }
  };

  const moveItemOrder = (itemId: string, direction: "up" | "down") => {
    const ids = filteredItems.map((it) => it.id);
    const idx = ids.indexOf(itemId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    const nextIds = [...ids];
    const tmp = nextIds[idx]!;
    nextIds[idx] = nextIds[swapIdx]!;
    nextIds[swapIdx] = tmp;
    setSortBy("manual");
    actions.reorderMoodboardItems(nextIds);
  };

  const toggleArrayId = (arr: string[], id: string): string[] =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  // Lightbox item e navegação anterior / próxima
  const lightboxIndex = useMemo(
    () => (lightboxItemId ? filteredItems.findIndex((x) => x.id === lightboxItemId) : -1),
    [filteredItems, lightboxItemId],
  );
  const lightboxItem =
    lightboxIndex >= 0
      ? filteredItems[lightboxIndex]
      : moodboardItems.find((x) => x.id === lightboxItemId);

  // Renderizador de Card de Moodboard (Coleção)
  const renderMoodboardCard = (mb: Moodboard) => {
    const boardPins = moodboardItems.filter((it) => (it.moodboardIds ?? []).includes(mb.id));
    const previewImages = [mb.coverImageUrl, ...boardPins.map((p) => p.imageUrl)].filter(
      (x): x is string => Boolean(x),
    );
    const catMeta = getCategoryMeta(mb.category);
    const CatIcon = catMeta.icon;

    return (
      <article
        key={mb.id}
        data-testid={`moodboard-card-${mb.id}`}
        className="card-luxe group flex flex-col overflow-hidden transition-all hover:border-primary/60"
      >
        {/* Prévia de imagens em mosaico estilo Pinterest Board */}
        <div
          onClick={() => {
            setSelectedBoardId(mb.id);
            setWallLayout(mb.layoutMode || "pinterest");
            setActiveView("board");
          }}
          className="relative grid h-48 cursor-pointer grid-cols-3 grid-rows-2 gap-1 overflow-hidden bg-secondary/50 p-1.5"
        >
          {previewImages.length > 0 ? (
            <>
              <div className="col-span-2 row-span-2 overflow-hidden rounded-l-xl bg-secondary">
                <MediaImage
                  src={previewImages[0]}
                  alt={mb.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-tr-xl bg-secondary">
                {previewImages[1] ? (
                  <MediaImage
                    src={previewImages[1]}
                    alt={mb.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/70">
                    <CatIcon className="h-4 w-4 text-icon-muted" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden rounded-br-xl bg-secondary">
                {previewImages[2] ? (
                  <MediaImage
                    src={previewImages[2]}
                    alt={mb.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/70 text-xs font-medium text-muted-foreground">
                    {boardPins.length} {boardPins.length === 1 ? "item" : "itens"}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-span-3 row-span-2 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 p-4 text-center">
              <CatIcon className="h-8 w-8 text-icon-primary opacity-80" />
              <span className="text-xs text-muted-foreground">
                Mural pronto para receber referências
              </span>
            </div>
          )}

          {/* Badge de Categoria e Botão Favoritar */}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className="chip pointer-events-auto !bg-background/90 !text-[11px] backdrop-blur">
              <CatIcon className="h-3 w-3 text-icon-primary" />
              {mb.category}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                actions.toggleFavoriteMoodboard(mb.id);
              }}
              aria-label={mb.isFavorite ? "Remover moodboard dos favoritos" : "Favoritar moodboard"}
              data-testid={`fav-moodboard-${mb.id}`}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur transition-transform hover:scale-105"
            >
              <Star
                className={`h-4 w-4 ${mb.isFavorite ? "fill-gold text-gold" : "text-icon-muted"}`}
              />
            </button>
          </div>

          {/* Paleta de cores do moodboard no canto inferior */}
          {(mb.paletteColors ?? []).length > 0 && (
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 backdrop-blur">
              {(mb.paletteColors ?? []).slice(0, 6).map((hex, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Corpo do Cartão */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedBoardId(mb.id);
                  setWallLayout(mb.layoutMode || "pinterest");
                  setActiveView("board");
                }}
                className="text-left font-display text-xl leading-snug text-foreground hover:text-primary"
              >
                {mb.name || "Moodboard sem título"}
              </button>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                {boardPins.length} {boardPins.length === 1 ? "pin" : "pins"}
              </span>
            </div>

            {mb.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{mb.description}</p>
            )}

            {/* Tags e Vínculos */}
            <div className="mt-3 flex flex-wrap gap-1">
              {(mb.tags ?? []).slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-secondary/70 px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
              {(mb.bookIds ?? []).slice(0, 2).map((bid) => {
                const bk = books.find((b) => b.id === bid);
                return bk ? (
                  <span
                    key={bid}
                    className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                  >
                    📖 {bk.title}
                  </span>
                ) : null;
              })}
              {(mb.characterIds ?? []).slice(0, 2).map((cid) => {
                const ch = characters.find((c) => c.id === cid);
                return ch ? (
                  <span
                    key={cid}
                    className="rounded-md border border-teal/30 bg-teal/10 px-2 py-0.5 text-[10px] text-teal"
                  >
                    👤 {ch.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-4 flex items-center justify-between gap-1 border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => {
                setSelectedBoardId(mb.id);
                setWallLayout(mb.layoutMode || "pinterest");
                setActiveView("board");
              }}
              data-testid={`open-moodboard-${mb.id}`}
              className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
            >
              <Eye className="h-3.5 w-3.5" /> Abrir Mural
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => openCreateItemModal({ category: mb.category, moodboardId: mb.id })}
                title="Adicionar imagem a este moodboard"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Plus className="h-4 w-4 text-icon-primary" />
              </button>
              <button
                type="button"
                onClick={() => openEditBoardModal(mb)}
                aria-label={`Editar ${mb.name}`}
                data-testid={`edit-moodboard-${mb.id}`}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const copy = actions.duplicateMoodboard(mb.id);
                  if (copy) showToast(`Moodboard "${copy.name}" duplicado!`);
                }}
                aria-label={`Duplicar ${mb.name}`}
                data-testid={`duplicate-moodboard-${mb.id}`}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteBoardTarget(mb)}
                aria-label={`Excluir ${mb.name}`}
                data-testid={`delete-moodboard-${mb.id}`}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  // Renderizador de Cartão de Pin (Referência Visual em Estilo Pinterest)
  const renderPinterestPinCard = (item: MoodboardReferenceItem, idx: number, total: number) => {
    const aspectSpec = ASPECT_LABELS.find((a) => a.value === item.aspectRatio) ?? ASPECT_LABELS[0]!;
    const linkedBooks = (item.bookIds ?? [])
      .map((id) => books.find((b) => b.id === id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    const linkedChars = (item.characterIds ?? [])
      .map((id) => characters.find((c) => c.id === id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    const linkedWorlds = (item.worldRecordIds ?? [])
      .map((id) => worldRecords.find((w) => w.id === id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    return (
      <figure
        key={item.id}
        data-testid={`pin-card-${item.id}`}
        className={`card-luxe group relative overflow-hidden transition-all hover:border-primary/60 ${
          wallLayout === "pinterest" ? "mb-4 break-inside-avoid" : "flex flex-col"
        }`}
      >
        {/* Imagem com proporção respeitada ou ajustada */}
        <div
          onClick={() => setLightboxItemId(item.id)}
          className="relative cursor-zoom-in overflow-hidden bg-secondary/40"
        >
          <MediaImage
            src={item.imageUrl}
            alt={item.title || item.caption || "Referência visual"}
            className={`w-full transition-transform duration-300 group-hover:scale-[1.03] ${
              wallLayout === "grid"
                ? "aspect-[4/3] object-cover"
                : aspectSpec.css || "h-auto max-h-[520px] object-cover"
            }`}
          />

          {/* Overlay estilo Pinterest no Hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          {/* Barra superior flutuante no Pin */}
          <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-1.5 opacity-95 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
            <span className="chip !bg-background/90 !px-2.5 !py-0.5 !text-[10px] backdrop-blur">
              {item.category}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.toggleFavoriteMoodboardItem(item.id);
                }}
                aria-label={item.isFavorite ? "Desfavoritar referência" : "Favoritar referência"}
                data-testid={`fav-pin-${item.id}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur hover:scale-105"
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    item.isFavorite ? "fill-gold text-gold" : "text-icon-muted"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditItemModal(item);
                }}
                aria-label={`Editar referência ${item.title}`}
                data-testid={`edit-pin-${item.id}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur hover:scale-105"
              >
                <Edit3 className="h-3.5 w-3.5 text-icon-primary" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteItemTarget(item);
                }}
                aria-label={`Excluir referência ${item.title}`}
                data-testid={`delete-pin-${item.id}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur hover:scale-105"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          </div>

          {/* Paleta Extraída / Associada à Imagem */}
          {(item.paletteColors ?? []).length > 0 && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 backdrop-blur">
              {(item.paletteColors ?? []).map((hex, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-white/20"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legenda, Tags e Vínculos */}
        <figcaption className="space-y-2 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => setLightboxItemId(item.id)}
              className="text-left font-display text-base leading-snug text-foreground hover:text-primary"
            >
              {item.title || "Referência visual"}
            </button>
            {total > 1 && (
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItemOrder(item.id, "up")}
                  aria-label="Mover referência para trás"
                  className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === total - 1}
                  onClick={() => moveItemOrder(item.id, "down")}
                  aria-label="Mover referência para frente"
                  className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {item.caption && (
            <p className="line-clamp-3 text-xs text-muted-foreground">{item.caption}</p>
          )}

          {/* Etiquetas e Vínculos Narrativos */}
          {((item.tags ?? []).length > 0 ||
            linkedBooks.length > 0 ||
            linkedChars.length > 0 ||
            linkedWorlds.length > 0) && (
            <div className="flex flex-wrap gap-1 pt-1">
              {(item.tags ?? []).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterTag(filterTag === t ? "" : t)}
                  className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-primary"
                >
                  #{t}
                </button>
              ))}
              {linkedBooks.map((b) => (
                <Link
                  key={b.id}
                  to="/livros/$id"
                  params={{ id: b.id }}
                  className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:underline"
                >
                  📖 {b.title}
                </Link>
              ))}
              {linkedChars.map((c) => (
                <Link
                  key={c.id}
                  to="/personagens/$id"
                  params={{ id: c.id }}
                  className="rounded border border-teal/30 bg-teal/10 px-1.5 py-0.5 text-[10px] text-teal hover:underline"
                >
                  👤 {c.name}
                </Link>
              ))}
              {linkedWorlds.map((w) => (
                <Link
                  key={w.id}
                  to="/universo"
                  className="rounded border border-gold/30 bg-gold/10 px-1.5 py-0.5 text-[10px] text-gold hover:underline"
                >
                  🌍 {w.name}
                </Link>
              ))}
            </div>
          )}
        </figcaption>
      </figure>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8" data-testid="moodboards-page">
      {/* Notificação rápida */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 right-5 z-50 flex items-center gap-2 rounded-2xl border border-primary/40 bg-card/95 px-4 py-2.5 text-xs font-medium shadow-xl backdrop-blur md:bottom-6"
        >
          <Check className="h-4 w-4 text-icon-primary" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* CABEÇALHO PRINCIPAL */}
      <header className="bg-saga relative overflow-hidden rounded-3xl border p-6 md:p-9">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {activeView !== "home" && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveView("home");
                    setSelectedBoardId(null);
                    setSelectedCategoryGallery(null);
                  }}
                  data-testid="btn-voltar-moodboards-home"
                  className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Todos os Moodboards
                </button>
              )}
              <span className="chip">
                <Images className="h-3.5 w-3.5 text-icon-primary" /> Curadoria Estética & Pinterest
                Studio
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl">
              {activeView === "board" && currentBoard
                ? currentBoard.name
                : activeView === "category" && selectedCategoryGallery
                  ? `Galeria: ${selectedCategoryGallery}`
                  : "Moodboards"}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {activeView === "board" && currentBoard
                ? currentBoard.description || `Mural visual da categoria ${currentBoard.category}.`
                : activeView === "category" && selectedCategoryGallery
                  ? getCategoryMeta(selectedCategoryGallery).subtitle
                  : "Reúna inspirações, organize referências e dê vida à estética das suas histórias."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => openCreateItemModal()}
              data-testid="btn-nova-referencia"
              className="btn-ghost"
            >
              <Upload className="h-4 w-4 text-icon-primary" /> ＋ Adicionar imagem
            </button>
            <button
              type="button"
              onClick={() =>
                openCreateBoardModal(
                  activeView === "category" && selectedCategoryGallery
                    ? selectedCategoryGallery
                    : "Referências diversas",
                )
              }
              data-testid="btn-novo-moodboard"
              className="btn"
            >
              <Plus className="h-4 w-4" /> ＋ Novo moodboard
            </button>
          </div>
        </div>

        {/* BARRA DE PESQUISA E FILTROS */}
        <div className="mt-6 space-y-3 border-t border-border/60 pt-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome, legenda, categoria, tag, personagem, livro ou mundo…"
                aria-label="Pesquisar nos moodboards"
                data-testid="input-search-moodboards"
                className="!pl-10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Ordenar referências"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "recent" | "oldest" | "alpha" | "manual")
                }
                className="!w-auto text-xs"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="alpha">Ordem alfabética (A–Z)</option>
                <option value="manual">Ordem manual personalizada</option>
              </select>

              <button
                type="button"
                onClick={() => setFilterOnlyFavorites((v) => !v)}
                data-testid="btn-filter-favorites"
                className={`btn-ghost !min-h-10 !px-3.5 text-xs ${
                  filterOnlyFavorites ? "!border-primary !bg-primary/15 !text-foreground" : ""
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    filterOnlyFavorites ? "fill-gold text-gold" : "text-icon-primary"
                  }`}
                />
                Favoritos
              </button>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters((s) => !s)}
                data-testid="btn-toggle-advanced-filters"
                className={`btn-ghost !min-h-10 !px-3.5 text-xs ${
                  showAdvancedFilters ? "!border-primary !bg-primary/15" : ""
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-icon-primary" />
                Vínculos & Cores
              </button>

              {/* Alternador de Layout: Pinterest Masonry vs Grade Uniforme */}
              <div
                className="inline-flex rounded-full border border-border bg-secondary/50 p-1"
                role="group"
                aria-label="Modo de visualização da galeria"
              >
                <button
                  type="button"
                  onClick={() => setWallLayout("pinterest")}
                  title="Visualização em Mural estilo Pinterest (proporções livres)"
                  data-testid="btn-layout-pinterest"
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                    wallLayout === "pinterest"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Columns3 className="h-3.5 w-3.5" /> Pinterest
                </button>
                <button
                  type="button"
                  onClick={() => setWallLayout("grid")}
                  title="Visualização em Grade Uniforme"
                  data-testid="btn-layout-grid"
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                    wallLayout === "grid"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grade
                </button>
              </div>
            </div>
          </div>

          {/* Chips de Categorias Rápidas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["Todas", ...allCategories].map((cat) => {
              const active =
                activeView === "category"
                  ? selectedCategoryGallery === cat
                  : filterCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    if (cat === "Todas") {
                      setFilterCategory("Todas");
                      if (activeView === "category") {
                        setActiveView("home");
                        setSelectedCategoryGallery(null);
                      }
                    } else if (activeView === "category") {
                      setSelectedCategoryGallery(cat);
                    } else {
                      setFilterCategory(filterCategory === cat ? "Todas" : cat);
                    }
                  }}
                  data-testid={`filter-category-${cat}`}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setNewCustomCatInput("");
                setCustomCatModalOpen(true);
              }}
              data-testid="btn-criar-categoria-personalizada"
              className="shrink-0 rounded-full border border-dashed border-primary/50 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
            >
              ＋ Nova Categoria
            </button>
          </div>

          {/* Painel Expansível de Filtros por Livro, Personagem, Casal, Mundo, Capítulo, Tag e Cor */}
          {showAdvancedFilters && (
            <div
              className="grid gap-3 rounded-2xl border border-border/80 bg-background/60 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
              data-testid="advanced-filters-panel"
            >
              <div>
                <label className="text-[11px]">Livro vinculado</label>
                <select
                  aria-label="Filtrar por livro"
                  value={filterBookId}
                  onChange={(e) => setFilterBookId(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Todos os livros</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.order}. {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px]">Personagem vinculado</label>
                <select
                  aria-label="Filtrar por personagem"
                  value={filterCharacterId}
                  onChange={(e) => setFilterCharacterId(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Todos os personagens</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || "Sem nome"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px]">Casal vinculado</label>
                <select
                  aria-label="Filtrar por casal"
                  value={filterCoupleId}
                  onChange={(e) => setFilterCoupleId(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Todos os casais</option>
                  {couples.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px]">Lugar / Mundo (Enciclopédia)</label>
                <select
                  aria-label="Filtrar por mundo ou país"
                  value={filterWorldId}
                  onChange={(e) => setFilterWorldId(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Todos os lugares</option>
                  {worldRecords.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name || "Sem nome"} ({w.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px]">Capítulo vinculado</label>
                <select
                  aria-label="Filtrar por capítulo"
                  value={filterChapterId}
                  onChange={(e) => setFilterChapterId(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Todos os capítulos</option>
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      Cap. {ch.number} — {ch.title || "Sem título"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px]">Tag / Etiqueta</label>
                <select
                  aria-label="Filtrar por tag"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Todas as tags</option>
                  {allAvailableTags.map((t) => (
                    <option key={t} value={t}>
                      #{t}
                    </option>
                  ))}
                </select>
              </div>

              {allAvailableColors.length > 0 && (
                <div className="sm:col-span-2 md:col-span-3 lg:col-span-6">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Filtrar por cor da paleta:
                  </span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {allAvailableColors.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setFilterColor(filterColor === hex ? "" : hex)}
                        title={`Filtrar pela cor ${hex}`}
                        className={`h-6 w-6 rounded-full border transition-transform ${
                          filterColor === hex
                            ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "border-white/30 hover:scale-110"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    {filterColor && (
                      <button
                        type="button"
                        onClick={() => setFilterColor("")}
                        className="text-xs text-primary hover:underline"
                      >
                        Limpar cor ({filterColor})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasActiveFilter && (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs">
              <span>
                Exibindo resultados filtrados ({filteredMoodboards.length}{" "}
                {filteredMoodboards.length === 1 ? "moodboard" : "moodboards"} e{" "}
                {filteredItems.length} {filteredItems.length === 1 ? "referência" : "referências"}).
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                data-testid="btn-clear-filters"
                className="font-medium text-primary hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* VISÃO 1: PÁGINA INICIAL DOS MOODBOARDS                                */}
      {/* ===================================================================== */}
      {activeView === "home" && (
        <div className="space-y-10">
          {/* ESTADO VAZIO CONVIDATIVO QUANDO AINDA NÃO HÁ MOODBOARDS NEM REFERÊNCIAS */}
          {moodboards.length === 0 && moodboardItems.length === 0 && (
            <section
              data-testid="moodboards-empty-state"
              className="card-luxe relative overflow-hidden p-8 text-center md:p-12"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <Images className="h-8 w-8 text-icon-primary" />
              </div>
              <h2 className="mt-4 text-3xl">Seu Universo Visual Começa Aqui</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Você ainda não criou nenhum moodboard ou referência. Monte painéis inspirados no
                Pinterest para capas, figurinos, paletas de cores, cenários, casais e magias das
                suas histórias!
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openCreateBoardModal()}
                  data-testid="btn-empty-create-first-moodboard"
                  className="btn"
                >
                  <Plus className="h-4 w-4" /> ＋ Criar o primeiro moodboard
                </button>
                <button type="button" onClick={() => openCreateItemModal()} className="btn-ghost">
                  <Upload className="h-4 w-4 text-icon-primary" /> Enviar primeira referência
                </button>
              </div>
            </section>
          )}

          {/* SEÇÃO: MOODBOARDS FAVORITOS */}
          {favoriteMoodboards.length > 0 && !hasActiveFilter && (
            <section className="space-y-4" data-testid="section-favorite-moodboards">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-gold text-gold" />
                  <h2 className="text-2xl md:text-3xl">Moodboards Favoritos</h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {favoriteMoodboards.length}{" "}
                  {favoriteMoodboards.length === 1 ? "favorito" : "favoritos"}
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteMoodboards.map((mb) => renderMoodboardCard(mb))}
              </div>
            </section>
          )}

          {/* SEÇÃO: MOODBOARDS RECENTES / FILTRADOS */}
          {moodboards.length > 0 && (
            <section className="space-y-4" data-testid="section-recent-moodboards">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-icon-primary" />
                  <h2 className="text-2xl md:text-3xl">
                    {hasActiveFilter ? "Moodboards Encontrados" : "Moodboards Recentes"}
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {filteredMoodboards.length} de {moodboards.length}
                </span>
              </div>

              {filteredMoodboards.length === 0 ? (
                <div className="card-luxe p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum moodboard corresponde aos filtros selecionados.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(hasActiveFilter ? filteredMoodboards : recentMoodboards).map((mb) =>
                    renderMoodboardCard(mb),
                  )}
                </div>
              )}
            </section>
          )}

          {/* SEÇÃO: GALERIAS ORGANIZADAS POR CATEGORIAS (12 INICIAIS + PERSONALIZADAS) */}
          <section className="space-y-4" data-testid="section-category-galleries">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl md:text-3xl">Galerias de Referências por Categoria</h2>
                <p className="text-xs text-muted-foreground">
                  Acesse cada galeria temática para explorar suas imagens em mural estilo Pinterest
                  ou criar categorias personalizadas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewCustomCatInput("");
                  setCustomCatModalOpen(true);
                }}
                className="btn-ghost !min-h-9 !px-3.5 !py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5 text-icon-primary" /> Criar Categoria Personalizada
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {allCategories.map((cat) => {
                const meta = getCategoryMeta(cat);
                const Icon = meta.icon;
                const catBoards = moodboards.filter((m) =>
                  cat === "Personalizada"
                    ? !MOODBOARD_DEFAULT_CATEGORIES.filter((c) => c !== "Personalizada").includes(
                        m.category as never,
                      )
                    : m.category === cat,
                );
                const catItems = moodboardItems.filter((it) =>
                  cat === "Personalizada"
                    ? !MOODBOARD_DEFAULT_CATEGORIES.filter((c) => c !== "Personalizada").includes(
                        it.category as never,
                      )
                    : it.category === cat,
                );
                const sampleImg =
                  catItems[0]?.imageUrl || catBoards.find((b) => b.coverImageUrl)?.coverImageUrl;
                const isCustomRemovable =
                  !MOODBOARD_DEFAULT_CATEGORIES.includes(cat as never) &&
                  customCategories.includes(cat);

                return (
                  <div
                    key={cat}
                    data-testid={`gallery-category-card-${cat}`}
                    onClick={() => {
                      if (cat === "Personalizada" && customCategories.length === 0) {
                        setNewCustomCatInput("");
                        setCustomCatModalOpen(true);
                        return;
                      }
                      setSelectedCategoryGallery(cat);
                      setActiveView("category");
                    }}
                    className="card-luxe group relative flex cursor-pointer flex-col justify-between overflow-hidden p-4 transition-all hover:border-primary/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary/70 transition-colors group-hover:border-primary/50 group-hover:bg-primary/15">
                        <Icon className="h-5 w-5 text-icon-primary" />
                      </div>
                      {sampleImg ? (
                        <div className="h-11 w-16 overflow-hidden rounded-xl border border-border">
                          <MediaImage
                            src={sampleImg}
                            alt={cat}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground">
                          {catItems.length} {catItems.length === 1 ? "imagem" : "imagens"}
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="font-display text-xl text-foreground group-hover:text-primary">
                        {cat}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {meta.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
                      <span>
                        {catBoards.length} {catBoards.length === 1 ? "moodboard" : "moodboards"} ·{" "}
                        {catItems.length} {catItems.length === 1 ? "pin" : "pins"}
                      </span>
                      <div className="flex items-center gap-1">
                        {isCustomRemovable && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.deleteCustomMoodboardCategory(cat);
                              showToast(`Categoria "${cat}" removida.`);
                            }}
                            title="Remover categoria personalizada"
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <span className="font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                          Abrir →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* MURAL GERAL DE REFERÊNCIAS (ESTILO PINTEREST) NA HOME QUANDO HÁ PINS */}
          {moodboardItems.length > 0 && (
            <section className="space-y-4" data-testid="section-all-pins-wall">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl md:text-3xl">Mural de Inspirações (Estilo Pinterest)</h2>
                  <p className="text-xs text-muted-foreground">
                    Clique em qualquer imagem para ampliar, ver detalhes, copiar a paleta ou navegar
                    para os itens da história.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? "referência" : "referências"}
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="card-luxe p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma imagem corresponde aos filtros selecionados.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    wallLayout === "pinterest"
                      ? "columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
                      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  }
                >
                  {filteredItems.map((item, idx) =>
                    renderPinterestPinCard(item, idx, filteredItems.length),
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISÃO 2: MURAL INTERNO DE UM MOODBOARD ESPECÍFICO                     */}
      {/* ===================================================================== */}
      {activeView === "board" && currentBoard && (
        <div className="space-y-6" data-testid="moodboard-detail-view">
          {/* Painel de Metadados, Paleta e Vínculos do Moodboard */}
          <section className="card-luxe flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{currentBoard.category}</span>
                {(currentBoard.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Vínculos clicáveis */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(currentBoard.bookIds ?? []).map((bid) => {
                  const bk = books.find((b) => b.id === bid);
                  return bk ? (
                    <Link
                      key={bid}
                      to="/livros/$id"
                      params={{ id: bk.id }}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary hover:underline"
                    >
                      <BookOpen className="h-3 w-3" /> {bk.title}
                    </Link>
                  ) : null;
                })}
                {(currentBoard.characterIds ?? []).map((cid) => {
                  const ch = characters.find((c) => c.id === cid);
                  return ch ? (
                    <Link
                      key={cid}
                      to="/personagens/$id"
                      params={{ id: ch.id }}
                      className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs text-teal hover:underline"
                    >
                      <Users className="h-3 w-3" /> {ch.name}
                    </Link>
                  ) : null;
                })}
                {(currentBoard.coupleIds ?? []).map((cpId) => {
                  const cp = couples.find((x) => x.id === cpId);
                  return cp ? (
                    <Link
                      key={cpId}
                      to="/casais"
                      className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary hover:underline"
                    >
                      <Heart className="h-3 w-3" /> {cp.label}
                    </Link>
                  ) : null;
                })}
                {(currentBoard.worldRecordIds ?? []).map((wid) => {
                  const wr = worldRecords.find((w) => w.id === wid);
                  return wr ? (
                    <Link
                      key={wid}
                      to="/universo"
                      className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold hover:underline"
                    >
                      <Globe2 className="h-3 w-3" /> {wr.name}
                    </Link>
                  ) : null;
                })}
                {(currentBoard.chapterIds ?? []).map((chid) => {
                  const chp = chapters.find((c) => c.id === chid);
                  return chp ? (
                    <Link
                      key={chid}
                      to="/capitulos"
                      search={{ livro: chp.bookId, capitulo: chp.id }}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground hover:underline"
                    >
                      <ScrollText className="h-3 w-3 text-icon-primary" /> Cap. {chp.number}:{" "}
                      {chp.title}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(currentBoard.paletteColors ?? []).length > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
                  <span className="text-[11px] text-muted-foreground">Paleta:</span>
                  {(currentBoard.paletteColors ?? []).map((hex, i) => (
                    <span
                      key={i}
                      title={hex}
                      className="h-4 w-4 rounded-full border border-white/25"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => openEditBoardModal(currentBoard)}
                className="btn-ghost !min-h-9 !px-3.5 text-xs"
              >
                <Edit3 className="h-3.5 w-3.5" /> Editar Moodboard
              </button>
              <button
                type="button"
                onClick={() =>
                  openCreateItemModal({
                    category: currentBoard.category,
                    moodboardId: currentBoard.id,
                  })
                }
                data-testid="btn-add-pin-to-current-board"
                className="btn !min-h-9 !px-4 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Imagem ao Mural
              </button>
            </div>
          </section>

          {/* Grade Pinterest do Moodboard */}
          {filteredItems.length === 0 ? (
            <div className="card-luxe p-10 text-center">
              <Images className="mx-auto h-10 w-10 text-icon-primary opacity-80" />
              <h3 className="mt-3 text-2xl">Nenhuma imagem neste moodboard ainda</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Envie imagens do seu dispositivo ou adicione links de referência com legendas,
                paleta de cores e tags.
              </p>
              <button
                type="button"
                onClick={() =>
                  openCreateItemModal({
                    category: currentBoard.category,
                    moodboardId: currentBoard.id,
                  })
                }
                className="btn mt-5"
              >
                <Plus className="h-4 w-4" /> Adicionar primeira imagem
              </button>
            </div>
          ) : (
            <div
              className={
                wallLayout === "pinterest"
                  ? "columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
                  : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {filteredItems.map((item, idx) =>
                renderPinterestPinCard(item, idx, filteredItems.length),
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISÃO 3: GALERIA DE UMA CATEGORIA ESPECÍFICA                          */}
      {/* ===================================================================== */}
      {activeView === "category" && selectedCategoryGallery && (
        <div className="space-y-8" data-testid="category-gallery-view">
          {/* Moodboards pertencentes a esta categoria */}
          {moodboards.filter((m) => m.category === selectedCategoryGallery).length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl">Moodboards em {selectedCategoryGallery}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {moodboards
                  .filter((m) => m.category === selectedCategoryGallery)
                  .map((mb) => renderMoodboardCard(mb))}
              </div>
            </section>
          )}

          {/* Mural Pinterest da Categoria */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Mural de Imagens — {selectedCategoryGallery}</h2>
              <button
                type="button"
                onClick={() => openCreateItemModal({ category: selectedCategoryGallery })}
                data-testid="btn-add-pin-to-category"
                className="btn !min-h-9 !px-4 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar em {selectedCategoryGallery}
              </button>
            </div>

            {filteredItems.length === 0 ? (
              <div className="card-luxe p-10 text-center">
                <Images className="mx-auto h-10 w-10 text-icon-primary opacity-80" />
                <h3 className="mt-3 text-2xl">Galeria {selectedCategoryGallery} vazia</h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                  Adicione imagens de inspiração para {selectedCategoryGallery.toLowerCase()} e
                  organize sua estética visual.
                </p>
                <button
                  type="button"
                  onClick={() => openCreateItemModal({ category: selectedCategoryGallery })}
                  className="btn mt-5"
                >
                  <Plus className="h-4 w-4" /> Adicionar imagem em {selectedCategoryGallery}
                </button>
              </div>
            ) : (
              <div
                className={
                  wallLayout === "pinterest"
                    ? "columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
                    : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }
              >
                {filteredItems.map((item, idx) =>
                  renderPinterestPinCard(item, idx, filteredItems.length),
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CRIAR / EDITAR MOODBOARD                                       */}
      {/* ===================================================================== */}
      {boardModalOpen && boardDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setBoardModalOpen(false)}
          data-testid="modal-moodboard-form"
        >
          <div
            className="card-luxe max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-2xl">
                  {moodboards.some((x) => x.id === boardDraft.id)
                    ? "Editar Moodboard"
                    : "Novo Moodboard"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure a identidade, categoria, paleta e conexões narrativas do mural.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBoardModalOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {boardError && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  {boardError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="mb-name">Nome do Moodboard *</label>
                  <input
                    id="mb-name"
                    value={boardDraft.name}
                    onChange={(e) => setBoardDraft({ ...boardDraft, name: e.target.value })}
                    placeholder="Ex: Estética de Chama, Figurinos da Corte Solar…"
                    data-testid="input-moodboard-name"
                  />
                </div>

                <div>
                  <label htmlFor="mb-category">Categoria Principal</label>
                  <select
                    id="mb-category"
                    value={boardDraft.category}
                    onChange={(e) => setBoardDraft({ ...boardDraft, category: e.target.value })}
                    data-testid="select-moodboard-category"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {boardDraft.category === "Personalizada" && (
                <div>
                  <label htmlFor="mb-custom-cat">Nome da Categoria Personalizada *</label>
                  <input
                    id="mb-custom-cat"
                    value={boardDraft.customCategoryName ?? ""}
                    onChange={(e) =>
                      setBoardDraft({ ...boardDraft, customCategoryName: e.target.value })
                    }
                    placeholder="Ex: Arquitetura Élfica, Armaduras Astrais, Poções…"
                    data-testid="input-moodboard-custom-category"
                  />
                </div>
              )}

              <div>
                <label htmlFor="mb-desc">Descrição e Conceito Estético</label>
                <textarea
                  id="mb-desc"
                  rows={2}
                  value={boardDraft.description}
                  onChange={(e) => setBoardDraft({ ...boardDraft, description: e.target.value })}
                  placeholder="Descreva a atmosfera, referências de iluminação, texturas e sensações deste moodboard…"
                  data-testid="input-moodboard-description"
                />
              </div>

              {/* Capa e Modo de Visualização Padrão */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label>Imagem de Capa (Opcional)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="btn-ghost cursor-pointer !min-h-10 !px-3.5 text-xs">
                      <Upload className="h-3.5 w-3.5 text-icon-primary" /> Enviar capa
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] && void handleUploadBoardCover(e.target.files[0])
                        }
                      />
                    </label>
                    <input
                      value={
                        boardDraft.coverImageUrl && !boardDraft.coverImageUrl.startsWith("idb://")
                          ? boardDraft.coverImageUrl
                          : ""
                      }
                      onChange={(e) =>
                        setBoardDraft({
                          ...boardDraft,
                          coverImageUrl: e.target.value || undefined,
                        })
                      }
                      placeholder="Ou cole a URL da capa…"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mb-layout">Layout Padrão do Mural</label>
                  <select
                    id="mb-layout"
                    value={boardDraft.layoutMode}
                    onChange={(e) =>
                      setBoardDraft({
                        ...boardDraft,
                        layoutMode: e.target.value as "pinterest" | "grid",
                      })
                    }
                  >
                    <option value="pinterest">Mural Dinâmico Estilo Pinterest</option>
                    <option value="grid">Grade Uniforme</option>
                  </select>
                </div>
              </div>

              {/* Paleta de Cores do Moodboard */}
              <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
                <label>Paleta de Cores Associada</label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="color"
                    aria-label="Escolher cor para a paleta do moodboard"
                    value={boardColorInput}
                    onChange={(e) => setBoardColorInput(e.target.value)}
                    className="!h-9 !w-12 cursor-pointer !p-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!(boardDraft.paletteColors ?? []).includes(boardColorInput)) {
                        setBoardDraft({
                          ...boardDraft,
                          paletteColors: [...(boardDraft.paletteColors ?? []), boardColorInput],
                        });
                      }
                    }}
                    data-testid="btn-add-board-color"
                    className="btn-ghost !min-h-9 !px-3 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar cor
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5 pl-2">
                    {(boardDraft.paletteColors ?? []).map((hex) => (
                      <span
                        key={hex}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[11px]"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                        {hex}
                        <button
                          type="button"
                          onClick={() =>
                            setBoardDraft({
                              ...boardDraft,
                              paletteColors: boardDraft.paletteColors.filter((c) => c !== hex),
                            })
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags / Etiquetas */}
              <div>
                <label>Tags e Palavras-chave</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={boardTagInput}
                    onChange={(e) => setBoardTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const clean = boardTagInput.trim().replace(/^#/, "");
                        if (clean && !(boardDraft.tags ?? []).includes(clean)) {
                          setBoardDraft({
                            ...boardDraft,
                            tags: [...(boardDraft.tags ?? []), clean],
                          });
                        }
                        setBoardTagInput("");
                      }
                    }}
                    placeholder="Digite uma tag (ex: realeza, noturno, dourado) e pressione Enter…"
                    data-testid="input-board-tag"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const clean = boardTagInput.trim().replace(/^#/, "");
                      if (clean && !(boardDraft.tags ?? []).includes(clean)) {
                        setBoardDraft({ ...boardDraft, tags: [...(boardDraft.tags ?? []), clean] });
                      }
                      setBoardTagInput("");
                    }}
                    data-testid="btn-add-board-tag"
                    className="btn-ghost shrink-0 text-xs"
                  >
                    <Tag className="h-3.5 w-3.5" /> Adicionar Tag
                  </button>
                </div>
                {(boardDraft.tags ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(boardDraft.tags ?? []).map((t) => (
                      <span key={t} className="chip">
                        #{t}
                        <button
                          type="button"
                          onClick={() =>
                            setBoardDraft({
                              ...boardDraft,
                              tags: boardDraft.tags.filter((x) => x !== t),
                            })
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* CONEXÕES COM O APLICATIVO: LIVROS, PERSONAGENS, CASAIS, MUNDOS, CAPÍTULOS */}
              <div className="space-y-4 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <h3 className="flex items-center gap-2 font-display text-lg">
                  <Link2 className="h-4 w-4 text-icon-primary" /> Conexões com a Saga
                </h3>

                {/* Livros */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Livros:</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {books.map((b) => {
                      const active = (boardDraft.bookIds ?? []).includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() =>
                            setBoardDraft({
                              ...boardDraft,
                              bookIds: toggleArrayId(boardDraft.bookIds ?? [], b.id),
                            })
                          }
                          data-testid={`toggle-board-book-${b.id}`}
                          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          📖 {b.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Personagens */}
                {characters.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Personagens:</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {characters.map((c) => {
                        const active = (boardDraft.characterIds ?? []).includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              setBoardDraft({
                                ...boardDraft,
                                characterIds: toggleArrayId(boardDraft.characterIds ?? [], c.id),
                              })
                            }
                            data-testid={`toggle-board-char-${c.id}`}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            👤 {c.name || "Sem nome"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Casais */}
                {couples.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Casais:</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {couples.map((cp) => {
                        const active = (boardDraft.coupleIds ?? []).includes(cp.id);
                        return (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() =>
                              setBoardDraft({
                                ...boardDraft,
                                coupleIds: toggleArrayId(boardDraft.coupleIds ?? [], cp.id),
                              })
                            }
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            ♥ {cp.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Países, Reinos ou Mundos da Enciclopédia */}
                {worldRecords.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Países, Reinos e Mundos (Enciclopédia):
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {worldRecords.map((w) => {
                        const active = (boardDraft.worldRecordIds ?? []).includes(w.id);
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() =>
                              setBoardDraft({
                                ...boardDraft,
                                worldRecordIds: toggleArrayId(
                                  boardDraft.worldRecordIds ?? [],
                                  w.id,
                                ),
                              })
                            }
                            data-testid={`toggle-board-world-${w.id}`}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            🌍 {w.name || "Sem nome"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Capítulos */}
                {chapters.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Capítulos:</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {chapters.map((ch) => {
                        const active = (boardDraft.chapterIds ?? []).includes(ch.id);
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() =>
                              setBoardDraft({
                                ...boardDraft,
                                chapterIds: toggleArrayId(boardDraft.chapterIds ?? [], ch.id),
                              })
                            }
                            data-testid={`toggle-board-chapter-${ch.id}`}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            📜 Cap. {ch.number}: {ch.title || "Sem título"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => setBoardModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBoard}
                  data-testid="btn-save-moodboard"
                  className="btn"
                >
                  <Check className="h-4 w-4" /> Salvar Moodboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADICIONAR / EDITAR REFERÊNCIA VISUAL (PIN)                     */}
      {/* ===================================================================== */}
      {itemModalOpen && itemDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setItemModalOpen(false)}
          data-testid="modal-pin-form"
        >
          <div
            className="card-luxe max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-2xl">
                  {moodboardItems.some((x) => x.id === itemDraft.id)
                    ? "Editar Referência Visual"
                    : "Adicionar Imagem / Referência"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Envie uma imagem do dispositivo ou adicione via URL, com legenda, categoria, tags
                  e vínculos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setItemModalOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {itemError && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  {itemError}
                </div>
              )}

              {/* Fonte da Imagem: Upload ou Link */}
              <div className="space-y-3 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setItemInputMode("upload")}
                    className={`btn-ghost !min-h-8 !px-3 text-xs ${
                      itemInputMode === "upload" ? "!border-primary !bg-primary/15" : ""
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" /> Enviar do dispositivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemInputMode("url")}
                    data-testid="btn-mode-url"
                    className={`btn-ghost !min-h-8 !px-3 text-xs ${
                      itemInputMode === "url" ? "!border-primary !bg-primary/15" : ""
                    }`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Usar link de imagem (URL)
                  </button>
                </div>

                {itemInputMode === "upload" ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 p-5 text-center">
                    <label className="btn cursor-pointer text-xs">
                      <Upload className="h-4 w-4" />{" "}
                      {uploadingImage ? "Processando imagem…" : "Selecionar arquivo de imagem"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        data-testid="input-upload-pin-file"
                        onChange={(e) =>
                          e.target.files?.[0] && void handleUploadItemImage(e.target.files[0])
                        }
                      />
                    </label>
                    <span className="mt-2 text-[11px] text-muted-foreground">
                      Suporta PNG, JPG, WebP ou GIF. Armazenamento otimizado neste navegador.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="pin-image-url">Endereço da Imagem (URL) *</label>
                    <input
                      id="pin-image-url"
                      value={itemDraft.imageUrl.startsWith("idb://") ? "" : itemDraft.imageUrl}
                      onChange={(e) => setItemDraft({ ...itemDraft, imageUrl: e.target.value })}
                      placeholder="https://exemplo.com/inspiracao.jpg"
                      data-testid="input-pin-image-url"
                    />
                  </div>
                )}

                {itemDraft.imageUrl && (
                  <div className="mt-3 flex items-center gap-4 rounded-xl border bg-background/60 p-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
                      <MediaImage
                        src={itemDraft.imageUrl}
                        alt="Prévia"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-medium text-foreground">Imagem carregada pronta</p>
                      <p className="truncate text-muted-foreground">{itemDraft.imageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label htmlFor="pin-title">Título da Referência</label>
                  <input
                    id="pin-title"
                    value={itemDraft.title}
                    onChange={(e) => setItemDraft({ ...itemDraft, title: e.target.value })}
                    placeholder="Ex: Vestido de Gala Solar…"
                    data-testid="input-pin-title"
                  />
                </div>

                <div>
                  <label htmlFor="pin-category">Categoria da Galeria</label>
                  <select
                    id="pin-category"
                    value={itemDraft.category}
                    onChange={(e) => setItemDraft({ ...itemDraft, category: e.target.value })}
                    data-testid="select-pin-category"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pin-aspect">Proporção no Mural</label>
                  <select
                    id="pin-aspect"
                    value={itemDraft.aspectRatio}
                    onChange={(e) =>
                      setItemDraft({
                        ...itemDraft,
                        aspectRatio: e.target.value as MoodboardAspectRatio,
                      })
                    }
                  >
                    {ASPECT_LABELS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {itemDraft.category === "Personalizada" && (
                <div>
                  <label htmlFor="pin-custom-cat">Nome da Categoria Personalizada *</label>
                  <input
                    id="pin-custom-cat"
                    value={itemDraft.customCategoryName ?? ""}
                    onChange={(e) =>
                      setItemDraft({ ...itemDraft, customCategoryName: e.target.value })
                    }
                    placeholder="Digite o nome da sua categoria personalizada…"
                    data-testid="input-pin-custom-category"
                  />
                </div>
              )}

              <div>
                <label htmlFor="pin-caption">Legenda, Anotações e Detalhes Estéticos</label>
                <textarea
                  id="pin-caption"
                  rows={2}
                  value={itemDraft.caption}
                  onChange={(e) => setItemDraft({ ...itemDraft, caption: e.target.value })}
                  placeholder="Por que esta referência inspira a história? Quais detalhes de luz, roupa ou emoção observar?"
                  data-testid="input-pin-caption"
                />
              </div>

              {/* Associar a um ou mais Moodboards */}
              {moodboards.length > 0 && (
                <div>
                  <label>Incluir nos Moodboards:</label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {moodboards.map((mb) => {
                      const active = (itemDraft.moodboardIds ?? []).includes(mb.id);
                      return (
                        <button
                          key={mb.id}
                          type="button"
                          onClick={() =>
                            setItemDraft({
                              ...itemDraft,
                              moodboardIds: toggleArrayId(itemDraft.moodboardIds ?? [], mb.id),
                            })
                          }
                          data-testid={`toggle-pin-board-${mb.id}`}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {mb.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Paleta e Tags da Imagem */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-secondary/20 p-3.5">
                  <label>Paleta de Cores da Imagem</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={itemColorInput}
                      onChange={(e) => setItemColorInput(e.target.value)}
                      className="!h-9 !w-12 !p-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!(itemDraft.paletteColors ?? []).includes(itemColorInput)) {
                          setItemDraft({
                            ...itemDraft,
                            paletteColors: [...(itemDraft.paletteColors ?? []), itemColorInput],
                          });
                        }
                      }}
                      data-testid="btn-add-pin-color"
                      className="btn-ghost !min-h-8 !px-3 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Cor
                    </button>
                  </div>
                  {(itemDraft.paletteColors ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(itemDraft.paletteColors ?? []).map((hex) => (
                        <span
                          key={hex}
                          className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[10px]"
                        >
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: hex }} />
                          {hex}
                          <button
                            type="button"
                            onClick={() =>
                              setItemDraft({
                                ...itemDraft,
                                paletteColors: itemDraft.paletteColors.filter((c) => c !== hex),
                              })
                            }
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border/70 bg-secondary/20 p-3.5">
                  <label>Tags da Imagem</label>
                  <div className="mt-1.5 flex gap-1.5">
                    <input
                      value={itemTagInput}
                      onChange={(e) => setItemTagInput(e.target.value)}
                      placeholder="Ex: coroa, luar, vestido…"
                      data-testid="input-pin-tag"
                      className="!min-h-9 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const clean = itemTagInput.trim().replace(/^#/, "");
                        if (clean && !(itemDraft.tags ?? []).includes(clean)) {
                          setItemDraft({ ...itemDraft, tags: [...(itemDraft.tags ?? []), clean] });
                        }
                        setItemTagInput("");
                      }}
                      data-testid="btn-add-pin-tag"
                      className="btn-ghost !min-h-9 !px-3 text-xs"
                    >
                      ＋ Tag
                    </button>
                  </div>
                  {(itemDraft.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(itemDraft.tags ?? []).map((t) => (
                        <span key={t} className="chip !text-[10px]">
                          #{t}
                          <button
                            type="button"
                            onClick={() =>
                              setItemDraft({
                                ...itemDraft,
                                tags: itemDraft.tags.filter((x) => x !== t),
                              })
                            }
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Vínculos Narrativos da Imagem */}
              <div className="space-y-3 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <h3 className="text-sm font-semibold">Vínculos com a História</h3>
                <div className="flex flex-wrap gap-1.5">
                  {books.map((b) => {
                    const active = (itemDraft.bookIds ?? []).includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setItemDraft({
                            ...itemDraft,
                            bookIds: toggleArrayId(itemDraft.bookIds ?? [], b.id),
                          })
                        }
                        data-testid={`toggle-pin-book-${b.id}`}
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/70 text-muted-foreground"
                        }`}
                      >
                        📖 {b.title}
                      </button>
                    );
                  })}
                  {characters.map((c) => {
                    const active = (itemDraft.characterIds ?? []).includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setItemDraft({
                            ...itemDraft,
                            characterIds: toggleArrayId(itemDraft.characterIds ?? [], c.id),
                          })
                        }
                        data-testid={`toggle-pin-char-${c.id}`}
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/70 text-muted-foreground"
                        }`}
                      >
                        👤 {c.name || "Sem nome"}
                      </button>
                    );
                  })}
                  {worldRecords.map((w) => {
                    const active = (itemDraft.worldRecordIds ?? []).includes(w.id);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() =>
                          setItemDraft({
                            ...itemDraft,
                            worldRecordIds: toggleArrayId(itemDraft.worldRecordIds ?? [], w.id),
                          })
                        }
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/70 text-muted-foreground"
                        }`}
                      >
                        🌍 {w.name || "Sem nome"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                <button type="button" onClick={() => setItemModalOpen(false)} className="btn-ghost">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  data-testid="btn-save-pin"
                  className="btn"
                >
                  <Check className="h-4 w-4" /> Salvar Referência
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: NOVA CATEGORIA PERSONALIZADA                                   */}
      {/* ===================================================================== */}
      {customCatModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setCustomCatModalOpen(false)}
          data-testid="modal-custom-category"
        >
          <div
            className="card-luxe w-full max-w-md space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl">Criar Categoria Personalizada</h3>
            <p className="text-xs text-muted-foreground">
              Crie uma galeria própria para organizar referências específicas do seu universo.
            </p>
            <div>
              <label htmlFor="new-custom-cat-name">Nome da categoria *</label>
              <input
                id="new-custom-cat-name"
                value={newCustomCatInput}
                onChange={(e) => setNewCustomCatInput(e.target.value)}
                placeholder="Ex: Criaturas Abissais, Caligrafia Real, Gastronomia…"
                data-testid="input-new-custom-category"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomCatModalOpen(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const clean = newCustomCatInput.trim();
                  if (!clean) return;
                  actions.addCustomMoodboardCategory(clean);
                  setCustomCatModalOpen(false);
                  setSelectedCategoryGallery(clean);
                  setActiveView("category");
                  showToast(`Categoria "${clean}" criada!`);
                }}
                data-testid="btn-confirm-custom-category"
                className="btn"
              >
                <Check className="h-4 w-4" /> Criar Galeria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* LIGHTBOX: VISUALIZAÇÃO AMPLIADA DA IMAGEM (ESTILO PINTEREST)          */}
      {/* ===================================================================== */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setLightboxItemId(null)}
          data-testid="pin-lightbox-modal"
        >
          <div
            className="card-luxe grid max-h-[92vh] w-full max-w-5xl overflow-hidden md:grid-cols-[1.35fr_1fr]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagem Ampliada + Navegação Anterior/Próxima */}
            <div className="relative flex min-h-[280px] items-center justify-center bg-black/60 p-4">
              <MediaImage
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain"
              />

              {lightboxIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxItemId(filteredItems[lightboxIndex - 1]!.id)}
                  aria-label="Imagem anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/85 p-2 backdrop-blur hover:bg-background"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {lightboxIndex >= 0 && lightboxIndex < filteredItems.length - 1 && (
                <button
                  type="button"
                  onClick={() => setLightboxItemId(filteredItems[lightboxIndex + 1]!.id)}
                  aria-label="Próxima imagem"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/85 p-2 backdrop-blur hover:bg-background"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Painel Lateral de Informações da Referência */}
            <div className="flex flex-col justify-between overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="chip">{lightboxItem.category}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => actions.toggleFavoriteMoodboardItem(lightboxItem.id)}
                      className="rounded-full p-1.5 hover:bg-secondary"
                      aria-label="Favoritar"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          lightboxItem.isFavorite ? "fill-gold text-gold" : "text-icon-muted"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxItemId(null);
                        openEditItemModal(lightboxItem);
                      }}
                      className="rounded-full p-1.5 hover:bg-secondary"
                      aria-label="Editar referência"
                    >
                      <Edit3 className="h-4 w-4 text-icon-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightboxItemId(null)}
                      className="rounded-full p-1.5 hover:bg-secondary"
                      aria-label="Fechar visualização ampliada"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-2xl">{lightboxItem.title}</h3>

                {lightboxItem.caption && (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {lightboxItem.caption}
                  </p>
                )}

                {(lightboxItem.paletteColors ?? []).length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Paleta de Cores
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(lightboxItem.paletteColors ?? []).map((hex) => (
                        <span
                          key={hex}
                          className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/50 px-2.5 py-1 text-xs"
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/25"
                            style={{ backgroundColor: hex }}
                          />
                          {hex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(lightboxItem.tags ?? []).length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tags
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(lightboxItem.tags ?? []).map((t) => (
                        <span key={t} className="chip !text-xs">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vínculos clicáveis */}
                <div className="space-y-2 border-t border-border/60 pt-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Elementos Vinculados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(lightboxItem.bookIds ?? []).map((bid) => {
                      const bk = books.find((b) => b.id === bid);
                      return bk ? (
                        <Link
                          key={bid}
                          to="/livros/$id"
                          params={{ id: bk.id }}
                          className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary hover:underline"
                        >
                          📖 {bk.title}
                        </Link>
                      ) : null;
                    })}
                    {(lightboxItem.characterIds ?? []).map((cid) => {
                      const ch = characters.find((c) => c.id === cid);
                      return ch ? (
                        <Link
                          key={cid}
                          to="/personagens/$id"
                          params={{ id: ch.id }}
                          className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs text-teal hover:underline"
                        >
                          👤 {ch.name}
                        </Link>
                      ) : null;
                    })}
                    {(lightboxItem.worldRecordIds ?? []).map((wid) => {
                      const wr = worldRecords.find((w) => w.id === wid);
                      return wr ? (
                        <Link
                          key={wid}
                          to="/universo"
                          className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold hover:underline"
                        >
                          🌍 {wr.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteItemTarget(lightboxItem);
                    setLightboxItemId(null);
                  }}
                  className="btn-ghost !min-h-9 !px-3 text-xs text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxItemId(null)}
                  className="btn !min-h-9 !px-4 text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAIS DE CONFIRMAÇÃO DE EXCLUSÃO (SEM APAGAR ACIDENTALMENTE)         */}
      {/* ===================================================================== */}
      {deleteBoardTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          data-testid="modal-confirm-delete-board"
        >
          <div className="card-luxe w-full max-w-md space-y-4 p-6">
            <h3 className="text-2xl text-destructive">Excluir Moodboard?</h3>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o moodboard{" "}
              <strong className="text-foreground">“{deleteBoardTarget.name}”</strong>? As imagens
              cadastradas nas galerias continuarão salvas a menos que você as remova
              individualmente.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteBoardTarget(null)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = deleteBoardTarget.id;
                  actions.deleteMoodboard(id, false);
                  if (selectedBoardId === id) {
                    setSelectedBoardId(null);
                    setActiveView("home");
                  }
                  setDeleteBoardTarget(null);
                  showToast("Moodboard excluído.");
                }}
                data-testid="btn-confirm-delete-board"
                className="btn !bg-destructive"
              >
                <Trash2 className="h-4 w-4" /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItemTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          data-testid="modal-confirm-delete-pin"
        >
          <div className="card-luxe w-full max-w-md space-y-4 p-6">
            <h3 className="text-2xl text-destructive">Remover Imagem de Referência?</h3>
            <p className="text-sm text-muted-foreground">
              Deseja excluir permanentemente a referência{" "}
              <strong className="text-foreground">
                “{deleteItemTarget.title || "Referência visual"}”
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteItemTarget(null)} className="btn-ghost">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.deleteMoodboardItem(deleteItemTarget.id);
                  setDeleteItemTarget(null);
                  showToast("Referência excluída.");
                }}
                data-testid="btn-confirm-delete-pin"
                className="btn !bg-destructive"
              >
                <Trash2 className="h-4 w-4" /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Lightbulb,
  Plus,
  Search,
  Filter,
  Heart,
  Edit3,
  Trash2,
  Copy,
  Sparkles,
  BookOpen,
  Users,
  X,
  Check,
  ArrowUpDown,
  Tag,
  Grid3X3,
  List,
  Columns,
  Download,
  Eye,
  HelpCircle,
  MessageSquare,
  Flame,
  Clock,
  Compass,
  FileText,
  Palette,
  Shuffle,
  Share2,
} from "lucide-react";
import {
  useStore,
  actions,
  IDEA_DEFAULT_CATEGORIES,
  type IdeaItem,
  type IdeaStatus,
  type Book,
  type Character,
  type Chapter,
} from "@/lib/store";

export const Route = createFileRoute("/laboratorio-de-ideias")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    categoria?: string;
    status?: string;
    livro?: string;
    busca?: string;
    favoritas?: boolean;
    ideiaId?: string;
  } => {
    return {
      ...(typeof search?.categoria === "string" ? { categoria: search.categoria } : {}),
      ...(typeof search?.status === "string" ? { status: search.status } : {}),
      ...(typeof search?.livro === "string" ? { livro: search.livro } : {}),
      ...(typeof search?.busca === "string" ? { busca: search.busca } : {}),
      ...(typeof search?.favoritas === "boolean" ? { favoritas: search.favoritas } : {}),
      ...(typeof search?.ideiaId === "string" ? { ideiaId: search.ideiaId } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Laboratório de Ideias — Spectral Archive Studio" },
      {
        name: "description",
        content:
          "Toda grande história começa com uma possibilidade. Espaço criativo para registrar, desenvolver e conectar ideias narrativas.",
      },
      { property: "og:title", content: "Laboratório de Ideias — Spectral Archive Studio" },
      {
        property: "og:description",
        content:
          "Experimentação criativa, centelhas de enredo, personagens, worldbuilding e conexões narrativas.",
      },
    ],
  }),
  component: LaboratorioDeIdeiasRoute,
});

// Configuração visual de cada status
export const STATUS_CONFIG: Record<
  IdeaStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    icon: typeof Lightbulb;
    borderClass: string;
    bgClass: string;
  }
> = {
  centelha: {
    label: "Centelha Inicial",
    description: "Ideia crua, relâmpago criativo recém-nascido",
    badgeClass: "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/5",
    icon: Flame,
  },
  desenvolvimento: {
    label: "Em Desenvolvimento",
    description: "Pesquisando, testando desdobramentos e conexões",
    badgeClass: "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30",
    borderClass: "border-blue-500/30",
    bgClass: "bg-blue-500/5",
    icon: Compass,
  },
  amadurecida: {
    label: "Amadurecida",
    description: "Pronta e estruturada para entrar em manuscrito",
    badgeClass: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/5",
    icon: Sparkles,
  },
  integrada: {
    label: "Integrada ao Livro",
    description: "Já aplicada e tecida na história",
    badgeClass: "bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/30",
    borderClass: "border-purple-500/30",
    bgClass: "bg-purple-500/5",
    icon: Check,
  },
  arquivada: {
    label: "Em Pausa / Arquivada",
    description: "Guardada no arquivo para projetos futuros",
    badgeClass: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400 border-zinc-500/30",
    borderClass: "border-zinc-500/30",
    bgClass: "bg-zinc-500/5",
    icon: Clock,
  },
};

// Paleta de cores para destaque visual das ideias
const ACCENT_COLORS = [
  "#e8475f", // Rosa Rubi
  "#2d8a9e", // Turquesa Maré
  "#f2d27a", // Ouro Luz
  "#6b5ca5", // Ametista Lua
  "#e86fa6", // Pétala Vida
  "#a8703f", // Âmbar Terra
  "#1a6f8f", // Índigo Oceano
  "#e01e8c", // Neon Fúcsia
  "#a01652", // Carmim Destino
  "#f08ca0", // Aurora Suave
  "#4ade80", // Esmeralda
  "#38bdf8", // Céu Estelar
];

// Gerador de Centelhas Criativas (prompts prontos para destravar o autor)
const CREATIVE_SPARKS = [
  {
    title: "A Promessa Quebrada na Torre de Vidro",
    category: "Reviravoltas",
    whatIf:
      "E se a pessoa que mais jurou proteger o protagonista for a única que sabe como destruí-lo?",
    description:
      "Um juramento solene feito na juventude tinha uma cláusula oculta que só se manifesta na décima lua cheia após a coroação.",
    keyConflict: "Dever moral vs. lealdade de sangue.",
    sampleDialogue:
      "— Eu não quebrei nosso juramento. Ele foi quebrado no instante em que nos fizeram acreditar que tínhamos escolha.",
    tags: ["Promessa", "Traição", "Torre de Vidro"],
  },
  {
    title: "O Mercado dos Nomes Esquecidos",
    category: "Worldbuilding",
    whatIf: "E se você pudesse vender sua pior memória em troca de três dias de sorte absoluta?",
    description:
      "Em um beco subterrâneo da capital, mercadores compram remorsos e os destilam em poções para nobres desprovidos de sentimentos.",
    keyConflict:
      "Ao perder a dor, o personagem também perde a motivação para lutar pela pessoa amada.",
    sampleDialogue:
      "— O preço não é ouro. O preço é o primeiro momento em que você sentiu saudades.",
    tags: ["Mercado Negro", "Memória", "Magia Emocional"],
  },
  {
    title: "O Duelo dos Sussurros Silenciosos",
    category: "Cenas",
    whatIf:
      "E se um combate mortal precisasse acontecer no meio de um baile real sem que os convidados percebessem um único golpe?",
    description:
      "Dois rivais com lâminas encantadas trocam ataques microscópicos enquanto dançam uma valsa solene em volta dos regentes.",
    keyConflict: "Precisão mortal sob o olhar severo da corte.",
    sampleDialogue:
      "— Um passo em falso, capitão, e o sangue no seu colarinho não poderá ser disfarçado pelo vinho.",
    tags: ["Baile", "Combate Furtivo", "Tensão"],
  },
  {
    title: "O Papiro Que Escreve o Futuro ao Contrário",
    category: "Mistérios e segredos",
    whatIf:
      "E se um artefato mostrasse o dia da morte do herói, mas cada capítulo anterior estivesse apagado até que ele cometesse um erro imperdoável?",
    description:
      "Um livro encadernado em couro estelar cuja tinta só preenche as páginas à medida que o destino é distorcido por atos covardes.",
    keyConflict: "Agir heroicamente e acelerar o fim, ou hesitar e perder todos que ama.",
    sampleDialogue:
      "— As páginas em branco não são silêncio. São avisos de que você ainda tem tempo de falhar.",
    tags: ["Profecia Inversa", "Artefato", "Destino"],
  },
  {
    title: "O Refúgio na Ilha das Sombras Amigas",
    category: "Casais e relacionamentos",
    whatIf:
      "E se duas pessoas destinadas a se destruírem em lados opostos de uma guerra fossem as únicas sobreviventes de um naufrágio misterioso?",
    description:
      "Isolados em uma praia de areia fosforescente, eles precisam cooperar para acender a fogueira antes que as criaturas da noite acordem.",
    keyConflict:
      "Inimigos por juramento, aliados pela sobrevivência e cúmplices pela atração inevitável.",
    sampleDialogue:
      "— Quando o resgate chegar, voltaremos a ser monstros um para o outro. Mas até o amanhecer, me empreste suas mãos.",
    tags: ["Inimigos para Amantes", "Sobrevivência", "Isolamento"],
  },
];

export function LaboratorioDeIdeiasRoute() {
  const searchParams = Route.useSearch();

  const ideas = useStore((s) => s.ideas ?? []);
  const customCategories = useStore((s) => s.ideaCustomCategories ?? []);
  const books = useStore((s) => s.books ?? []);
  const characters = useStore((s) => s.characters ?? []);
  const chapters = useStore((s) => s.chapters ?? []);

  // Estados locais da interface
  const [searchQuery, setSearchQuery] = useState(searchParams.busca || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.categoria || "todas",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.status || "todos");
  const [selectedBook, setSelectedBook] = useState<string>(searchParams.livro || "todos");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(Boolean(searchParams.favoritas));
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title" | "status">("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("grid");

  // Modais
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<IdeaItem | null>(null);
  const [readingIdea, setReadingIdea] = useState<IdeaItem | null>(null);
  const [isSparkDrawerOpen, setIsSparkDrawerOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<
    "todas" | "recentes" | "favoritas" | "desenvolvimento"
  >("todas");

  // Categorias combinadas
  const allCategories = useMemo(() => {
    const list = [...IDEA_DEFAULT_CATEGORIES, ...customCategories];
    return Array.from(new Set(list));
  }, [customCategories]);

  // Contadores gerais
  const stats = useMemo(() => {
    const total = ideas.length;
    const favorites = ideas.filter((i) => i.isFavorite).length;
    const centelhas = ideas.filter((i) => i.status === "centelha").length;
    const emDesenvolvimento = ideas.filter((i) => i.status === "desenvolvimento").length;
    const amadurecidas = ideas.filter((i) => i.status === "amadurecida").length;
    const integradas = ideas.filter((i) => i.status === "integrada").length;
    return { total, favorites, centelhas, emDesenvolvimento, amadurecidas, integradas };
  }, [ideas]);

  // Filtragem e ordenação
  const filteredIdeas = useMemo(() => {
    return ideas
      .filter((item) => {
        // Tab rápida
        if (activeTabSection === "favoritas" && !item.isFavorite) return false;
        if (activeTabSection === "desenvolvimento" && item.status !== "desenvolvimento")
          return false;

        // Filtro de favoritas
        if (onlyFavorites && !item.isFavorite) return false;

        // Filtro de categoria
        if (selectedCategory !== "todas" && item.category !== selectedCategory) return false;

        // Filtro de status
        if (selectedStatus !== "todos" && item.status !== selectedStatus) return false;

        // Filtro de livro
        if (selectedBook !== "todos" && item.bookId !== selectedBook) return false;

        // Busca textual
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchContent = item.content?.toLowerCase().includes(q);
          const matchWhatIf = item.whatIf?.toLowerCase().includes(q);
          const matchKeyConflict = item.keyConflict?.toLowerCase().includes(q);
          const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
          const matchCat = item.category.toLowerCase().includes(q);
          if (
            !matchTitle &&
            !matchDesc &&
            !matchContent &&
            !matchWhatIf &&
            !matchKeyConflict &&
            !matchTags &&
            !matchCat
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "updated") {
          diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        } else if (sortBy === "created") {
          diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "title") {
          diff = a.title.localeCompare(b.title, "pt-BR");
        } else if (sortBy === "status") {
          diff = a.status.localeCompare(b.status);
        }
        return sortOrder === "asc" ? -diff : diff;
      });
  }, [
    ideas,
    activeTabSection,
    onlyFavorites,
    selectedCategory,
    selectedStatus,
    selectedBook,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  // Ideias recentes (últimas 3 atualizadas)
  const recentIdeas = useMemo(() => {
    return [...ideas]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [ideas]);

  // Ideias favoritas (topo)
  const favoriteIdeas = useMemo(() => {
    return ideas.filter((i) => i.isFavorite).slice(0, 4);
  }, [ideas]);

  const handleOpenNew = (prefill?: Partial<IdeaItem>) => {
    const newIdea: IdeaItem = {
      id: `idea_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: prefill?.title || "",
      description: prefill?.description || "",
      content: prefill?.content || "",
      category: prefill?.category || "Enredo",
      tags: prefill?.tags || [],
      status: prefill?.status || "centelha",
      isFavorite: prefill?.isFavorite || false,
      accentColor: prefill?.accentColor || "#e8475f",
      bookId: prefill?.bookId || undefined,
      characterIds: prefill?.characterIds || [],
      coupleId: prefill?.coupleId || undefined,
      chapterId: prefill?.chapterId || undefined,
      connectedIdeaIds: prefill?.connectedIdeaIds || [],
      whatIf: prefill?.whatIf || "",
      keyConflict: prefill?.keyConflict || "",
      sampleDialogue: prefill?.sampleDialogue || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingIdea(newIdea);
    setIsEditorOpen(true);
  };

  const handleEdit = (idea: IdeaItem) => {
    setEditingIdea({ ...idea });
    setIsEditorOpen(true);
  };

  const handleDuplicate = (id: string) => {
    actions.duplicateIdea(id);
  };

  const handleDelete = (id: string) => {
    actions.deleteIdea(id);
    if (readingIdea?.id === id) setReadingIdea(null);
    setDeleteConfirmId(null);
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    actions.toggleFavoriteIdea(id);
  };

  const handleQuickStatusChange = (id: string, newStatus: IdeaStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    actions.updateIdeaStatus(id, newStatus);
  };

  const handleApplySpark = (spark: (typeof CREATIVE_SPARKS)[0]) => {
    handleOpenNew({
      title: spark.title,
      category: spark.category,
      whatIf: spark.whatIf,
      description: spark.description,
      keyConflict: spark.keyConflict,
      sampleDialogue: spark.sampleDialogue,
      tags: spark.tags,
      status: "centelha",
      accentColor: "#f2d27a",
    });
    setIsSparkDrawerOpen(false);
  };

  // Exportar ideias para arquivo TXT ou JSON
  const handleExport = (format: "txt" | "json") => {
    const listToExport = filteredIdeas.length > 0 ? filteredIdeas : ideas;
    let fileContent = "";
    let mimeType = "text/plain";
    let fileName = `spectral-laboratorio-ideias-${new Date().toISOString().slice(0, 10)}`;

    if (format === "json") {
      fileContent = JSON.stringify(listToExport, null, 2);
      mimeType = "application/json";
      fileName += ".json";
    } else {
      fileContent = `=======================================================\n`;
      fileContent += `SPECTRAL ARCHIVE STUDIO — LABORATÓRIO DE IDEIAS\n`;
      fileContent += `Data de Exportação: ${new Date().toLocaleDateString("pt-BR")}\n`;
      fileContent += `Total de Ideias: ${listToExport.length}\n`;
      fileContent += `=======================================================\n\n`;

      listToExport.forEach((item, idx) => {
        fileContent += `[${idx + 1}] ${item.title.toUpperCase()}\n`;
        fileContent += `Status: ${STATUS_CONFIG[item.status]?.label || item.status} | Categoria: ${item.category}\n`;
        if (item.tags?.length) fileContent += `Tags: #${item.tags.join(" #")}\n`;
        if (item.whatIf) fileContent += `Gatilho (E se...?): ${item.whatIf}\n`;
        if (item.keyConflict) fileContent += `Conflito Central: ${item.keyConflict}\n`;
        fileContent += `Descrição Inicial:\n${item.description}\n`;
        if (item.content) fileContent += `Anotações & Detalhamento:\n${item.content}\n`;
        if (item.sampleDialogue) fileContent += `Diálogo de Amostra:\n${item.sampleDialogue}\n`;
        fileContent += `Criada em: ${new Date(item.createdAt).toLocaleDateString("pt-BR")}\n`;
        fileContent += `-------------------------------------------------------\n\n`;
      });
      fileName += ".txt";
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* 1. CABEÇALHO PRINCIPAL DO LABORATÓRIO DE IDEIAS */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card/95 to-primary/5 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
                <Lightbulb className="h-5 w-5" />
              </span>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                Espaço de Criação e Exploração Literária
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Laboratório de Ideias
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground italic">
              “Toda grande história começa com uma possibilidade.”
            </p>
          </div>

          {/* Botões de Ação Principais */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSparkDrawerOpen(true)}
              className="btn-ghost flex items-center gap-2 text-xs md:text-sm font-medium border border-border/70 hover:border-primary/50 transition-colors"
              title="Sortear centelhas criativas prontas"
            >
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Centelhas Criativas</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="btn-ghost flex items-center gap-2 text-xs md:text-sm font-medium border border-border/70 hover:border-primary/50 transition-colors"
              title="Exportar ideias para arquivo"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => handleOpenNew()}
              className="btn-primary flex items-center gap-2 text-xs md:text-sm shadow-md hover:shadow-primary/25"
            >
              <Plus className="h-4 w-4" />
              <span>+ Nova ideia</span>
            </button>
          </div>
        </div>

        {/* Indicadores / Métricas do Laboratório */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-border/40 pt-5">
          <div className="rounded-lg bg-card/80 p-3 border border-border/40">
            <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <p className="font-display text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-lg bg-amber-500/5 p-3 border border-amber-500/20">
            <span className="text-[0.7rem] uppercase tracking-wider text-amber-500 font-medium">
              Centelhas
            </span>
            <p className="font-display text-2xl font-bold text-amber-500">{stats.centelhas}</p>
          </div>
          <div className="rounded-lg bg-blue-500/5 p-3 border border-blue-500/20">
            <span className="text-[0.7rem] uppercase tracking-wider text-blue-500 font-medium">
              Em Expansão
            </span>
            <p className="font-display text-2xl font-bold text-blue-500">
              {stats.emDesenvolvimento}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/5 p-3 border border-emerald-500/20">
            <span className="text-[0.7rem] uppercase tracking-wider text-emerald-500 font-medium">
              Amadurecidas
            </span>
            <p className="font-display text-2xl font-bold text-emerald-500">{stats.amadurecidas}</p>
          </div>
          <div className="rounded-lg bg-purple-500/5 p-3 border border-purple-500/20">
            <span className="text-[0.7rem] uppercase tracking-wider text-purple-500 font-medium">
              Integradas
            </span>
            <p className="font-display text-2xl font-bold text-purple-500">{stats.integradas}</p>
          </div>
          <div className="rounded-lg bg-rose-500/5 p-3 border border-rose-500/20">
            <span className="text-[0.7rem] uppercase tracking-wider text-rose-500 font-medium">
              Favoritas
            </span>
            <p className="font-display text-2xl font-bold text-rose-500">{stats.favorites}</p>
          </div>
        </div>
      </section>

      {/* 2. SEÇÕES RÁPIDAS DE DESTAQUE: RECENTES & FAVORITAS (SE HOUVER) */}
      {ideas.length > 0 && activeTabSection === "todas" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recentes */}
          <div className="card-luxe p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="font-display text-base font-semibold">Ideias Recentes</h2>
              </div>
              <span className="text-xs text-muted-foreground">Últimas movimentações</span>
            </div>
            <div className="divide-y divide-border/40">
              {recentIdeas.map((rec) => {
                const conf = STATUS_CONFIG[rec.status];
                return (
                  <div
                    key={rec.id}
                    onClick={() => setReadingIdea(rec)}
                    className="flex items-center justify-between py-2.5 hover:bg-muted/40 px-2 rounded-md cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium truncate text-foreground hover:text-primary">
                        {rec.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {rec.description || "Sem descrição"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[0.65rem] px-2 py-0.5 rounded-full border ${conf.badgeClass}`}
                      >
                        {conf.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Favoritas */}
          <div className="card-luxe p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                <h2 className="font-display text-base font-semibold">Ideias Favoritas</h2>
              </div>
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className="text-xs text-primary hover:underline"
              >
                {onlyFavorites ? "Ver todas" : "Filtrar favoritas"}
              </button>
            </div>
            {favoriteIdeas.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 italic">
                Nenhuma ideia favoritada ainda. Clique no ícone de coração de qualquer ideia para
                fixá-la aqui.
              </p>
            ) : (
              <div className="divide-y divide-border/40">
                {favoriteIdeas.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => setReadingIdea(fav)}
                    className="flex items-center justify-between py-2.5 hover:bg-muted/40 px-2 rounded-md cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium truncate text-foreground hover:text-primary">
                        {fav.title}
                      </p>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {fav.category} • {fav.whatIf || fav.description}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleToggleFavorite(fav.id, e)}
                      className="p-1 text-rose-500 hover:scale-110 transition-transform"
                      title="Desfavoritar"
                    >
                      <Heart className="h-4 w-4 fill-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. BARRA DE BUSCA, FILTROS E VISUALIZAÇÃO */}
      <section className="card-luxe p-4 space-y-4">
        {/* Abas Rápidas de Navegação de Seção */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
          <button
            onClick={() => setActiveTabSection("todas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTabSection === "todas"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Todas as Ideias ({stats.total})
          </button>
          <button
            onClick={() => setActiveTabSection("desenvolvimento")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTabSection === "desenvolvimento"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            Em Desenvolvimento ({stats.emDesenvolvimento})
          </button>
          <button
            onClick={() => setActiveTabSection("favoritas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTabSection === "favoritas"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            Favoritas ({stats.favorites})
          </button>
        </div>

        {/* Linha de Controles: Busca, Filtros e Alternância de Visualização */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por título, descrição, gatilho 'E se...?', notas ou tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border/70 bg-background/50 pl-9 pr-8 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="todas">Todas as categorias</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="todos">Todos os status</option>
              <option value="centelha">Centelha Inicial</option>
              <option value="desenvolvimento">Em Desenvolvimento</option>
              <option value="amadurecida">Amadurecida</option>
              <option value="integrada">Integrada ao Livro</option>
              <option value="arquivada">Arquivada</option>
            </select>

            {/* Livro Relacionado */}
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="todos">Todos os livros</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "updated" | "created" | "title" | "status",
                )
              }
              className="rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="updated">Atualização</option>
              <option value="created">Criação</option>
              <option value="title">Título (A-Z)</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 rounded-lg border border-border/70 bg-background/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              title={sortOrder === "asc" ? "Crescente" : "Decrescente"}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>

            {/* Alternância de Visualização */}
            <div className="flex items-center rounded-lg border border-border/70 bg-background/50 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grade de Cartões"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Lista Detalhada"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-md ${
                  viewMode === "kanban"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Quadro de Fluxo por Status"
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTEÚDO PRINCIPAL (GRID, LISTA OU KANBAN) */}
      {filteredIdeas.length === 0 ? (
        <div className="card-luxe flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Lightbulb className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Nenhuma ideia encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== "todas" || selectedStatus !== "todos"
                ? "Tente limpar os filtros ou realizar outra busca."
                : "Seu laboratório está pronto para receber suas primeiras centelhas criativas, mistérios e conexões de personagens."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleOpenNew()}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Primeira Ideia</span>
            </button>
            <button
              onClick={() => setIsSparkDrawerOpen(true)}
              className="btn-ghost flex items-center gap-2 text-sm border border-border"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Sortear Centelha de Inspiração</span>
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* VISUALIZAÇÃO EM CARTÕES */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => {
            const statusConfig = STATUS_CONFIG[idea.status] || STATUS_CONFIG.centelha;
            const relatedBook = books.find((b) => b.id === idea.bookId);

            return (
              <div
                key={idea.id}
                onClick={() => setReadingIdea(idea)}
                className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: idea.accentColor || "#e8475f",
                }}
              >
                {/* Cabeçalho do Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
                      {idea.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleFavorite(idea.id, e)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition-colors"
                        title={idea.isFavorite ? "Remover dos favoritos" : "Marcar como favorita"}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            idea.isFavorite ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Título & Detalhes */}
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {idea.title}
                    </h3>
                    {idea.whatIf && (
                      <p className="mt-1 text-xs italic text-primary/90 font-serif line-clamp-2">
                        “{idea.whatIf}”
                      </p>
                    )}
                  </div>

                  {/* Descrição resumida */}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {idea.description || idea.content || "Sem descrição registrada ainda."}
                  </p>

                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {idea.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-muted/60 px-2 py-0.5 text-[0.65rem] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                      {idea.tags.length > 3 && (
                        <span className="text-[0.65rem] text-muted-foreground">
                          +{idea.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Rodapé do Card: Vínculos, Status e Ações Rápidas */}
                <div className="mt-4 pt-3 border-t border-border/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium border ${statusConfig.badgeClass}`}
                    >
                      {statusConfig.label}
                    </span>

                    {relatedBook && (
                      <span className="flex items-center gap-1 text-[0.68rem] text-muted-foreground truncate max-w-[120px]">
                        <BookOpen className="h-3 w-3 shrink-0" />
                        <span className="truncate">{relatedBook.title}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground pt-1">
                    <span>
                      {new Date(idea.updatedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>

                    {/* Ações Rápidas */}
                    <div
                      className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(idea)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Editar ideia"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(idea.id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Duplicar ideia"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(idea.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Excluir ideia"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "list" ? (
        /* VISUALIZAÇÃO EM LISTA DETALHADA */
        <div className="card-luxe divide-y divide-border/50 overflow-hidden">
          {filteredIdeas.map((idea) => {
            const statusConfig = STATUS_CONFIG[idea.status] || STATUS_CONFIG.centelha;
            const relatedBook = books.find((b) => b.id === idea.bookId);

            return (
              <div
                key={idea.id}
                onClick={() => setReadingIdea(idea)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/40 transition-colors cursor-pointer gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(idea.id, e)}
                      className="text-muted-foreground hover:text-rose-500"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          idea.isFavorite ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                    <h4 className="font-display text-base font-semibold text-foreground hover:text-primary transition-colors truncate">
                      {idea.title}
                    </h4>
                    <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {idea.category}
                    </span>
                    <span
                      className={`text-[0.68rem] px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {idea.whatIf ? `“${idea.whatIf}” — ` : ""}
                    {idea.description || idea.content || "Sem notas adicionais."}
                  </p>

                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {idea.tags.map((t) => (
                        <span key={t} className="text-[0.65rem] text-muted-foreground">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  {relatedBook && (
                    <span className="flex items-center gap-1 text-[0.7rem]">
                      <BookOpen className="h-3 w-3" />
                      {relatedBook.title}
                    </span>
                  )}
                  <span>
                    {new Date(idea.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(idea)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Editar"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(idea.id)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(idea.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISUALIZAÇÃO KANBAN / QUADRO DE FLUXO POR STATUS */
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {(
            ["centelha", "desenvolvimento", "amadurecida", "integrada", "arquivada"] as IdeaStatus[]
          ).map((colStatus) => {
            const conf = STATUS_CONFIG[colStatus];
            const colIdeas = filteredIdeas.filter((i) => i.status === colStatus);

            return (
              <div
                key={colStatus}
                className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-3 min-h-[400px]"
              >
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        colStatus === "centelha"
                          ? "bg-amber-500"
                          : colStatus === "desenvolvimento"
                            ? "bg-blue-500"
                            : colStatus === "amadurecida"
                              ? "bg-emerald-500"
                              : colStatus === "integrada"
                                ? "bg-purple-500"
                                : "bg-zinc-500"
                      }`}
                    />
                    <h4 className="font-display text-xs font-semibold text-foreground uppercase tracking-wide">
                      {conf.label}
                    </h4>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                    {colIdeas.length}
                  </span>
                </div>

                {/* Lista de Cartões da Coluna */}
                <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto">
                  {colIdeas.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground italic border border-dashed border-border/40 rounded-lg">
                      Nenhuma ideia nesta fase
                    </div>
                  ) : (
                    colIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        onClick={() => setReadingIdea(idea)}
                        className="rounded-lg border border-border/70 bg-card p-3 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer space-y-2"
                        style={{
                          borderLeftWidth: "3px",
                          borderLeftColor: idea.accentColor || "#e8475f",
                        }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[0.65rem] text-muted-foreground font-medium">
                            {idea.category}
                          </span>
                          <button
                            onClick={(e) => handleToggleFavorite(idea.id, e)}
                            className="text-muted-foreground hover:text-rose-500"
                          >
                            <Heart
                              className={`h-3.5 w-3.5 ${
                                idea.isFavorite ? "fill-rose-500 text-rose-500" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <h5 className="font-display text-sm font-semibold text-foreground line-clamp-2">
                          {idea.title}
                        </h5>
                        {idea.whatIf && (
                          <p className="text-[0.7rem] italic text-primary/80 line-clamp-2 font-serif">
                            “{idea.whatIf}”
                          </p>
                        )}
                        <p className="text-[0.72rem] text-muted-foreground line-clamp-2">
                          {idea.description}
                        </p>

                        <div
                          className="pt-2 border-t border-border/40 flex items-center justify-between text-[0.68rem] text-muted-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={idea.status}
                            onChange={(e) =>
                              handleQuickStatusChange(idea.id, e.target.value as IdeaStatus)
                            }
                            className="bg-muted/60 rounded px-1.5 py-0.5 text-[0.65rem] border border-border/40"
                          >
                            <option value="centelha">Centelha</option>
                            <option value="desenvolvimento">Desenvolvimento</option>
                            <option value="amadurecida">Amadurecida</option>
                            <option value="integrada">Integrada</option>
                            <option value="arquivada">Arquivada</option>
                          </select>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(idea)}
                              className="p-1 hover:text-foreground"
                              title="Editar"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL COMPLETO DE CRIAÇÃO E EDIÇÃO DE IDEIAS */}
      {isEditorOpen && editingIdea && (
        <IdeaEditorModal
          idea={editingIdea}
          allCategories={allCategories}
          books={books}
          characters={characters}
          chapters={chapters}
          allIdeas={ideas.filter((i) => i.id !== editingIdea.id)}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingIdea(null);
          }}
          onSave={(savedIdea) => {
            actions.upsertIdea(savedIdea);
            setIsEditorOpen(false);
            setEditingIdea(null);
          }}
        />
      )}

      {/* 6. MODAL DE VISUALIZAÇÃO / LEITURA COMPLETA DA IDEIA */}
      {readingIdea && (
        <IdeaDetailModal
          idea={readingIdea}
          books={books}
          characters={characters}
          chapters={chapters}
          allIdeas={ideas}
          onClose={() => setReadingIdea(null)}
          onEdit={() => {
            const copy = { ...readingIdea };
            setReadingIdea(null);
            handleEdit(copy);
          }}
          onDuplicate={() => {
            handleDuplicate(readingIdea.id);
            setReadingIdea(null);
          }}
          onDelete={() => {
            setDeleteConfirmId(readingIdea.id);
          }}
          onToggleFavorite={() => actions.toggleFavoriteIdea(readingIdea.id)}
        />
      )}

      {/* 7. GAVETA / MODAL DE GERADOR DE CENTELHAS CRIATIVAS */}
      {isSparkDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setIsSparkDrawerOpen(false)}
        >
          <div
            className="card-luxe flex max-h-[90vh] w-full max-w-2xl flex-col p-6 space-y-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="font-display text-lg font-bold">Gerador de Centelhas Criativas</h3>
              </div>
              <button
                onClick={() => setIsSparkDrawerOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Selecione uma das centelhas narrativas abaixo para abri-la no Laboratório de Ideias ou
              use como ponto de partida para desbloquear seu fluxo criativo.
            </p>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {CREATIVE_SPARKS.map((spark, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/70 bg-card p-4 space-y-2 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[0.68rem] font-semibold text-primary uppercase tracking-wider">
                      {spark.category}
                    </span>
                    <button
                      onClick={() => handleApplySpark(spark)}
                      className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Usar Esta Centelha</span>
                    </button>
                  </div>

                  <h4 className="font-display text-base font-semibold text-foreground">
                    {spark.title}
                  </h4>
                  <p className="text-xs italic font-serif text-amber-500/90">“{spark.whatIf}”</p>
                  <p className="text-xs text-muted-foreground">{spark.description}</p>
                  <p className="text-[0.72rem] text-muted-foreground/90">
                    <strong className="text-foreground">Conflito:</strong> {spark.keyConflict}
                  </p>
                  <p className="text-[0.72rem] italic text-muted-foreground">
                    {spark.sampleDialogue}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border/40 flex justify-end">
              <button onClick={() => setIsSparkDrawerOpen(false)} className="btn-ghost text-xs">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="card-luxe w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-destructive">Excluir Ideia?</h3>
            <p className="text-sm text-muted-foreground">
              Esta ação removerá a ideia do seu laboratório. Você pode arquivá-la em vez de excluir
              caso deseje guardá-la para o futuro.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-ghost text-xs">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn-primary bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL DE EXPORTAÇÃO */}
      {isExportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setIsExportModalOpen(false)}
        >
          <div
            className="card-luxe w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <h3 className="font-display text-base font-bold">Exportar Ideias</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Escolha o formato desejado para exportar as ideias do seu laboratório:
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleExport("txt")}
                className="card-luxe p-4 text-center hover:border-primary transition-colors flex flex-col items-center gap-2"
              >
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xs font-semibold">Documento de Texto (.txt)</span>
                <span className="text-[0.65rem] text-muted-foreground">
                  Formatado para leitura do autor
                </span>
              </button>

              <button
                onClick={() => handleExport("json")}
                className="card-luxe p-4 text-center hover:border-primary transition-colors flex flex-col items-center gap-2"
              >
                <Share2 className="h-6 w-6 text-teal" />
                <span className="text-xs font-semibold">Arquivo de Dados (.json)</span>
                <span className="text-[0.65rem] text-muted-foreground">
                  Backup estruturado completo
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// MODAL DE EDIÇÃO / CRIAÇÃO DE IDEIA (RESPONSIVO E COMPLETO)
// ===========================================================================

interface IdeaEditorModalProps {
  idea: IdeaItem;
  allCategories: string[];
  books: Book[];
  characters: Character[];
  chapters: Chapter[];
  allIdeas: IdeaItem[];
  onClose: () => void;
  onSave: (idea: IdeaItem) => void;
}

function IdeaEditorModal({
  idea,
  allCategories,
  books,
  characters,
  chapters,
  allIdeas,
  onClose,
  onSave,
}: IdeaEditorModalProps) {
  const [formData, setFormData] = useState<IdeaItem>({ ...idea });
  const [activeTab, setActiveTab] = useState<
    "basico" | "desenvolvimento" | "vinculos" | "estetica"
  >("basico");
  const [newTagInput, setNewTagInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (!(formData.tags || []).includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmed],
      }));
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  };

  const handleCreateCustomCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    actions.addIdeaCustomCategory(trimmed);
    setFormData((prev) => ({ ...prev, category: trimmed }));
    setNewCategoryInput("");
    setIsAddingCustomCategory(false);
  };

  const handleToggleCharacter = (charId: string) => {
    const current = formData.characterIds || [];
    const updated = current.includes(charId)
      ? current.filter((id) => id !== charId)
      : [...current, charId];
    setFormData((prev) => ({ ...prev, characterIds: updated }));
  };

  const handleToggleConnectedIdea = (otherId: string) => {
    const current = formData.connectedIdeaIds || [];
    const updated = current.includes(otherId)
      ? current.filter((id) => id !== otherId)
      : [...current, otherId];
    setFormData((prev) => ({ ...prev, connectedIdeaIds: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Por favor, preencha o título da ideia.");
      return;
    }
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="card-luxe flex h-[94vh] max-h-[900px] w-full max-w-4xl flex-col p-0 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: formData.accentColor || "#e8475f" }}
            />
            <h2 className="font-display text-lg font-bold text-foreground">
              {formData.title ? `Editar: ${formData.title}` : "Nova Ideia Narrativa"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, isFavorite: !p.isFavorite }))}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-500"
            >
              <Heart
                className={`h-4 w-4 ${formData.isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
              />
              <span className="hidden sm:inline">
                {formData.isFavorite ? "Favorita" : "Favoritar"}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Abas do Formulário */}
        <div className="flex items-center gap-1 border-b border-border/40 px-6 py-2 bg-muted/10 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("basico")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "basico"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Informações Básicas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("desenvolvimento")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "desenvolvimento"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Aprofundamento & Gatilhos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vinculos")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "vinculos"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Vínculos Narrativos ({formData.characterIds?.length || 0} personagens)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("estetica")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "estetica"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Estética & Cor
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* ABA 1: BÁSICO */}
            {activeTab === "basico" && (
              <div className="space-y-4">
                {/* Título */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Título da Ideia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: O Pacto das Cinzas Silenciosas"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Categoria e Status */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Categoria
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                        className="text-[0.68rem] text-primary hover:underline"
                      >
                        {isAddingCustomCategory ? "Cancelar" : "+ Nova Categoria"}
                      </button>
                    </div>

                    {isAddingCustomCategory ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Nome da categoria..."
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCustomCategory}
                          className="btn-primary px-2.5 py-1.5 text-xs"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {allCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Status de Desenvolvimento
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as IdeaStatus })
                      }
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="centelha">Centelha Inicial (Relâmpago criativo)</option>
                      <option value="desenvolvimento">Em Desenvolvimento (Pesquisando)</option>
                      <option value="amadurecida">Amadurecida (Pronta para usar)</option>
                      <option value="integrada">Integrada ao Livro (Em manuscrito)</option>
                      <option value="arquivada">Em Pausa / Arquivada</option>
                    </select>
                  </div>
                </div>

                {/* Descrição Inicial */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Descrição Inicial / Conceito
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Resuma o conceito central em poucas frases..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Tags Personalizadas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar tag (ex: Plot Twist, Magia, Clímax) e aperte Enter..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-ghost px-3 py-1.5 text-xs border border-border"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 2: APROFUNDAMENTO & GATILHOS */}
            {activeTab === "desenvolvimento" && (
              <div className="space-y-4">
                {/* Gatilho "E se...?" */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Gatilho Criativo: “E se...?”
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: E se o juramento de proteção exigir a morte da memória mais preciosa?"
                    value={formData.whatIf || ""}
                    onChange={(e) => setFormData({ ...formData, whatIf: e.target.value })}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm italic font-serif focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Conflito Central */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Conflito Central / Dilema
                  </label>
                  <input
                    type="text"
                    placeholder="Qual é a escolha impossível ou risco emocional?"
                    value={formData.keyConflict || ""}
                    onChange={(e) => setFormData({ ...formData, keyConflict: e.target.value })}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Detalhamento Expandido */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Detalhamento & Anotações de Desenvolvimento
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Escreva livremente: desdobramentos da cena, regras da magia, motivações ocultas, atmosfera..."
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed font-sans"
                  />
                </div>

                {/* Rascunho de Diálogo */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Trecho de Diálogo ou Citação Memorável
                  </label>
                  <input
                    type="text"
                    placeholder="— Não foi a profecia que escolheu você. Foi a covardia de quem a escreveu."
                    value={formData.sampleDialogue || ""}
                    onChange={(e) => setFormData({ ...formData, sampleDialogue: e.target.value })}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs italic focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* ABA 3: VÍNCULOS NARRATIVOS */}
            {activeTab === "vinculos" && (
              <div className="space-y-5">
                {/* Livro Relacionado */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Livro do Estúdio
                  </label>
                  <select
                    value={formData.bookId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bookId: e.target.value || undefined })
                    }
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Nenhum livro específico vinculado</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {b.subtitle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personagens Relacionados */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Personagens Relacionados ({characters.length} disponíveis)
                  </label>
                  {characters.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhum personagem cadastrado no projeto ainda.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-border/50 rounded-lg">
                      {characters.map((char) => {
                        const isSelected = (formData.characterIds || []).includes(char.id);
                        return (
                          <button
                            type="button"
                            key={char.id}
                            onClick={() => handleToggleCharacter(char.id)}
                            className={`flex items-center gap-2 p-2 rounded-md text-left text-xs transition-colors border ${
                              isSelected
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "bg-card border-border/60 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isSelected ? "bg-primary" : "bg-muted-foreground/40"
                              }`}
                            />
                            <span className="truncate">{char.name || "Sem nome"}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ideias Conectadas no Próprio Laboratório */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Conectar com Outras Ideias deste Laboratório
                  </label>
                  {allIdeas.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Não há outras ideias registradas para cruzar no momento.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-border/50 rounded-lg">
                      {allIdeas.map((other) => {
                        const isConnected = (formData.connectedIdeaIds || []).includes(other.id);
                        return (
                          <button
                            type="button"
                            key={other.id}
                            onClick={() => handleToggleConnectedIdea(other.id)}
                            className={`flex items-center justify-between p-2 rounded-md text-left text-xs transition-colors border ${
                              isConnected
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "bg-card border-border/60 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="font-medium truncate">{other.title}</p>
                              <span className="text-[0.65rem] text-muted-foreground">
                                {other.category}
                              </span>
                            </div>
                            <span
                              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                isConnected ? "bg-primary" : "border border-muted-foreground/40"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 4: ESTÉTICA & COR */}
            {activeTab === "estetica" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Cor de Destaque da Ideia
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Define a cor de marcação da borda do cartão e identificador visual.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setFormData({ ...formData, accentColor: color })}
                        className={`h-8 w-8 rounded-full border-2 transition-transform ${
                          formData.accentColor === color
                            ? "border-foreground scale-110 shadow-md ring-2 ring-primary/40"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Imagem de Referência / Estética (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/imagem-referencia.jpg"
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 h-32 w-full rounded-lg border border-border overflow-hidden bg-muted">
                      <img
                        src={formData.imageUrl}
                        alt="Pré-visualização"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé do Modal */}
          <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              {formData.createdAt
                ? `Criado em ${new Date(formData.createdAt).toLocaleDateString("pt-BR")}`
                : "Nova entrada"}
            </span>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-ghost text-xs">
                Cancelar
              </button>
              <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>Salvar Ideia</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// MODAL DE DETALHES / LEITURA COMPLETA DA IDEIA
// ===========================================================================

interface IdeaDetailModalProps {
  idea: IdeaItem;
  books: Book[];
  characters: Character[];
  chapters: Chapter[];
  allIdeas: IdeaItem[];
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

function IdeaDetailModal({
  idea,
  books,
  characters,
  allIdeas,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: IdeaDetailModalProps) {
  const statusConfig = STATUS_CONFIG[idea.status] || STATUS_CONFIG.centelha;
  const relatedBook = books.find((b) => b.id === idea.bookId);
  const relatedCharacters = (idea.characterIds || [])
    .map((id) => characters.find((c) => c.id === id))
    .filter(Boolean) as Character[];
  const connectedIdeas = (idea.connectedIdeaIds || [])
    .map((id) => allIdeas.find((i) => i.id === id))
    .filter(Boolean) as IdeaItem[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="card-luxe flex h-[92vh] max-h-[850px] w-full max-w-3xl flex-col p-0 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTopWidth: "4px",
          borderTopColor: idea.accentColor || "#e8475f",
        }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {idea.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleFavorite}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors"
              title="Favoritar"
            >
              <Heart
                className={`h-5 w-5 ${idea.isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
              />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Editar"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Duplicar"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo de Leitura */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {idea.title}
            </h1>
            {idea.whatIf && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3.5 my-3">
                <span className="text-[0.68rem] uppercase tracking-wider text-amber-500 font-bold block mb-1">
                  Gatilho Criativo • E se...?
                </span>
                <p className="font-serif text-base italic text-foreground leading-relaxed">
                  “{idea.whatIf}”
                </p>
              </div>
            )}
          </div>

          {/* Descrição Inicial */}
          {idea.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Descrição do Conceito
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>
          )}

          {/* Conflito Central */}
          {idea.keyConflict && (
            <div className="rounded-lg bg-muted/40 p-3.5 border border-border/50">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
                Conflito Central / Dilema
              </span>
              <p className="text-sm text-foreground">{idea.keyConflict}</p>
            </div>
          )}

          {/* Detalhamento Expandido */}
          {idea.content && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Detalhamento & Anotações de Desenvolvimento
              </h3>
              <div className="rounded-xl bg-card border border-border/60 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {idea.content}
              </div>
            </div>
          )}

          {/* Diálogo de Amostra */}
          {idea.sampleDialogue && (
            <div className="rounded-lg bg-muted/30 border-l-4 border-primary p-4 italic text-sm text-foreground font-serif">
              <p>{idea.sampleDialogue}</p>
            </div>
          )}

          {/* Vínculos */}
          {(relatedBook || relatedCharacters.length > 0 || connectedIdeas.length > 0) && (
            <div className="space-y-3 pt-3 border-t border-border/40">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Vínculos no Universo Narrativo
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedBook && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-1.5 text-xs text-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    Livro: <strong>{relatedBook.title}</strong>
                  </span>
                )}
                {relatedCharacters.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-1.5 text-xs text-foreground"
                  >
                    <Users className="h-3.5 w-3.5 text-teal" />
                    Personagem: <strong>{c.name}</strong>
                  </span>
                ))}
              </div>

              {connectedIdeas.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs text-muted-foreground">Ideias Conectadas:</span>
                  <div className="flex flex-wrap gap-2">
                    {connectedIdeas.map((ci) => (
                      <span
                        key={ci.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs text-primary"
                      >
                        <Lightbulb className="h-3 w-3" />
                        {ci.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {idea.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between border-t border-border/50 px-6 py-3.5 bg-muted/20 text-xs text-muted-foreground">
          <span>
            Atualizado em:{" "}
            {new Date(idea.updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button onClick={onClose} className="btn-primary text-xs">
            Concluir Leitura
          </button>
        </div>
      </div>
    </div>
  );
}

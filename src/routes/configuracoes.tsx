import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Palette,
  Sparkles,
  Heart,
  Eye,
  Check,
  Plus,
  Copy,
  Trash2,
  Edit3,
  RotateCcw,
  Sun,
  Moon,
  Clock,
  BookOpen,
  Globe2,
  Sliders,
  ShieldCheck,
  Search,
  X,
  Save,
  Layers,
} from "lucide-react";
import {
  useThemeStore,
  themeActions,
  getAllThemes,
  getThemeById,
  THEME_CATEGORIES,
  getContrastRatio,
  type ThemeCategory,
  type VisualTheme,
  type ThemeCardBorderStyle,
  type ThemeButtonShape,
  type ThemeIconStyle,
  type ThemeDecorationMotif,
  type ThemeSpacingScale,
} from "@/lib/themes";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · Aparência e Temas — Spectral Archive Studio" },
      {
        name: "description",
        content:
          "Personalize a aparência do Spectral Archive Studio com temas visuais completos, criador de temas e preferências de leitura.",
      },
    ],
  }),
  component: ConfiguracoesTemasPage,
});

const CARD_STYLE_LABELS: Record<ThemeCardBorderStyle, string> = {
  subtle: "Suave & Moderno",
  "rounded-soft": "Arredondado Acolhedor",
  "classic-double": "Moldura Dupla Editorial",
  "neon-glow": "Borda Luminosa / Neon",
  "sharp-minimal": "Minimalista Nitidez",
};

const BUTTON_SHAPE_LABELS: Record<ThemeButtonShape, string> = {
  pill: "Pílula (Arredondado)",
  rounded: "Cantos Suaves",
  "soft-square": "Retangular Editorial",
  "cyber-cut": "Geométrico / Futurista",
};

const ICON_STYLE_LABELS: Record<ThemeIconStyle, string> = {
  minimalist: "Minimalista",
  delicate: "Delicado",
  ornamental: "Ornamental",
  magical: "Mágico & Astral",
  futuristic: "Futurista",
  editorial: "Editorial Clássico",
  botanical: "Botânico & Natural",
};

const MOTIF_LABELS: Record<ThemeDecorationMotif, string> = {
  none: "Nenhum (Limpo)",
  "spectral-archive": "Arquivos & Astrolábio",
  "sparkle-hearts": "Corações & Brilhos",
  "coquette-bows": "Laços & Fitas Coquette",
  "cherry-blossom": "Pétalas de Cerejeira",
  "academia-quills": "Moldura Dark Academia",
  "classic-filigree": "Filigrana de Biblioteca",
  "sage-leaves": "Ramos Botânicos",
  "ocean-waves": "Ondas do Oceano",
  "lavender-stars": "Estrelas & Lavanda",
  "galaxy-constellations": "Constelações & Galáxia",
  "mystic-crystals": "Cristais Místicos",
  "cyberpunk-grid": "Circuito Cyberpunk",
  "cottage-wildflowers": "Flores do Campo",
  "royal-crowns": "Insígnia Imperial Dourada",
  "minimal-clean": "Minimalista Puro",
};

const FONT_OPTIONS = [
  {
    label: "Cormorant Garamond (Clássica Editorial)",
    value: '"Cormorant Garamond", Georgia, serif',
  },
  { label: "Georgia (Serifada Literária)", value: "Georgia, Cambria, serif" },
  { label: "Jost (Moderna Geométrica)", value: '"Jost", system-ui, sans-serif' },
  { label: "Sistema Sans-Serif (Leitura Limpa)", value: "system-ui, -apple-system, sans-serif" },
];

type SettingsSectionTab = "galeria" | "criador" | "contextos" | "acessibilidade";

function ThemeMiniPreview({ theme }: { theme: VisualTheme }) {
  const c = theme.colors;
  const iconMain = c.iconPrimary || c.primary;
  const iconAcc = c.iconAccent || c.accent || c.primary;
  const iconMuted = c.iconMuted || c.mutedForeground;
  const radius = Math.min(18, Math.max(4, Math.round(theme.visualStyle.radiusPx * 0.75)));
  const btnRadius =
    theme.visualStyle.buttonShape === "pill"
      ? 999
      : theme.visualStyle.buttonShape === "rounded"
        ? 8
        : 4;

  return (
    <div
      className="relative overflow-hidden border p-3 transition-all"
      style={{
        backgroundColor: c.background,
        borderColor: c.border,
        borderRadius: `${radius}px`,
        color: c.foreground,
      }}
      aria-label={`Prévia visual do tema ${theme.name}`}
    >
      {/* Topo simulado da interface */}
      <div
        className="flex items-center justify-between gap-2 pb-2 mb-2 border-b"
        style={{ borderColor: c.border }}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: iconAcc }} />
          <span
            className="text-[11px] font-semibold tracking-wide truncate"
            style={{ fontFamily: theme.typography.displayFont, color: c.foreground }}
          >
            Spectral Archive
          </span>
        </div>
        <span
          className="px-2 py-0.5 text-[9px] font-medium"
          style={{
            backgroundColor: c.secondary,
            color: c.secondaryForeground,
            borderRadius: `${btnRadius}px`,
          }}
        >
          {theme.mode === "light" ? "Claro" : "Escuro"}
        </span>
      </div>

      {/* Corpo simulado: barra lateral + cartão principal */}
      <div className="grid grid-cols-12 gap-2">
        <div
          className="col-span-4 flex flex-col gap-1.5 rounded p-1.5"
          style={{ backgroundColor: c.backgroundSecondary }}
        >
          <div className="flex items-center gap-1">
            <BookOpen className="h-2.5 w-2.5 shrink-0" style={{ color: iconMain }} />
            <div
              className="h-2 w-4/5 rounded-sm"
              style={{ backgroundColor: c.primary, opacity: 0.85 }}
            />
          </div>
          <div className="flex items-center gap-1">
            <Globe2 className="h-2.5 w-2.5 shrink-0" style={{ color: iconAcc }} />
            <div
              className="h-1.5 w-3/4 rounded-sm"
              style={{ backgroundColor: iconMuted, opacity: 0.55 }}
            />
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-2.5 w-2.5 shrink-0" style={{ color: iconMain }} />
            <div
              className="h-1.5 w-2/3 rounded-sm"
              style={{ backgroundColor: iconMuted, opacity: 0.45 }}
            />
          </div>
        </div>

        <div
          className="col-span-8 rounded border p-2"
          style={{
            backgroundColor: c.card,
            borderColor: c.border,
            borderRadius: `${Math.max(4, radius - 4)}px`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: c.foreground, fontFamily: theme.typography.displayFont }}
            >
              <Palette className="h-3 w-3 shrink-0" style={{ color: iconMain }} />
              Capítulo I · A Aurora
            </span>
            <Sparkles className="h-3 w-3 shrink-0" style={{ color: iconAcc }} />
          </div>
          <p className="mt-1 line-clamp-1 text-[9px]" style={{ color: c.mutedForeground }}>
            A biblioteca guardava segredos antigos...
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="px-2 py-0.5 text-[9px] font-medium"
              style={{
                backgroundColor: c.primary,
                color: c.primaryForeground,
                borderRadius: `${btnRadius}px`,
              }}
            >
              Abrir
            </span>
            <span
              className="border px-1.5 py-0.5 text-[9px]"
              style={{
                borderColor: c.border,
                color: c.foreground,
                borderRadius: `${btnRadius}px`,
              }}
            >
              Notas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfiguracoesTemasPage() {
  const themeState = useThemeStore((s) => s);
  const allThemes = useMemo(() => getAllThemes(themeState), [themeState]);
  const activeTheme = useMemo(
    () => getThemeById(themeState.activeThemeId, themeState),
    [themeState],
  );

  const books = useStore((s) => s.books);
  const worldRecords = useStore((s) => s.worldRecords ?? []);

  const [activeTab, setActiveTab] = useState<SettingsSectionTab>("galeria");
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>("Todos");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Estado do Criador / Editor de Tema Personalizado
  const [editingTheme, setEditingTheme] = useState<VisualTheme>(() =>
    themeActions.createBlankCustomTheme(themeState.activeThemeId),
  );

  const notify = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const filteredThemes = useMemo(() => {
    return allThemes.filter((theme) => {
      if (onlyFavorites && !themeState.favoriteThemeIds.includes(theme.id)) {
        return false;
      }
      if (selectedCategory !== "Todos") {
        if (selectedCategory === "Personalizados") {
          if (!theme.isCustom) return false;
        } else if (!theme.categories.includes(selectedCategory)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = theme.name.toLowerCase().includes(q);
        const matchDesc = theme.description.toLowerCase().includes(q);
        const matchCat = theme.categories.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [allThemes, onlyFavorites, selectedCategory, searchQuery, themeState.favoriteThemeIds]);

  const handleOpenCreatorWithBase = (baseTheme?: VisualTheme, isEditExisting?: boolean) => {
    if (baseTheme && isEditExisting && baseTheme.isCustom) {
      setEditingTheme(structuredClone(baseTheme));
    } else {
      const next = themeActions.createBlankCustomTheme(baseTheme?.id ?? themeState.activeThemeId);
      setEditingTheme(next);
    }
    setActiveTab("criador");
  };

  const handleSaveCustomTheme = (applyImmediately: boolean) => {
    const trimmedName = editingTheme.name.trim() || "Tema Personalizado";
    const toSave: VisualTheme = {
      ...editingTheme,
      name: trimmedName,
    };
    themeActions.saveCustomTheme(toSave);
    if (applyImmediately) {
      themeActions.applyTheme(toSave.id);
      notify(`Tema personalizado "${trimmedName}" salvo e aplicado!`);
    } else {
      notify(`Tema personalizado "${trimmedName}" salvo na galeria!`);
    }
    setActiveTab("galeria");
  };

  const contrastRatio = useMemo(
    () => getContrastRatio(editingTheme.colors.background, editingTheme.colors.foreground),
    [editingTheme.colors.background, editingTheme.colors.foreground],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Cabeçalho e Trilha Configurações -> Aparência -> Temas */}
      <div className="card-luxe bg-saga p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span>Configurações</span>
          <span>→</span>
          <span>Aparência</span>
          <span>→</span>
          <span className="font-semibold text-primary">Temas</span>
        </div>

        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl md:text-4xl">
              <Palette className="h-8 w-8 text-primary" />
              Galeria & Sistema de Temas Visuais
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Personalize a atmosfera do Spectral Archive Studio com experiências visuais completas:
              paletas de cores, tipografia, estilo de cartões, botões e elementos decorativos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenCreatorWithBase(activeTheme, false)}
              className="btn"
            >
              <Plus className="h-4 w-4" /> Criar Tema Personalizado
            </button>
            <button
              type="button"
              onClick={() => {
                themeActions.restoreDefaultTheme();
                notify("Tema padrão Spectral Original restaurado.");
              }}
              className="btn-ghost"
              title="Restaurar para o tema oficial Spectral Original"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar Padrão
            </button>
          </div>
        </div>

        {/* Resumo do Tema Ativo Atual */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background/70 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {activeTheme.paletteSwatches.map((hex, i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tema Ativo:
                </span>
                <strong className="text-sm text-foreground" data-testid="active-theme-name">
                  {activeTheme.name}
                </strong>
                <span className="chip">
                  {activeTheme.mode === "light" ? "Modo Claro" : "Modo Escuro"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {activeTheme.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Cartões: {CARD_STYLE_LABELS[activeTheme.visualStyle.cardBorderStyle]}</span>
            <span>·</span>
            <span>Ícones: {ICON_STYLE_LABELS[activeTheme.visualStyle.iconStyle]}</span>
          </div>
        </div>
      </div>

      {statusBanner && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-primary/40 bg-secondary px-4 py-3 text-sm text-foreground shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> {statusBanner}
          </span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Abas de Navegação do Módulo de Temas */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("galeria")}
          className={activeTab === "galeria" ? "btn !min-h-10" : "btn-ghost !min-h-10"}
        >
          <Palette className="h-4 w-4" /> Galeria de Temas ({allThemes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("criador")}
          className={activeTab === "criador" ? "btn !min-h-10" : "btn-ghost !min-h-10"}
        >
          <Sliders className="h-4 w-4" /> Criador de Tema Personalizado
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contextos")}
          className={activeTab === "contextos" ? "btn !min-h-10" : "btn-ghost !min-h-10"}
        >
          <Clock className="h-4 w-4" /> Modo Dia/Noite & Temas por Livro/Mundo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("acessibilidade")}
          className={activeTab === "acessibilidade" ? "btn !min-h-10" : "btn-ghost !min-h-10"}
        >
          <ShieldCheck className="h-4 w-4" /> Conforto Visual & Acessibilidade
        </button>
      </div>

      {/* =====================================================================
          ABA 1: GALERIA DE TEMAS
      ===================================================================== */}
      {activeTab === "galeria" && (
        <div className="space-y-6">
          {/* Barra de Busca e Filtros por Categoria */}
          <div className="card-luxe p-4 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tema por nome, estilo, cor ou inspiração..."
                  className="pl-9"
                  aria-label="Buscar tema"
                />
              </div>
              <button
                type="button"
                onClick={() => setOnlyFavorites((v) => !v)}
                className={onlyFavorites ? "btn !min-h-11" : "btn-ghost !min-h-11"}
              >
                <Heart className={`h-4 w-4 ${onlyFavorites ? "fill-current" : ""}`} />
                Favoritos ({themeState.favoriteThemeIds.length})
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Categorias de temas">
              {THEME_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/70 text-secondary-foreground hover:bg-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade de Cartões de Temas */}
          {filteredThemes.length === 0 ? (
            <div className="card-luxe p-10 text-center">
              <Palette className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 text-xl">Nenhum tema encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Experimente limpar os filtros ou criar seu próprio tema personalizado.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredThemes.map((theme) => {
                const isApplied = themeState.activeThemeId === theme.id;
                const isPreviewing = themeState.previewThemeId === theme.id;
                const isFav = themeState.favoriteThemeIds.includes(theme.id);

                return (
                  <article
                    key={theme.id}
                    data-testid={`theme-card-${theme.id}`}
                    className={`card-luxe flex flex-col justify-between p-5 transition-all ${
                      isApplied ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div>
                      {/* Cabeçalho do Cartão */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold">{theme.name}</h3>
                            {isApplied && (
                              <span className="chip !bg-primary !text-primary-foreground font-medium">
                                Ativo
                              </span>
                            )}
                            {theme.isCustom && <span className="chip">Personalizado</span>}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {theme.categories
                              .filter((c) => c !== "Todos")
                              .map((cat) => (
                                <span
                                  key={cat}
                                  className="text-[10px] uppercase tracking-wider text-muted-foreground"
                                >
                                  #{cat}
                                </span>
                              ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => themeActions.toggleFavoriteTheme(theme.id)}
                          className={`rounded-full p-2 transition-colors ${
                            isFav
                              ? "text-primary bg-secondary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                          aria-label={
                            isFav
                              ? `Remover ${theme.name} dos favoritos`
                              : `Favoritar ${theme.name}`
                          }
                        >
                          <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                        {theme.description}
                      </p>

                      {/* Mini Prévia Visual da Interface */}
                      <div className="mt-4">
                        <ThemeMiniPreview theme={theme} />
                      </div>

                      {/* Paleta de Cores e Metadados de Estilo */}
                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Paleta de Cores
                          </span>
                          <div className="flex items-center gap-1.5">
                            {theme.paletteSwatches.map((hex, idx) => (
                              <span
                                key={idx}
                                title={hex}
                                className="h-5 w-5 rounded-full border border-border shadow-xs"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-secondary/40 p-2 text-[11px]">
                          <div>
                            <span className="text-muted-foreground">Cartões: </span>
                            <span className="font-medium">
                              {CARD_STYLE_LABELS[theme.visualStyle.cardBorderStyle]}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Botões: </span>
                            <span className="font-medium">
                              {BUTTON_SHAPE_LABELS[theme.visualStyle.buttonShape]}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ícones: </span>
                            <span className="font-medium">
                              {ICON_STYLE_LABELS[theme.visualStyle.iconStyle]}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Decoração: </span>
                            <span className="font-medium">
                              {MOTIF_LABELS[theme.visualStyle.decorationMotif]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações do Cartão */}
                    <div className="mt-5 space-y-2 pt-3 border-t border-border/60">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isPreviewing) {
                              themeActions.stopPreviewTheme();
                            } else {
                              themeActions.startPreviewTheme(theme.id);
                            }
                          }}
                          className="btn-ghost !min-h-10 !px-3 !py-1.5 !text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {isPreviewing ? "Sair da Prévia" : "Visualizar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            themeActions.applyTheme(theme.id);
                            notify(`Tema "${theme.name}" aplicado com sucesso!`);
                          }}
                          disabled={isApplied && !themeState.previewThemeId}
                          className="btn !min-h-10 !px-3 !py-1.5 !text-xs disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {isApplied && !themeState.previewThemeId ? "Aplicado" : "Aplicar"}
                        </button>
                      </div>

                      {/* Ações extras para temas personalizados ou duplicar como base */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = themeActions.duplicateThemeAsCustom(theme.id);
                            notify(`Cópia editável "${copy.name}" criada!`);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" /> Duplicar
                        </button>

                        {theme.isCustom && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenCreatorWithBase(theme, true)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-primary hover:bg-secondary"
                            >
                              <Edit3 className="h-3 w-3" /> Editar
                            </button>

                            {confirmDeleteId === theme.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    themeActions.deleteCustomTheme(theme.id);
                                    setConfirmDeleteId(null);
                                    notify(`Tema "${theme.name}" excluído.`);
                                  }}
                                  className="rounded bg-destructive px-2 py-0.5 text-[11px] font-medium text-white"
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 text-[11px] text-muted-foreground"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(theme.id)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-destructive hover:bg-secondary"
                              >
                                <Trash2 className="h-3 w-3" /> Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          ABA 2: CRIADOR DE TEMA PERSONALIZADO
      ===================================================================== */}
      {activeTab === "criador" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="card-luxe space-y-6 p-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-2xl">Criador de Tema Personalizado</h2>
                <p className="text-xs text-muted-foreground">
                  Personalize cores, fontes, bordas e elementos decorativos e salve na sua galeria.
                </p>
              </div>
              <div>
                <label className="block text-[10px]">Copiar base de:</label>
                <select
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const base = getThemeById(e.target.value, themeState);
                    setEditingTheme((prev) => ({
                      ...structuredClone(base),
                      id: prev.id,
                      name: prev.name,
                      description: prev.description,
                      isBuiltIn: false,
                      isCustom: true,
                    }));
                  }}
                  className="!min-h-9 !py-1 !text-xs"
                >
                  <option value="">Escolher tema base...</option>
                  {allThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Identificação e Modo */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="custom-theme-name">Nome do Tema</label>
                <input
                  id="custom-theme-name"
                  type="text"
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex.: Império de Cristal"
                />
              </div>
              <div>
                <label htmlFor="custom-theme-mode">Modo Base (Claro ou Escuro)</label>
                <select
                  id="custom-theme-mode"
                  value={editingTheme.mode}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      mode: e.target.value as "light" | "dark",
                    }))
                  }
                >
                  <option value="dark">Modo Escuro</option>
                  <option value="light">Modo Claro</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="custom-theme-desc">Descrição</label>
                <input
                  id="custom-theme-desc"
                  type="text"
                  value={editingTheme.description}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descreva a inspiração deste tema..."
                />
              </div>
            </div>

            {/* Seletor de Cores do Tema */}
            <div>
              <h3 className="mb-3 text-lg">Paleta de Cores do Tema</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(
                  [
                    ["background", "Cor de Fundo Principal"],
                    ["backgroundSecondary", "Fundo Secundário"],
                    ["card", "Cor dos Cartões"],
                    ["foreground", "Texto Principal"],
                    ["mutedForeground", "Texto Secundário"],
                    ["primary", "Cor de Destaque (Primária)"],
                    ["secondary", "Botões / Fundo Secundário"],
                    ["accent", "Cor de Acento"],
                    ["hover", "Cor de Hover"],
                    ["iconPrimary", "Cor Principal dos Ícones"],
                    ["iconAccent", "Cor Secundária / Destaque dos Ícones"],
                    ["iconMuted", "Cor dos Ícones Discretos"],
                  ] as const
                ).map(([key, label]) => {
                  const fallbackVal =
                    key === "iconPrimary"
                      ? editingTheme.colors.primary
                      : key === "iconAccent"
                        ? editingTheme.colors.accent
                        : key === "iconMuted"
                          ? editingTheme.colors.mutedForeground
                          : "#8833aa";
                  const currentVal = editingTheme.colors[key] || fallbackVal;

                  const applyColorField = (val: string) => {
                    setEditingTheme((prev) => {
                      const nextColors = {
                        ...prev.colors,
                        [key]: val,
                      };
                      // Quando o usuário altera primary, accent ou mutedForeground, acompanha os ícones caso não tenham sido fixados separadamente
                      if (key === "primary") {
                        nextColors.magenta = val;
                        nextColors.ring = val;
                        nextColors.iconPrimary = val;
                        nextColors.iconColor = val;
                        nextColors.iconActive = val;
                      } else if (key === "accent") {
                        nextColors.teal = val;
                        nextColors.iconAccent = val;
                        nextColors.iconSecondary = val;
                        nextColors.iconHover = val;
                      } else if (key === "mutedForeground") {
                        nextColors.iconMuted = val;
                        nextColors.iconDisabled = val;
                      } else if (key === "iconPrimary") {
                        nextColors.iconColor = val;
                        nextColors.iconActive = val;
                      } else if (key === "iconAccent") {
                        nextColors.iconSecondary = val;
                        nextColors.iconHover = val;
                      }
                      return {
                        ...prev,
                        colors: nextColors,
                      };
                    });
                  };

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-border bg-secondary/30 p-2.5"
                    >
                      <label className="block truncate text-[10px]">{label}</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={`Seletor de cor: ${label}`}
                          value={currentVal.startsWith("#") ? currentVal : "#8833aa"}
                          onChange={(e) => applyColorField(e.target.value)}
                          className="!h-8 !min-h-8 !w-10 shrink-0 cursor-pointer !p-0.5"
                        />
                        <input
                          type="text"
                          aria-label={`Valor hexadecimal: ${label}`}
                          value={currentVal}
                          onChange={(e) => applyColorField(e.target.value)}
                          className="!min-h-8 !px-2 !py-1 font-mono !text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estilo Visual, Bordas, Sombras e Fontes */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label>Fonte de Títulos</label>
                <select
                  value={editingTheme.typography.displayFont}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, displayFont: e.target.value },
                    }))
                  }
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.label} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Fonte do Corpo de Texto</label>
                <select
                  value={editingTheme.typography.bodyFont}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, bodyFont: e.target.value },
                    }))
                  }
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.label} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Arredondamento dos Cartões ({editingTheme.visualStyle.radiusPx}px)</label>
                <input
                  type="range"
                  min={0}
                  max={28}
                  value={editingTheme.visualStyle.radiusPx}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      visualStyle: {
                        ...prev.visualStyle,
                        radiusPx: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>

              <div>
                <label>Intensidade das Sombras ({editingTheme.visualStyle.shadowIntensity}%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editingTheme.visualStyle.shadowIntensity}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      visualStyle: {
                        ...prev.visualStyle,
                        shadowIntensity: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>

              <div>
                <label>Estilo de Bordas dos Cartões</label>
                <select
                  value={editingTheme.visualStyle.cardBorderStyle}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      visualStyle: {
                        ...prev.visualStyle,
                        cardBorderStyle: e.target.value as ThemeCardBorderStyle,
                      },
                    }))
                  }
                >
                  {Object.entries(CARD_STYLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Formato dos Botões</label>
                <select
                  value={editingTheme.visualStyle.buttonShape}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      visualStyle: {
                        ...prev.visualStyle,
                        buttonShape: e.target.value as ThemeButtonShape,
                      },
                    }))
                  }
                >
                  {Object.entries(BUTTON_SHAPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Estilo de Ícones</label>
                <select
                  value={editingTheme.visualStyle.iconStyle}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      visualStyle: {
                        ...prev.visualStyle,
                        iconStyle: e.target.value as ThemeIconStyle,
                      },
                    }))
                  }
                >
                  {Object.entries(ICON_STYLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Elementos Decorativos</label>
                <select
                  value={editingTheme.visualStyle.decorationMotif}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
                      ...prev,
                      visualStyle: {
                        ...prev.visualStyle,
                        decorationMotif: e.target.value as ThemeDecorationMotif,
                      },
                    }))
                  }
                >
                  {Object.entries(MOTIF_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <button type="button" onClick={() => handleSaveCustomTheme(true)} className="btn">
                <Save className="h-4 w-4" /> Salvar e Aplicar Tema
              </button>
              <button
                type="button"
                onClick={() => handleSaveCustomTheme(false)}
                className="btn-ghost"
              >
                Salvar na Galeria
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmedName = editingTheme.name.trim() || "Tema Personalizado";
                  const toPreview: VisualTheme = {
                    ...editingTheme,
                    name: trimmedName,
                  };
                  themeActions.saveCustomTheme(toPreview);
                  themeActions.startPreviewTheme(toPreview.id);
                }}
                className="btn-ghost"
              >
                <Eye className="h-4 w-4" /> Testar na Interface
              </button>
            </div>
          </div>

          {/* Painel Lateral de Prévia ao Vivo e Verificação de Contraste */}
          <div className="space-y-5 lg:col-span-5">
            <div className="card-luxe p-5 space-y-4">
              <h3 className="text-xl">Prévia em Tempo Real</h3>
              <ThemeMiniPreview theme={editingTheme} />

              <div className="rounded-xl border border-border bg-secondary/40 p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Índice de Contraste (Texto / Fundo):</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-semibold ${
                      contrastRatio >= 4.5
                        ? "bg-primary/20 text-foreground"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {contrastRatio}:1{" "}
                    {contrastRatio >= 4.5 ? "(Ótima Legibilidade)" : "(Contraste Baixo)"}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  O sistema ajusta automaticamente o texto sobre botões de destaque para garantir
                  leitura confortável.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 3: MODO AUTOMÁTICO DIA/NOITE & TEMAS POR LIVRO OU MUNDO
      ===================================================================== */}
      {activeTab === "contextos" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Modo Automático Dia / Noite */}
          <div className="card-luxe p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-2xl">Modo Automático Dia / Noite</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs normal-case">
                <input
                  type="checkbox"
                  checked={themeState.schedule.enabled}
                  onChange={(e) => themeActions.updateSchedule({ enabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>Ativar troca automática</span>
              </label>
            </div>

            <p className="text-xs text-muted-foreground">
              Escolha um tema para usar durante o dia e outro tema para usar automaticamente à
              noite.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-primary" /> Tema para o Dia
                </label>
                <select
                  value={themeState.schedule.dayThemeId}
                  onChange={(e) => themeActions.updateSchedule({ dayThemeId: e.target.value })}
                >
                  {allThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.mode === "light" ? "Claro" : "Escuro"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-primary" /> Tema para a Noite
                </label>
                <select
                  value={themeState.schedule.nightThemeId}
                  onChange={(e) => themeActions.updateSchedule({ nightThemeId: e.target.value })}
                >
                  {allThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.mode === "light" ? "Claro" : "Escuro"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Início do Período Diurno (Hora)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={themeState.schedule.dayStartHour}
                  onChange={(e) =>
                    themeActions.updateSchedule({
                      dayStartHour: Math.max(0, Math.min(23, Number(e.target.value))),
                    })
                  }
                />
              </div>

              <div>
                <label>Início do Período Noturno (Hora)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={themeState.schedule.nightStartHour}
                  onChange={(e) =>
                    themeActions.updateSchedule({
                      nightStartHour: Math.max(0, Math.min(23, Number(e.target.value))),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Tema por Livro */}
          <div className="card-luxe p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-2xl">Tema Exclusivo por Livro</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Associe um tema visual específico a cada livro da saga. Ao abrir a página do livro, o
              Meu Livro Físico ou seus Capítulos, o tema será ativado automaticamente.
            </p>

            <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
              {books.map((book) => {
                const currentOverride = themeState.bookThemeOverrides[book.id] ?? "";
                return (
                  <div
                    key={book.id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center"
                  >
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Livro {book.order}
                      </span>
                      <h4 className="text-sm font-semibold">{book.title}</h4>
                    </div>
                    <select
                      aria-label={`Tema do livro ${book.title}`}
                      value={currentOverride}
                      onChange={(e) =>
                        themeActions.setBookThemeOverride(
                          book.id,
                          e.target.value ? e.target.value : null,
                        )
                      }
                      className="!min-h-9 sm:!w-56 !py-1 !text-xs"
                    >
                      <option value="">Usar Tema Global Padrão</option>
                      {allThemes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tema por Mundo / Registro da Enciclopédia */}
          <div className="card-luxe p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Globe2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl">Tema por Mundo ou País da Enciclopédia</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Vincule uma atmosfera visual própria para seus mundos, reinos ou países cadastrados na
              Enciclopédia.
            </p>

            {worldRecords.length === 0 ? (
              <p className="rounded-xl border border-border bg-secondary/20 p-4 text-xs text-muted-foreground">
                Nenhum país ou mundo cadastrado ainda na Enciclopédia. Quando criar registros em
                Enciclopédia & Universo, você poderá associar temas exclusivos a eles aqui.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {worldRecords.map((rec) => {
                  const currentOverride = themeState.worldThemeOverrides[rec.id] ?? "";
                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/30 p-3"
                    >
                      <div className="truncate">
                        <span className="text-[10px] uppercase text-muted-foreground">
                          {rec.category}
                        </span>
                        <h4 className="truncate text-sm font-semibold">
                          {rec.name || "Registro sem nome"}
                        </h4>
                      </div>
                      <select
                        value={currentOverride}
                        onChange={(e) =>
                          themeActions.setWorldThemeOverride(
                            rec.id,
                            e.target.value ? e.target.value : null,
                          )
                        }
                        className="!min-h-9 !w-48 shrink-0 !py-1 !text-xs"
                      >
                        <option value="">Tema Global</option>
                        {allThemes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 4: CONFORTO VISUAL, ELEMENTOS DECORATIVOS E ACESSIBILIDADE
      ===================================================================== */}
      {activeTab === "acessibilidade" && (
        <div className="card-luxe p-6 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <Layers className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-2xl">Elementos Decorativos, Animações e Acessibilidade</h2>
              <p className="text-xs text-muted-foreground">
                Controle a intensidade dos ornamentos temáticos, animações e contraste para longas
                sessões de escrita.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 cursor-pointer normal-case">
              <input
                type="checkbox"
                checked={themeState.accessibility.showDecorations}
                onChange={(e) =>
                  themeActions.updateAccessibility({ showDecorations: e.target.checked })
                }
                className="mt-1 h-4 w-4"
              />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Exibir Elementos Decorativos Temáticos
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mostra ilustrações sutis de fundo (como laços Coquette, flores de cerejeira,
                  constelações ou circuitos neon) conforme o tema ativo.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 cursor-pointer normal-case">
              <input
                type="checkbox"
                checked={themeState.accessibility.enableAnimations}
                onChange={(e) =>
                  themeActions.updateAccessibility({ enableAnimations: e.target.checked })
                }
                className="mt-1 h-4 w-4"
              />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Ativar Transições e Animações Suaves
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Desative caso prefira transições instantâneas ou redução de movimento.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 cursor-pointer normal-case">
              <input
                type="checkbox"
                checked={themeState.accessibility.highContrast}
                onChange={(e) =>
                  themeActions.updateAccessibility({ highContrast: e.target.checked })
                }
                className="mt-1 h-4 w-4"
              />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Modo de Alto Contraste de Leitura
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reforça a nitidez de textos e bordas em qualquer tema claro ou escuro para máxima
                  legibilidade.
                </p>
              </div>
            </label>

            <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
              <div>
                <label>Intensidade dos Elementos Decorativos</label>
                <select
                  value={themeState.accessibility.decorationIntensity}
                  onChange={(e) =>
                    themeActions.updateAccessibility({
                      decorationIntensity: e.target.value as "subtle" | "medium" | "vibrant",
                    })
                  }
                >
                  <option value="subtle">Discreta (Recomendado para escrita)</option>
                  <option value="medium">Equilibrada</option>
                  <option value="vibrant">Expressiva</option>
                </select>
              </div>

              <div>
                <label>Escala de Espaçamento da Interface</label>
                <select
                  value={themeState.accessibility.spacingScale}
                  onChange={(e) =>
                    themeActions.updateAccessibility({
                      spacingScale: e.target.value as ThemeSpacingScale,
                    })
                  }
                >
                  <option value="compact">Compacto</option>
                  <option value="default">Padrão Equilibrado</option>
                  <option value="relaxed">Amplo & Arejado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

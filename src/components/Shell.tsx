import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Home,
  Library,
  Users,
  Heart,
  ScrollText,
  Globe2,
  Images,
  Sparkles,
  Palette,
  Menu,
  X,
  Check,
  Eye,
  Sun,
  Moon,
  History,
  Music,
  Lightbulb,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import {
  useThemeStore,
  themeActions,
  getAllThemes,
  getThemeById,
  applyCurrentThemeToDocument,
  setThemeContextOverride,
} from "@/lib/themes";
import { ThemeDecorations } from "@/components/ThemeDecorations";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/biblioteca", label: "Biblioteca", icon: Library },
  { to: "/estudio", label: "Meu Livro Físico", icon: BookOpen },
  { to: "/laboratorio-de-ideias", label: "Laboratório de Ideias", icon: Lightbulb },
  { to: "/linha-do-tempo", label: "Linha do Tempo", icon: History },
  { to: "/music-room", label: "Music Room", icon: Music },
  { to: "/personagens", label: "Personagens", icon: Users },
  { to: "/casais", label: "Casais", icon: Heart },
  { to: "/capitulos", label: "Capítulos", icon: ScrollText },
  { to: "/universo", label: "Enciclopédia & Universo", icon: Globe2 },
  { to: "/moodboards", label: "Moodboards", icon: Images },
  { to: "/configuracoes", label: "Configurações · Temas", icon: Palette },
] as const;

const MOBILE = [NAV[0], NAV[1], NAV[3], NAV[10]];

export function Shell({ children }: { children: ReactNode }) {
  const [more, setMore] = useState(false);
  const [quickThemeOpen, setQuickThemeOpen] = useState(false);

  const themeState = useThemeStore((s) => s);
  const allThemes = getAllThemes(themeState);
  const activeTheme = getThemeById(themeState.activeThemeId, themeState);
  const previewTheme = themeState.previewThemeId
    ? getThemeById(themeState.previewThemeId, themeState)
    : null;

  // Detecta automaticamente contexto de livro nas rotas /livros/$id, /estudio/$id ou /capitulos?livro=id
  const routerLocation = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    const path = routerLocation.pathname || "";
    const searchStr = routerLocation.searchStr || "";
    let bookId: string | null = null;

    const matchLivro = path.match(/^\/(?:livros|estudio)\/([^/]+)/);
    if (matchLivro?.[1]) {
      bookId = decodeURIComponent(matchLivro[1]);
    } else if (path.startsWith("/capitulos")) {
      const params = new URLSearchParams(searchStr);
      const qLivro = params.get("livro");
      if (qLivro) bookId = qLivro;
    }

    setThemeContextOverride({ bookId });
  }, [routerLocation.pathname, routerLocation.searchStr]);

  useEffect(() => {
    applyCurrentThemeToDocument();
  }, [
    themeState.activeThemeId,
    themeState.previewThemeId,
    themeState.schedule,
    themeState.accessibility,
    themeState.customThemes,
    themeState.bookThemeOverrides,
    themeState.worldThemeOverrides,
  ]);

  return (
    <div className="relative min-h-screen md:flex">
      <ThemeDecorations />

      {/* Barra Flutuante de Pré-visualização de Tema */}
      {previewTheme && (
        <div
          className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur"
          data-testid="theme-preview-banner"
        >
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-primary" />
            <span>
              Pré-visualizando o tema <strong>{previewTheme.name}</strong>
            </span>
            <div className="ml-2 hidden items-center gap-1 sm:flex">
              {previewTheme.paletteSwatches.map((hex, idx) => (
                <span
                  key={idx}
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => themeActions.applyTheme(previewTheme.id)}
              className="btn !min-h-9 !px-3.5 !py-1.5 !text-xs"
            >
              <Check className="h-3.5 w-3.5" /> Aplicar Tema
            </button>
            <button
              type="button"
              onClick={() => themeActions.stopPreviewTheme()}
              className="btn-ghost !min-h-9 !px-3.5 !py-1.5 !text-xs"
            >
              Cancelar Prévia
            </button>
          </div>
        </div>
      )}

      <aside className="relative z-20 sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-background/80 p-5 backdrop-blur-sm md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-icon-accent" />
          <span className="font-display text-xl leading-tight">
            Juramentos do Destino <em className="text-primary">Studio</em>
          </span>
        </Link>
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex items-center gap-3 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{
                className: "!bg-secondary !text-foreground font-medium [&_svg]:!text-icon-active",
              }}
            >
              <Icon className="h-4 w-4 shrink-0 text-icon-primary transition-colors group-hover:text-icon-hover" />{" "}
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Seletor Rápido de Tema no Rodapé Lateral */}
        <div className="mt-auto pt-4 border-t border-border/60">
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickThemeOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-left text-xs transition-colors hover:bg-secondary"
              aria-label="Seletor rápido de tema"
              data-testid="quick-theme-trigger"
            >
              <span className="flex items-center gap-2 truncate">
                {activeTheme.mode === "light" ? (
                  <Sun className="h-3.5 w-3.5 text-primary shrink-0" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
                <span className="truncate font-medium">{activeTheme.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                {activeTheme.paletteSwatches.slice(0, 3).map((hex, i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full border border-border"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </span>
            </button>

            {quickThemeOpen && (
              <div
                className="card-luxe absolute bottom-12 left-0 right-0 z-50 max-h-72 overflow-y-auto p-2 shadow-xl"
                data-testid="quick-theme-popover"
              >
                <div className="mb-1.5 flex items-center justify-between px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span>Troca Rápida</span>
                  <Link
                    to="/configuracoes"
                    onClick={() => setQuickThemeOpen(false)}
                    className="text-primary hover:underline"
                  >
                    Galeria →
                  </Link>
                </div>
                <div className="space-y-1">
                  {allThemes.map((t) => {
                    const isSelected = t.id === themeState.activeThemeId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          themeActions.applyTheme(t.id);
                          setQuickThemeOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          {t.paletteSwatches.slice(0, 3).map((hex, idx) => (
                            <span
                              key={idx}
                              className="h-2.5 w-2.5 rounded-full border border-white/25"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Dados salvos neste navegador.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-background/85 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-icon-accent" />
          <span className="font-display text-lg">
            Juramentos <em className="text-primary">Studio</em>
          </span>
        </div>
        <Link
          to="/configuracoes"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs"
          aria-label="Abrir Temas e Aparência"
        >
          <Palette className="h-3.5 w-3.5 text-icon-primary" />
          <span className="max-w-[90px] truncate">{activeTheme.name}</span>
        </Link>
      </header>

      <main
        className={`relative z-10 min-w-0 flex-1 px-4 pb-28 pt-5 md:px-10 md:pb-10 md:pt-8 ${
          previewTheme ? "mt-12" : ""
        }`}
      >
        {children}
      </main>

      {more && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
          onClick={() => setMore(false)}
        >
          <nav
            className="card-luxe absolute inset-x-3 bottom-20 grid grid-cols-2 gap-2 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMore(false)}
                activeOptions={{ exact: to === "/" }}
                className="group flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm hover:bg-secondary"
                activeProps={{ className: "!bg-secondary !text-primary [&_svg]:!text-icon-active" }}
              >
                <Icon className="h-4 w-4 shrink-0 text-icon-primary group-hover:text-icon-hover" />{" "}
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {MOBILE.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMore(false)}
            activeOptions={{ exact: to === "/" }}
            className="group flex min-h-14 flex-col items-center justify-center gap-1 text-[0.65rem] text-muted-foreground"
            activeProps={{ className: "!text-primary [&_svg]:!text-icon-active" }}
          >
            <Icon className="h-5 w-5 text-icon-primary group-hover:text-icon-hover" />{" "}
            <span className="truncate">
              {label
                .replace("Meu Livro Físico", "Estúdio")
                .replace("Configurações · Temas", "Temas")}
            </span>
          </Link>
        ))}
        <button
          onClick={() => setMore((m) => !m)}
          className="group flex min-h-14 flex-col items-center justify-center gap-1 text-[0.65rem] text-muted-foreground"
          aria-label="Mais opções"
        >
          {more ? (
            <X className="h-5 w-5 text-icon-active" />
          ) : (
            <Menu className="h-5 w-5 text-icon-primary group-hover:text-icon-hover" />
          )}{" "}
          Mais
        </button>
      </nav>
    </div>
  );
}

export function SoonPage({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl">{title}</h1>
      <div className="card-luxe mt-6 p-6">
        <span className="chip">Ainda não disponível</span>
        <p className="mt-3 text-muted-foreground">
          Esta área faz parte das próximas entregas. O que está planejado:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

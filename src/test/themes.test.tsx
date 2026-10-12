import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import {
  BUILTIN_THEMES,
  THEME_CATEGORIES,
  themeActions,
  useThemeStore,
  getAllThemes,
  getThemeById,
  resolveEffectiveTheme,
  resolveScheduledThemeId,
  getContrastRatio,
  ensureReadableForeground,
  applyCurrentThemeToDocument,
} from "@/lib/themes";
import { Route as ConfigRoute } from "@/routes/configuracoes";
import { actions } from "@/lib/store";

const ConfigComponent = ConfigRoute.options.component!;

function ThemeProbe() {
  const st = useThemeStore((s) => s);
  const effective = resolveEffectiveTheme(undefined, st);
  return (
    <div>
      <span data-testid="probe-active">{st.activeThemeId}</span>
      <span data-testid="probe-preview">{st.previewThemeId ?? "none"}</span>
      <span data-testid="probe-effective">{effective.id}</span>
      <span data-testid="probe-favs">{st.favoriteThemeIds.join(",")}</span>
      <span data-testid="probe-custom-count">{st.customThemes.length}</span>
    </div>
  );
}

describe("Spectral Archive Studio — Sistema Completo de Temas Visuais", () => {
  beforeEach(() => {
    cleanup();
    actions.resetStoreForTests();
    themeActions.resetThemesForTests();
  });

  it("1. Contém todos os 15 temas iniciais oficiais com estrutura visual completa", () => {
    expect(BUILTIN_THEMES).toHaveLength(15);

    const expectedNames = [
      "Spectral Original",
      "Pink Dream",
      "Coquette",
      "Cherry Blossom",
      "Dark Academia",
      "Classic Library",
      "Sage Garden",
      "Ocean Breeze",
      "Lavender Dreams",
      "Midnight Galaxy",
      "Mystic Fantasy",
      "Cyberpunk Neon",
      "Cottagecore",
      "Royal Gold",
      "Minimal Light",
    ];

    const actualNames = BUILTIN_THEMES.map((t) => t.name);
    expect(actualNames).toEqual(expectedNames);

    // Verifica que cada um dos 15 temas possui paleta, cores completas, tipografia e estilo visual
    for (const theme of BUILTIN_THEMES) {
      expect(theme.paletteSwatches).toHaveLength(5);
      expect(theme.colors.background).toBeTruthy();
      expect(theme.colors.foreground).toBeTruthy();
      expect(theme.colors.primary).toBeTruthy();
      expect(theme.colors.card).toBeTruthy();
      expect(theme.typography.displayFont).toBeTruthy();
      expect(theme.typography.bodyFont).toBeTruthy();
      expect(theme.visualStyle.cardBorderStyle).toBeTruthy();
      expect(theme.visualStyle.buttonShape).toBeTruthy();
      expect(theme.visualStyle.iconStyle).toBeTruthy();
      expect(theme.visualStyle.decorationMotif).toBeTruthy();
    }
  });

  it("2. Organiza temas por todas as 9 categorias solicitadas", () => {
    expect(THEME_CATEGORIES).toEqual([
      "Todos",
      "Claros",
      "Escuros",
      "Românticos",
      "Fantasia",
      "Acadêmicos",
      "Naturais",
      "Futuristas",
      "Personalizados",
    ]);

    expect(BUILTIN_THEMES.some((t) => t.categories.includes("Claros"))).toBe(true);
    expect(BUILTIN_THEMES.some((t) => t.categories.includes("Escuros"))).toBe(true);
    expect(BUILTIN_THEMES.some((t) => t.categories.includes("Românticos"))).toBe(true);
    expect(BUILTIN_THEMES.some((t) => t.categories.includes("Fantasia"))).toBe(true);
    expect(BUILTIN_THEMES.some((t) => t.categories.includes("Acadêmicos"))).toBe(true);
    expect(BUILTIN_THEMES.some((t) => t.categories.includes("Naturais"))).toBe(true);
    expect(BUILTIN_THEMES.some((t) => t.categories.includes("Futuristas"))).toBe(true);
  });

  it("3. Aplica temas em tempo real no documento HTML e salva no localStorage", () => {
    render(<ThemeProbe />);
    expect(screen.getByTestId("probe-active").textContent).toBe("spectral-original");

    act(() => {
      themeActions.applyTheme("coquette");
    });
    expect(screen.getByTestId("probe-active").textContent).toBe("coquette");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("coquette");
    expect(document.documentElement.getAttribute("data-theme-mode")).toBe("light");
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#B81D38");

    // Verifica persistência no localStorage
    const savedRaw = localStorage.getItem("spectral-archive-themes-v1");
    expect(savedRaw).toBeTruthy();
    const parsed = JSON.parse(savedRaw!);
    expect(parsed.activeThemeId).toBe("coquette");
  });

  it("4. Permite pré-visualizar um tema sem sobrescrever o tema ativo até confirmar", () => {
    render(<ThemeProbe />);
    expect(screen.getByTestId("probe-active").textContent).toBe("spectral-original");

    // Inicia prévia de Cyberpunk Neon
    act(() => {
      themeActions.startPreviewTheme("cyberpunk-neon");
    });
    expect(screen.getByTestId("probe-preview").textContent).toBe("cyberpunk-neon");
    expect(screen.getByTestId("probe-effective").textContent).toBe("cyberpunk-neon");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("cyberpunk-neon");

    // Cancela prévia: volta imediatamente ao Spectral Original
    act(() => {
      themeActions.stopPreviewTheme();
    });
    expect(screen.getByTestId("probe-preview").textContent).toBe("none");
    expect(screen.getByTestId("probe-effective").textContent).toBe("spectral-original");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("spectral-original");
  });

  it("5. Permite favoritar e desfavoritar temas com persistência", () => {
    render(<ThemeProbe />);
    expect(screen.getByTestId("probe-favs").textContent).not.toContain("ocean-breeze");

    act(() => {
      themeActions.toggleFavoriteTheme("ocean-breeze");
    });
    expect(screen.getByTestId("probe-favs").textContent).toContain("ocean-breeze");

    act(() => {
      themeActions.toggleFavoriteTheme("ocean-breeze");
    });
    expect(screen.getByTestId("probe-favs").textContent).not.toContain("ocean-breeze");
  });

  it("6. Permite criar, editar, duplicar e excluir temas personalizados", () => {
    render(<ThemeProbe />);
    expect(screen.getByTestId("probe-custom-count").textContent).toBe("0");

    // Cria tema personalizado
    const draft = themeActions.createBlankCustomTheme("royal-gold");
    draft.name = "Império Solar";
    draft.colors.primary = "#FFAA00";
    act(() => {
      themeActions.saveCustomTheme(draft);
    });

    expect(screen.getByTestId("probe-custom-count").textContent).toBe("1");
    expect(getThemeById(draft.id).name).toBe("Império Solar");

    // Edita tema personalizado
    act(() => {
      themeActions.saveCustomTheme({ ...draft, name: "Império Solar Dourado" });
    });
    expect(getThemeById(draft.id).name).toBe("Império Solar Dourado");

    // Duplica tema
    let duplicatedName = "";
    act(() => {
      const duplicated = themeActions.duplicateThemeAsCustom(draft.id);
      duplicatedName = duplicated.name;
    });
    expect(screen.getByTestId("probe-custom-count").textContent).toBe("2");
    expect(duplicatedName).toContain("(Cópia)");

    // Aplica e depois exclui tema personalizado -> deve restaurar para Spectral Original com segurança
    act(() => {
      themeActions.applyTheme(draft.id);
    });
    expect(screen.getByTestId("probe-active").textContent).toBe(draft.id);

    act(() => {
      themeActions.deleteCustomTheme(draft.id);
    });
    expect(screen.getByTestId("probe-custom-count").textContent).toBe("1");
    expect(screen.getByTestId("probe-active").textContent).toBe("spectral-original");
  });

  it("7. Suporta Modo Automático Dia/Noite e Temas Exclusivos por Livro ou Mundo", () => {
    themeActions.updateSchedule({
      enabled: true,
      dayThemeId: "sage-garden",
      nightThemeId: "midnight-galaxy",
      dayStartHour: 6,
      nightStartHour: 19,
    });

    // Às 10h da manhã -> Sage Garden
    expect(resolveScheduledThemeId(undefined, 10)).toBe("sage-garden");
    expect(resolveEffectiveTheme({ currentHour: 10 }).id).toBe("sage-garden");

    // Às 22h da noite -> Midnight Galaxy
    expect(resolveScheduledThemeId(undefined, 22)).toBe("midnight-galaxy");
    expect(resolveEffectiveTheme({ currentHour: 22 }).id).toBe("midnight-galaxy");

    // Tema exclusivo para o livro "chama" tem prioridade sobre o global
    themeActions.setBookThemeOverride("chama", "royal-gold");
    expect(resolveEffectiveTheme({ bookId: "chama", currentHour: 10 }).id).toBe("royal-gold");

    // Tema exclusivo para um mundo da enciclopédia
    themeActions.setWorldThemeOverride("wrec_1", "mystic-fantasy");
    expect(resolveEffectiveTheme({ worldRecordId: "wrec_1", currentHour: 10 }).id).toBe(
      "mystic-fantasy",
    );
  });

  it("8. Garante contraste e legibilidade em todos os 15 temas e suporta controles de acessibilidade", () => {
    for (const theme of BUILTIN_THEMES) {
      const ratio = getContrastRatio(theme.colors.background, theme.colors.foreground);
      expect(ratio).toBeGreaterThanOrEqual(4.5);

      const safeBtnFg = ensureReadableForeground(
        theme.colors.primary,
        theme.colors.primaryForeground,
      );
      expect(getContrastRatio(theme.colors.primary, safeBtnFg)).toBeGreaterThanOrEqual(3.0);
    }

    themeActions.updateAccessibility({
      enableAnimations: false,
      highContrast: true,
      showDecorations: false,
    });
    applyCurrentThemeToDocument();

    expect(document.documentElement.getAttribute("data-animations")).toBe("disabled");
    expect(document.documentElement.getAttribute("data-high-contrast")).toBe("true");
  });

  it("9. Renderiza a página Configurações → Aparência → Temas e permite filtrar e aplicar temas", () => {
    render(<ConfigComponent />);

    expect(screen.getByText(/Galeria & Sistema de Temas Visuais/i)).toBeInTheDocument();

    // Verifica que cartões dos temas iniciais estão renderizados
    expect(screen.getByTestId("theme-card-spectral-original")).toBeInTheDocument();
    expect(screen.getByTestId("theme-card-pink-dream")).toBeInTheDocument();
    expect(screen.getByTestId("theme-card-cyberpunk-neon")).toBeInTheDocument();

    // Filtra por categoria "Futuristas"
    const futuristasTab = screen.getByRole("tab", { name: "Futuristas" });
    fireEvent.click(futuristasTab);

    expect(screen.getByTestId("theme-card-cyberpunk-neon")).toBeInTheDocument();
    expect(screen.queryByTestId("theme-card-cottagecore")).not.toBeInTheDocument();

    // Restaura padrão com 1 clique
    const restoreBtn = screen.getByRole("button", { name: /Restaurar Padrão/i });
    fireEvent.click(restoreBtn);
    expect(screen.getByTestId("active-theme-name").textContent).toBe("Spectral Original");
  });

  it("10. Preserva todos os dados cadastrados (livros, capítulos, personagens, enciclopédia) ao alternar temas", () => {
    const char = actions.newCharacter("Protagonista");
    char.name = "Lyra Valkyrie";
    actions.saveCharacter(char);

    const chap = actions.newChapter("chama", 1);
    chap.title = "O Juramento das Cinzas";
    actions.saveChapter(chap);

    const world = actions.newWorldRecord("Fantasia — Medieval a Moderna", "Reino");
    world.name = "Reino de Solaria";
    actions.saveWorldRecord(world);

    // Troca por vários temas claros e escuros
    for (const t of getAllThemes()) {
      themeActions.applyTheme(t.id);
    }

    const rawStore = localStorage.getItem("juramentos-studio-v1");
    expect(rawStore).toBeTruthy();
    const parsedStore = JSON.parse(rawStore!);
    expect(parsedStore.characters.some((c: { name: string }) => c.name === "Lyra Valkyrie")).toBe(
      true,
    );
    expect(
      parsedStore.chapters.some((c: { title: string }) => c.title === "O Juramento das Cinzas"),
    ).toBe(true);
    expect(
      parsedStore.worldRecords.some((w: { name: string }) => w.name === "Reino de Solaria"),
    ).toBe(true);
  });

  it("11. Atualiza dinamicamente todas as variáveis de cores dos ícones em todos os 15 temas do sistema", () => {
    const root = document.documentElement;

    for (const theme of BUILTIN_THEMES) {
      act(() => {
        themeActions.applyTheme(theme.id);
      });

      const iconColor = root.style.getPropertyValue("--icon-color");
      const iconPrimary = root.style.getPropertyValue("--icon-primary");
      const iconSecondary = root.style.getPropertyValue("--icon-secondary");
      const iconAccent = root.style.getPropertyValue("--icon-accent");
      const iconMuted = root.style.getPropertyValue("--icon-muted");
      const iconActive = root.style.getPropertyValue("--icon-active");
      const iconHover = root.style.getPropertyValue("--icon-hover");
      const iconDisabled = root.style.getPropertyValue("--icon-disabled");
      const goldVar = root.style.getPropertyValue("--gold");

      expect(iconColor).toBe(theme.colors.primary);
      expect(iconPrimary).toBe(theme.colors.primary);
      expect(iconSecondary).toBe(theme.colors.accent);
      expect(iconAccent).toBe(theme.colors.accent);
      expect(iconMuted).toBe(theme.colors.mutedForeground);
      expect(iconActive).toBe(theme.colors.primary);
      expect(iconHover).toBe(theme.colors.accent);
      expect(iconDisabled).toBe(theme.colors.mutedForeground);
      expect(goldVar).toBeTruthy();

      // Garante legibilidade e contraste dos ícones em relação ao fundo principal e aos cartões
      const primaryIconContrast = getContrastRatio(theme.colors.background, iconPrimary);
      const mutedIconContrast = getContrastRatio(theme.colors.card, iconMuted);
      expect(primaryIconContrast).toBeGreaterThanOrEqual(2.5);
      expect(mutedIconContrast).toBeGreaterThanOrEqual(2.5);
    }
  });

  it("12. Sincroniza as cores dos ícones e variáveis semânticas (--teal, --magenta, --gold) em temas personalizados e na pré-visualização", () => {
    const root = document.documentElement;

    // Cria tema personalizado com paleta própria e cores de ícones customizadas
    const custom = themeActions.createBlankCustomTheme("spectral-original");
    custom.name = "Alvorada Esmeralda";
    custom.colors.primary = "#10B981";
    custom.colors.accent = "#F59E0B";
    custom.colors.mutedForeground = "#94A3B8";
    custom.colors.iconPrimary = "#059669";
    custom.colors.iconAccent = "#D97706";

    act(() => {
      themeActions.saveCustomTheme(custom);
      themeActions.startPreviewTheme(custom.id);
    });

    // Durante a pré-visualização, os ícones já devem refletir as cores do tema personalizado
    expect(root.style.getPropertyValue("--icon-primary")).toBe("#059669");
    expect(root.style.getPropertyValue("--icon-color")).toBe("#059669");
    expect(root.style.getPropertyValue("--icon-accent")).toBe("#D97706");
    expect(root.style.getPropertyValue("--icon-hover")).toBe("#D97706");
    expect(root.style.getPropertyValue("--icon-muted")).toBe("#94A3B8");
    expect(root.style.getPropertyValue("--teal")).toBe("#D97706");
    expect(root.style.getPropertyValue("--magenta")).toBe("#059669");

    // Ao cancelar a prévia, os ícones retornam imediatamente ao tema ativo (Spectral Original)
    act(() => {
      themeActions.stopPreviewTheme();
    });
    expect(root.style.getPropertyValue("--icon-primary")).toBe("#E83888");
    expect(root.style.getPropertyValue("--icon-accent")).toBe("#4CD4C8");

    // Ao aplicar o tema personalizado e editar suas cores no Criador de Temas
    render(<ConfigComponent />);
    const creatorTabBtn = screen.getByRole("button", { name: /Criador de Tema Personalizado/i });
    fireEvent.click(creatorTabBtn);

    const primaryHexInput = screen.getByLabelText(
      /Valor hexadecimal: Cor de Destaque \(Primária\)/i,
    );
    fireEvent.change(primaryHexInput, { target: { value: "#3B82F6" } });

    const accentHexInput = screen.getByLabelText(/Valor hexadecimal: Cor de Acento/i);
    fireEvent.change(accentHexInput, { target: { value: "#EC4899" } });

    const saveAndApplyBtn = screen.getByRole("button", { name: /Salvar e Aplicar Tema/i });
    fireEvent.click(saveAndApplyBtn);

    expect(root.style.getPropertyValue("--primary")).toBe("#3B82F6");
    expect(root.style.getPropertyValue("--icon-primary")).toBe("#3B82F6");
    expect(root.style.getPropertyValue("--icon-color")).toBe("#3B82F6");
    expect(root.style.getPropertyValue("--icon-accent")).toBe("#EC4899");
    expect(root.style.getPropertyValue("--teal")).toBe("#EC4899");
    expect(root.style.getPropertyValue("--magenta")).toBe("#3B82F6");
  });
});

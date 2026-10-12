import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { actions, MOODBOARD_DEFAULT_CATEGORIES } from "@/lib/store";
import { themeActions } from "@/lib/themes";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useHydrated: () => true,
    useNavigate: () => vi.fn(),
    Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <a className={className}>{children}</a>
    ),
  };
});

import { Route as MoodboardsRoute } from "@/routes/moodboards";

describe("Módulo Moodboards & Galerias Estilo Pinterest", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    actions.resetStoreForTests();
    themeActions.resetThemesForTests();
    vi.spyOn(MoodboardsRoute, "useSearch").mockReturnValue({});
  });

  it("exibe o estado vazio convidativo quando não há moodboards e lista as 12 categorias iniciais", () => {
    const MoodboardsComp = MoodboardsRoute.options.component!;
    render(<MoodboardsComp />);

    expect(screen.getByTestId("moodboards-page")).toBeTruthy();
    expect(screen.getByText("Moodboards")).toBeTruthy();
    expect(
      screen.getByText(
        "Reúna inspirações, organize referências e dê vida à estética das suas histórias.",
      ),
    ).toBeTruthy();
    expect(screen.getByTestId("moodboards-empty-state")).toBeTruthy();

    // Verifica que todas as 12 categorias iniciais estão presentes
    expect(MOODBOARD_DEFAULT_CATEGORIES.length).toBe(12);
    for (const cat of MOODBOARD_DEFAULT_CATEGORIES) {
      expect(screen.getByTestId(`gallery-category-card-${cat}`)).toBeTruthy();
    }
  });

  it("permite criar, editar, duplicar, favoritar e excluir um moodboard, mantendo persistência e vínculos", () => {
    // Cadastra personagem e mundo para testar conexão
    const char = actions.newCharacter("Protagonista");
    char.name = "Ayla Solis";
    actions.saveCharacter(char);

    const world = actions.newWorldRecord("Fantasia — Medieval a Moderna", "Reino");
    world.name = "Império de Solária";
    actions.saveWorldRecord(world);

    const MoodboardsComp = MoodboardsRoute.options.component!;
    render(<MoodboardsComp />);

    // Abre modal de novo moodboard
    fireEvent.click(screen.getByTestId("btn-novo-moodboard"));
    expect(screen.getByTestId("modal-moodboard-form")).toBeTruthy();

    fireEvent.change(screen.getByTestId("input-moodboard-name"), {
      target: { value: "Estética da Corte Solar" },
    });
    fireEvent.change(screen.getByTestId("select-moodboard-category"), {
      target: { value: "Figurinos e moda" },
    });
    fireEvent.change(screen.getByTestId("input-moodboard-description"), {
      target: { value: "Tecidos dourados, bordados de fogo e joias imperiais." },
    });

    // Adiciona cor à paleta e tag
    fireEvent.click(screen.getByTestId("btn-add-board-color"));
    fireEvent.change(screen.getByTestId("input-board-tag"), {
      target: { value: "realeza" },
    });
    fireEvent.click(screen.getByTestId("btn-add-board-tag"));

    // Vincula livro Chama, personagem Ayla Solis e mundo Império de Solária
    fireEvent.click(screen.getByTestId("toggle-board-book-chama"));
    fireEvent.click(screen.getByTestId(`toggle-board-char-${char.id}`));
    fireEvent.click(screen.getByTestId(`toggle-board-world-${world.id}`));

    // Salva moodboard
    fireEvent.click(screen.getByTestId("btn-save-moodboard"));

    expect(screen.getByText("Estética da Corte Solar")).toBeTruthy();
    expect(screen.getByText(/📖 Chama/)).toBeTruthy();
    expect(screen.getByText(/👤 Ayla Solis/)).toBeTruthy();

    // Verifica persistência no localStorage
    const raw = localStorage.getItem("juramentos-studio-v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.moodboards.length).toBe(1);
    const savedBoardId = parsed.moodboards[0].id as string;
    expect(parsed.moodboards[0].category).toBe("Figurinos e moda");
    expect(parsed.moodboards[0].bookIds).toContain("chama");
    expect(parsed.moodboards[0].characterIds).toContain(char.id);
    expect(parsed.moodboards[0].worldRecordIds).toContain(world.id);

    // Favorita o moodboard
    fireEvent.click(screen.getByTestId(`fav-moodboard-${savedBoardId}`));
    expect(screen.getByTestId("section-favorite-moodboards")).toBeTruthy();

    // Duplica o moodboard
    fireEvent.click(screen.getAllByTestId(`duplicate-moodboard-${savedBoardId}`)[0]!);
    expect(screen.getAllByText("Estética da Corte Solar (Cópia)").length).toBeGreaterThan(0);

    // Exclui a cópia com confirmação
    const afterDup = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    const copyBoard = afterDup.moodboards.find((m: { name: string }) => m.name.includes("(Cópia)"));
    expect(copyBoard).toBeTruthy();
    const copyDeleteButtons = screen.getAllByTestId(`delete-moodboard-${copyBoard.id}`);
    fireEvent.click(copyDeleteButtons[0]!);
    expect(screen.getByTestId("modal-confirm-delete-board")).toBeTruthy();
    fireEvent.click(screen.getByTestId("btn-confirm-delete-board"));

    const afterDel = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    expect(afterDel.moodboards.length).toBe(1);
  });

  it("permite adicionar imagens (pins), abrir em estilo Pinterest, ampliar no lightbox, filtrar e criar categoria personalizada", () => {
    const mb = actions.newMoodboard("Cenários e lugares");
    mb.name = "Palácio de Cristal";
    actions.saveMoodboard(mb);

    const MoodboardsComp = MoodboardsRoute.options.component!;
    render(<MoodboardsComp />);

    // Cria uma categoria personalizada
    fireEvent.click(screen.getByTestId("btn-criar-categoria-personalizada"));
    expect(screen.getByTestId("modal-custom-category")).toBeTruthy();
    fireEvent.change(screen.getByTestId("input-new-custom-category"), {
      target: { value: "Arquitetura Astral" },
    });
    fireEvent.click(screen.getByTestId("btn-confirm-custom-category"));

    // Deve abrir a galeria da nova categoria personalizada
    expect(screen.getByTestId("category-gallery-view")).toBeTruthy();
    expect(screen.getByText("Galeria: Arquitetura Astral")).toBeTruthy();

    // Adiciona uma referência visual (pin) via URL
    fireEvent.click(screen.getByTestId("btn-nova-referencia"));
    expect(screen.getByTestId("modal-pin-form")).toBeTruthy();

    fireEvent.click(screen.getByTestId("btn-mode-url"));
    fireEvent.change(screen.getByTestId("input-pin-image-url"), {
      target: {
        value: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      },
    });
    fireEvent.change(screen.getByTestId("input-pin-title"), {
      target: { value: "Torre do Observatório" },
    });
    fireEvent.change(screen.getByTestId("input-pin-caption"), {
      target: { value: "Cúpula translúcida sob aurora boreal." },
    });
    fireEvent.click(screen.getByTestId(`toggle-pin-board-${mb.id}`));
    fireEvent.click(screen.getByTestId("btn-save-pin"));

    // O cartão do pin deve aparecer no mural
    expect(screen.getByText("Torre do Observatório")).toBeTruthy();
    expect(screen.getByText("Cúpula translúcida sob aurora boreal.")).toBeTruthy();

    // Abre visualização ampliada (Lightbox) ao clicar no título do pin
    fireEvent.click(screen.getByText("Torre do Observatório"));
    expect(screen.getByTestId("pin-lightbox-modal")).toBeTruthy();

    // Alterna entre modo Pinterest e Grade
    fireEvent.click(screen.getByLabelText("Fechar visualização ampliada"));
    fireEvent.click(screen.getByTestId("btn-layout-grid"));
    fireEvent.click(screen.getByTestId("btn-layout-pinterest"));

    // Testa pesquisa por texto
    fireEvent.change(screen.getByTestId("input-search-moodboards"), {
      target: { value: "Observatório" },
    });
    expect(screen.getByText("Torre do Observatório")).toBeTruthy();

    fireEvent.change(screen.getByTestId("input-search-moodboards"), {
      target: { value: "InexistenteXYZ" },
    });
    expect(screen.queryByText("Torre do Observatório")).toBeNull();

    // Limpa filtros
    fireEvent.click(screen.getByTestId("btn-clear-filters"));
    expect(screen.getByText("Torre do Observatório")).toBeTruthy();
  });

  it("adapta os ícones e elementos visuais da página Moodboards quando o tema ativo muda", () => {
    const MoodboardsComp = MoodboardsRoute.options.component!;
    render(<MoodboardsComp />);

    themeActions.applyTheme("coquette");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("coquette");
    expect(document.documentElement.style.getPropertyValue("--icon-primary").toLowerCase()).toBe(
      "#b81d38",
    );

    themeActions.applyTheme("dark-academia");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("dark-academia");
    expect(
      document.documentElement.style.getPropertyValue("--icon-primary").toLowerCase(),
    ).not.toBe("#b81d38");
  });
});

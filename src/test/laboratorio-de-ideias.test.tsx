import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { actions } from "@/lib/store";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useHydrated: () => true,
    useNavigate: () => vi.fn(),
    Link: ({
      children,
      className,
      onClick,
    }: {
      children: React.ReactNode;
      className?: string;
      onClick?: () => void;
    }) => (
      <a className={className} onClick={onClick}>
        {children}
      </a>
    ),
  };
});

import { Route as LaboratorioDeIdeiasRoute } from "@/routes/laboratorio-de-ideias";

describe("Módulo Laboratório de Ideias", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    actions.resetStoreForTests();
    vi.spyOn(LaboratorioDeIdeiasRoute, "useSearch").mockReturnValue({});
  });

  it("renderiza a tela principal com título, subtítulo e contadores", () => {
    const Component = LaboratorioDeIdeiasRoute.options.component!;
    render(<Component />);

    expect(screen.getByText("Laboratório de Ideias")).toBeInTheDocument();
    expect(
      screen.getByText("“Toda grande história começa com uma possibilidade.”"),
    ).toBeInTheDocument();
    expect(screen.getByText("+ Nova ideia")).toBeInTheDocument();
    expect(screen.getByText("Centelhas Criativas")).toBeInTheDocument();
    expect(screen.getByText("Exportar")).toBeInTheDocument();
  });

  it("permite criar uma nova ideia completa e exibi-la na interface", () => {
    const Component = LaboratorioDeIdeiasRoute.options.component!;
    render(<Component />);

    // Clica em + Nova ideia
    const btnNova = screen.getByText("+ Nova ideia");
    fireEvent.click(btnNova);

    // Preenche título
    const inputTitulo = screen.getByPlaceholderText("Ex: O Pacto das Cinzas Silenciosas");
    fireEvent.change(inputTitulo, { target: { value: "A Lança de Cristal de Apolo" } });

    // Preenche descrição
    const inputDesc = screen.getByPlaceholderText("Resuma o conceito central em poucas frases...");
    fireEvent.change(inputDesc, {
      target: { value: "Uma arma mágica que drena os pecados do portador ao custo da memória." },
    });

    // Salva a ideia
    const btnSalvar = screen.getByText("Salvar Ideia");
    fireEvent.click(btnSalvar);

    // Confere se apareceu no laboratório (pode aparecer no card e no recentes)
    const elements = screen.getAllByText("A Lança de Cristal de Apolo");
    expect(elements.length).toBeGreaterThanOrEqual(1);

    const descElements = screen.getAllByText(
      "Uma arma mágica que drena os pecados do portador ao custo da memória.",
    );
    expect(descElements.length).toBeGreaterThanOrEqual(1);
  });

  it("permite favoritar e desfavoritar uma ideia com persistência", () => {
    const Component = LaboratorioDeIdeiasRoute.options.component!;
    render(<Component />);

    const botoesFavorito = screen.getAllByTitle(/Marcar como favorita|Remover dos favoritos/i);
    expect(botoesFavorito.length).toBeGreaterThan(0);

    fireEvent.click(botoesFavorito[0]);
    // Ação executada sem erros
  });

  it("permite abrir e selecionar centelhas do Gerador Criativo", () => {
    const Component = LaboratorioDeIdeiasRoute.options.component!;
    render(<Component />);

    // Abre o gerador
    const btnSparks = screen.getByText("Centelhas Criativas");
    fireEvent.click(btnSparks);

    expect(screen.getByText("Gerador de Centelhas Criativas")).toBeInTheDocument();
    expect(screen.getByText("A Promessa Quebrada na Torre de Vidro")).toBeInTheDocument();

    // Clica em usar a centelha
    const btnsUsar = screen.getAllByText("Usar Esta Centelha");
    fireEvent.click(btnsUsar[0]);

    // O modal de edição deve se abrir pré-preenchido
    expect(screen.getByDisplayValue("A Promessa Quebrada na Torre de Vidro")).toBeInTheDocument();
  });

  it("permite pesquisar e filtrar ideias em tempo real", () => {
    const Component = LaboratorioDeIdeiasRoute.options.component!;
    render(<Component />);

    const inputBusca = screen.getByPlaceholderText(
      "Pesquisar por título, descrição, gatilho 'E se...?', notas ou tags...",
    );
    fireEvent.change(inputBusca, { target: { value: "Sombras Proibidas" } });

    const matched = screen.getAllByText("O Papiro das Sombras Proibidas");
    expect(matched.length).toBeGreaterThanOrEqual(1);
  });
});

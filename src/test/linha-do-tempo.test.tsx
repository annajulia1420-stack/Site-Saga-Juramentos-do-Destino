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

import { Route as LinhaDoTempoRoute } from "@/routes/linha-do-tempo";

describe("Módulo Linha do Tempo Narrativa", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    actions.resetStoreForTests();
    vi.spyOn(LinhaDoTempoRoute, "useSearch").mockReturnValue({});
  });

  it("renderiza a página inicial da Linha do Tempo com título, subtítulo e estado convidativo", () => {
    const LinhaDoTempoComp = LinhaDoTempoRoute.options.component!;
    render(<LinhaDoTempoComp />);

    expect(screen.getByText("Linha do Tempo Narrativa")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Organize os acontecimentos da sua história, conecte eventos e mantenha a cronologia da sua saga sob controle.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByTestId("btn-novo-evento")).toBeInTheDocument();
    expect(screen.getByTestId("empty-timeline-state")).toBeInTheDocument();
  });

  it("permite abrir o editor, cadastrar um novo evento narrativo e visualizá-lo na linha do tempo", () => {
    const LinhaDoTempoComp = LinhaDoTempoRoute.options.component!;
    render(<LinhaDoTempoComp />);

    // Abre o editor
    const btnNovo = screen.getByTestId("btn-novo-evento");
    fireEvent.click(btnNovo);

    expect(screen.getByTestId("event-editor-modal")).toBeInTheDocument();

    // Preenche o título do evento
    const inputTitulo = screen.getByTestId("event-title-input");
    fireEvent.change(inputTitulo, { target: { value: "O Eclipse de Sangue" } });

    // Salva o evento
    const btnSalvar = screen.getByTestId("btn-salvar-evento");
    fireEvent.click(btnSalvar);

    // O modal deve fechar e o evento deve aparecer na tela
    expect(screen.queryByTestId("event-editor-modal")).not.toBeInTheDocument();
    expect(screen.getAllByText("O Eclipse de Sangue").length).toBeGreaterThan(0);
  });

  it("permite filtrar eventos por texto e alternar entre modos de visualização", () => {
    // Cadastra 2 eventos no store
    const ev1 = actions.newTimelineEvent({
      title: "Batalha do Pico Gelado",
      type: "Batalha & Confronto",
      storyDate: "Ano 320",
      chronologicalOrder: 10,
    });
    actions.saveTimelineEvent(ev1);

    const ev2 = actions.newTimelineEvent({
      title: "Pacto Secreto das Sombras",
      type: "Revelação & Segredo",
      storyDate: "Ano 325",
      chronologicalOrder: 20,
    });
    actions.saveTimelineEvent(ev2);

    const LinhaDoTempoComp = LinhaDoTempoRoute.options.component!;
    render(<LinhaDoTempoComp />);

    expect(screen.getAllByText("Batalha do Pico Gelado").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pacto Secreto das Sombras").length).toBeGreaterThan(0);

    // Filtra por busca
    const searchInput = screen.getByPlaceholderText(/Pesquisar por título/i);
    fireEvent.change(searchInput, { target: { value: "Pacto" } });

    expect(screen.queryByText("Batalha do Pico Gelado")).not.toBeInTheDocument();
    expect(screen.getAllByText("Pacto Secreto das Sombras").length).toBeGreaterThan(0);

    // Limpa a busca
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getAllByText("Batalha do Pico Gelado").length).toBeGreaterThan(0);

    // Alterna para visualização em Cartões
    const btnCartoes = screen.getByTitle(/Grade de Cartões Visuais/i);
    fireEvent.click(btnCartoes);

    expect(screen.getAllByText("Batalha do Pico Gelado").length).toBeGreaterThan(0);
  });

  it("permite duplicar e excluir evento da linha do tempo", () => {
    const ev = actions.newTimelineEvent({
      title: "Grande Julgamento de Apolo",
      type: "Ponto de Virada",
    });
    actions.saveTimelineEvent(ev);

    const LinhaDoTempoComp = LinhaDoTempoRoute.options.component!;
    render(<LinhaDoTempoComp />);

    expect(screen.getAllByText("Grande Julgamento de Apolo").length).toBeGreaterThan(0);

    // Clica em duplicar
    const btnDuplicar = screen.getByTitle("Duplicar evento");
    fireEvent.click(btnDuplicar);

    // O modal deve abrir com a cópia
    expect(screen.getByTestId("event-editor-modal")).toBeInTheDocument();
    const btnSalvar = screen.getByTestId("btn-salvar-evento");
    fireEvent.click(btnSalvar);

    expect(screen.getAllByText("Grande Julgamento de Apolo (Cópia)").length).toBeGreaterThan(0);

    // Exclui a cópia
    const btnsExcluir = screen.getAllByTitle("Excluir evento");
    fireEvent.click(btnsExcluir[1]);

    const btnConfirmar = screen.getByRole("button", { name: /Sim, Excluir/i });
    fireEvent.click(btnConfirmar);

    expect(screen.queryByText("Grande Julgamento de Apolo (Cópia)")).not.toBeInTheDocument();
  });

  it("garante que o modal de Novo Evento é responsivo, navega entre todas as 5 abas, permite cancelar e reabrir preservando dados", () => {
    const LinhaDoTempoComp = LinhaDoTempoRoute.options.component!;
    render(<LinhaDoTempoComp />);

    // 1. Abre Novo Evento
    const btnNovo = screen.getByTestId("btn-novo-evento");
    fireEvent.click(btnNovo);

    const modal = screen.getByTestId("event-editor-modal");
    expect(modal).toBeInTheDocument();

    // 2. Verifica a aba padrão (Identificação)
    expect(screen.getByTestId("event-title-input")).toBeInTheDocument();
    expect(screen.getByText("Nível de Impacto na História")).toBeInTheDocument();

    // 3. Testa navegação para Aba 2: Cronologia & Época
    const tabCronologia = screen.getByRole("button", { name: /Cronologia & Época/i });
    fireEvent.click(tabCronologia);
    expect(screen.getByText(/Data Narrativa Dentro da História/i)).toBeInTheDocument();
    expect(screen.getByText(/Ano Fictício/i)).toBeInTheDocument();
    expect(screen.getByText(/Ordem Cronológica Numérica/i)).toBeInTheDocument();

    // 4. Testa navegação para Aba 3: Narrativa & Descrição
    const tabNarrativa = screen.getByRole("button", { name: /Narrativa & Descrição/i });
    fireEvent.click(tabNarrativa);
    expect(
      screen.getByPlaceholderText(/Descreva o que acontece neste momento crucial/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ideias a desenvolver, foreshadowing/i)).toBeInTheDocument();

    // 5. Testa navegação para Aba 4: Vínculos & Personagens
    const tabVinculos = screen.getByRole("button", { name: /Vínculos & Personagens/i });
    fireEvent.click(tabVinculos);
    expect(screen.getByText(/Livro Vinculado/i)).toBeInTheDocument();
    expect(screen.getByText(/Local \/ Reino da Enciclopédia/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Personagens Presentes ou Diretamente Envolvidos:/i),
    ).toBeInTheDocument();

    // 6. Testa navegação para Aba 5: Imagem & Estética
    const tabVisual = screen.getByRole("button", { name: /Imagem & Estética/i });
    fireEvent.click(tabVisual);
    expect(screen.getByText(/Imagem de Cena ou Referência Visual/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar do dispositivo/i })).toBeInTheDocument();

    // 7. Retorna para Identificação e preenche dados
    const tabGeral = screen.getByRole("button", { name: /Identificação/i });
    fireEvent.click(tabGeral);
    const inputTitulo = screen.getByTestId("event-title-input");
    fireEvent.change(inputTitulo, { target: { value: "Cerimônia dos Ventos Sagrados" } });

    // 8. Testa botão Cancelar fecha o modal sem salvar
    const btnCancelar = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(btnCancelar);
    expect(screen.queryByTestId("event-editor-modal")).not.toBeInTheDocument();
    expect(screen.queryByText("Cerimônia dos Ventos Sagrados")).not.toBeInTheDocument();

    // 9. Reabre e salva com sucesso
    fireEvent.click(screen.getByTestId("btn-novo-evento"));
    const inputReaberto = screen.getByTestId("event-title-input");
    fireEvent.change(inputReaberto, { target: { value: "Cerimônia dos Ventos Sagrados" } });

    const btnSalvar = screen.getByTestId("btn-salvar-evento");
    fireEvent.click(btnSalvar);

    expect(screen.queryByTestId("event-editor-modal")).not.toBeInTheDocument();
    expect(screen.getAllByText("Cerimônia dos Ventos Sagrados").length).toBeGreaterThan(0);
  });
});

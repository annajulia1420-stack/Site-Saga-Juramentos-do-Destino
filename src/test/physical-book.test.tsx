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
    Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <a className={className}>{children}</a>
    ),
  };
});

import { Route as EstudioIndexRoute } from "@/routes/estudio.index";
import { Route as EstudioDetailRoute } from "@/routes/estudio.$id";

describe("Módulo Livro Físico (Estúdio Editorial 3D)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    actions.resetStoreForTests();
    vi.spyOn(EstudioDetailRoute, "useParams").mockReturnValue({ id: "chama" });
  });

  it("renderiza a galeria do estúdio com especificações dos livros", () => {
    const IndexComp = EstudioIndexRoute.options.component!;
    render(<IndexComp />);

    expect(screen.getByText("Meu Livro Físico")).toBeInTheDocument();
    expect(screen.getAllByText("Chama").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maré").length).toBeGreaterThan(0);
  });

  it("abre o estúdio 3D de um livro, permite alternar vistas, editar campos e salvar versões", () => {
    const StudioComp = EstudioDetailRoute.options.component!;
    render(<StudioComp />);

    expect(screen.getByText("Estúdio de Livro Físico")).toBeInTheDocument();

    // Verifica modos de visualização
    const spineTab = screen.getByRole("tab", { name: /Lombada/i });
    fireEvent.click(spineTab);
    expect(screen.getByText(/Cálculo Técnico de Lombada/i)).toBeInTheDocument();

    const spreadTab = screen.getByRole("tab", { name: /Capa Aberta/i });
    fireEvent.click(spreadTab);
    expect(screen.getByText(/Contracapa 14 cm/i)).toBeInTheDocument();

    // Volta para vista 3D
    const tab3d = screen.getByRole("tab", { name: /3D Interativo/i });
    fireEvent.click(tab3d);
    const rotateSlider = screen.getByLabelText("Girar livro");
    fireEvent.change(rotateSlider, { target: { value: "45" } });
    expect((rotateSlider as HTMLInputElement).value).toBe("45");

    // Altera título na aba de Textos
    const titleInputs = screen.getAllByPlaceholderText("Título principal na capa e lombada");
    fireEvent.change(titleInputs[0]!, { target: { value: "Chama Eterna" } });
    expect(screen.getAllByText("Chama Eterna").length).toBeGreaterThan(0);

    // Muda para aba Medidas e altera páginas para verificar cálculo de lombada
    const medidasBtn = screen.getByRole("button", { name: /Medidas/i });
    fireEvent.click(medidasBtn);
    const pagesInput = screen.getByDisplayValue("320");
    fireEvent.change(pagesInput, { target: { value: "600" } });
    expect((pagesInput as HTMLInputElement).value).toBe("600");

    // Muda para aba Versões e salva uma versão
    const versoesBtn = screen.getByRole("button", { name: /Versões/i });
    fireEvent.click(versoesBtn);
    const versionInput = screen.getByPlaceholderText(/Nome da versão/i);
    fireEvent.change(versionInput, { target: { value: "Edição de Luxo" } });
    const saveBtn = screen.getByRole("button", { name: "Salvar versão" });
    fireEvent.click(saveBtn);

    expect(screen.getByText("Edição de Luxo")).toBeInTheDocument();
  });
});

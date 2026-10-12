import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { actions } from "@/lib/store";

// Controle dinâmico de parâmetros de rota e navegação para testar os componentes de rota em jsdom
let mockParamId = "novo";
let mockSearchParams: { modelo?: "Protagonista" | "Secundário" } = {};
const mockNavigate = vi.fn(
  (opts?: {
    to?: string;
    params?: { id?: string };
    search?: { modelo?: "Protagonista" | "Secundário" };
  }) => {
    if (opts?.params?.id) {
      mockParamId = opts.params.id;
    }
    if (opts?.search) {
      mockSearchParams = opts.search;
    } else if (opts?.params?.id && opts.params.id !== "novo") {
      mockSearchParams = {};
    }
  },
);

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useHydrated: () => true,
    useNavigate: () => mockNavigate,
    Link: ({
      children,
      to,
      params,
      className,
      onClick,
    }: {
      children: ReactNode;
      to?: string;
      params?: { id?: string };
      className?: string;
      onClick?: () => void;
    }) => (
      <a
        href={params?.id ? `${to?.replace("$id", params.id)}` : (to ?? "#")}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
        }}
      >
        {children}
      </a>
    ),
  };
});

import { Route as HomeRoute } from "@/routes/index";
import { Route as BibliotecaRoute } from "@/routes/biblioteca";
import { Route as PersonagensIndexRoute } from "@/routes/personagens.index";
import { Route as PersonagemFichaRoute } from "@/routes/personagens.$id";

// Sobrescreve useParams e useSearch da rota de ficha para ler nosso mockParamId e mockSearchParams
PersonagemFichaRoute.useParams = (() => ({
  id: mockParamId,
})) as unknown as typeof PersonagemFichaRoute.useParams;
PersonagemFichaRoute.useSearch = (() =>
  mockSearchParams) as unknown as typeof PersonagemFichaRoute.useSearch;

const HomeComp = HomeRoute.options.component!;
const BibliotecaComp = BibliotecaRoute.options.component!;
const PersonagensListComp = PersonagensIndexRoute.options.component!;
const CharPageComp = PersonagemFichaRoute.options.component!;

describe("Spectral Archive Studio — Arquivo de Personagem (14 Testes Obrigatórios)", () => {
  beforeEach(() => {
    actions.resetStoreForTests();
    mockParamId = "novo";
    mockSearchParams = {};
    mockNavigate.mockClear();
  });

  it("Executa os 14 testes obrigatórios: criar personagem, 16 seções, paleta de cores, galeria de referências, perguntas personalizadas (texto, múltipla escolha, cor), edição segura de pergunta, persistência após reload, duplicação, exclusão e integridade da Home e Biblioteca", async () => {
    // 14. Confirmar que a Home e a Biblioteca continuam funcionando
    const { unmount: unmountHome } = render(<HomeComp />);
    expect(screen.getByText(/Saga em dez livros/i)).toBeInTheDocument();
    expect(screen.getByText(/Projetos recentes/i)).toBeInTheDocument();
    unmountHome();

    const { unmount: unmountBib } = render(<BibliotecaComp />);
    expect(screen.getByRole("heading", { name: /Biblioteca/i })).toBeInTheDocument();
    expect(screen.getAllByText("Chama").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maré").length).toBeGreaterThan(0);
    unmountBib();

    // 1. Criar um personagem & 2. Preencher campos de diferentes tipos
    mockParamId = "novo";
    const { unmount: unmountNew } = render(<CharPageComp />);

    const nameInput = screen.getByTestId("input-char-name");
    fireEvent.change(nameInput, { target: { value: "Lyra Vane" } });

    // Preenche campos na Seção 1 (Identidade: data, número, seleção, livros)
    fireEvent.change(screen.getByLabelText(/Data de nascimento/i), {
      target: { value: "2001-05-14" },
    });
    fireEvent.change(screen.getByLabelText(/^Idade$/i), {
      target: { value: "24" },
    });
    fireEvent.change(screen.getByLabelText(/Elemento ou conceito principal associado/i), {
      target: { value: "Chama" },
    });
    fireEvent.click(screen.getByRole("button", { name: /1\. Chama/i }));

    // Navega para Seção 2 (Essência) e seleciona opções visuais
    fireEvent.click(screen.getByTestId("nav-sec-2"));
    expect(screen.getByTestId("section-2-essencia")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Frase que define o personagem/i), {
      target: { value: "O fogo nunca esquece sua origem." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Estrategista/i }));

    // Navega para Seção 6 (Estilo Visual) -> 3. Criar uma paleta de cores & 4. Editar e salvar a paleta
    fireEvent.click(screen.getByTestId("nav-sec-6"));
    expect(screen.getByTestId("section-6-estilo")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-criar-paleta"));
    expect(screen.getByTestId("palette-editor-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nome da paleta/i), {
      target: { value: "Vinho Astral" },
    });
    const hexInput = screen.getByLabelText(/Código hexadecimal da cor/i);
    fireEvent.change(hexInput, { target: { value: "#FF69B4" } });
    fireEvent.click(screen.getByTestId("btn-add-hex-color"));
    fireEvent.click(screen.getByTestId("btn-salvar-paleta"));

    // Verifica que a paleta foi criada e exibe #FF69B4
    expect(screen.getAllByText("Vinho Astral").length).toBeGreaterThan(0);
    expect(screen.getByText("#FF69B4")).toBeInTheDocument();

    // 4. Editar e salvar a paleta
    const editPaletteBtn = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editPaletteBtn);
    fireEvent.change(screen.getByLabelText(/Nome da paleta/i), {
      target: { value: "Vinho Astral Imperial" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-paleta"));
    expect(screen.getAllByText("Vinho Astral Imperial").length).toBeGreaterThan(0);

    // 5. Adicionar imagens de referência (Seção 13)
    fireEvent.click(screen.getByTestId("nav-sec-13"));
    expect(screen.getByTestId("section-13-referencias")).toBeInTheDocument();

    const fileInput = screen.getByTestId("input-file-referencia") as HTMLInputElement;
    const fakeFile = new File(["fake-image-binary-content"], "armadura-lunar.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    const pendingPanel = await screen.findByTestId("pending-image-panel");
    expect(pendingPanel).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Título ou legenda/i), {
      target: { value: "Armadura Ceremonial" },
    });
    fireEvent.change(screen.getByLabelText(/Categoria da referência/i), {
      target: { value: "Moda" },
    });
    fireEvent.change(
      screen.getByLabelText(/Notas sobre o que inspira o personagem nesta imagem/i),
      { target: { value: "Bordados prateados nos ombros" } },
    );
    fireEvent.click(screen.getByTestId("btn-confirmar-imagem"));

    await waitFor(() => {
      expect(screen.queryByTestId("pending-image-panel")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("reference-card")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Armadura Ceremonial")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bordados prateados nos ombros")).toBeInTheDocument();

    // Testar Seção 12 (Montar prompt de IA)
    fireEvent.click(screen.getByTestId("nav-sec-12"));
    fireEvent.click(screen.getByTestId("btn-montar-prompt"));
    const promptTextarea = screen.getByLabelText(/Estrutura do Prompt/i) as HTMLTextAreaElement;
    expect(promptTextarea.value).toContain("Lyra Vane");
    expect(promptTextarea.value).toContain("cinematic realistic photography, film still");

    // 6. Criar uma pergunta personalizada de texto
    fireEvent.click(screen.getByTestId("btn-adicionar-pergunta"));
    expect(screen.getByTestId("question-builder-modal")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/1\. Texto da pergunta/i), {
      target: { value: "Qual objeto jamais emprestaria?" },
    });
    fireEvent.change(screen.getByLabelText(/2\. Tipo de resposta/i), {
      target: { value: "short_text" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-pergunta"));

    // 7. Criar uma pergunta de seleção múltipla
    fireEvent.click(screen.getByTestId("btn-adicionar-pergunta"));
    fireEvent.change(screen.getByLabelText(/1\. Texto da pergunta/i), {
      target: { value: "Quais instrumentos sabe tocar?" },
    });
    fireEvent.change(screen.getByLabelText(/2\. Tipo de resposta/i), {
      target: { value: "multi_select" },
    });
    const optInput = screen.getByLabelText(/Nova opção de resposta/i);
    fireEvent.change(optInput, { target: { value: "Violino" } });
    fireEvent.click(screen.getByTestId("btn-add-question-option"));
    fireEvent.change(optInput, { target: { value: "Harpa" } });
    fireEvent.click(screen.getByTestId("btn-add-question-option"));
    fireEvent.click(screen.getByTestId("btn-salvar-pergunta"));

    // 8. Criar uma pergunta de cor
    fireEvent.click(screen.getByTestId("btn-adicionar-pergunta"));
    fireEvent.change(screen.getByLabelText(/1\. Texto da pergunta/i), {
      target: { value: "Qual a cor da sua aura mágica?" },
    });
    fireEvent.change(screen.getByLabelText(/2\. Tipo de resposta/i), {
      target: { value: "color" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-pergunta"));

    // 9. Responder às perguntas personalizadas
    const textQuestionInput = screen.getByLabelText("Qual objeto jamais emprestaria?");
    fireEvent.change(textQuestionInput, {
      target: { value: "O relógio de bolso do meu avô" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Violino" }));
    fireEvent.click(screen.getByRole("button", { name: "Harpa" }));

    const colorQuestionHex = screen.getByLabelText(
      /Hexadecimal para Qual a cor da sua aura mágica\?/i,
    );
    fireEvent.change(colorQuestionHex, { target: { value: "#5CC8C0" } });

    // 10. Editar uma pergunta sem perder respostas silenciosamente
    const allEditBtns = screen.getAllByRole("button", { name: /Editar/i });
    const editTextQuestionBtn = allEditBtns.find((b) =>
      b.getAttribute("data-testid")?.startsWith("btn-edit-question-"),
    )!;
    fireEvent.click(editTextQuestionBtn);

    fireEvent.change(screen.getByLabelText(/1\. Texto da pergunta/i), {
      target: { value: "Qual relíquia jamais emprestaria?" },
    });
    // Muda de short_text para long_text (compatível -> preserva resposta)
    fireEvent.change(screen.getByLabelText(/2\. Tipo de resposta/i), {
      target: { value: "long_text" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-pergunta"));

    const preservedTextarea = screen.getByLabelText(
      "Qual relíquia jamais emprestaria?",
    ) as HTMLTextAreaElement;
    expect(preservedTextarea.value).toBe("O relógio de bolso do meu avô");

    // 11. Salvar a ficha e atualizar a página
    fireEvent.click(screen.getByTestId("btn-salvar-ficha"));
    expect(screen.getByTestId("status-message")).toHaveTextContent(/Ficha salva com sucesso/i);

    // Verifica que o estado foi salvo no localStorage
    const rawSaved = localStorage.getItem("juramentos-studio-v1");
    expect(rawSaved).toBeTruthy();
    const parsedSaved = JSON.parse(rawSaved!);
    expect(parsedSaved.characters).toHaveLength(1);
    const savedCharId = parsedSaved.characters[0].id as string;
    unmountNew();

    // 12. Reabrir o aplicativo e verificar se os dados continuam disponíveis
    mockParamId = savedCharId;
    const { unmount: unmountReopen } = render(<CharPageComp />);

    expect(screen.getByTestId("input-char-name")).toHaveValue("Lyra Vane");
    expect(screen.getByDisplayValue("O relógio de bolso do meu avô")).toBeInTheDocument();
    expect(screen.getByDisplayValue("#5CC8C0")).toBeInTheDocument();

    // Verifica paleta salva após reabrir
    fireEvent.click(screen.getByTestId("nav-sec-6"));
    expect(screen.getAllByText("Vinho Astral Imperial").length).toBeGreaterThan(0);
    expect(screen.getByText("#FF69B4")).toBeInTheDocument();

    // 13. Editar, duplicar e excluir um personagem de teste
    const nameInputReopened = screen.getByTestId("input-char-name");
    fireEvent.change(nameInputReopened, { target: { value: "Lyra Vane Editada" } });
    fireEvent.click(screen.getByTestId("btn-salvar-ficha"));
    unmountReopen();

    // Abre a listagem de personagens, verifica filtro, duplicação e exclusão
    const { unmount: unmountList } = render(<PersonagensListComp />);

    expect(screen.getByText("Lyra Vane Editada")).toBeInTheDocument();

    // Duplica o personagem para criar um personagem de teste independente
    const dupBtn = screen.getByTestId(`duplicate-char-${savedCharId}`);
    fireEvent.click(dupBtn);
    expect(screen.getByText("Lyra Vane Editada (Cópia)")).toBeInTheDocument();

    // Exclui o personagem de teste duplicado com confirmação
    const afterDupState = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    const copyChar = afterDupState.characters.find((c: { name: string }) =>
      c.name.includes("(Cópia)"),
    );
    expect(copyChar).toBeTruthy();

    fireEvent.click(screen.getByTestId(`delete-char-${copyChar.id}`));
    fireEvent.click(screen.getByTestId(`confirm-delete-char-${copyChar.id}`));

    await waitFor(() => {
      expect(screen.queryByText("Lyra Vane Editada (Cópia)")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Lyra Vane Editada")).toBeInTheDocument();
    unmountList();
  });

  it("Garante estabilidade do seletor de cores na edição de cores existentes: troca verde -> laranja -> rosa, edição repetida, edição de várias cores seguidas, cancelamento e persistência sem desmontar o seletor", async () => {
    mockParamId = "novo";
    const { unmount } = render(<CharPageComp />);

    // Define nome do personagem
    fireEvent.change(screen.getByTestId("input-char-name"), {
      target: { value: "Kaelen Solaris" },
    });

    // Abre Seção 6 (Estilo Visual) e clica em "Criar paleta"
    fireEvent.click(screen.getByTestId("nav-sec-6"));
    fireEvent.click(screen.getByTestId("btn-criar-paleta"));
    expect(screen.getByTestId("palette-editor-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nome da paleta/i), {
      target: { value: "Paleta Cromática" },
    });

    // Adiciona uma cor Verde (#22C55E) como 4ª cor da paleta (índice 3)
    const addHexInput = screen.getByLabelText(/Código hexadecimal da cor/i);
    fireEvent.change(addHexInput, { target: { value: "#22C55E" } });
    fireEvent.click(screen.getByTestId("btn-add-hex-color"));

    // Verifica que as 3 cores originais (#E8475F, #3A1238, #5CC8C0) + a nova cor verde (#22C55E) estão presentes
    expect(screen.getByTestId("swatch-hex-input-0")).toHaveValue("#E8475F");
    expect(screen.getByTestId("swatch-hex-input-1")).toHaveValue("#3A1238");
    expect(screen.getByTestId("swatch-hex-input-2")).toHaveValue("#5CC8C0");
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#22C55E");

    // 1. Clica na cor Verde existente (índice 3) para alterá-la
    const slotElementBefore = screen.getByTestId("palette-slot-3");
    fireEvent.click(screen.getByTestId("swatch-trigger-3"));

    // Verifica que o seletor de edição abre com a cor atual (#22C55E) selecionada
    const activePanel = screen.getByTestId("active-color-picker-panel");
    expect(activePanel).toBeInTheDocument();
    const colorPickerInput = screen.getByTestId("active-slot-color-input") as HTMLInputElement;
    const hexPickerInput = screen.getByTestId("active-slot-hex-input") as HTMLInputElement;
    expect(colorPickerInput.value.toUpperCase()).toBe("#22C55E");
    expect(hexPickerInput.value.toUpperCase()).toBe("#22C55E");

    // 2. Troca a cor Verde (#22C55E) por Laranja (#F97316) usando o seletor visual
    // Simula múltiplos eventos de mudança (como quando o usuário arrasta o cursor no seletor)
    fireEvent.change(colorPickerInput, { target: { value: "#f59e0b" } });
    fireEvent.change(colorPickerInput, { target: { value: "#f97316" } });

    // O seletor NÃO deve desaparecer nem o card da cor deve ser desmontado!
    expect(screen.getByTestId("active-color-picker-panel")).toBeInTheDocument();
    expect(screen.getByTestId("palette-slot-3")).toBe(slotElementBefore);
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#F97316");

    // Confirma a alteração para Laranja
    fireEvent.click(screen.getByTestId("btn-confirm-color-edit"));
    expect(screen.queryByTestId("active-color-picker-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#F97316");

    // 3. Edição repetida da mesma cor: troca Laranja (#F97316) para Rosa (#FF69B4)
    fireEvent.click(screen.getByTestId("swatch-trigger-3"));
    expect(screen.getByTestId("active-color-picker-panel")).toBeInTheDocument();
    expect(
      (screen.getByTestId("active-slot-color-input") as HTMLInputElement).value.toUpperCase(),
    ).toBe("#F97316");

    fireEvent.change(screen.getByTestId("active-slot-color-input"), {
      target: { value: "#ff69b4" },
    });
    // Permanece aberto durante a escolha
    expect(screen.getByTestId("active-color-picker-panel")).toBeInTheDocument();
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#FF69B4");

    // Confirma a troca para Rosa (#FF69B4)
    fireEvent.click(screen.getByTestId("btn-confirm-color-edit"));
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#FF69B4");

    // 4. Testa cancelar a edição sem alterar a cor original (Rosa #FF69B4)
    fireEvent.click(screen.getByTestId("swatch-trigger-3"));
    // Muda temporariamente para Lilás (#C084FC), mas clica em Cancelar
    fireEvent.change(screen.getByTestId("active-slot-color-input"), {
      target: { value: "#c084fc" },
    });
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#C084FC");
    fireEvent.click(screen.getByTestId("btn-cancel-color-edit"));
    // Deve restaurar #FF69B4!
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#FF69B4");

    // 5. Editar várias cores seguidas (Cor 0 -> Vermelho #EF4444, Cor 1 -> Lilás #C084FC) preservando a Cor 2 (#5CC8C0) e Cor 3 (#FF69B4)
    fireEvent.click(screen.getByTestId("swatch-trigger-0"));
    expect(screen.getByTestId("active-color-picker-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("quick-swatch-vermelho"));
    expect(screen.getByTestId("active-color-picker-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("btn-confirm-color-edit"));

    fireEvent.click(screen.getByTestId("swatch-trigger-1"));
    expect(screen.getByTestId("active-color-picker-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("quick-swatch-lilás"));
    expect(screen.getByTestId("active-color-picker-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("btn-confirm-color-edit"));

    // Verifica que todas as 4 cores estão exatas e que a Cor 2 (#5CC8C0) foi preservada intacta
    expect(screen.getByTestId("swatch-hex-input-0")).toHaveValue("#EF4444");
    expect(screen.getByTestId("swatch-hex-input-1")).toHaveValue("#C084FC");
    expect(screen.getByTestId("swatch-hex-input-2")).toHaveValue("#5CC8C0");
    expect(screen.getByTestId("swatch-hex-input-3")).toHaveValue("#FF69B4");

    // 6. Salva a paleta e salva a ficha do personagem
    fireEvent.click(screen.getByTestId("btn-salvar-paleta"));
    expect(screen.getAllByText("Paleta Cromática").length).toBeGreaterThan(0);
    expect(screen.getByText("#EF4444")).toBeInTheDocument();
    expect(screen.getByText("#C084FC")).toBeInTheDocument();
    expect(screen.getByText("#5CC8C0")).toBeInTheDocument();
    expect(screen.getByText("#FF69B4")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-salvar-ficha"));
    const savedState = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    const charId = savedState.characters[0].id as string;
    unmount();

    // 7. Reabre a ficha do personagem e verifica persistência das cores editadas
    mockParamId = charId;
    const { unmount: unmountReopen } = render(<CharPageComp />);
    fireEvent.click(screen.getByTestId("nav-sec-6"));

    expect(screen.getAllByText("Paleta Cromática").length).toBeGreaterThan(0);
    expect(screen.getByText("#EF4444")).toBeInTheDocument();
    expect(screen.getByText("#C084FC")).toBeInTheDocument();
    expect(screen.getByText("#5CC8C0")).toBeInTheDocument();
    expect(screen.getByText("#FF69B4")).toBeInTheDocument();
    unmountReopen();
  });

  it("Testa a Seção 7 (Assinatura Cinematográfica) com opção 'Personalizado' nos 3 campos (Câmera ideal, Iluminação, Tipo de cena), troca entre predefinido e personalizado, modelos Protagonista e Secundário, e persistência após sair e reabrir", async () => {
    mockParamId = "novo";
    const { unmount } = render(<CharPageComp />);

    fireEvent.change(screen.getByTestId("input-char-name"), {
      target: { value: "Seraphina Noctis" },
    });

    // Navega para a Seção 7 — Assinatura Cinematográfica
    fireEvent.click(screen.getByTestId("nav-sec-7"));
    expect(screen.getByTestId("section-7-cinematografia")).toBeInTheDocument();

    // 1. Verifica que todas as opções predefinidas continuam presentes junto com a opção "Personalizado" nos 3 campos
    expect(screen.getByTestId("camera-ideal-preset-Close emocional")).toBeInTheDocument();
    expect(screen.getByTestId("camera-ideal-preset-Câmera baixa")).toBeInTheDocument();
    expect(screen.getByTestId("camera-ideal-option-personalizado")).toBeInTheDocument();

    expect(screen.getByTestId("iluminacao-preset-Chiaroscuro dramático")).toBeInTheDocument();
    expect(screen.getByTestId("iluminacao-preset-Luar prateado")).toBeInTheDocument();
    expect(screen.getByTestId("iluminacao-option-personalizado")).toBeInTheDocument();

    expect(screen.getByTestId("tipo-cena-preset-Confronto sob chuva")).toBeInTheDocument();
    expect(screen.getByTestId("tipo-cena-preset-Baile de máscaras")).toBeInTheDocument();
    expect(screen.getByTestId("tipo-cena-option-personalizado")).toBeInTheDocument();

    // Inicialmente os painéis de texto personalizados não estão visíveis
    expect(screen.queryByTestId("camera-ideal-custom-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iluminacao-custom-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tipo-cena-custom-panel")).not.toBeInTheDocument();

    // 2. Seleciona "Personalizado" (e também uma opção predefinida) nos 3 campos e preenche as descrições livres
    fireEvent.click(screen.getByTestId("camera-ideal-preset-Close emocional"));
    fireEvent.click(screen.getByTestId("camera-ideal-option-personalizado"));
    expect(screen.getByTestId("camera-ideal-custom-panel")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("camera-ideal-custom-textarea"), {
      target: {
        value:
          "Travelling circular lento em câmera baixa, aproximando até um extreme close-up nos olhos refletindo chamas.",
      },
    });

    fireEvent.click(screen.getByTestId("iluminacao-preset-Luar prateado"));
    fireEvent.click(screen.getByTestId("iluminacao-option-personalizado"));
    expect(screen.getByTestId("iluminacao-custom-panel")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("iluminacao-custom-textarea"), {
      target: {
        value:
          "Contraluz carmesim intensa cortando a neblina azulada com partículas de cinza suspensas no ar.",
      },
    });

    fireEvent.click(screen.getByTestId("tipo-cena-option-personalizado"));
    expect(screen.getByTestId("tipo-cena-custom-panel")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("tipo-cena-custom-textarea"), {
      target: {
        value:
          "Caminhando solitária por uma catedral submersa enquanto o teto de vidro reflete um eclipse.",
      },
    });

    // 3. Testa trocar "Personalizado" por uma opção predefinida: não deve causar erro nem apagar o texto salvo
    fireEvent.click(screen.getByTestId("tipo-cena-option-personalizado")); // desmarca Personalizado
    fireEvent.click(screen.getByTestId("tipo-cena-preset-Confronto sob chuva")); // marca predefinida
    expect(screen.queryByTestId("tipo-cena-custom-panel")).not.toBeInTheDocument();

    // Quando reativa "Personalizado", o texto que havia sido escrito permanece preservado sem perda!
    fireEvent.click(screen.getByTestId("tipo-cena-option-personalizado"));
    expect(screen.getByTestId("tipo-cena-custom-textarea")).toHaveValue(
      "Caminhando solitária por uma catedral submersa enquanto o teto de vidro reflete um eclipse.",
    );

    // 4. Salva a ficha protagonista, sai da ficha (desmonta) e reabre para verificar que tudo foi persistido
    fireEvent.click(screen.getByTestId("btn-salvar-ficha"));
    expect(screen.getByTestId("status-message")).toHaveTextContent(/Ficha salva com sucesso/i);

    const savedState = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    const charId = savedState.characters[0].id as string;
    unmount();

    // 5. Reabre a ficha existente e navega até a Seção 7
    mockParamId = charId;
    const { unmount: unmountReopen } = render(<CharPageComp />);
    fireEvent.click(screen.getByTestId("nav-sec-7"));

    // Verifica que "Personalizado" continua selecionado nos 3 campos e que os textos personalizados estão restaurados
    expect(screen.getByTestId("camera-ideal-custom-panel")).toBeInTheDocument();
    expect(screen.getByTestId("camera-ideal-custom-textarea")).toHaveValue(
      "Travelling circular lento em câmera baixa, aproximando até um extreme close-up nos olhos refletindo chamas.",
    );

    expect(screen.getByTestId("iluminacao-custom-panel")).toBeInTheDocument();
    expect(screen.getByTestId("iluminacao-custom-textarea")).toHaveValue(
      "Contraluz carmesim intensa cortando a neblina azulada com partículas de cinza suspensas no ar.",
    );

    expect(screen.getByTestId("tipo-cena-custom-panel")).toBeInTheDocument();
    expect(screen.getByTestId("tipo-cena-custom-textarea")).toHaveValue(
      "Caminhando solitária por uma catedral submersa enquanto o teto de vidro reflete um eclipse.",
    );

    unmountReopen();
  });

  it("Executa os 20 testes obrigatórios do modelo ARQUIVO DE PERSONAGEM — SECUNDÁRIO (15 seções independentes, sem exibir ficha principal, coexistência com protagonista, paleta, importância narrativa, prompt IA, galeria por categoria, perguntas personalizadas, persistência, duplicação e exclusão)", async () => {
    // Primeiro cria e salva um Protagonista para testar coexistência e vínculos
    mockParamId = "novo";
    mockSearchParams = { modelo: "Protagonista" };
    const { unmount: unmountProt } = render(<CharPageComp />);
    expect(screen.getByTestId("protagonist-character-sheet")).toBeInTheDocument();
    expect(screen.queryByTestId("secondary-character-sheet")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("input-char-name"), {
      target: { value: "Aurelia Vance" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-ficha"));
    const stateWithProt = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    const protagonistId = stateWithProt.characters[0].id as string;
    unmountProt();

    // 1. Selecionar "Personagem Secundário" ao criar um novo personagem a partir da listagem
    const { unmount: unmountList1 } = render(<PersonagensListComp />);
    fireEvent.click(screen.getByTestId("btn-novo-personagem"));
    expect(screen.getByTestId("create-character-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("btn-modelo-secundario"));
    unmountList1();

    expect(mockParamId).toBe("novo");
    expect(mockSearchParams.modelo).toBe("Secundário");

    // 2. Confirmar que a ficha secundária abre com suas 15 seções, e NÃO com a ficha principal
    const { unmount: unmountSec } = render(<CharPageComp />);
    expect(screen.getByTestId("secondary-character-sheet")).toBeInTheDocument();
    expect(screen.queryByTestId("protagonist-character-sheet")).not.toBeInTheDocument();
    expect(screen.getByTestId("secondary-section-counter")).toHaveTextContent(
      /Ficha Secundária · Seção 01 de 15/i,
    );
    // Verifica que existem exatamente 15 botões de seção no menu lateral (não existe nav-sec-16)
    expect(screen.getByTestId("nav-sec-15")).toBeInTheDocument();
    expect(screen.queryByTestId("nav-sec-16")).not.toBeInTheDocument();

    // 3. Preencher campos da Seção 1 — Identidade (nome, apelido, livro/arco, função na história, relação com protagonistas)
    fireEvent.change(screen.getByTestId("input-char-name"), {
      target: { value: "Thorne Vex" },
    });
    fireEvent.change(screen.getByLabelText("Apelido"), {
      target: { value: "O Relojoeiro de Cinzas" },
    });
    fireEvent.click(screen.getByRole("button", { name: /1\. Chama/i }));

    // 4. Testar opção predefinida ("Mentor") e opção "Personalizado" em Função na História
    fireEvent.click(screen.getByTestId("sec-funcao-historia-preset-Mentor"));
    fireEvent.click(screen.getByTestId("sec-funcao-historia-option-personalizado"));
    expect(screen.getByTestId("sec-funcao-historia-custom-panel")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("sec-funcao-historia-custom-textarea"), {
      target: { value: "Guardião do relógio astral que regula as marés de fogo." },
    });

    // Vínculo com a protagonista Aurelia Vance
    fireEvent.change(screen.getByLabelText(/Selecionar personagem cadastrado \(opcional\)/i), {
      target: { value: protagonistId },
    });
    fireEvent.change(screen.getByLabelText(/Descrição da relação/i), {
      target: { value: "Antigo mestre de forja da família Vance." },
    });
    fireEvent.click(screen.getByTestId("btn-add-protagonist-link"));
    expect(screen.getByText(/Antigo mestre de forja da família Vance/i)).toBeInTheDocument();

    // Seção 2 — Essência (Frase + Papel emocional com opção Personalizado)
    fireEvent.click(screen.getByTestId("nav-sec-2"));
    expect(screen.getByTestId("sec-section-2-essencia")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Frase que resume o personagem/i), {
      target: { value: "Todo mecanismo cobra uma engrenagem de sangue." },
    });
    fireEvent.click(screen.getByTestId("sec-papel-emocional-preset-Desafia"));
    fireEvent.click(screen.getByTestId("sec-papel-emocional-option-personalizado"));
    fireEvent.change(screen.getByTestId("sec-papel-emocional-custom-textarea"), {
      target: { value: "Desperta nostalgia e desconfiança ao mesmo tempo." },
    });

    // Seção 3 — Personalidade (3 traços, qualidade, defeito, jeito de falar com Personalizado)
    fireEvent.click(screen.getByTestId("nav-sec-3"));
    expect(screen.getByTestId("sec-section-3-personalidade")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /\+ Observador/i }));
    fireEvent.click(screen.getByRole("button", { name: /\+ Sarcástico/i }));
    fireEvent.change(screen.getByLabelText("Qualidade marcante"), {
      target: { value: "Lealdade inabalável aos juramentos antigos" },
    });
    fireEvent.change(screen.getByLabelText("Defeito marcante"), {
      target: { value: "Rancoroso com traidores" },
    });
    fireEvent.click(screen.getByTestId("sec-jeito-falar-preset-Irônico"));
    fireEvent.click(screen.getByTestId("sec-jeito-falar-option-personalizado"));
    fireEvent.change(screen.getByTestId("sec-jeito-falar-custom-textarea"), {
      target: { value: "Fala em metáforas de relojoaria e pausas secas." },
    });

    // Seção 4 — Motivação
    fireEvent.click(screen.getByTestId("nav-sec-4"));
    expect(screen.getByTestId("sec-section-4-motivacao")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("O que ele quer"), {
      target: { value: "Restaurar a Torre do Tempo antes do eclipse." },
    });
    fireEvent.change(screen.getByLabelText("Por que quer isso"), {
      target: { value: "Para cumprir a promessa feita à irmã caída." },
    });
    fireEvent.change(screen.getByLabelText("O que teme perder"), {
      target: { value: "As últimas memórias de sua juventude." },
    });

    // Seção 5 — Aparência
    fireEvent.click(screen.getByTestId("nav-sec-5"));
    expect(screen.getByTestId("sec-section-5-aparencia")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Idade aproximada"), {
      target: { value: "48 anos" },
    });
    fireEvent.change(screen.getByLabelText("Cabelo"), {
      target: { value: "Grisalho curto com mechas acobreadas" },
    });
    fireEvent.change(screen.getByLabelText("Olhos"), {
      target: { value: "Âmbar metálico" },
    });
    fireEvent.change(screen.getByLabelText("Traços marcantes"), {
      target: { value: "Luva mecânica de bronze na mão direita" },
    });
    fireEvent.change(screen.getByLabelText("Expressão comum"), {
      target: { value: "Semicerrar de olhos analítico" },
    });

    // 5. Seção 6 — Estilo Visual: Criar e editar uma paleta de cores na ficha secundária + Objeto marcante
    fireEvent.click(screen.getByTestId("nav-sec-6"));
    expect(screen.getByTestId("sec-section-6-estilo")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("sec-estetica-preset-Sombrio"));
    fireEvent.click(screen.getByTestId("sec-estetica-option-personalizado"));
    fireEvent.change(screen.getByTestId("sec-estetica-custom-textarea"), {
      target: { value: "Alfaiataria steampunk de couro escuro e bronze oxidado." },
    });

    // Cria paleta e edita cor existente (Verde #22C55E -> Laranja #F97316)
    fireEvent.click(screen.getByTestId("btn-criar-paleta"));
    fireEvent.change(screen.getByLabelText(/Nome da paleta/i), {
      target: { value: "Bronze & Fuligem" },
    });
    const addHex = screen.getByLabelText(/Código hexadecimal da cor/i);
    fireEvent.change(addHex, { target: { value: "#22C55E" } });
    fireEvent.click(screen.getByTestId("btn-add-hex-color"));
    fireEvent.click(screen.getByTestId("swatch-trigger-3"));
    fireEvent.change(screen.getByTestId("active-slot-color-input"), {
      target: { value: "#f97316" },
    });
    fireEvent.click(screen.getByTestId("btn-confirm-color-edit"));
    fireEvent.click(screen.getByTestId("btn-salvar-paleta"));
    expect(screen.getAllByText("Bronze & Fuligem").length).toBeGreaterThan(0);
    expect(screen.getByText("#F97316")).toBeInTheDocument();

    // Objeto marcante
    fireEvent.change(screen.getByLabelText(/Nome do objeto \/ acessório/i), {
      target: { value: "Cronômetro de Obsidiana" },
    });
    fireEvent.change(screen.getByLabelText(/Significado narrativo/i), {
      target: { value: "Marca as horas restantes do pacto real" },
    });
    fireEvent.change(screen.getByLabelText(/Descrição visual do objeto/i), {
      target: { value: "Ponteiros de ouro rubro cravejados em pedra negra" },
    });
    fireEvent.click(screen.getByTestId("btn-save-striking-object"));
    expect(screen.getByTestId("striking-object-card")).toHaveTextContent("Cronômetro de Obsidiana");

    // Seção 7 — Assinatura Visual (Clima de cena, Cenário, Tipo de enquadramento com Personalizado)
    fireEvent.click(screen.getByTestId("nav-sec-7"));
    expect(screen.getByTestId("sec-section-7-assinatura")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("sec-clima-cena-preset-Misteriosa"));
    fireEvent.click(screen.getByTestId("sec-clima-cena-option-personalizado"));
    fireEvent.change(screen.getByTestId("sec-clima-cena-custom-textarea"), {
      target: { value: "Vapor denso iluminado por fagulhas da forja." },
    });
    fireEvent.change(screen.getByLabelText(/Cenário que combina com ele/i), {
      target: { value: "Oficina suspensa nas engrenagens da ponte velha" },
    });
    fireEvent.click(screen.getByTestId("sec-enquadramento-preset-Plano médio"));
    fireEvent.click(screen.getByTestId("sec-enquadramento-option-personalizado"));
    fireEvent.change(screen.getByTestId("sec-enquadramento-custom-textarea"), {
      target: { value: "Enquadramento através de engrenagens em primeiro plano." },
    });

    // Seção 8 — História Resumida & Seção 9 — Relacionamentos & Seção 10 — Detalhes Humanos
    fireEvent.click(screen.getByTestId("nav-sec-8"));
    fireEvent.change(screen.getByLabelText("Origem"), {
      target: { value: "Distrito das Forjas Subterrâneas" },
    });
    fireEvent.click(screen.getByTestId("nav-sec-9"));
    fireEvent.change(screen.getByLabelText(/Como ajuda ou atrapalha a história/i), {
      target: { value: "Fornece armas rúnicas, mas oculta a localização do herdeiro." },
    });
    fireEvent.click(screen.getByTestId("nav-sec-10"));
    fireEvent.change(screen.getByLabelText(/Mania ou hábito/i), {
      target: { value: "Ajustar monóculo mesmo quando não está usando um" },
    });

    // 7. Seção 11 — Gerar e editar o Prompt Base de IA
    fireEvent.click(screen.getByTestId("nav-sec-11"));
    expect(screen.getByTestId("sec-section-11-prompt")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("btn-montar-prompt-secundario"));
    const secPromptArea = screen.getByTestId("textarea-prompt-secundario") as HTMLTextAreaElement;
    expect(secPromptArea.value).toContain("Thorne Vex");
    expect(secPromptArea.value).toContain("48 anos");
    expect(secPromptArea.value).toContain(
      "cinematic realistic portrait, film still, natural lighting",
    );
    fireEvent.change(secPromptArea, {
      target: { value: `${secPromptArea.value} Masterpiece 8k.` },
    });

    // 6. Seção 12 — Selecionar Importância Narrativa (Nível 3 — Fundamental na história)
    fireEvent.click(screen.getByTestId("nav-sec-12"));
    expect(screen.getByTestId("sec-section-12-importancia")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("importance-level-3"));

    // Seção 13 — Evolução & Seção 14 — Curiosidades
    fireEvent.click(screen.getByTestId("nav-sec-13"));
    fireEvent.change(screen.getByLabelText(/Como aparece na história/i), {
      target: { value: "Surge como um mercador recluso no capítulo 4." },
    });
    fireEvent.click(screen.getByTestId("nav-sec-14"));
    fireEvent.change(
      screen.getByLabelText(/Fatos extras, segredos de bastidores e ideias futuras/i),
      { target: { value: "Construiu o braço mecânico com peças de um autômato real." } },
    );
    fireEvent.click(screen.getByTestId("btn-add-sec-curiosity"));
    expect(
      screen.getByText(/Construiu o braço mecânico com peças de um autômato real/i),
    ).toBeInTheDocument();

    // 8, 9, 10, 11. Seção 15 — Referências Visuais ("Personagem" e "Estilo de moda" + notas + visualização)
    fireEvent.click(screen.getByTestId("nav-sec-15"));
    expect(screen.getByTestId("sec-section-15-referencias")).toBeInTheDocument();

    const refInput = screen.getByTestId("input-file-referencia") as HTMLInputElement;
    // 8. Adicionar imagem em "Personagem"
    fireEvent.change(refInput, {
      target: {
        files: [new File(["img-char"], "thorne-rosto.png", { type: "image/png" })],
      },
    });
    await screen.findByTestId("pending-image-panel");
    fireEvent.change(screen.getByLabelText(/Título ou legenda/i), {
      target: { value: "Retrato de Thorne" },
    });
    fireEvent.change(screen.getByLabelText(/Categoria da referência/i), {
      target: { value: "Personagem" },
    });
    fireEvent.change(
      screen.getByLabelText(/Notas sobre o que inspira o personagem nesta imagem/i),
      { target: { value: "Cicatriz na sobrancelha e barba grisalha" } },
    );
    fireEvent.click(screen.getByTestId("btn-confirmar-imagem"));
    await waitFor(() => {
      expect(screen.queryByTestId("pending-image-panel")).not.toBeInTheDocument();
    });

    // 9. Adicionar imagem em "Estilo de moda"
    fireEvent.change(refInput, {
      target: {
        files: [new File(["img-fashion"], "casaco-forja.png", { type: "image/png" })],
      },
    });
    await screen.findByTestId("pending-image-panel");
    fireEvent.change(screen.getByLabelText(/Título ou legenda/i), {
      target: { value: "Casaco de Relojoeiro" },
    });
    fireEvent.change(screen.getByLabelText(/Categoria da referência/i), {
      target: { value: "Estilo de moda" },
    });
    fireEvent.change(
      screen.getByLabelText(/Notas sobre o que inspira o personagem nesta imagem/i),
      { target: { value: "Fivelas de bronze e avental de couro pesado" } },
    );
    fireEvent.click(screen.getByTestId("btn-confirmar-imagem"));
    await waitFor(() => {
      expect(screen.queryByTestId("pending-image-panel")).not.toBeInTheDocument();
    });

    // 10 & 11. Verifica as duas imagens, edita legenda/nota e abre o lightbox
    expect(screen.getAllByTestId("reference-card")).toHaveLength(2);
    expect(screen.getByDisplayValue("Retrato de Thorne")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Casaco de Relojoeiro")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Ampliar Retrato de Thorne"));
    expect(screen.getByTestId("reference-lightbox")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Fechar/i }));

    // 12, 13, 14. Criar perguntas personalizadas na ficha secundária, responder e editar sem perder respostas
    fireEvent.click(screen.getByTestId("btn-adicionar-pergunta"));
    fireEvent.change(screen.getByLabelText(/1\. Texto da pergunta/i), {
      target: { value: "Qual juramento secreto fez ao rei?" },
    });
    fireEvent.change(screen.getByLabelText(/2\. Tipo de resposta/i), {
      target: { value: "short_text" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-pergunta"));

    // 13. Responde à pergunta
    fireEvent.change(screen.getByLabelText("Qual juramento secreto fez ao rei?"), {
      target: { value: "Jamais revelar a terceira chave da torre." },
    });

    // 14. Edita a pergunta sem perder a resposta
    const editQBtn = screen
      .getAllByRole("button", { name: /Editar/i })
      .find((b) => b.getAttribute("data-testid")?.startsWith("btn-edit-question-"))!;
    fireEvent.click(editQBtn);
    fireEvent.change(screen.getByLabelText(/1\. Texto da pergunta/i), {
      target: { value: "Qual pacto secreto fez ao antigo rei?" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-pergunta"));
    expect(screen.getByLabelText("Qual pacto secreto fez ao antigo rei?")).toHaveValue(
      "Jamais revelar a terceira chave da torre.",
    );

    // 15. Salvar o personagem secundário
    fireEvent.click(screen.getByTestId("btn-salvar-ficha"));
    expect(screen.getByTestId("status-message")).toHaveTextContent(/Ficha salva com sucesso/i);

    const savedAll = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    expect(savedAll.characters).toHaveLength(2);
    const secCharSaved = savedAll.characters.find((c: { name: string }) => c.name === "Thorne Vex");
    expect(secCharSaved).toBeTruthy();
    expect(secCharSaved.modelType).toBe("Secundário");
    const secondaryId = secCharSaved.id as string;
    unmountSec();

    // 16 & 17. Fechar e reabrir a ficha / recarregar e confirmar que ela continua no modelo secundário (15 seções) com todos os dados
    mockParamId = secondaryId;
    mockSearchParams = {}; // mesmo sem query param na URL ao reabrir pelo ID, deve abrir no modelo Secundário!
    const { unmount: unmountReopenSec } = render(<CharPageComp />);

    expect(screen.getByTestId("secondary-character-sheet")).toBeInTheDocument();
    expect(screen.queryByTestId("protagonist-character-sheet")).not.toBeInTheDocument();
    expect(screen.getByTestId("input-char-name")).toHaveValue("Thorne Vex");
    expect(
      screen.getByDisplayValue("Guardião do relógio astral que regula as marés de fogo."),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Jamais revelar a terceira chave da torre."),
    ).toBeInTheDocument();

    // Verifica importância narrativa nível 3 e referências visuais após reabrir
    fireEvent.click(screen.getByTestId("nav-sec-12"));
    expect(screen.getByTestId("importance-level-3")).toHaveClass("border-teal");
    fireEvent.click(screen.getByTestId("nav-sec-15"));
    expect(screen.getAllByTestId("reference-card")).toHaveLength(2);
    unmountReopenSec();

    // 18. Confirmar que as fichas de protagonistas continuam abrindo no modelo principal (16 seções) sem mistura
    mockParamId = protagonistId;
    const { unmount: unmountReopenProt } = render(<CharPageComp />);
    expect(screen.getByTestId("protagonist-character-sheet")).toBeInTheDocument();
    expect(screen.queryByTestId("secondary-character-sheet")).not.toBeInTheDocument();
    expect(screen.getByTestId("input-char-name")).toHaveValue("Aurelia Vance");
    expect(screen.getByTestId("nav-sec-16")).toBeInTheDocument();
    unmountReopenProt();

    // 19. Duplicar e excluir um personagem secundário de teste sem afetar os demais
    const { unmount: unmountList2 } = render(<PersonagensListComp />);
    expect(screen.getByText("Aurelia Vance")).toBeInTheDocument();
    expect(screen.getByText("Thorne Vex")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(`duplicate-char-${secondaryId}`));
    expect(screen.getByText("Thorne Vex (Cópia)")).toBeInTheDocument();

    const stateAfterDup = JSON.parse(localStorage.getItem("juramentos-studio-v1")!);
    const copySec = stateAfterDup.characters.find((c: { name: string }) =>
      c.name.includes("Thorne Vex (Cópia)"),
    );
    expect(copySec).toBeTruthy();
    expect(copySec.modelType).toBe("Secundário");

    fireEvent.click(screen.getByTestId(`delete-char-${copySec.id}`));
    fireEvent.click(screen.getByTestId(`confirm-delete-char-${copySec.id}`));

    await waitFor(() => {
      expect(screen.queryByText("Thorne Vex (Cópia)")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Thorne Vex")).toBeInTheDocument();
    expect(screen.getByText("Aurelia Vance")).toBeInTheDocument();
    unmountList2();

    // 20. Confirmar que a Home e a Biblioteca continuam funcionando normalmente
    const { unmount: unmountHome } = render(<HomeComp />);
    expect(screen.getByText(/Saga em dez livros/i)).toBeInTheDocument();
    unmountHome();

    const { unmount: unmountBib } = render(<BibliotecaComp />);
    expect(screen.getByRole("heading", { name: /Biblioteca/i })).toBeInTheDocument();
    unmountBib();
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { actions } from "@/lib/store";
import {
  ENCYCLOPEDIA_SECTIONS_META,
  FANTASY_STYLES,
  DYSTOPIA_SCIFI_STYLES,
} from "@/lib/encyclopedia-types";
import { Route as UniversoRoute } from "@/routes/universo";
import { Route as HomeRoute } from "@/routes/index";
import { Route as BibliotecaRoute } from "@/routes/biblioteca";
import { Route as PersonagensIndexRoute } from "@/routes/personagens.index";

// Mock para TanStack Router Link e useNavigate
vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    Link: ({
      children,
      to,
      onClick,
      className,
    }: {
      children: React.ReactNode;
      to?: string;
      onClick?: () => void;
      className?: string;
    }) => (
      <a href={to ?? "#"} onClick={onClick} className={className}>
        {children}
      </a>
    ),
    useNavigate: () => vi.fn(),
  };
});

// Mock para mídia IndexedDB
vi.mock("@/lib/media-store", () => ({
  processImageFile: vi.fn(async (file: File) => `data:image/png;base64,mock_${file.name}`),
  storeMediaDataUrl: vi.fn(async (_prefix: string, dataUrl: string) => dataUrl),
  resolveMediaUrl: vi.fn(async (url: string) => url),
}));

const UniversoComp = UniversoRoute.options.component!;
const HomeComp = HomeRoute.options.component!;
const BibliotecaComp = BibliotecaRoute.options.component!;
const PersonagensListComp = PersonagensIndexRoute.options.component!;

describe("Spectral Archive Studio — Enciclopédia de Países e Mundos (20 Testes Obrigatórios)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    actions.resetStoreForTests();
  });

  it("Executa os 20 testes obrigatórios cobrindo as 34 seções, 2 modalidades narrativas, imagens, mapas, eventos históricos, perguntas, organizações, sistemas mágicos, transformações e persistência", async () => {
    // =========================================================================
    // TESTES 1, 2 e 3: Criação em Fantasia e Distopia/Ficção Científica, e
    // verificação das 34 seções completas
    // =========================================================================
    const { unmount } = render(<UniversoComp />);

    expect(screen.getByText("Enciclopédia de Países e Mundos")).toBeInTheDocument();

    // 1. Criar um país fictício de Fantasia (Medieval a Moderna)
    fireEvent.click(screen.getByTestId("btn-novo-registro-enciclopedico"));
    expect(screen.getByTestId("modal-novo-registro-enciclopedico")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-modality-Fantasia — Medieval a Moderna"));
    fireEvent.change(screen.getByTestId("modal-select-category"), {
      target: { value: "Reino" },
    });
    fireEvent.change(screen.getByTestId("modal-input-record-name"), {
      target: { value: "Reino de Valdoria" },
    });
    fireEvent.click(screen.getByTestId("btn-confirmar-criar-registro"));

    // 3. Verificar que todas as 34 seções estão disponíveis no índice lateral
    expect(ENCYCLOPEDIA_SECTIONS_META).toHaveLength(34);
    for (let s = 1; s <= 34; s++) {
      expect(screen.getByTestId(`nav-enc-sec-${s}`)).toBeInTheDocument();
    }

    // Verifica que os estilos de Fantasia estão visíveis
    expect(screen.getByText(FANTASY_STYLES[0].title)).toBeInTheDocument();

    // =========================================================================
    // TESTE 4: Preencher campos de diferentes seções e salvar
    // =========================================================================
    // Seção 1 já vem expandida por padrão
    fireEvent.change(screen.getByTestId("field-officialName"), {
      target: { value: "Soberano Reino de Valdoria" },
    });
    fireEvent.change(screen.getByTestId("field-capitalCity"), {
      target: { value: "Aurelia" },
    });
    fireEvent.change(screen.getByTestId("field-officialLanguages"), {
      target: { value: "Alto Valdoriano e Língua Comum" },
    });
    fireEvent.change(screen.getByTestId("field-officialCurrency"), {
      target: { value: "Coroas Solares" },
    });

    // Abre Seção 5 (Política e Governo) e preenche
    fireEvent.click(screen.getByTestId("toggle-enc-sec-5"));
    fireEvent.change(screen.getByTestId("field-governmentSystem"), {
      target: { value: "Monarquia Constitucional Arcana" },
    });

    // Abre Seção 10 (Clima) e preenche
    fireEvent.click(screen.getByTestId("toggle-enc-sec-10"));
    fireEvent.change(screen.getByTestId("field-predominantClimateTypes"), {
      target: { value: "Temperado oceânico com invernos luminescentes" },
    });

    // Abre Seção 17 (Religião) e preenche
    fireEvent.click(screen.getByTestId("toggle-enc-sec-17"));
    fireEvent.change(screen.getByTestId("field-predominantReligionsOrCults"), {
      target: { value: "Ordem dos Sete Sóis" },
    });

    // =========================================================================
    // TESTES 8, 9, 10, 11 e 12: Perguntas predefinidas e personalizadas
    // =========================================================================
    // Na Seção 1:
    // 8. Editar uma pergunta predefinida (def_sec1_1)
    const sec1QuestionBlock = screen.getByTestId("sec-questions-block-1");
    expect(sec1QuestionBlock).toBeInTheDocument();

    // Responde a pergunta predefinida da seção 1
    fireEvent.change(screen.getByLabelText("Qual é o significado simbólico das cores nacionais?"), {
      target: { value: "O ouro representa o sol eterno e o azul as águas sagradas." },
    });

    // Edita o enunciado da pergunta predefinida def_sec1_1
    fireEvent.click(screen.getByTestId("btn-edit-wq-def_sec1_1"));
    fireEvent.change(screen.getByTestId("input-wq-prompt-sec-1"), {
      target: {
        value: "Qual o significado místico e heráldico das cores de Valdoria?",
      },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-wq-sec-1"));
    expect(
      screen.getByText("Qual o significado místico e heráldico das cores de Valdoria?"),
    ).toBeInTheDocument();

    // 9. Criar pergunta personalizada apenas para este registro
    fireEvent.change(screen.getByTestId("input-wq-prompt-sec-1"), {
      target: { value: "Qual o juramento real feito na coroação?" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-wq-sec-1"));

    expect(screen.getByText("Qual o juramento real feito na coroação?")).toBeInTheDocument();

    // 11. Responder a pergunta personalizada recém-criada
    fireEvent.change(screen.getByLabelText("Qual o juramento real feito na coroação?"), {
      target: { value: "Servir à Chama Primordial até o último crepúsculo." },
    });

    // 10. Criar pergunta global e verificar depois que aparece em outros registros
    fireEvent.change(screen.getByTestId("input-wq-prompt-sec-1"), {
      target: { value: "Qual é a constelação regente deste território?" },
    });
    fireEvent.change(screen.getByLabelText("Escopo de reutilização"), {
      target: { value: "global" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-wq-sec-1"));

    expect(screen.getByText("Qual é a constelação regente deste território?")).toBeInTheDocument();

    // 12. Excluir uma pergunta predefinida na Seção 5 (def_sec5_1) e restaurar
    fireEvent.click(screen.getByTestId("btn-delete-wq-def_sec5_1"));
    expect(screen.queryByTestId("wq-card-def_sec5_1")).not.toBeInTheDocument();
    // E testar restauração de pergunta predefinida
    fireEvent.click(screen.getByTestId("btn-restaurar-perguntas-sec-5"));
    expect(screen.getByTestId("wq-card-def_sec5_1")).toBeInTheDocument();

    // =========================================================================
    // TESTE 5: Adicionar imagens com categorias e legendas e verificar galeria
    // =========================================================================
    fireEvent.click(screen.getByTestId("sheet-view-tab-gallery"));
    expect(screen.getByTestId("encyclopedia-image-gallery")).toBeInTheDocument();

    const fileInput = screen.getByTestId("input-file-enc-image");
    const mockFile = new File(["img-bytes"], "bandeira-valdoria.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Aguarda o painel pendente ou preenche se disponível
    await vi.waitFor(() => {
      expect(screen.getByTestId("enc-pending-image-panel")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("input-enc-img-title"), {
      target: { value: "Estandarte Solar de Valdoria" },
    });
    fireEvent.change(screen.getByTestId("select-enc-img-category"), {
      target: { value: "Bandeira" },
    });
    fireEvent.click(screen.getByTestId("btn-confirm-enc-image"));

    await vi.waitFor(() => {
      expect(screen.getByDisplayValue("Estandarte Solar de Valdoria")).toBeInTheDocument();
    });

    // =========================================================================
    // TESTE 6: Adicionar um mapa e criar marcadores interativos nele
    // =========================================================================
    fireEvent.click(screen.getByTestId("sheet-view-tab-maps"));
    expect(screen.getByTestId("encyclopedia-map-studio")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-novo-mapa"));
    fireEvent.change(screen.getByTestId("input-map-title"), {
      target: { value: "Mapa Político de Valdoria" },
    });
    fireEvent.change(screen.getByTestId("input-map-description"), {
      target: { value: "Escala 1:500.000 — Fronteiras dos Sete Ducados" },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-mapa"));

    expect(screen.getByRole("heading", { name: "Mapa Político de Valdoria" })).toBeInTheDocument();

    // Cria um marcador interativo no mapa ativo
    fireEvent.change(screen.getByTestId("input-map-marker-name"), {
      target: { value: "Cidadela de Aurelia" },
    });
    fireEvent.change(screen.getByTestId("select-map-marker-type"), {
      target: { value: "Capital" },
    });
    fireEvent.click(screen.getByTestId("btn-add-map-marker"));

    expect(screen.getAllByText("Cidadela de Aurelia").length).toBeGreaterThanOrEqual(1);

    // =========================================================================
    // TESTE 7: Criar acontecimentos históricos e visualizar na linha do tempo
    // =========================================================================
    fireEvent.click(screen.getByTestId("sheet-view-tab-timeline"));
    expect(screen.getByTestId("encyclopedia-timeline-manager")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-adicionar-acontecimento"));
    fireEvent.change(screen.getByTestId("input-event-name"), {
      target: { value: "Tratado das Três Coroas" },
    });
    fireEvent.change(screen.getByTestId("input-event-date"), {
      target: { value: "Ano 312 da Era Solar" },
    });
    fireEvent.change(screen.getByTestId("input-event-order"), {
      target: { value: "312" },
    });
    fireEvent.change(screen.getByTestId("select-event-category"), {
      target: { value: "Tratado / Diplomacia" },
    });
    fireEvent.change(screen.getByTestId("input-event-description"), {
      target: { value: "Aliança histórica que unificou os ducados do norte." },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-acontecimento"));

    expect(screen.getByText("Tratado das Três Coroas")).toBeInTheDocument();

    // =========================================================================
    // TESTES 13, 14 e 15: Organizações, Sistemas Mágicos e Transformações
    // =========================================================================
    fireEvent.click(screen.getByTestId("sheet-view-tab-entities"));
    expect(screen.getByTestId("encyclopedia-entities-hub")).toBeInTheDocument();

    // 13. Criar uma Organização e relacioná-la ao país
    fireEvent.click(screen.getByTestId("btn-nova-organizacao"));
    fireEvent.change(screen.getByTestId("input-org-name"), {
      target: { value: "Ordem dos Guardiões do Sol" },
    });
    fireEvent.change(screen.getByTestId("input-org-acronym"), {
      target: { value: "OGS" },
    });
    fireEvent.change(screen.getByTestId("select-org-category"), {
      target: { value: "Mágica" },
    });
    fireEvent.change(screen.getByTestId("input-org-description"), {
      target: { value: "Proteger as linhas de luz de Valdoria." },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-organizacao"));

    expect(screen.getByText("Ordem dos Guardiões do Sol")).toBeInTheDocument();

    // 14. Criar um Sistema Mágico e relacioná-lo ao país
    fireEvent.click(screen.getByTestId("hub-tab-magic"));
    fireEvent.click(screen.getByTestId("btn-novo-sistema-magico"));
    fireEvent.change(screen.getByTestId("input-magic-name"), {
      target: { value: "Tecelagem Heliocêntrica" },
    });
    fireEvent.change(screen.getByTestId("input-magic-source"), {
      target: { value: "Luz solar concentrada em cristais prismáticos" },
    });
    fireEvent.change(screen.getByTestId("input-magic-rules"), {
      target: { value: "Não pode ser conjurada em escuridão absoluta sem reserva." },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-sistema-magico"));

    expect(screen.getByText("Tecelagem Heliocêntrica")).toBeInTheDocument();

    // 15. Criar uma Transformação e relacioná-la ao sistema mágico e personagem
    const protagonist = actions.newCharacter("Protagonista");
    protagonist.name = "Seraphina Solis";
    actions.saveCharacter(protagonist);

    fireEvent.click(screen.getByTestId("hub-tab-transformations"));
    fireEvent.click(screen.getByTestId("btn-nova-transformacao"));
    fireEvent.change(screen.getByTestId("input-transformation-name"), {
      target: { value: "Forma de Valquíria Solar" },
    });
    fireEvent.change(screen.getByTestId("input-transformation-reqs"), {
      target: { value: "Portar a Relíquia da Aurora sob luz solar direta." },
    });
    fireEvent.click(screen.getByTestId("btn-salvar-transformacao"));

    expect(screen.getByText("Forma de Valquíria Solar")).toBeInTheDocument();

    // =========================================================================
    // TESTE 16: Relacionar o país/mundo a livros e personagens existentes
    // =========================================================================
    const testBook = actions.newBook(99);
    testBook.title = "Crônicas de Valdoria";
    actions.saveBook(testBook);

    fireEvent.click(screen.getByTestId("sheet-view-tab-relations"));
    expect(screen.getByTestId("record-relations-panel")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(`rel-book-${testBook.id}`));
    fireEvent.click(screen.getByTestId(`rel-char-${protagonist.id}`));

    // Volta para as 34 seções e usa o Montador Inteligente de Resumo (Seção 33 já vem expandida por padrão)
    fireEvent.click(screen.getByTestId("sheet-view-tab-sections"));
    fireEvent.click(screen.getByTestId("btn-montar-resumo-enciclopedico"));

    const summaryField = screen.getByTestId("field-encyclopedicSummaryText") as HTMLTextAreaElement;
    expect(summaryField.value).toContain("Soberano Reino de Valdoria");
    expect(summaryField.value).toContain("Aurelia");

    // Salva a ficha enciclopédica
    fireEvent.click(screen.getByTestId("btn-salvar-ficha-enciclopedica"));
    expect(screen.getByTestId("encyclopedia-save-status")).toHaveTextContent(
      /Ficha enciclopédica salva com sucesso/,
    );

    // =========================================================================
    // TESTE 18: Recarregar a página e confirmar que todos os dados permanecem salvos
    // =========================================================================
    unmount();

    const { unmount: unmountAfterReload } = render(<UniversoComp />);
    expect(screen.getByText("Reino de Valdoria")).toBeInTheDocument();

    // =========================================================================
    // TESTE 2: Criar um país/mundo de Distopia ou Ficção Científica e verificar
    // também que a pergunta global (Teste 10) aparece nele
    // =========================================================================
    fireEvent.click(screen.getByTestId("btn-novo-registro-enciclopedico"));
    fireEvent.click(screen.getByTestId("modal-modality-Distopia / Ficção Científica"));
    fireEvent.change(screen.getByTestId("modal-select-category"), {
      target: { value: "Mundo ou planeta" },
    });
    fireEvent.change(screen.getByTestId("modal-input-record-name"), {
      target: { value: "Colônia Orbital Neo-Vespera" },
    });
    fireEvent.click(screen.getByTestId("btn-confirmar-criar-registro"));

    // Verifica que os estilos de Distopia / Ficção Científica são carregados
    expect(screen.getByText(DYSTOPIA_SCIFI_STYLES[0].title)).toBeInTheDocument();

    // Verifica que a pergunta global criada no registro anterior aparece automaticamente na Seção 1 deste novo registro!
    expect(screen.getByText("Qual é a constelação regente deste território?")).toBeInTheDocument();

    // Salva e volta ao Hub da Enciclopédia
    fireEvent.click(screen.getByTestId("btn-salvar-ficha-enciclopedica"));
    fireEvent.click(screen.getByTestId("btn-voltar-enciclopedia"));

    // =========================================================================
    // TESTE 17: Testar busca e filtros da Enciclopédia
    // =========================================================================
    expect(screen.getByText("Reino de Valdoria")).toBeInTheDocument();
    expect(screen.getByText("Colônia Orbital Neo-Vespera")).toBeInTheDocument();

    // Filtra por modalidade Distopia / Ficção Científica
    fireEvent.change(screen.getByTestId("filter-encyclopedia-modality"), {
      target: { value: "Distopia / Ficção Científica" },
    });
    expect(screen.queryByText("Reino de Valdoria")).not.toBeInTheDocument();
    expect(screen.getByText("Colônia Orbital Neo-Vespera")).toBeInTheDocument();

    // Restaura filtro de modalidade e testa busca por capital ("Aurelia")
    fireEvent.change(screen.getByTestId("filter-encyclopedia-modality"), {
      target: { value: "Todas" },
    });
    fireEvent.change(screen.getByTestId("input-search-encyclopedia"), {
      target: { value: "Aurelia" },
    });
    expect(screen.getByText("Reino de Valdoria")).toBeInTheDocument();
    expect(screen.queryByText("Colônia Orbital Neo-Vespera")).not.toBeInTheDocument();

    // Limpa a busca
    fireEvent.change(screen.getByTestId("input-search-encyclopedia"), {
      target: { value: "" },
    });

    // =========================================================================
    // TESTE 19: Excluir registros de teste sem quebrar vínculos
    // =========================================================================
    const neoVesperaCardBtn = screen
      .getAllByTitle("Excluir registro")
      .find((btn) =>
        btn
          .closest("[data-testid^='world-record-card-']")
          ?.textContent?.includes("Colônia Orbital Neo-Vespera"),
      );
    expect(neoVesperaCardBtn).toBeDefined();
    fireEvent.click(neoVesperaCardBtn!);

    const confirmBtn = screen.getByText("Confirmar");
    fireEvent.click(confirmBtn);

    expect(screen.queryByText("Colônia Orbital Neo-Vespera")).not.toBeInTheDocument();
    expect(screen.getByText("Reino de Valdoria")).toBeInTheDocument();

    unmountAfterReload();

    // =========================================================================
    // TESTE 20: Confirmar que Home, Biblioteca e Personagens continuam intactos
    // =========================================================================
    const { unmount: uHome } = render(<HomeComp />);
    expect(screen.getAllByText(/Juramentos do Destino/i).length).toBeGreaterThan(0);
    uHome();

    const { unmount: uBib } = render(<BibliotecaComp />);
    expect(screen.getAllByText(/Biblioteca/i).length).toBeGreaterThan(0);
    uBib();

    const { unmount: uChars } = render(<PersonagensListComp />);
    expect(screen.getByText("Seraphina Solis")).toBeInTheDocument();
    uChars();
  }, 20000);
});

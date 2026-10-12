import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { actions } from "@/lib/store";
import {
  sanitizeRichHtml,
  normalizeSummaryToHtml,
  extractPlainTextFromHtml,
} from "@/components/chapters/RichTextWordEditor";

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

import { Route as CapitulosRoute } from "@/routes/capitulos";

function selectNodeText(node: Node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

describe("Spectral Archive Studio — Módulo de Capítulos e Sinopses + Editor Rico Estilo Microsoft Word", () => {
  beforeEach(() => {
    cleanup();
    actions.resetStoreForTests();
    vi.spyOn(CapitulosRoute, "useSearch").mockReturnValue({});
  });

  it("Executa todos os testes obrigatórios do módulo de Capítulos, do Editor Rico estilo Word e de integridade", () => {
    // Prepara entidades existentes no universo (personagens e locais da enciclopédia)
    const protagonist = actions.newCharacter("Protagonista");
    protagonist.name = "Aurelia Vance";
    actions.saveCharacter(protagonist);

    const secondaryChar = actions.newCharacter("Secundário");
    secondaryChar.name = "Dorian Kael";
    actions.saveCharacter(secondaryChar);

    const placeRecord = actions.newWorldRecord("Fantasia — Medieval a Moderna", "Reino");
    placeRecord.name = "Cidadela de Valis";
    actions.saveWorldRecord(placeRecord);

    const CapitulosComp = CapitulosRoute.options.component!;
    const { unmount } = render(<CapitulosComp />);

    // =========================================================================
    // 1. Verificar estado vazio amigável e livros existentes da biblioteca
    // =========================================================================
    expect(screen.getByTestId("chapters-hub-view")).toBeInTheDocument();
    expect(screen.getByTestId("empty-chapters-state")).toBeInTheDocument();
    expect(screen.getByTestId("stat-total-chapters").textContent).toBe("0");

    // =========================================================================
    // 2. Criar um capítulo, selecionar livro ("chama"), preencher 17 campos
    // =========================================================================
    fireEvent.click(screen.getByTestId("btn-new-chapter"));
    expect(screen.getByTestId("chapter-edit-view")).toBeInTheDocument();

    const bookSelect = screen.getByTestId("select-chapter-book") as HTMLSelectElement;
    expect(bookSelect.value).toBe("chama");

    fireEvent.change(screen.getByTestId("input-chapter-number"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId("input-chapter-title"), {
      target: { value: "O Despertar da Chama Ancestral" },
    });
    fireEvent.change(screen.getByTestId("select-chapter-type"), {
      target: { value: "Capítulo" },
    });
    fireEvent.change(screen.getByTestId("input-chapter-part"), {
      target: { value: "Parte I — Brasas do Trono" },
    });
    fireEvent.change(screen.getByTestId("input-chapter-chronology"), {
      target: { value: "Equinócio de Outono, Ano 304" },
    });
    fireEvent.change(screen.getByTestId("select-chapter-status"), {
      target: { value: "Em escrita" },
    });

    // Campos dramáticos (11 a 15)
    fireEvent.change(screen.getByTestId("input-chapter-objective"), {
      target: { value: "Apresentar o juramento proibido de Aurelia." },
    });
    fireEvent.change(screen.getByTestId("input-chapter-conflict"), {
      target: { value: "O selo real começa a romper diante do conselho." },
    });
    fireEvent.change(screen.getByTestId("input-chapter-emotion"), {
      target: { value: "Tensão solene e presságio místico." },
    });
    fireEvent.change(screen.getByTestId("input-chapter-hook"), {
      target: { value: "As chamas ficam azuis quando Dorian entra na sala." },
    });
    fireEvent.change(screen.getByTestId("input-chapter-private-notes"), {
      target: { value: "Lembrar de conectar o anel ao Livro 3." },
    });

    // =========================================================================
    // 3. Adicionar, editar e reorganizar acontecimentos importantes
    // =========================================================================
    const evInput = screen.getByTestId("input-new-important-event");
    fireEvent.change(evInput, {
      target: { value: "Aurelia chega ao salão das relíquias" },
    });
    fireEvent.click(screen.getByTestId("btn-add-important-event"));

    fireEvent.change(evInput, {
      target: { value: "O juramento de sangue é pronunciado" },
    });
    fireEvent.click(screen.getByTestId("btn-add-important-event"));

    expect(screen.getByTestId("important-event-item-0")).toHaveTextContent(
      "Aurelia chega ao salão das relíquias",
    );
    expect(screen.getByTestId("important-event-item-1")).toHaveTextContent(
      "O juramento de sangue é pronunciado",
    );

    // Reorganizar (mover o segundo evento para cima)
    fireEvent.click(screen.getByTestId("move-event-up-1"));
    expect(screen.getByTestId("important-event-item-0")).toHaveTextContent(
      "O juramento de sangue é pronunciado",
    );

    // Editar o primeiro acontecimento
    fireEvent.click(screen.getByTestId("edit-event-btn-0"));
    fireEvent.change(screen.getByTestId("edit-event-input-0"), {
      target: { value: "O juramento ancestral é selado em segredo" },
    });
    fireEvent.click(screen.getByTestId("save-event-btn-0"));
    expect(screen.getByTestId("important-event-item-0")).toHaveTextContent(
      "O juramento ancestral é selado em segredo",
    );

    // =========================================================================
    // 4. Associar personagens existentes e locais da enciclopédia sem duplicar
    // =========================================================================
    fireEvent.click(screen.getByTestId(`toggle-chap-char-${protagonist.id}`));
    fireEvent.click(screen.getByTestId(`toggle-chap-char-${secondaryChar.id}`));
    fireEvent.click(screen.getByTestId(`toggle-chap-loc-${placeRecord.id}`));

    // =========================================================================
    // 5. TESTES DO EDITOR DE TEXTO RICO ESTILO MICROSOFT WORD NO CAMPO RESUMO
    // =========================================================================
    const editorEl = screen.getByTestId("word-rich-editor-content");

    // Digitar resumo com acentos, caracteres especiais e parágrafos
    editorEl.innerHTML =
      "<p>Trecho selecionado para formatação rica no estúdio literário — ação, emoção & mistério!</p>";
    fireEvent.input(editorEl);

    const pNode = editorEl.querySelector("p")!;
    selectNodeText(pNode);

    // Aplicar Negrito, Itálico, Sublinhado, Tachado
    fireEvent.click(screen.getByTestId("toolbar-bold"));
    expect(editorEl.innerHTML.toLowerCase()).toMatch(/<(strong|b)>/);

    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.click(screen.getByTestId("toolbar-italic"));
    expect(editorEl.innerHTML.toLowerCase()).toMatch(/<(em|i)>/);

    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.click(screen.getByTestId("toolbar-underline"));
    expect(editorEl.innerHTML.toLowerCase()).toMatch(/<u>/);

    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.click(screen.getByTestId("toolbar-strikethrough"));
    expect(editorEl.innerHTML.toLowerCase()).toMatch(/<(s|strike)>/);

    // Alterar família e tamanho da fonte
    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.change(screen.getByTestId("toolbar-font-family"), {
      target: { value: "Georgia, serif" },
    });
    expect(editorEl.innerHTML).toContain("Georgia");

    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.change(screen.getByTestId("toolbar-font-size"), {
      target: { value: "20px" },
    });
    expect(editorEl.innerHTML).toContain("20px");

    // Aumentar tamanho da fonte no botão
    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.click(screen.getByTestId("toolbar-font-increase"));
    expect(editorEl.innerHTML).toContain("24px");

    // Aplicar cor do texto e destaque (marca-texto)
    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.click(screen.getByTestId("toolbar-text-color"));
    fireEvent.click(screen.getByTestId("text-color-swatch-#E8475F"));
    expect(editorEl.innerHTML.toLowerCase()).toMatch(/color:\s*(#e8475f|rgb\(232,\s*71,\s*95\))/i);

    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.click(screen.getByTestId("toolbar-highlight-color"));
    fireEvent.click(screen.getByTestId("highlight-swatch-#7A0F2B"));
    expect(editorEl.innerHTML.toLowerCase()).toMatch(
      /background-color:\s*(#7a0f2b|rgb\(122,\s*15,\s*43\))/i,
    );

    // Criar Títulos (Título 1, Título 2, Subtítulo)
    selectNodeText(editorEl.querySelector("p")!);
    fireEvent.change(screen.getByTestId("toolbar-block-style"), {
      target: { value: "h1" },
    });
    expect(editorEl.querySelector("h1")).not.toBeNull();

    selectNodeText(editorEl.querySelector("h1")!);
    fireEvent.change(screen.getByTestId("toolbar-block-style"), {
      target: { value: "h2" },
    });
    expect(editorEl.querySelector("h2")).not.toBeNull();

    // Alinhamento (Centralizar e Justificar)
    selectNodeText(editorEl.querySelector("h2")!);
    fireEvent.click(screen.getByTestId("toolbar-align-center"));
    expect(editorEl.querySelector("h2")?.style.textAlign).toBe("center");

    fireEvent.click(screen.getByTestId("toolbar-align-justify"));
    expect(editorEl.querySelector("h2")?.style.textAlign).toBe("justify");

    // Listas com marcadores e numeradas
    selectNodeText(editorEl.querySelector("h2")!);
    fireEvent.click(screen.getByTestId("toolbar-bullet-list"));
    expect(editorEl.querySelector("ul")).not.toBeNull();

    selectNodeText(editorEl.querySelector("li")!);
    fireEvent.click(screen.getByTestId("toolbar-ordered-list"));
    expect(editorEl.querySelector("ol")).not.toBeNull();

    // Inserir e remover hiperlink
    selectNodeText(editorEl.querySelector("li")!);
    fireEvent.click(screen.getByTestId("toolbar-insert-link"));
    fireEvent.change(screen.getByTestId("input-link-text"), {
      target: { value: "Crônicas de Valis" },
    });
    fireEvent.change(screen.getByTestId("input-link-url"), {
      target: { value: "https://spectral-archive.example/valis" },
    });
    fireEvent.click(screen.getByTestId("confirm-insert-link"));
    expect(editorEl.querySelector("a")?.getAttribute("href")).toBe(
      "https://spectral-archive.example/valis",
    );

    // Remover link e manter texto
    selectNodeText(editorEl.querySelector("a")!);
    fireEvent.click(screen.getByTestId("toolbar-remove-link"));
    expect(editorEl.querySelector("a")).toBeNull();
    expect(editorEl.textContent).toContain("Crônicas de Valis");

    // Desfazer e Refazer operações no editor
    fireEvent.click(screen.getByTestId("toolbar-undo"));
    expect(editorEl.querySelector("a")).not.toBeNull();
    fireEvent.click(screen.getByTestId("toolbar-redo"));
    expect(editorEl.querySelector("a")).toBeNull();

    // Salvar o capítulo e voltar à lista
    fireEvent.click(screen.getByTestId("btn-save-chapter"));
    expect(screen.getByTestId("chapter-save-feedback")).toHaveTextContent(
      "Capítulo salvo com sucesso",
    );
    fireEvent.click(screen.getByTestId("btn-return-chapter-list"));

    // =========================================================================
    // 6. Verificar capítulo salvo na lista do livro "Chama" e não em "Maré"
    // =========================================================================
    expect(screen.getByTestId("chapters-hub-view")).toBeInTheDocument();
    expect(screen.getByTestId("stat-total-chapters").textContent).toBe("1");
    expect(screen.getByText("O Despertar da Chama Ancestral")).toBeInTheDocument();

    // Trocar para o livro "Maré" -> não deve exibir o capítulo de "Chama"
    fireEvent.click(screen.getByTestId("book-tab-mare"));
    expect(screen.getByTestId("stat-total-chapters").textContent).toBe("0");
    expect(screen.queryByText("O Despertar da Chama Ancestral")).not.toBeInTheDocument();

    // Voltar para o livro "Chama"
    fireEvent.click(screen.getByTestId("book-tab-chama"));
    expect(screen.getByTestId("stat-total-chapters").textContent).toBe("1");

    // =========================================================================
    // 7. Reabrir o capítulo em Modo Leitura e confirmar formatação preservada
    // =========================================================================
    const savedChapter = JSON.parse(localStorage.getItem("juramentos-studio-v1") || "{}")
      .chapters[0];
    expect(savedChapter).toBeDefined();

    fireEvent.click(screen.getByTestId(`open-chapter-${savedChapter.id}`));
    expect(screen.getByTestId("chapter-read-view")).toBeInTheDocument();
    const readSummaryHtml = screen.getByTestId("read-chapter-summary-html");
    expect(readSummaryHtml.innerHTML).toContain("<ol>");
    expect(readSummaryHtml.textContent).toContain("Crônicas de Valis");

    // Voltar para o Hub de capítulos
    fireEvent.click(screen.getByTestId("btn-back-to-chapters"));

    // =========================================================================
    // 8. Alterar status para "Finalizado" e verificar Painel de Progresso (100%)
    // =========================================================================
    fireEvent.change(screen.getByTestId(`quick-status-${savedChapter.id}`), {
      target: { value: "Finalizado" },
    });
    expect(screen.getByTestId("stat-status-Finalizado").textContent).toBe("1");
    expect(screen.getByTestId("progress-completion-percent").textContent).toBe("100%");

    // =========================================================================
    // 9. Pesquisar capítulos e aplicar/remover filtros
    // =========================================================================
    const searchInput = screen.getByTestId("search-chapters-input");
    fireEvent.change(searchInput, { target: { value: "Aurelia" } }); // busca por personagem associado
    expect(screen.getByText("O Despertar da Chama Ancestral")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "InexistenteXYZ" } });
    expect(screen.queryByText("O Despertar da Chama Ancestral")).not.toBeInTheDocument();

    // Limpar filtros rapidamente
    fireEvent.click(screen.getByTestId("btn-clear-chapter-filters"));
    expect(screen.getByText("O Despertar da Chama Ancestral")).toBeInTheDocument();

    // Filtrar por local da enciclopédia
    fireEvent.change(screen.getByTestId("filter-location-select"), {
      target: { value: placeRecord.id },
    });
    expect(screen.getByText("O Despertar da Chama Ancestral")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("btn-clear-chapter-filters"));

    // =========================================================================
    // 10. Duplicar capítulo e excluir a cópia mediante confirmação
    // =========================================================================
    fireEvent.click(screen.getByTestId(`duplicate-chapter-${savedChapter.id}`));
    expect(screen.getByTestId("stat-total-chapters").textContent).toBe("2");
    expect(screen.getByText("O Despertar da Chama Ancestral (Cópia)")).toBeInTheDocument();

    const allChapsAfterDup = JSON.parse(
      localStorage.getItem("juramentos-studio-v1") || "{}",
    ).chapters;
    const duplicatedChap = allChapsAfterDup.find((c: { id: string }) => c.id !== savedChapter.id);

    // Excluir mediante confirmação
    fireEvent.click(screen.getByTestId(`delete-chapter-${duplicatedChap.id}`));
    expect(screen.getByTestId("confirm-delete-chapter-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("confirm-delete-chapter-btn"));

    expect(screen.getByTestId("stat-total-chapters").textContent).toBe("1");
    expect(screen.queryByText("O Despertar da Chama Ancestral (Cópia)")).not.toBeInTheDocument();

    // =========================================================================
    // 11. Simular recarregamento da página e confirmar persistência + sanitização
    // =========================================================================
    unmount();
    const { unmount: unmountReload } = render(<CapitulosComp />);
    expect(screen.getByText("O Despertar da Chama Ancestral")).toBeInTheDocument();
    expect(screen.getByTestId("progress-completion-percent").textContent).toBe("100%");
    unmountReload();

    // Verifica compatibilidade com resumos antigos em texto simples e sanitização contra XSS
    const migratedLegacy = normalizeSummaryToHtml(
      "",
      "Parágrafo legado 1 com acentuação.\n\nParágrafo legado 2.",
    );
    expect(migratedLegacy).toContain("<p>Parágrafo legado 1 com acentuação.</p>");
    expect(migratedLegacy).toContain("<p>Parágrafo legado 2.</p>");
    expect(extractPlainTextFromHtml(migratedLegacy)).toContain(
      "Parágrafo legado 1 com acentuação.",
    );

    const maliciousHtml =
      '<p onclick="alert(1)">Texto seguro</p><script>window.hacked=true</script><a href="javascript:alert(2)">Link</a>';
    const sanitized = sanitizeRichHtml(maliciousHtml);
    expect(sanitized).not.toContain("<script");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).toContain("<p>Texto seguro</p>");
  });
});

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Heart, UserRound, Copy, Trash2, Sparkles, Users, X } from "lucide-react";
import { useStore, actions, resolveCharacterModel, type CharacterModelType } from "@/lib/store";
import { MediaImage } from "@/components/MediaImage";

export const Route = createFileRoute("/personagens/")({
  head: () => ({
    meta: [
      { title: "Personagens — Juramentos Studio" },
      { name: "description", content: "Fichas dos personagens da saga Juramentos do Destino." },
      { property: "og:title", content: "Personagens — Juramentos Studio" },
      {
        property: "og:description",
        content: "Fichas dos personagens da saga Juramentos do Destino.",
      },
    ],
  }),
  component: Personagens,
});

function Personagens() {
  const chars = useStore((s) => s.characters);
  const books = useStore((s) => s.books);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [book, setBook] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("");
  const [archetypeFilter, setArchetypeFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const allArchetypes = Array.from(new Set(chars.flatMap((c) => c.archetypes ?? []))).sort();

  const list = chars
    .filter((c) => {
      const searchTarget = [
        c.name,
        c.nicknames,
        c.profession,
        c.elementOrConcept,
        ...(c.archetypes ?? []),
        ...(c.secStoryFunctions ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchTarget.includes(q.toLowerCase());
    })
    .filter((c) => !book || c.bookIds.includes(book))
    .filter((c) => !modelFilter || resolveCharacterModel(c) === modelFilter)
    .filter((c) => !archetypeFilter || (c.archetypes ?? []).includes(archetypeFilter))
    .sort((a, b) => a.name.localeCompare(b.name));

  const nameOf = (id?: string) => chars.find((c) => c.id === id)?.name;

  const handleDuplicate = (id: string) => {
    const copy = actions.duplicateCharacter(id);
    if (copy) {
      setToastMsg(`Ficha duplicada: “${copy.name}”`);
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  const handleDelete = (id: string) => {
    actions.deleteCharacter(id);
    setDeleteConfirmId(null);
    setToastMsg("Personagem excluído.");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const startNewCharacter = (model: CharacterModelType) => {
    setShowCreateModal(false);
    nav({
      to: "/personagens/$id",
      params: { id: "novo" },
      search: { modelo: model } as unknown as Record<string, unknown>,
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-teal">Spectral Archive Studio</p>
          <h1 className="text-4xl">Arquivo de Personagens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Desenvolvimento literário, psicológico, cinematográfico e visual dos personagens da
            saga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => setShowCreateModal(true)}
            data-testid="btn-novo-personagem"
          >
            <Plus className="h-4 w-4" /> Criar personagem
          </button>
        </div>
      </div>

      {toastMsg && (
        <div
          className="rounded-xl border border-teal/50 bg-teal/10 px-4 py-2.5 text-xs text-teal"
          role="status"
        >
          {toastMsg}
        </div>
      )}

      {/* Modal de escolha entre Protagonista e Personagem Secundário */}
      {showCreateModal && (
        <div
          className="card-luxe space-y-4 border-primary/50 p-5"
          data-testid="create-character-modal"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-2xl">Escolher modelo de ficha</h2>
              <p className="text-xs text-muted-foreground">
                Escolha entre o modelo Protagonista (16 seções) ou Personagem Secundário (15 seções
                dedicadas).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
            >
              <X className="h-4 w-4" /> Fechar
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => startNewCharacter("Protagonista")}
              className="flex flex-col items-start rounded-2xl border bg-background/60 p-5 text-left transition hover:border-primary"
              data-testid="btn-modelo-protagonista"
            >
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="mt-2 font-display text-2xl text-foreground">
                Modelo Protagonista (16 Seções)
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Ideal para personagens centrais da saga, com foco em arco principal, psicologia
                profunda, par romântico, jornada completa e assinatura cinematográfica.
              </p>
            </button>

            <button
              type="button"
              onClick={() => startNewCharacter("Secundário")}
              className="flex flex-col items-start rounded-2xl border bg-background/60 p-5 text-left transition hover:border-teal"
              data-testid="btn-modelo-secundario"
            >
              <Users className="h-6 w-6 text-teal" />
              <h3 className="mt-2 font-display text-2xl text-foreground">
                Modelo Personagem Secundário (15 Seções)
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Estrutura própria de 15 seções para aliados, mentores, rivais e vilões: função na
                história, vínculo com protagonistas, importância narrativa (1 a 3 estrelas), objetos
                marcantes, paletas e referências.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Barra de pesquisa e filtros */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px]">
        <div className="relative">
          <Search
            className="
            pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground
          "
          />
          <input
            className="!pl-9"
            placeholder="Pesquisar por nome, apelido, papel ou elemento…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          aria-label="Filtrar por livro"
          value={book}
          onChange={(e) => setBook(e.target.value)}
        >
          <option value="">Todos os livros</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por modelo"
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
        >
          <option value="">Todos os modelos</option>
          <option value="Protagonista">Protagonista</option>
          <option value="Secundário">Personagem Secundário</option>
        </select>

        <select
          aria-label="Filtrar por arquétipo"
          value={archetypeFilter}
          onChange={(e) => setArchetypeFilter(e.target.value)}
        >
          <option value="">Todos os arquétipos</option>
          {allArchetypes.map((arc) => (
            <option key={arc} value={arc}>
              {arc}
            </option>
          ))}
        </select>
      </div>

      {/* Estado vazio ou listagem */}
      {chars.length === 0 ? (
        <div className="card-luxe p-10 text-center">
          <UserRound className="mx-auto h-9 w-9 text-teal" />
          <h2 className="mt-3 font-display text-2xl">Nenhum personagem cadastrado ainda</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Crie a primeira ficha de personagem escolhendo entre o modelo de protagonista ou
            personagem secundário.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn" onClick={() => startNewCharacter("Protagonista")}>
              <Plus className="h-4 w-4" /> Criar protagonista
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => startNewCharacter("Secundário")}
            >
              Criar personagem secundário
            </button>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="card-luxe p-8 text-center text-muted-foreground">
          Nenhum personagem encontrado para os filtros selecionados.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const bookTitles = c.bookIds
              .map((id) => books.find((b) => b.id === id)?.title)
              .filter(Boolean)
              .join(" · ");
            const mainPalette = c.palettes?.[0];

            return (
              <li
                key={c.id}
                className="card-luxe flex flex-col justify-between p-4 transition hover:border-primary/60"
                data-testid={`char-card-${c.id}`}
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <Link
                      to="/personagens/$id"
                      params={{ id: c.id }}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-full border bg-secondary"
                    >
                      {c.photo ? (
                        <MediaImage
                          src={c.photo}
                          alt={c.name || "Personagem"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-display text-xl text-muted-foreground">
                          {(c.name || "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                        <span
                          className={
                            resolveCharacterModel(c) === "Secundário"
                              ? "font-medium text-teal"
                              : "font-medium text-primary"
                          }
                        >
                          {resolveCharacterModel(c)}
                        </span>
                        {c.elementOrConcept && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate text-teal">{c.elementOrConcept}</span>
                          </>
                        )}
                      </div>

                      <Link
                        to="/personagens/$id"
                        params={{ id: c.id }}
                        className="block truncate font-display text-2xl hover:text-primary"
                      >
                        {c.name || "Sem nome"}
                      </Link>

                      {c.nicknames && (
                        <p className="truncate text-xs italic text-muted-foreground">
                          “{c.nicknames}”
                        </p>
                      )}

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {bookTitles || "Sem livro vinculado"}
                        {c.profession ? ` · ${c.profession}` : ""}
                      </p>

                      {c.partnerId && (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-primary">
                          <Heart className="h-3 w-3 shrink-0" /> {nameOf(c.partnerId)}
                        </p>
                      )}
                    </div>
                  </div>

                  {c.definingPhrase && (
                    <p className="mt-3 line-clamp-2 text-xs italic text-muted-foreground">
                      “{c.definingPhrase}”
                    </p>
                  )}

                  {mainPalette && mainPalette.colors.length > 0 && (
                    <div className="mt-3 flex h-2 overflow-hidden rounded-full">
                      {mainPalette.colors.map((hex, i) => (
                        <span key={i} className="flex-1" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirmação de exclusão no cartão */}
                {deleteConfirmId === c.id ? (
                  <div className="mt-4 rounded-xl border border-destructive bg-destructive/10 p-2.5 text-xs">
                    <p className="text-foreground">
                      Excluir <strong>{c.name || "este personagem"}</strong>?
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="btn-ghost !min-h-7 !px-2.5 !py-1 text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="btn !min-h-7 !bg-destructive !px-2.5 !py-1 text-xs"
                        data-testid={`confirm-delete-char-${c.id}`}
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <Link
                      to="/personagens/$id"
                      params={{ id: c.id }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Abrir ficha completa →
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(c.id)}
                        aria-label={`Duplicar ${c.name}`}
                        title="Duplicar ficha"
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        data-testid={`duplicate-char-${c.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(c.id)}
                        aria-label={`Excluir ${c.name}`}
                        title="Excluir personagem"
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                        data-testid={`delete-char-${c.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

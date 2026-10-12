import { useHydrated } from "@tanstack/react-router";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ScrollText, Trash2, Save, Images } from "lucide-react";
import { useStore, actions, STATUSES, type Book } from "@/lib/store";
import { Cover } from "@/components/Cover";

export const Route = createFileRoute("/livros/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do livro — Juramentos Studio" },
      { name: "description", content: "Ficha editorial de um livro da saga." },
      { property: "og:title", content: "Ficha do livro — Juramentos Studio" },
      { property: "og:description", content: "Ficha editorial de um livro da saga." },
    ],
  }),
  component: BookPage,
});

function readImage(file: File, cb: (url: string) => void) {
  const r = new FileReader();
  r.onload = () => cb(r.result as string);
  r.readAsDataURL(file);
}

function BookPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const book = useStore((s) => s.books.find((b) => b.id === id));
  const [f, setF] = useState<Book | undefined>(book);
  const [saved, setSaved] = useState(false);
  const chars = useStore((s) => s.characters);
  const hydrated = useHydrated();
  useEffect(() => {
    setF(book);
  }, [book?.id, hydrated]);

  if (!book || !f)
    return (
      <div className="card-luxe p-8 text-center">
        Livro não encontrado.{" "}
        <Link to="/biblioteca" className="text-primary">
          Voltar
        </Link>
      </div>
    );
  const up = <K extends keyof Book>(k: K, v: Book[K]) => {
    setF({ ...f, [k]: v });
    setSaved(false);
  };
  const field = (k: "title" | "subtitle" | "genre" | "protagonists", label: string) => (
    <div>
      <label htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} value={f[k]} onChange={(e) => up(k, e.target.value)} />
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/biblioteca"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Biblioteca
      </Link>
      <div className="mt-4 grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <Cover book={f} className="mx-auto w-44 md:w-full" />
          <label className="btn-ghost w-full cursor-pointer !normal-case !tracking-normal">
            Enviar capa
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && readImage(e.target.files[0], (u) => up("cover", u))
              }
            />
          </label>
          {f.cover && (
            <button className="btn-ghost w-full" onClick={() => up("cover", undefined)}>
              Remover capa
            </button>
          )}
          <Link to="/estudio/$id" params={{ id }} className="btn w-full">
            <BookOpen className="h-4 w-4" /> Meu Livro Físico
          </Link>
          <Link to="/capitulos" search={{ livro: id }} className="btn-ghost w-full">
            <ScrollText className="h-4 w-4" /> Capítulos e Sinopses
          </Link>
          <Link to="/moodboards" search={{ livro: id }} className="btn-ghost w-full">
            <Images className="h-4 w-4" /> Moodboards do Livro
          </Link>
          <div className="card-luxe p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Progresso</p>
            <p className="font-display text-2xl">
              {f.chapters ? Math.min(100, Math.round((f.chaptersWritten / f.chapters) * 100)) : 0}%
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${f.chapters ? Math.min(100, (f.chaptersWritten / f.chapters) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {f.chaptersWritten} de {f.chapters} capítulos · {f.status}
            </p>
          </div>
          <div className="card-luxe p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Personagens neste livro
            </p>
            {chars.filter((c) => c.bookIds.includes(id)).length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum ainda.{" "}
                <Link to="/personagens" className="text-primary">
                  Adicionar
                </Link>
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {chars
                  .filter((c) => c.bookIds.includes(id))
                  .map((c) => (
                    <li key={c.id}>
                      <Link
                        to="/personagens/$id"
                        params={{ id: c.id }}
                        className="flex min-h-9 items-center text-sm hover:text-primary"
                      >
                        {c.name}
                        {c.partnerId ? " ♥" : ""}
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card-luxe space-y-4 p-5">
          <p className="text-xs text-teal">
            Campos com “exemplo editável” são marcadores — substitua pelo seu conteúdo.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("title", "Título")}
            {field("subtitle", "Subtítulo")}
            {field("genre", "Gênero")}
            {field("protagonists", "Casal protagonista")}
            <div>
              <label>Status</label>
              <select
                value={f.status}
                onChange={(e) => up("status", e.target.value as Book["status"])}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Ordem na saga</label>
              <input type="number" value={f.order} onChange={(e) => up("order", +e.target.value)} />
            </div>
            <div>
              <label>Capítulos planejados</label>
              <input
                type="number"
                min={0}
                value={f.chapters}
                onChange={(e) => up("chapters", +e.target.value)}
              />
            </div>
            <div>
              <label>Capítulos escritos</label>
              <input
                type="number"
                min={0}
                value={f.chaptersWritten}
                onChange={(e) => up("chaptersWritten", +e.target.value)}
              />
            </div>
          </div>
          <div>
            <label>Sinopse</label>
            <textarea
              rows={5}
              value={f.synopsis}
              placeholder="Ainda não preenchida."
              onChange={(e) => up("synopsis", e.target.value)}
            />
          </div>
          <div>
            <label>Informações editoriais</label>
            <textarea
              rows={3}
              value={f.editorial}
              placeholder="ISBN, editora, revisão, prazos…"
              onChange={(e) => up("editorial", e.target.value)}
            />
          </div>
          <div>
            <label>Paleta de cores</label>
            <div className="mt-1 flex gap-2">
              {f.palette.map((c, i) => (
                <input
                  key={i}
                  type="color"
                  className="!h-10 !w-14 !p-1"
                  value={c}
                  onChange={(e) => {
                    const p = [...f.palette] as Book["palette"];
                    p[i] = e.target.value;
                    up("palette", p);
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <button
              className="btn-ghost text-destructive"
              onClick={() => {
                if (confirm(`Excluir “${book.title}”? Esta ação não pode ser desfeita.`)) {
                  actions.deleteBook(id);
                  nav({ to: "/biblioteca" });
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
            <button
              className="btn"
              onClick={() => {
                actions.saveBook(f);
                setSaved(true);
              }}
            >
              <Save className="h-4 w-4" /> {saved ? "Salvo ✓" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

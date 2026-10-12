import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Layers, Sparkles, Compass } from "lucide-react";
import { useStore, defaultDesign } from "@/lib/store";
import { Cover } from "@/components/Cover";

export const Route = createFileRoute("/estudio/")({
  head: () => ({
    meta: [
      { title: "Meu Livro Físico — Spectral Archive Studio" },
      {
        name: "description",
        content:
          "Estúdio editorial 3D: simule capa, contracapa, lombada, orelhas e miolo de cada livro.",
      },
      { property: "og:title", content: "Meu Livro Físico — Spectral Archive Studio" },
      {
        property: "og:description",
        content:
          "Estúdio editorial 3D: simule capa, contracapa, lombada, orelhas e miolo de cada livro.",
      },
    ],
  }),
  component: EstudioIndexPage,
});

function EstudioIndexPage() {
  const books = useStore((s) => s.books);
  const studio = useStore((s) => s.studio);
  const author = useStore((s) => s.authorName);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Estúdio Editorial Tridimensional
          </p>
          <h1 className="mt-1 text-3xl md:text-4xl">Meu Livro Físico</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Escolha um livro da sua biblioteca para projetar capa frontal, lombada proporcional,
            contracapa, orelhas, acabamento gráfico, papel e miolo em perspectiva 3D realista.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            {books.length} {books.length === 1 ? "livro disponível" : "livros disponíveis"}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-teal" />
            {Object.keys(studio).length}{" "}
            {Object.keys(studio).length === 1 ? "projeto editado" : "projetos editados"}
          </span>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="card-luxe flex flex-col items-center justify-center p-12 text-center">
          <Compass className="h-10 w-10 text-primary" />
          <h2 className="mt-3 text-2xl">Nenhum livro cadastrado</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Cadastre um livro na Biblioteca para habilitar o Estúdio de Livro Físico.
          </p>
          <Link to="/biblioteca" className="btn mt-4">
            Ir para a Biblioteca
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((b) => {
            const entry = studio[b.id];
            const design = entry?.current ?? defaultDesign(b, author);
            const versionsCount = entry?.versions?.length ?? 0;
            const spineCm = Math.max(0.8, design.pages * 0.0065 + (design.hardcover ? 0.45 : 0.12));
            return (
              <Link
                key={b.id}
                to="/estudio/$id"
                params={{ id: b.id }}
                className="group card-luxe flex flex-col justify-between p-3.5 transition-transform duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="relative mx-auto overflow-hidden rounded-lg">
                    <Cover book={b} />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground tabular-nums">
                      <span>Vol. {b.order}</span>
                      <span>·</span>
                      <span>{design.format} cm</span>
                    </div>
                    <h2 className="mt-0.5 font-display text-lg leading-tight group-hover:text-primary transition-colors">
                      {design.title || b.title}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                      {design.pages} págs · lombada {spineCm.toFixed(1)} cm
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[0.7rem] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {design.hardcover ? "Capa dura" : "Brochura"}
                  </span>
                  <span className="tabular-nums">
                    {versionsCount > 0 ? `${versionsCount} v.` : "Abrir 3D →"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

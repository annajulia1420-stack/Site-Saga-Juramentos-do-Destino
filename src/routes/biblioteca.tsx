import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useStore, actions, STATUSES } from "@/lib/store";
import { Cover } from "@/components/Cover";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Juramentos Studio" },
      { name: "description", content: "Os dez livros da saga Juramentos do Destino." },
      { property: "og:title", content: "Biblioteca — Juramentos Studio" },
      { property: "og:description", content: "Os dez livros da saga Juramentos do Destino." },
    ],
  }),
  component: Biblioteca,
});

function Biblioteca() {
  const books = useStore((s) => s.books);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"order" | "title" | "status">("order");
  const list = books
    .filter((b) =>
      (b.title + b.subtitle + b.genre + b.protagonists).toLowerCase().includes(q.toLowerCase()),
    )
    .filter((b) => !status || b.status === status)
    .sort((a, b) =>
      sort === "order" ? a.order - b.order : String(a[sort]).localeCompare(String(b[sort])),
    );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-4xl">Biblioteca</h1>
        <button
          className="btn"
          onClick={() => {
            const b = actions.newBook(books.length + 1);
            actions.saveBook(b);
            nav({ to: "/livros/$id", params: { id: b.id } });
          }}
        >
          <Plus className="h-4 w-4" /> Livro
        </button>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            className="!pl-9"
            placeholder="Pesquisar livros…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="order">Ordem da saga</option>
          <option value="title">Título</option>
          <option value="status">Status</option>
        </select>
      </div>
      {list.length === 0 ? (
        <p className="card-luxe mt-6 p-8 text-center text-muted-foreground">
          Nenhum livro encontrado.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((b) => (
            <Link key={b.id} to="/livros/$id" params={{ id: b.id }} className="group">
              <Cover book={b} className="transition group-hover:-translate-y-1" />
              <p className="mt-2 font-display text-lg leading-tight">{b.title}</p>
              <span className="chip mt-1">{b.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

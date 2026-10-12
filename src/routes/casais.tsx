import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Images } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/casais")({
  head: () => ({
    meta: [
      { title: "Casais — Juramentos Studio" },
      { name: "description", content: "Casais e pares românticos da saga Juramentos do Destino." },
      { property: "og:title", content: "Casais — Juramentos Studio" },
      {
        property: "og:description",
        content: "Casais e pares românticos da saga Juramentos do Destino.",
      },
    ],
  }),
  component: Casais,
});

function Casais() {
  const chars = useStore((s) => s.characters);
  const books = useStore((s) => s.books);
  const pairs = chars
    .filter((c) => c.partnerId && c.id < c.partnerId)
    .map((a) => [a, chars.find((c) => c.id === a.partnerId)!] as const)
    .filter(([, b]) => b);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-4xl">Casais</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Os pares são definidos na ficha de cada personagem, no campo “Par romântico”.
      </p>
      {pairs.length === 0 ? (
        <div className="card-luxe mt-6 p-8 text-center">
          <Heart className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-muted-foreground">Nenhum casal definido ainda.</p>
          <Link to="/personagens" className="btn mt-4">
            Ir para personagens
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {pairs.map(([a, b]) => {
            const shared = a.bookIds
              .filter((x) => b.bookIds.includes(x))
              .map((x) => books.find((k) => k.id === x)?.title)
              .filter(Boolean);
            return (
              <li key={a.id} className="card-luxe p-4">
                <div className="flex items-center justify-center gap-3 font-display text-xl">
                  <Link to="/personagens/$id" params={{ id: a.id }} className="truncate">
                    {a.name}
                  </Link>
                  <Heart className="h-4 w-4 shrink-0 fill-primary text-primary" />
                  <Link to="/personagens/$id" params={{ id: b.id }} className="truncate">
                    {b.name}
                  </Link>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {shared.length ? shared.join(" · ") : "Sem livro em comum"}
                </p>
                <div className="mt-3 flex justify-center">
                  <Link
                    to="/moodboards"
                    search={{ casal: `${a.id}::${b.id}` }}
                    className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
                  >
                    <Images className="h-3.5 w-3.5 text-icon-primary" /> Moodboard do Casal
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

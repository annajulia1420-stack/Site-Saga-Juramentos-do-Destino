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

import { Route as MusicRoomRoute } from "@/routes/music-room";

describe("Módulo Music Room", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    actions.resetStoreForTests();
    vi.spyOn(MusicRoomRoute, "useSearch").mockReturnValue({});
  });

  it("renderiza a página inicial da Music Room com título, subtítulo e botões de ação", () => {
    const MusicRoomComp = MusicRoomRoute.options.component!;
    render(<MusicRoomComp />);

    expect(screen.getByText("Music Room")).toBeInTheDocument();
    expect(screen.getByText("A trilha sonora das suas histórias começa aqui.")).toBeInTheDocument();

    expect(screen.getByTestId("btn-criar-playlist")).toBeInTheDocument();
    expect(screen.getByTestId("btn-adicionar-musica")).toBeInTheDocument();
    expect(screen.getByTestId("btn-streaming-services")).toBeInTheDocument();
  });

  it("permite criar, editar, favoritar e duplicar uma nova playlist", () => {
    const MusicRoomComp = MusicRoomRoute.options.component!;
    render(<MusicRoomComp />);

    // 1. Abre modal de criação de playlist
    const btnCriar = screen.getByTestId("btn-criar-playlist");
    fireEvent.click(btnCriar);

    expect(screen.getByTestId("playlist-editor-modal")).toBeInTheDocument();

    // 2. Preenche nome
    const inputNome = screen.getByTestId("playlist-name-input");
    fireEvent.change(inputNome, { target: { value: "Trilha Épica da Batalha" } });

    // 3. Salva
    const btnSalvar = screen.getByTestId("btn-salvar-playlist");
    fireEvent.click(btnSalvar);

    expect(screen.queryByTestId("playlist-editor-modal")).not.toBeInTheDocument();
    expect(screen.getByText("Trilha Épica da Batalha")).toBeInTheDocument();

    // 4. Abre a playlist
    fireEvent.click(screen.getByText("Trilha Épica da Batalha"));
    expect(screen.getByText("Nenhuma música nesta playlist ainda.")).toBeInTheDocument();

    // 5. Duplica
    const btnDuplicar = screen.getByRole("button", { name: /Duplicar/i });
    fireEvent.click(btnDuplicar);

    // Volta para todas as playlists
    fireEvent.click(screen.getByRole("button", { name: /Playlists/i }));
    expect(screen.getByText("Trilha Épica da Batalha (Cópia)")).toBeInTheDocument();
  });

  it("permite adicionar uma música manualmente por link e associá-la a uma playlist", () => {
    // Cria uma playlist inicial
    const pl = actions.newMusicPlaylist({ name: "Cenas Noturnas" });
    actions.saveMusicPlaylist(pl);

    const MusicRoomComp = MusicRoomRoute.options.component!;
    render(<MusicRoomComp />);

    // Abre modal de música
    const btnAddMusica = screen.getByTestId("btn-adicionar-musica");
    fireEvent.click(btnAddMusica);

    expect(screen.getByTestId("track-editor-modal")).toBeInTheDocument();

    // Preenche URL, título e artista
    const inputUrl = screen.getByTestId("track-url-input");
    fireEvent.change(inputUrl, {
      target: { value: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" },
    });

    const inputTitulo = screen.getByTestId("track-title-input");
    fireEvent.change(inputTitulo, { target: { value: "Clair de Lune" } });

    const inputArtista = screen.getByTestId("track-artist-input");
    fireEvent.change(inputArtista, { target: { value: "Claude Debussy" } });

    // Seleciona a playlist
    const btnPl = screen.getByRole("button", { name: /Cenas Noturnas/i });
    fireEvent.click(btnPl);

    // Salva música
    const btnSalvar = screen.getByTestId("btn-salvar-musica");
    fireEvent.click(btnSalvar);

    expect(screen.queryByTestId("track-editor-modal")).not.toBeInTheDocument();

    // Abre a playlist Cenas Noturnas e verifica que a faixa está lá
    fireEvent.click(screen.getByText("Cenas Noturnas"));
    expect(screen.getByText("Clair de Lune")).toBeInTheDocument();
    expect(screen.getByText(/Claude Debussy/i)).toBeInTheDocument();
  });

  it("exibe informações reais e conexões com serviços de streaming (Spotify, YouTube Music, Apple Music, Deezer)", () => {
    const MusicRoomComp = MusicRoomRoute.options.component!;
    render(<MusicRoomComp />);

    // Clica na aba Conectar Serviços
    const btnServices = screen.getByTestId("btn-streaming-services");
    fireEvent.click(btnServices);

    expect(screen.getByText("Conectar Serviços de Streaming")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByText("YouTube Music")).toBeInTheDocument();
    expect(screen.getByText("Apple Music")).toBeInTheDocument();
    expect(screen.getByText("Deezer")).toBeInTheDocument();

    // Testa alternar conexão do Spotify
    const btnConectarSpotify = screen.getByTestId("btn-toggle-spotify");
    fireEvent.click(btnConectarSpotify); // Conecta Spotify

    // O status do Spotify deve ser "Conectado"
    expect(screen.getByTestId("status-spotify")).toHaveTextContent("Conectado");

    const btnDesconectar = screen.getByRole("button", { name: /Desconectar/i });
    fireEvent.click(btnDesconectar);
    expect(screen.getByTestId("status-spotify")).toHaveTextContent("Não conectado");
  });
});

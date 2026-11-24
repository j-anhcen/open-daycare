"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon";
const FIRST_POKEMON_ID = 1;

type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };
};

type PokemonState =
  | { status: "loading" }
  | { status: "ready"; pokemon: Pokemon }
  | { status: "error"; message: string };

type PokemonNavigatorProps = {
  initialId?: number;
};

export function PokemonNavigator({
  initialId = FIRST_POKEMON_ID,
}: PokemonNavigatorProps) {
  const [currentId, setCurrentId] = useState(initialId);
  const [state, setState] = useState<PokemonState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadPokemon() {
      setState({ status: "loading" });

      try {
        const response = await fetch(`${POKE_API_URL}/${currentId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`No se pudo cargar el Pokémon #${currentId}.`);
        }

        const pokemon = (await response.json()) as Pokemon;
        setState({ status: "ready", pokemon });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado.",
        });
      }
    }

    void loadPokemon();

    return () => controller.abort();
  }, [currentId]);

  const imageSrc =
    state.status === "ready"
      ? (state.pokemon.sprites.other["official-artwork"].front_default ??
        state.pokemon.sprites.front_default)
      : null;

  return (
    <section
      className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8"
      aria-live="polite"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-[12px] font-extrabold tracking-[0.12em] text-muted-strong uppercase">
          Pokémon actual
        </span>
        <span className="font-display text-[14px] font-semibold text-muted">
          #{String(currentId).padStart(3, "0")}
        </span>
      </div>

      <div className="flex min-h-[232px] items-center justify-center rounded-2xl bg-photo-bg p-4">
        {state.status === "ready" && imageSrc ? (
          <Image
            key={state.pokemon.id}
            src={imageSrc}
            alt={`Ilustración de ${state.pokemon.name}`}
            width={220}
            height={220}
            priority
            className="h-auto w-full max-w-[220px]"
          />
        ) : state.status === "loading" ? (
          <p className="text-[14px] text-muted">Cargando Pokémon…</p>
        ) : state.status === "error" ? (
          <p className="text-center text-[14px] text-accent-strong" role="alert">
            {state.message}
          </p>
        ) : (
          <p className="text-[14px] text-muted">Este Pokémon no tiene imagen.</p>
        )}
      </div>

      {state.status === "ready" && (
        <div className="mt-6 text-center">
          <h2 className="m-0 font-display text-[30px] font-semibold capitalize text-ink">
            {state.pokemon.name}
          </h2>
          <dl className="mt-4 flex justify-center gap-8 text-[13px]">
            <div>
              <dt className="text-muted">Altura</dt>
              <dd className="m-0 font-bold text-ink">
                {(state.pokemon.height / 10).toFixed(1)} m
              </dd>
            </div>
            <div>
              <dt className="text-muted">Peso</dt>
              <dd className="m-0 font-bold text-ink">
                {(state.pokemon.weight / 10).toFixed(1)} kg
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            setCurrentId((id) => Math.max(FIRST_POKEMON_ID, id - 1))
          }
          disabled={currentId === FIRST_POKEMON_ID || state.status === "loading"}
          className="cursor-pointer rounded-full border border-line bg-background px-5 py-2.5 text-[14px] font-bold text-ink transition hover:border-accent hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:text-ink"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={() => setCurrentId((id) => id + 1)}
          disabled={state.status === "loading"}
          className="cursor-pointer rounded-full bg-accent px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent"
        >
          Siguiente →
        </button>
      </div>
    </section>
  );
}

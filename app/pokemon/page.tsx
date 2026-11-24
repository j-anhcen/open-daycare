import type { Metadata } from "next";

import { PokemonNavigator } from "@/components/pokemon/PokemonNavigator";

export const metadata: Metadata = {
  title: "Pokédex · OpenDayCare",
  description: "Explorá Pokémon usando la PokéAPI.",
};

export default function PokemonPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center font-display text-[32px] font-semibold text-ink">
          Pokédex
        </h1>
        <PokemonNavigator />
      </div>
    </main>
  );
}

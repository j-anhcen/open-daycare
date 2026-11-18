import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { CreatePostProvider } from "@/components/feed/CreatePostContext";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenDayCare",
  description:
    "Feed del equipo de la guardería Sala Soles: compartí logros, actividades y avisos con las familias.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CreatePostProvider>{children}</CreatePostProvider>
      </body>
    </html>
  );
}

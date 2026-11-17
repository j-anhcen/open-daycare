export type PostType = "achievement" | "activity" | "announcement";

export type FeedPost = {
  id: string;
  type: PostType;
  authorName: string;
  authorInitial: string;
  timeLabel: string;
  audienceLabel: string;
  body: string;
  likesCount: number;
  commentsCount: number;
  photoPlaceholderLabel?: string;
};

export type FeedPageData = {
  roomLabel: string;
  greeting: string;
  subtitle: string;
  currentUser: { name: string; roleLabel: string; initial: string };
  composerPlaceholder: string;
  postsSectionLabel: string;
  posts: FeedPost[];
};

export const feedPageData: FeedPageData = {
  roomLabel: "GUARDERÍA · SALA SOLES",
  greeting: "Buenas, Caro",
  subtitle: "12 niños · martes 17 jun",
  currentUser: {
    name: "Caro Giménez",
    roleLabel: "Maestra · Soles",
    initial: "C",
  },
  composerPlaceholder: "Compartí un momento…",
  postsSectionLabel: "PUBLICADO HOY",
  posts: [
    {
      id: "achievement-mateo-potty",
      type: "achievement",
      authorName: "Mateo",
      authorInitial: "M",
      timeLabel: "14:20 · publicado por vos",
      audienceLabel: "Para: familia de Mateo",
      body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
      likesCount: 3,
      commentsCount: 1,
    },
    {
      id: "activity-mateo-painting",
      type: "activity",
      authorName: "Mateo",
      authorInitial: "M",
      timeLabel: "09:40 · publicado por vos",
      audienceLabel: "Para: familia de Mateo",
      body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
      likesCount: 5,
      commentsCount: 2,
      photoPlaceholderLabel: "Foto · pintando con témperas",
    },
    {
      id: "announcement-park",
      type: "announcement",
      authorName: "Anuncio general",
      authorInitial: "A",
      timeLabel: "07:50 · publicado por vos",
      audienceLabel: "Para: toda la sala",
      body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
      likesCount: 8,
      commentsCount: 0,
    },
  ],
};

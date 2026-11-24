import type { AvatarColorKey } from "@/lib/avatar";

export type PostType =
  | "achievement"
  | "activity"
  | "announcement"
  | "meal"
  | "nap"
  | "photo"
  | "encouragement";

/** Whole-room audience chip (e.g. "Toda la sala"): no avatar circle. */
export type RoomAudience = {
  id: string;
  label: string;
  initial?: undefined;
  color?: undefined;
};

/** Child audience chip. `color` pins the avatar palette instead of deriving it
 * from the name, so the compose modal matches the mockups exactly. */
export type ChildAudience = {
  id: string;
  label: string;
  initial: string;
  color: AvatarColorKey;
};

export type PostAudience = RoomAudience | ChildAudience;

export type PostTypeOption = { value: PostType; label: string };

export type FormPhoto = { id: string; name: string };

export type CreatePostFormValues = {
  recipients: string[];
  postType: PostType;
  description: string;
  photos: FormPhoto[];
};

export type CreatePostModalData = {
  title: string;
  cancelLabel: string;
  publishLabel: string;
  recipientsLabel: string;
  recipients: PostAudience[];
  typeLabel: string;
  postTypes: PostTypeOption[];
  descriptionLabel: string;
  descriptionPlaceholder: string;
  initialDescription: string;
  photosLabel: string;
  addPhotoLabel: string;
  newPostPhotoLabel: string;
  allAudienceName: string;
  errorMessage: { descriptionRequired: string };
};

export type StaffUser = {
  name: string;
  roleLabel: string;
  initial: string;
};

export const currentUser: StaffUser = {
  name: "Caro Giménez",
  roleLabel: "Maestra · Soles",
  initial: "C",
};

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
  currentUser: StaffUser;
  composerPlaceholder: string;
  postsSectionLabel: string;
  posts: FeedPost[];
};

export const feedPageData: FeedPageData = {
  roomLabel: "GUARDERÍA · SALA SOLES",
  greeting: "Buenas, Caro",
  subtitle: "12 niños · martes 17 jun",
  currentUser,
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

export const createPostModalData: CreatePostModalData = {
  title: "Nueva publicación",
  cancelLabel: "Cancelar",
  publishLabel: "Publicar",
  recipientsLabel: "PARA",
  recipients: [
    { id: "mateo", label: "Mateo", initial: "M", color: "blue" },
    { id: "sofia", label: "Sofía", initial: "S", color: "pink" },
    { id: "benjamin", label: "Benjamín", initial: "B", color: "green" },
    { id: "all", label: "Toda la sala" },
  ],
  typeLabel: "TIPO",
  postTypes: [
    { value: "meal", label: "Comida" },
    { value: "nap", label: "Siesta" },
    { value: "activity", label: "Actividad" },
    { value: "achievement", label: "Logro" },
    { value: "encouragement", label: "Ánimo" },
    { value: "photo", label: "Foto" },
    { value: "announcement", label: "Anuncio" },
  ],
  descriptionLabel: "DESCRIPCIÓN",
  descriptionPlaceholder: "Contá cómo le fue hoy…",
  initialDescription:
    "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón.",
  photosLabel: "FOTOS",
  addPhotoLabel: "Agregar",
  newPostPhotoLabel: "Foto · nueva publicación",
  allAudienceName: "Anuncio general",
  errorMessage: {
    descriptionRequired: "Escribí una descripción para publicar.",
  },
};

export const createPostInitialFormValues: CreatePostFormValues = {
  recipients: ["mateo"],
  postType: "activity",
  description: createPostModalData.initialDescription,
  photos: [{ id: "initial-photo", name: "" }],
};

/**
 * Derives the `FeedPost` for a valid "Nueva publicación" submission. The
 * audience is read in mockup order so labels stay stable regardless of the
 * order in which recipients were selected. Assumes the form was validated.
 */
export function buildFeedPostFromForm(values: CreatePostFormValues): FeedPost {
  const selectedRecipients = createPostModalData.recipients.filter((recipient) =>
    values.recipients.includes(recipient.id),
  );
  const isWholeRoom = values.recipients.includes("all");
  const firstChild = selectedRecipients.find(
    (recipient) => recipient.initial !== undefined,
  );
  const announcementInitial =
    createPostModalData.allAudienceName.charAt(0);

  return {
    id: crypto.randomUUID(),
    type: values.postType,
    authorName: isWholeRoom
      ? createPostModalData.allAudienceName
      : (firstChild?.label ?? createPostModalData.allAudienceName),
    authorInitial: isWholeRoom
      ? announcementInitial
      : (firstChild?.initial ?? announcementInitial),
    timeLabel: "ahora · publicado por vos",
    audienceLabel: isWholeRoom
      ? "Para: toda la sala"
      : `Para: familia de ${selectedRecipients
          .map((recipient) => recipient.label)
          .join(", ")}`,
    body: values.description.trim(),
    likesCount: 0,
    commentsCount: 0,
    photoPlaceholderLabel:
      values.photos.length > 0
        ? createPostModalData.newPostPhotoLabel
        : undefined,
  };
}

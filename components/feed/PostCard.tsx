import type { FeedPost, PostType } from "@/app/_data/mock";
import {
  CommentIcon,
  HeartIcon,
  ImageIcon,
  MegaphoneIcon,
} from "@/components/shared/icons";

const badgeStyles: Record<
  PostType,
  { label: string; wrapper: string; dot: string; text: string }
> = {
  achievement: {
    label: "LOGRO",
    wrapper: "bg-achievement-badge-bg",
    dot: "bg-achievement-badge-fg",
    text: "text-achievement-badge-fg",
  },
  activity: {
    label: "ACTIVIDAD",
    wrapper: "bg-activity-badge-bg",
    dot: "bg-activity-badge-fg",
    text: "text-activity-badge-fg",
  },
  announcement: {
    label: "ANUNCIO",
    wrapper: "bg-announcement-avatar-bg",
    dot: "bg-announcement-avatar-fg",
    text: "text-announcement-avatar-fg",
  },
  meal: {
    label: "COMIDA",
    wrapper: "bg-meal-badge-bg",
    dot: "bg-meal-badge-fg",
    text: "text-meal-badge-fg",
  },
  nap: {
    label: "SIESTA",
    wrapper: "bg-nap-badge-bg",
    dot: "bg-nap-badge-fg",
    text: "text-nap-badge-fg",
  },
  photo: {
    label: "FOTO",
    wrapper: "bg-photo-badge-bg",
    dot: "bg-photo-badge-fg",
    text: "text-photo-badge-fg",
  },
  encouragement: {
    label: "ÁNIMO",
    wrapper: "bg-encouragement-badge-bg",
    dot: "bg-encouragement-badge-fg",
    text: "text-encouragement-badge-fg",
  },
};

const avatarStyles: Record<PostType, string> = {
  achievement: "bg-child-avatar-bg text-child-avatar-fg",
  activity: "bg-child-avatar-bg text-child-avatar-fg",
  announcement: "bg-announcement-avatar-bg text-announcement-avatar-fg",
  meal: "bg-meal-badge-bg text-meal-badge-fg",
  nap: "bg-nap-badge-bg text-nap-badge-fg",
  photo: "bg-photo-badge-bg text-photo-badge-fg",
  encouragement: "bg-encouragement-badge-bg text-encouragement-badge-fg",
};

export type PostCardProps = {
  post: FeedPost;
};

export function PostCard({ post }: PostCardProps) {
  const badge = badgeStyles[post.type];
  const isAnnouncement = post.type === "announcement";

  return (
    <article className="rounded-[20px] border border-line bg-surface px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <div className="mb-[14px] flex items-center gap-3">
        <span
          className={`flex h-11 w-11 flex-none items-center justify-center rounded-full font-display text-[17px] font-semibold ${avatarStyles[post.type]}`}
        >
          {isAnnouncement ? (
            <MegaphoneIcon className="h-5 w-5" />
          ) : (
            post.authorInitial
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[16.5px] font-semibold text-ink">
            {post.authorName}
          </div>
          <div className="text-[12.5px] text-muted-light">
            {post.timeLabel}
          </div>
        </div>
        <div
          className={`flex flex-none items-center gap-[7px] rounded-full px-3 py-1.5 ${badge.wrapper}`}
        >
          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
          <span
            className={`text-[12px] font-extrabold tracking-[0.5px] ${badge.text}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <div className="mb-2.5 text-[12.5px] text-muted-light">
        {post.audienceLabel}
      </div>

      <p className="text-[15.5px] leading-[1.55] text-ink-body">{post.body}</p>

      {post.photoPlaceholderLabel ? (
        <div className="mt-[14px] flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-photo-border bg-photo-bg text-muted-faint">
          <ImageIcon className="h-[30px] w-[30px]" />
          <span className="text-[13.5px]">{post.photoPlaceholderLabel}</span>
        </div>
      ) : null}

      {/* TODO(posts): migrate the counters and "Editar" to next/link once the
          post detail and edit routes exist. */}
      <div className="mt-4 flex items-center gap-[18px] border-t border-line-soft pt-[14px]">
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-accent">
          <HeartIcon className="h-[19px] w-[19px]" />
          <span className="sr-only">{post.likesCount} me gusta</span>
          <span aria-hidden="true">{post.likesCount}</span>
        </span>
        <button
          type="button"
          aria-label={`Comentarios: ${post.commentsCount}`}
          className="flex cursor-pointer items-center gap-[7px] text-[14px] font-bold text-muted"
        >
          <CommentIcon className="h-[18px] w-[18px]" />
          <span aria-hidden="true">{post.commentsCount}</span>
        </button>
        <span className="flex-1" />
        <button
          type="button"
          className="cursor-pointer text-[14px] font-extrabold text-accent-strong"
        >
          Editar
        </button>
      </div>
    </article>
  );
}

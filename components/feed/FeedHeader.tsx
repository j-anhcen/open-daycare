type FeedHeaderProps = {
  roomLabel: string;
  greeting: string;
  subtitle: string;
};

export function FeedHeader({ roomLabel, greeting, subtitle }: FeedHeaderProps) {
  return (
    <header className="mb-6">
      <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent-label">
        {roomLabel}
      </div>
      <h1 className="m-0 font-display text-[30px] font-semibold text-ink">
        {greeting}
      </h1>
      <p className="mt-[5px] text-[14.5px] text-muted">{subtitle}</p>
    </header>
  );
}

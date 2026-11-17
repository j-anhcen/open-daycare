import { feedPageData } from "@/app/_data/mock";
import { Composer } from "@/components/feed/Composer";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { PostCard } from "@/components/feed/PostCard";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Sidebar } from "@/components/layout/Sidebar";

export default function Home() {
  const {
    roomLabel,
    greeting,
    subtitle,
    currentUser,
    composerPlaceholder,
    postsSectionLabel,
    posts,
  } = feedPageData;

  return (
    <div className="min-h-screen bg-background">
      <MobileMenu currentUser={currentUser} activeItem="feed" />

      <div className="md:flex">
        <Sidebar
          currentUser={currentUser}
          activeItem="feed"
          className="sticky top-0 hidden h-screen w-[248px] shrink-0 md:flex"
        />

        <main className="min-w-0 flex-1 md:h-screen md:overflow-y-auto">
          <div className="mx-auto w-full max-w-[760px] px-4 pt-6 pb-16 sm:px-6 md:px-10 md:pt-[34px] md:pb-20">
            <FeedHeader
              roomLabel={roomLabel}
              greeting={greeting}
              subtitle={subtitle}
            />

            <Composer
              currentUserInitial={currentUser.initial}
              placeholder={composerPlaceholder}
            />

            <div className="mb-[14px] flex items-center gap-[14px]">
              <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-muted-strong">
                {postsSectionLabel}
              </span>
              <span className="h-px flex-1 bg-[#E7DAC8]" />
            </div>

            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

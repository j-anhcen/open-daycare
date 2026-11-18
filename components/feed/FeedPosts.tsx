"use client";

import type { FeedPost } from "@/app/_data/mock";
import { useCreatePost } from "@/components/feed/CreatePostContext";
import { PostCard } from "@/components/feed/PostCard";

type FeedPostsProps = {
  posts: FeedPost[];
};

export function FeedPosts({ posts }: FeedPostsProps) {
  const { addedPosts } = useCreatePost();

  return (
    <div className="flex flex-col gap-4">
      {[...addedPosts, ...posts].map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

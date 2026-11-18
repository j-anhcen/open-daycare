"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  buildFeedPostFromForm,
  type CreatePostFormValues,
  type FeedPost,
} from "@/app/_data/mock";
import { CreatePostModal } from "@/components/feed/CreatePostModal";

type CreatePostContextValue = {
  isOpen: boolean;
  addedPosts: FeedPost[];
  openModal: () => void;
  closeModal: () => void;
  publishPost: (values: CreatePostFormValues) => void;
};

const CreatePostContext = createContext<CreatePostContextValue | null>(null);

export function CreatePostProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [addedPosts, setAddedPosts] = useState<FeedPost[]>([]);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setAddedPosts([]);
      setIsOpen(false);
    }
  }, [pathname]);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const publishPost = useCallback((values: CreatePostFormValues) => {
    const post = buildFeedPostFromForm(values);
    setAddedPosts((current) => [post, ...current]);
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, addedPosts, openModal, closeModal, publishPost }),
    [isOpen, addedPosts, openModal, closeModal, publishPost],
  );

  return (
    <CreatePostContext.Provider value={value}>
      {children}
      <CreatePostModal
        isOpen={isOpen}
        onClose={closeModal}
        onPublish={publishPost}
      />
    </CreatePostContext.Provider>
  );
}

export function useCreatePost(): CreatePostContextValue {
  const context = useContext(CreatePostContext);
  if (context === null) {
    throw new Error("useCreatePost must be used inside a CreatePostProvider");
  }
  return context;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createPostInitialFormValues,
  createPostModalData,
  type CreatePostFormValues,
  type FormPhoto,
  type PostType,
} from "@/app/_data/mock";
import { CloseIcon, ImageIcon, PlusIcon } from "@/components/shared/icons";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (values: CreatePostFormValues) => void;
};

const sectionLabelClass =
  "mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted";

const recipientAvatarStyles: Record<string, string> = {
  mateo: "bg-avatar-blue-bg text-avatar-blue-fg",
  sofia: "bg-avatar-pink-bg text-avatar-pink-fg",
  benjamin: "bg-avatar-green-bg text-avatar-green-fg",
};

const postTypePillStyles: Record<PostType, string> = {
  meal: "bg-post-type-meal-bg text-post-type-meal-fg",
  nap: "bg-post-type-nap-bg text-post-type-nap-fg",
  activity: "bg-post-type-activity-bg text-post-type-activity-fg",
  achievement: "bg-post-type-achievement-bg text-post-type-achievement-fg",
  encouragement:
    "bg-post-type-encouragement-bg text-post-type-encouragement-fg",
  photo: "bg-post-type-photo-bg text-post-type-photo-fg",
  announcement: "bg-post-type-announcement-bg text-post-type-announcement-fg",
};

function buildPhotos(names: string[]): FormPhoto[] {
  return names.map((name) => ({ id: crypto.randomUUID(), name }));
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPublish,
}: CreatePostModalProps) {
  const data = createPostModalData;
  const [values, setValues] = useState<CreatePostFormValues>(
    createPostInitialFormValues,
  );
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const handleClose = useCallback(() => {
    onClose();
    setValues(createPostInitialFormValues);
    setDescriptionError(undefined);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, handleClose]);

  const toggleRecipient = (id: string) => {
    setValues((current) => {
      if (id === "all") {
        return {
          ...current,
          recipients: current.recipients.includes("all")
            ? [...createPostInitialFormValues.recipients]
            : ["all"],
        };
      }

      const selectedChildren = current.recipients.filter(
        (recipient) => recipient !== "all",
      );
      const recipients = selectedChildren.includes(id)
        ? selectedChildren.filter((recipient) => recipient !== id)
        : [...selectedChildren, id];

      return {
        ...current,
        recipients:
          recipients.length > 0
            ? recipients
            : [...createPostInitialFormValues.recipients],
      };
    });
  };

  const addPhotos = (names: string[]) => {
    if (names.length === 0) {
      return;
    }

    setValues((current) => ({
      ...current,
      photos: [...current.photos, ...buildPhotos(names)],
    }));
  };

  const removePhoto = (id: string) => {
    setValues((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== id),
    }));
  };

  const handlePublish = () => {
    if (values.description.trim().length === 0) {
      setDescriptionError(data.errorMessage.descriptionRequired);
      descriptionRef.current?.focus();
      return;
    }

    onPublish(values);
    setValues(createPostInitialFormValues);
    setDescriptionError(undefined);
  };

  return (
    <div
      inert={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            handleClose();
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addPhotos(
            Array.from(event.dataTransfer.files).map((file) => file.name),
          );
        }}
        className={`absolute inset-0 flex items-start justify-center overflow-y-auto bg-ink/35 p-4 transition-opacity duration-200 sm:px-6 sm:py-10 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-post-modal-title"
          className={`mx-auto w-full max-w-[580px] overflow-hidden rounded-[24px] border border-line bg-modal-surface shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] transition-[opacity,scale] duration-200 ${
            isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-[26px] py-5">
            <button
              type="button"
              onClick={handleClose}
              className="text-[15px] font-bold text-muted"
            >
              {data.cancelLabel}
            </button>
            <span
              id="create-post-modal-title"
              className="font-display text-[18px] font-semibold text-ink"
            >
              {data.title}
            </span>
            <button
              type="button"
              onClick={handlePublish}
              className="text-[15px] font-extrabold text-accent-label"
            >
              {data.publishLabel}
            </button>
          </div>

          <div className="px-[26px] py-6">
            <div id="create-post-recipients-label" className={sectionLabelClass}>
              {data.recipientsLabel}
            </div>
            <div
              role="group"
              aria-labelledby="create-post-recipients-label"
              className="mb-[22px] flex flex-wrap gap-[9px]"
            >
              {data.recipients.map((recipient) => {
                const isSelected = values.recipients.includes(recipient.id);
                const isRoom = recipient.initial === undefined;
                const selectionStyles = isSelected
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-nav-muted";

                return (
                  <button
                    key={recipient.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleRecipient(recipient.id)}
                    className={`flex items-center rounded-full border-[1.5px] py-[6px] text-[14px] font-bold ${
                      isRoom ? "px-4" : "gap-2 pl-[6px] pr-[14px]"
                    } ${selectionStyles}`}
                  >
                    {isRoom ? null : (
                      <span
                        className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-display text-[13px] font-semibold ${
                          recipientAvatarStyles[recipient.id]
                        }`}
                      >
                        {recipient.initial}
                      </span>
                    )}
                    {recipient.label}
                  </button>
                );
              })}
            </div>

            <div id="create-post-types-label" className={sectionLabelClass}>
              {data.typeLabel}
            </div>
            <div
              role="group"
              aria-labelledby="create-post-types-label"
              className="mb-[22px] flex flex-wrap gap-[9px]"
            >
              {data.postTypes.map((option) => {
                const isSelected = values.postType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setValues((current) => ({
                        ...current,
                        postType: option.value,
                      }))
                    }
                    className={`rounded-full px-4 py-2 text-[13.5px] font-extrabold ${postTypePillStyles[option.value]} ${
                      isSelected
                        ? "ring-2 ring-ink ring-offset-2 ring-offset-modal-surface"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <label htmlFor="create-post-description" className={sectionLabelClass}>
              {data.descriptionLabel}
            </label>
            <div className="mb-[22px]">
              <textarea
                ref={descriptionRef}
                id="create-post-description"
                value={values.description}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }));
                  setDescriptionError(undefined);
                }}
                placeholder={data.descriptionPlaceholder}
                aria-invalid={descriptionError !== undefined}
                aria-describedby={
                  descriptionError === undefined
                    ? undefined
                    : "create-post-description-error"
                }
                className={`min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] bg-white p-[14px_16px] text-[15px] leading-[1.5] text-ink outline-none placeholder:text-input-placeholder ${
                  descriptionError === undefined
                    ? "border-input-border"
                    : "border-input-error-border"
                }`}
              />
              {descriptionError !== undefined && (
                <p
                  id="create-post-description-error"
                  className="mt-2 text-[12.5px] text-input-error-text"
                >
                  {descriptionError}
                </p>
              )}
            </div>

            <div className={sectionLabelClass}>{data.photosLabel}</div>
            <div className="flex flex-wrap gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-[14px] border border-line bg-photo-bg text-muted-faint">
                <ImageIcon className="h-[26px] w-[26px]" />
              </div>
              {values.photos
                .filter((photo) => photo.name.length > 0)
                .map((photo) => (
                  <div
                    key={photo.id}
                    className="relative flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-[14px] border border-line bg-photo-bg px-1 text-center"
                  >
                    <ImageIcon className="h-5 w-5 text-muted-faint" />
                    <span className="line-clamp-2 w-full text-[10px] leading-tight text-nav-muted">
                      {photo.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      aria-label={`Quitar ${photo.name}`}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-muted"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              <button
                type="button"
                onClick={() => addPhotos([data.newPostPhotoLabel])}
                className="flex h-24 w-24 flex-col items-center justify-center gap-[6px] rounded-[14px] border-[1.5px] border-dashed border-photo-border bg-photo-bg text-muted-faint"
              >
                <PlusIcon className="h-[22px] w-[22px] text-accent-strong" />
                <span className="text-[12px]">{data.addPhotoLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface AvatarPickerProps {
  userId: Id<"users">;
  avatarUrl: string | null;
  avatarCharacterId?: Id<"characters">;
}

export function AvatarPicker({
  userId,
  avatarUrl,
  avatarCharacterId,
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const characters = useQuery(api.characters.getUserCharactersWithThumbnails, {
    userId,
  });
  const updateAvatar = useMutation(api.users.updateUserAvatar);
  const clearAvatar = useMutation(api.users.clearUserAvatar);
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);

  const handleCharacterSelect = async (characterId: Id<"characters">) => {
    await updateAvatar({ characterId });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    await updateAvatar({ imageStorageId: storageId });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // The initials fallback for the large avatar
  const initials = "?";

  return (
    <div className="space-y-4">
      {/* Current avatar display */}
      <div className="flex items-center gap-4">
        <div className="size-20 rounded-full overflow-hidden shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Your avatar"
              width={80}
              height={80}
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <span className="size-20 rounded-full bg-coral/10 text-coral flex items-center justify-center text-xl font-medium">
              {initials}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Upload className="size-4" aria-hidden="true" />
            Upload photo
          </Button>
          {avatarUrl && (
            <button
              onClick={() => clearAvatar()}
              className="block text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded px-1"
            >
              Remove avatar
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload avatar photo"
          />
        </div>
      </div>

      {/* Character selection */}
      {characters && characters.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium">Or use a character</p>
          <div className="flex flex-wrap gap-2">
            {characters.map((character) => {
              const isSelected = avatarCharacterId === character._id;
              return (
                <button
                  key={character._id}
                  onClick={() => handleCharacterSelect(character._id)}
                  className={`size-12 rounded-full overflow-hidden cursor-pointer transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                    isSelected
                      ? "ring-2 ring-coral ring-offset-2"
                      : "hover:ring-2 hover:ring-border hover:ring-offset-1"
                  }`}
                  aria-label={`Use ${character.name} as avatar`}
                  aria-pressed={isSelected}
                >
                  {character.thumbnailUrl ? (
                    <Image
                      src={character.thumbnailUrl}
                      alt={character.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="size-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      {character.name[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

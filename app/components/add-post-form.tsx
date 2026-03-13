"use client";

import { useState, useRef } from "react";
import { createPost } from "../actions";

export function AddPostButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
      >
        Add post
      </button>
      {open && <AddPostDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function AddPostDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);
    setWarning(null);

    try {
      let blobName: string | null = null;
      let uploadUrl: string | null = null;

      if (file) {
        const res = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          blobName = data.blobName;
          uploadUrl = data.uploadUrl;
        }
      }

      const result = await createPost({
        title: title.trim(),
        excerpt: text.trim(),
        image_filename: blobName,
        published_at: new Date(date).toISOString(),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (file && uploadUrl) {
        try {
          const upload = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!upload.ok) throw new Error("Upload returned " + upload.status);
        } catch {
          setWarning("Post saved, but image failed to upload.");
          setTimeout(onClose, 2000);
          return;
        }
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-medium text-zinc-900">New post</h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-zinc-500" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-500" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-500" htmlFor="text">
              Text
            </label>
            <textarea
              id="text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400"
              placeholder="Write something..."
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-500">Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            {preview ? (
              <div className="mt-1 relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-full rounded-md border border-zinc-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-1.5 right-1.5 rounded-full bg-white/80 px-1.5 py-0.5 text-xs text-zinc-500 hover:text-zinc-900"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-1 w-full rounded-md border border-dashed border-zinc-300 py-6 text-sm text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-500"
              >
                Choose file
              </button>
            )}
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {warning && <p className="mt-3 text-sm text-red-500">{warning}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

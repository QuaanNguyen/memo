import Image from "next/image";
import { supabase, getImageUrl, type Post } from "./lib/supabase";
import { AddPostButton } from "./components/add-post-form";

export default async function Home() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false })
    .returns<Post[]>();

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
        <h1 className="text-lg font-medium tracking-tight text-zinc-900">
          Memo
        </h1>
        <AddPostButton />
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {!posts || posts.length === 0 ? (
          <p className="text-sm text-zinc-400">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const imageUrl = getImageUrl(post.image_filename);
              return (
                <article
                  key={post.id}
                  className="group overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors hover:border-zinc-300"
                >
                  {imageUrl && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-sm font-medium text-zinc-900">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                        {post.excerpt}
                      </p>
                    )}
                    <time
                      dateTime={post.published_at}
                      className="mt-3 block text-xs text-zinc-400"
                    >
                      {new Date(post.published_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./lib/supabase";

export async function createPost(data: {
  title: string;
  excerpt: string;
  image_filename: string | null;
  published_at: string;
}) {
  const { error } = await supabase.from("posts").insert({
    title: data.title,
    excerpt: data.excerpt || null,
    image_filename: data.image_filename,
    published_at: data.published_at,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function clearPostImage(postId: string) {
  const { error } = await supabase
    .from("posts")
    .update({ image_filename: null })
    .eq("id", postId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

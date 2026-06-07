import { notFound, redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { updateCircle, deleteCircle } from "@/app/actions/circles";
import { CircleForm } from "@/components/CircleForm";

export default async function EditCirclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/circles/${id}/edit`);

  const circle = await prisma.circle.findUnique({ where: { id } });
  if (!circle) notFound();
  if (circle.ownerId !== user.id) redirect(`/circles/${id}`);

  const boundUpdate = updateCircle.bind(null, id);
  const boundDelete = deleteCircle.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-stone-800">サークルを編集</h1>
        <p className="mt-1 text-stone-500">内容を更新して保存しましょう。</p>
      </div>

      <div className="rounded-4xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8">
        <CircleForm
          action={boundUpdate}
          submitLabel="変更を保存する"
          defaults={{
            name: circle.name,
            description: circle.description,
            rules: circle.rules,
            category: circle.category,
            audience: circle.audience,
            location: circle.location,
            capacity: circle.capacity,
            coverColor: circle.coverColor,
            tags: circle.tags,
            images: circle.images,
          }}
        />
      </div>

      {/* Danger zone */}
      <form action={boundDelete} className="mt-6 rounded-4xl border border-rose-100 bg-rose-50/50 p-6">
        <h2 className="font-bold text-rose-700">サークルを削除</h2>
        <p className="mt-1 text-sm text-stone-500">
          削除すると応募・チャットの履歴もすべて消えます。元に戻せません。
        </p>
        <button
          type="submit"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
        >
          <Trash2 className="h-4 w-4" />
          このサークルを削除する
        </button>
      </form>
    </div>
  );
}

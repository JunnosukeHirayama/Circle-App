import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { createCircle } from "@/app/actions/circles";
import { CircleForm } from "@/components/CircleForm";

export default async function NewCirclePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/circles/new");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-stone-800">サークルを作る</h1>
        <p className="mt-1 text-stone-500">
          情報を入力して、いっしょに活動する仲間を募集しましょう。
        </p>
      </div>
      <div className="rounded-4xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8">
        <CircleForm action={createCircle} />
      </div>
    </div>
  );
}

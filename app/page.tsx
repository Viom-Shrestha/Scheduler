import { listTasks } from "@/lib/db";
import DeckApp from "@/components/DeckApp";

export default async function Home() {
  const tasks = await listTasks();

  return (
    <main className="mx-auto max-w-[1560px] px-5 py-8 sm:px-10 sm:py-10">
      <DeckApp tasks={tasks} />
    </main>
  );
}

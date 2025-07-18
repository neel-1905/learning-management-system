import CompanionForm from "@/components/companion/CompanionForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const page = async () => {
  const { userId } = await auth();

  if (!userId) return redirect("/sign-in");

  return (
    <main className="min-lg:w-1/3 min-md:w-2/3 items-center justify-center flex p-2">
      <article className="w-full gap-4 flex flex-col">
        <h1>Companion Builder</h1>
        <CompanionForm />
      </article>
    </main>
  );
};

export default page;

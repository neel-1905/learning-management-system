import CompanionForm from "@/components/companion/CompanionForm";
import { newCompanionPermissions } from "@/lib/actions/companion.actions";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async () => {
  const { userId } = await auth();

  if (!userId) return redirect("/sign-in");

  const canCreateCompanion = await newCompanionPermissions();

  console.log(canCreateCompanion);

  return (
    <main className="min-lg:w-1/3 min-md:w-2/3 items-center justify-center flex p-2">
      {canCreateCompanion ? (
        <article className="w-full gap-4 flex flex-col">
          <h1>Companion Builder</h1>
          <CompanionForm />
        </article>
      ) : (
        <article className="companion-limit">
          <Image
            src={`/images/limit.svg`}
            alt="limit"
            width={360}
            height={230}
          />
          <div className="cta-badge">Upgrade your plan!</div>

          <h1>You have reached the limit of companions</h1>
          <p>
            You can create up to 3 companions with the free plan. Upgrade to
            create more companions.
          </p>

          <Link
            href={`/subscriptions`}
            className="btn-primary w-full justify-center"
          >
            Upgrade your plan
          </Link>
        </article>
      )}
    </main>
  );
};

export default page;

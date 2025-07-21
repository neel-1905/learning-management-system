import CompanionCard from "@/components/companion/CompanionCard";
import CompanionsList from "@/components/companion/CompanionsList";
import CTA from "@/components/shared/CTA";
import {
  getAllCompanions,
  getRecentSessions,
} from "@/lib/actions/companion.actions";
import React from "react";

const Page = async () => {
  const companions = await getAllCompanions({ limit: 3 });

  const recentSessions = await getRecentSessions(10);

  return (
    <main>
      <h1 className="text-3xl">Popular Companions</h1>
      <section className="home-section">
        {companions?.map((companion) => (
          <CompanionCard key={companion.id} {...companion} />
        ))}
      </section>

      <section className="home-section">
        <CompanionsList
          title="Recently completed sessions"
          companions={recentSessions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;

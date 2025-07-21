import CompanionCard from "@/components/companion/CompanionCard";
import SearchInput from "@/components/shared/SearchInput";
import SubjectFilter from "@/components/shared/SubjectFilter";
import { getAllCompanions } from "@/lib/actions/companion.actions";

const page = async ({ searchParams }: SearchParams) => {
  const filters = await searchParams;

  const subject = filters.subject ? filters?.subject : "";
  const topic = filters.topic ? filters?.topic : "";

  const companions = await getAllCompanions({ subject, topic });

  return (
    <main>
      <section className="flex justify-between gap-4 max-sm:flex-col">
        <h1>Companion Library</h1>
        <div className="flex gap-4">
          <SearchInput />
          <SubjectFilter />
        </div>
      </section>

      <section className="companions-grid">
        {companions?.map((companion) => (
          <CompanionCard key={companion.id} {...companion} />
        ))}
      </section>
    </main>
  );
};

export default page;

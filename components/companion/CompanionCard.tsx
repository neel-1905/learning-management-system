import { getSubjectColor } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type CompanionCardProps = {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  customColor?: string;
};

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  customColor,
}: CompanionCardProps) => {
  const color = customColor || getSubjectColor(subject);

  return (
    <article
      className="companion-card"
      style={{
        backgroundColor: color,
      }}
    >
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <button className="companion-bookmark">
          <Image
            src={`/icons/bookmark.svg`}
            width={12.5}
            height={15}
            alt="bookmark"
          />
        </button>
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>

      <div className="flex items-center gap-2">
        <Image
          src={`/icons/clock.svg`}
          width={13.5}
          height={13.5}
          alt="Clock"
        />
        <p className="text-sm">{duration} min</p>
      </div>

      <Link className="w-full" href={`/companions/${id}`}>
        <button className="btn-primary w-full justify-center">
          Launch Lesson
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;

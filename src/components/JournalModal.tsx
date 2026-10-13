import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";

type Story = {
  category: string;
  date: string;
  title: string;
  text: string;
};

type JournalModalProps = {
  onClose: () => void;
};

const stories: Story[] = [
  {
    category: "FIELD NOTES",
    date: "04.18.25",
    title: "The patience of a good morning",
    text: `Before the city catches up, there is the kettle, a quiet counter and a few unhurried minutes. We think the best cups begin there.

This season, our partners in Huila are picking in small passes, selecting only fruit at its sweetest. The work asks for patience; the cup gives it back.

Take a breath. Let the bloom settle. The day can wait.`,
  },
  {
    category: "BREW RITUALS",
    date: "03.02.25",
    title: "A slower pour, a softer start",
    text: `A little more time changes everything. Wet the grounds evenly, pause for the bloom, then pour in circles that start in the center. It is not a race to the bottom of the cup.`,
  },
  {
    category: "ORIGIN",
    date: "01.14.25",
    title: "Notes from the cloud line",
    text: `At altitude, mornings arrive cool and clear. These smallholder lots are harvested by hand and dried slowly, preserving the bright, delicate character of the place.`,
  },
];

export default function JournalModal({
  onClose,
}: JournalModalProps) {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleOverlayMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const selected = selectedStory !== null
    ? stories[selectedStory]
    : null;

  return (
    <div
      className="overlay"
      onMouseDown={handleOverlayMouseDown}
    >
      <section
        className="journal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-title"
      >
        <div className="modal-head">
          <div className="eyebrow">
            NOIR JOURNAL / NOTES FROM THE SLOW LANE
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close journal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {selected === null ? (
          <>
            <h2 id="journal-title">
              Ideas worth
              <br />
              <em>sitting with.</em>
            </h2>

            <div className="story-list">
              {stories.map((story, index) => (
                <button
                  type="button"
                  key={story.title}
                  onClick={() => setSelectedStory(index)}
                >
                  <span>
                    {story.category} · {story.date}
                  </span>

                  <b>{story.title}</b>

                  <i aria-hidden="true">↗</i>
                </button>
              ))}
            </div>
          </>
        ) : (
          <article className="story-detail">
            <button
              type="button"
              className="text-button"
              onClick={() => setSelectedStory(null)}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span>ALL STORIES</span>
            </button>

            <div className="eyebrow">
              {selected.category} · {selected.date}
            </div>

            <h2 id="journal-title">{selected.title}</h2>

            <div className="story-copy">
              {selected.text.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        )}
      </section>
    </div>
  );
}

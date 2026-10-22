import { Wheat, CreditCard, Umbrella, Droplets, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const topics = [
  {
    icon: Wheat,
    title: "PM-KISAN",
    prompt: "Who is eligible for PM-KISAN and how is the benefit paid?",
  },
  {
    icon: CreditCard,
    title: "Kisan Credit Card",
    prompt: "How does the Kisan Credit Card scheme work and who can get one?",
  },
  {
    icon: Umbrella,
    title: "Crop insurance (PMFBY)",
    prompt: "What does the Pradhan Mantri Fasal Bima Yojana cover?",
  },
  {
    icon: Droplets,
    title: "Irrigation (PMKSY)",
    prompt: "What is the Pradhan Mantri Krishi Sinchayee Yojana and what does it support?",
  },
];

export default function WelcomeScreen({ onPick }) {
  return (
    <div className="flex flex-1 overflow-y-auto bg-slate-50 px-4 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="m-auto w-full max-w-2xl py-10"
      >
        <h2 className="font-serif text-3xl font-semibold leading-tight text-brand-900 sm:text-4xl">
          Ask about government schemes for farmers
        </h2>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600">
          Ask about eligibility, benefits and how to apply. Answers are drawn from
          official scheme documents.
        </p>

        <ul className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {topics.map((t) => (
            <li key={t.title}>
              <button
                onClick={() => onPick(t.prompt)}
                className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-brand-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700 transition-colors group-hover:bg-white">
                  <t.icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">
                    {t.title}
                  </span>
                  <span className="block truncate text-sm text-slate-500">
                    {t.prompt}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-slate-300 transition-colors group-hover:text-brand-600"
                />
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
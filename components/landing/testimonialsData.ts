export type Testimonial = {
  quote: string;
  name: string;
  title: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Worklyn replaced four of our fragmented tools. It's the first workspace that feels like it was actually designed for the way we work, not just another database.",
    name: "Sarah Jenkins",
    title: "Design Director at LinearFlow",
  },
  {
    quote:
      "We finally have one place for docs, planning, and delivery. The whole team stays aligned without endless meetings.",
    name: "Omar Rahman",
    title: "Product Lead at NorthPeak",
  },
  {
    quote:
      "The workspace feels lightweight but powerful. Onboarding new teammates is faster and our processes are clearer.",
    name: "Mina Al-Sayed",
    title: "Operations Manager at StudioNine",
  },
  {
    quote:
      "Our roadmap, specs, and tasks live together now. Worklyn made collaboration feel intentional instead of chaotic.",
    name: "Lucas Meyer",
    title: "Engineering Manager at Brightforge",
  },
];

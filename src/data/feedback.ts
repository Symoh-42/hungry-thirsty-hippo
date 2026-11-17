export const ratingScale = [
  { value: 1, label: "Very Poor" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
] as const;

export const ratingLabel = (v: number) => ratingScale.find((r) => r.value === Math.round(v))?.label ?? "";

export const enjoyedOptions = [
  "Excellent customer service",
  "Comfortable accommodation",
  "Delicious food",
  "Beautiful environment",
  "Peaceful atmosphere",
  "Clean facilities",
  "Affordable prices",
  "Great entertainment",
  "Professional staff",
  "Fast service",
];

export const NOTHING_TO_IMPROVE = "Nothing, everything was great!";

export const improveOptions = [
  "Faster service",
  "More food options",
  "Better room facilities",
  "Improved cleanliness",
  "Better communication",
  "More affordable pricing",
  "Better entertainment",
  NOTHING_TO_IMPROVE,
];

/** Shown when a guest gives 1 or 2 overall (or rates any area 1-2). */
export const issueReasons = [
  "Long waiting time",
  "Food was cold or not as expected",
  "Room was not clean",
  "Noise disturbed my rest",
  "Staff were unhelpful",
  "Order or booking was wrong",
  "Overpriced for what I got",
  "Something was broken or not working",
];

/** Shown when a guest gives 5 overall. */
export const delightReasons = [
  "A staff member went above and beyond",
  "The food was outstanding",
  "Felt warmly welcomed",
  "Spotless and comfortable",
  "Great value",
  "Lovely, peaceful setting",
  "Quick, attentive service",
  "I'd bring friends and family",
];

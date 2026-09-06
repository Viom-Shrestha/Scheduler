import { offsetFromToday } from "./dates";
import type { SeedTask } from "./types";

/**
 * First-run seed data, styled after the design reference. Dates are relative
 * to whenever the app first starts so the board/calendar stay sensible no
 * matter when `npm install && npm run dev` is actually run.
 */
export const SEED_TASKS: SeedTask[] = [
  // Marigold School Website
  {
    project: "Marigold School Website",
    title: "Admissions page build",
    detail: "Hero, fee table, enquiry form.",
    status: "active",
  },
  {
    project: "Marigold School Website",
    title: "Send admissions + staff pages for review",
    status: "active",
    due: offsetFromToday(5),
  },
  {
    project: "Marigold School Website",
    title: "Staff photos from the principal",
    status: "waiting",
    waitingOn: "Principal",
    since: offsetFromToday(-5),
  },
  {
    project: "Marigold School Website",
    title: "News + blog module",
    detail: "Phase two, after launch.",
    status: "someday",
  },
  {
    project: "Marigold School Website",
    title: "Sitemap signed off",
    status: "done",
  },

  // Fourth Wall Technologies
  {
    project: "Fourth Wall Technologies",
    title: "Registration approval",
    detail: "Name and docs filed with the registry.",
    status: "waiting",
    waitingOn: "Registrar",
    since: offsetFromToday(-9),
  },
  {
    project: "Fourth Wall Technologies",
    title: "Registration follow-up call",
    status: "active",
    due: offsetFromToday(21),
  },
  {
    project: "Fourth Wall Technologies",
    title: "Open the business bank account",
    status: "someday",
  },
  {
    project: "Fourth Wall Technologies",
    title: "One-page site for the company",
    status: "someday",
  },

  // Closet Buddy
  {
    project: "Closet Buddy",
    title: "Wire outfit suggestions into the app",
    detail: "Model works in the notebook — needs an endpoint.",
    status: "active",
  },
  {
    project: "Closet Buddy",
    title: "Supervisor check-in",
    detail: "10:00 catch-up on outfit-suggestion progress.",
    status: "active",
    due: offsetFromToday(3),
  },
  {
    project: "Closet Buddy",
    title: "Record a demo video for the portfolio",
    status: "someday",
  },
  {
    project: "Closet Buddy",
    title: "Proposal defended",
    status: "done",
  },

  // PexusTech Internship
  {
    project: "PexusTech Internship",
    title: "Finish the take-home write-up",
    detail: "About an hour of writing left.",
    status: "active",
  },
  {
    project: "PexusTech Internship",
    title: "Recruiter reply on the take-home",
    detail: "Said about a week.",
    status: "waiting",
    waitingOn: "Recruiter",
    since: offsetFromToday(-3),
  },
  {
    project: "PexusTech Internship",
    title: "Follow up with PexusTech if still quiet",
    status: "active",
    due: offsetFromToday(14),
  },
  {
    project: "PexusTech Internship",
    title: "CV and cover letter sent",
    status: "done",
  },

  // WPT Literature Review
  {
    project: "WPT Literature Review",
    title: "Annotate the six core papers",
    detail: "2 of 6 read so far.",
    status: "active",
  },
  {
    project: "WPT Literature Review",
    title: "Draft the outline",
    status: "active",
    due: offsetFromToday(10),
  },
  {
    project: "WPT Literature Review",
    title: "Supervisor feedback on scope",
    detail: "Whether the review scope is narrow enough.",
    status: "waiting",
    waitingOn: "Supervisor",
    since: offsetFromToday(-2),
  },
  {
    project: "WPT Literature Review",
    title: "Search terms + shortlist",
    status: "done",
  },
];

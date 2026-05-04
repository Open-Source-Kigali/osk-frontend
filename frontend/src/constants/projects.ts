import type { Issue } from "@/types";

// Update these import paths to match where your images actually live

export const GOOD_FIRST_ISSUES: Issue[] = [
  {
    id: 1,
    title: "Add dark mode toggle to the navbar",
    label: "good first issue",
    project: "Kigali Community Hub",
    projectSlug: "kigali-community-hub",
    difficulty: "beginner",
    link: "https://github.com/opensourcekigali/kigali-community-hub/issues/1",
  },
  {
    id: 2,
    title: "Translate onboarding copy to Kinyarwanda",
    label: "good first issue",
    project: "AfyaConnect",
    projectSlug: "afyaconnect",
    difficulty: "beginner",
    link: "https://github.com/opensourcekigali/afyaconnect/issues/2",
  },
  {
    id: 3,
    title: "Fix attendance export to CSV — wrong headers",
    label: "bug",
    project: "EduTrack Rwanda",
    projectSlug: "edutrack-rwanda",
    difficulty: "beginner",
    link: "https://github.com/opensourcekigali/edutrack-rwanda/issues/3",
  },
  {
    id: 4,
    title: "Add marker clustering to the map view",
    label: "help wanted",
    project: "OpenRwanda Map",
    projectSlug: "openrwanda-map",
    difficulty: "intermediate",
    link: "https://github.com/opensourcekigali/openrwanda-map/issues/4",
  },
];

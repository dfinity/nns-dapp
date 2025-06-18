export const slugifyTitle = (title: string) =>
  title
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Add hyphen before capital letters
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

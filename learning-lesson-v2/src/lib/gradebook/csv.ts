import type { ClassroomGradebook } from "./types";

function csvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function classroomGradebookToCsv({
  gradebook,
  studentHeader,
  xpHeader,
  lessonsHeader
}: {
  gradebook: ClassroomGradebook;
  studentHeader: string;
  xpHeader: string;
  lessonsHeader: string;
}) {
  const headers = [studentHeader, ...gradebook.columns.map((column) => column.label), xpHeader, lessonsHeader];
  const lines = [
    headers.map(csvCell).join(","),
    ...gradebook.rows.map((row) =>
      [
        row.name,
        ...gradebook.columns.map((column) => row.cells[column.id]?.label ?? ""),
        String(row.xp),
        String(row.completedLessons)
      ]
        .map(csvCell)
        .join(",")
    )
  ];

  return `\uFEFF${lines.join("\n")}`;
}

export function gradebookCsvFilename(className: string) {
  const safe = className.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "class";
  return `gradebook-${safe}.csv`;
}

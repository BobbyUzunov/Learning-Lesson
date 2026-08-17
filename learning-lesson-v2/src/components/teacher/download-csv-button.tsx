"use client";

export function DownloadCsvButton({
  csv,
  filename,
  label
}: {
  csv: string;
  filename: string;
  label: string;
}) {
  function download() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      className="focus-ring inline-flex min-h-11 items-center rounded-xl bg-ink px-4 py-2 text-sm font-bold text-paper transition hover:bg-ink/90"
      onClick={download}
      type="button"
    >
      {label}
    </button>
  );
}

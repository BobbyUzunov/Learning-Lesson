type StatCardProps = {
  label: string;
  value: string;
  tone?: "mint" | "coral" | "violet" | "ink";
};

const tones = {
  mint: "bg-mint/15 text-ink",
  coral: "bg-coral/15 text-ink",
  violet: "bg-violet/15 text-ink",
  ink: "bg-ink text-paper"
};

export function StatCard({ label, value, tone = "mint" }: StatCardProps) {
  return (
    <div className={`rounded-lg p-4 ${tones[tone]}`}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

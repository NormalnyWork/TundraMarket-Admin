type InfoBlockProps = {
  title: string;
  lines: string[];
};

export function InfoBlock({ title, lines }: InfoBlockProps) {
  return (
    <div className="rounded-lg bg-slate-50 p-5">
      <p className="mb-2 text-sm text-slate-500">{title}</p>
      {lines.map((line) => (
        <p key={line} className="font-semibold">
          {line}
        </p>
      ))}
    </div>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--bronze)]">
        {eyebrow}
      </p>
      <h2 className="copy-balance mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">{description}</p>
    </div>
  );
}

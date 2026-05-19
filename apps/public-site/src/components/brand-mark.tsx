import Image from "next/image";

type BrandMarkProps = {
  imageClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  priority?: boolean;
};

export function BrandMark({
  imageClassName = "h-10 w-auto",
  showWordmark = false,
  wordmarkClassName = "font-display text-4xl uppercase tracking-[0.08em] text-white",
  className = "flex items-center gap-3",
  priority = false,
}: BrandMarkProps) {
  return (
    <div className={className}>
      <Image
        src="/brand/moviejet-logo.jpeg"
        alt="Moviejet logo"
        width={1280}
        height={853}
        priority={priority}
        className={imageClassName}
      />
      {showWordmark ? <span className={wordmarkClassName}>Moviejet</span> : null}
    </div>
  );
}

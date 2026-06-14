interface HeroBannerProps {
  title: string;
  subtitle?: string;
}

export function HeroBanner({ title, subtitle }: HeroBannerProps) {
  return (
    <div 
      className="rounded-[20px] p-12 min-h-[320px] flex flex-col justify-center shadow-2xl bg-cover bg-center relative overflow-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?w=1200')` 
      }}
    >
      <h1 className="mb-0">{title}</h1>
      {subtitle && (
        <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
}

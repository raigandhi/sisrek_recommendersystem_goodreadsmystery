import { HeroBanner } from "../components/HeroBanner";

interface RiwayatProps {
  history: string[];
}

export function Riwayat({ history }: RiwayatProps) {
  const uniqueHistory = Array.from(new Set([...history].reverse()));

  return (
    <div className="space-y-6">
      <HeroBanner title="Riwayat Pencarian Acuan" />

      {uniqueHistory.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Anda belum melakukan pencarian acuan judul.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueHistory.map((item, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <h4 className="flex items-center gap-2 m-0">
                <span>🔍</span>
                {item}
              </h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

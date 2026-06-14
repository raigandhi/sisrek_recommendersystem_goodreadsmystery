import { useState } from "react";

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    } else {
      setError("Nama tidak boleh kosong");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1722182877533-7378b60bf1e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbXlzdGVyaW91cyUyMGxpYnJhcnklMjBib29rcyUyMG5vaXJ8ZW58MXx8fHwxNzgxNDI2MzM3fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Login box */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-white mb-2" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
            Mystearch
          </h1>
          <p className="text-white/70 text-sm">
            Cari Rekomendasi Buku Mystery, Thriller &amp; Crime
          </p>
        </div>

        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-2xl">
          <h2 className="mb-6 text-center text-white">Masuk</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-white/80">Nama Pengguna</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Masukkan nama Anda"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:border-transparent"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-primary-foreground py-3 px-4 rounded-lg transition-all duration-200 border border-primary/50 hover:border-foreground"
            >
              Masuk
            </button>
          </form>

          <p className="mt-6 text-center text-white/40 text-xs">
            Menggunakan Hybrid Collaborative Filtering &amp; Content-Based Filtering
          </p>
        </div>
      </div>
    </div>
  );
}

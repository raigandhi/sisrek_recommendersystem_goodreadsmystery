import { Home, Search, History, Heart, BookOpen, LogOut } from "lucide-react";

interface SidebarProps {
  username: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Sidebar({ username, currentPage, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "cari", label: "Cari Buku", icon: Search },
    { id: "riwayat", label: "Riwayat", icon: History },
    { id: "favorit", label: "Favorit", icon: Heart },
    { id: "rak", label: "Rak Buku", icon: BookOpen },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="text-center p-6">
        <h1 className="text-foreground mb-0">Mystearch</h1>
        <p className="text-sm mt-2">
          Halo, <strong>{username}</strong>
        </p>
        <div className="border-t border-muted mt-4"></div>
      </div>
      
      <div className="px-4 mb-2">
        <p className="text-xs text-secondary uppercase tracking-wider mb-2">Menu Utama</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-sidebar-accent hover:border-secondary border border-transparent"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary text-secondary-foreground py-3 px-4 rounded-lg transition-all duration-200 border border-secondary hover:border-foreground"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}

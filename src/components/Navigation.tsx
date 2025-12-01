import { Home, BookHeart, MessageCircleQuestion, MessageSquare, Plane, CheckSquare, LogOut, LogIn, Gamepad2, Shield } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/diary", icon: BookHeart, label: "Diary" },
    { to: "/travel", icon: Plane, label: "Travel" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/qna", icon: MessageCircleQuestion, label: "Q&A" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/games", icon: Gamepad2, label: "Games" },
  ];

  const adminNavItems = isAdmin
    ? [{ to: "/admin", icon: Shield, label: "Admin" }]
    : [];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50 md:top-0 md:bottom-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around md:justify-center md:gap-8 py-3">
          {[...navItems, ...adminNavItems].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-2xl transition-all duration-300",
                "text-muted-foreground hover:text-primary hover:bg-primary/10",
                item.to === "/admin" && "bg-primary/10 border-2 border-primary"
              )}
              activeClassName="text-primary bg-primary/20 font-medium"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs md:text-sm font-rounded">{item.label}</span>
            </NavLink>
          ))}
          <ThemeToggle />
          {isAdmin && user ? (
            <Button
              onClick={signOut}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          ) : !user ? (
            <Button
              onClick={() => navigate("/auth")}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <LogIn className="w-5 h-5" />
            </Button>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

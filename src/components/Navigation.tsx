import { Home, BookHeart, MessageCircleQuestion, Plane, CheckSquare, LogIn, Gamepad2, Shield } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { motion } from "framer-motion";

const Navigation = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  
  const sectionIds = ["profile", "diary", "travel", "tasks", "qna", "games"];
  const activeSection = useScrollSpy(sectionIds);
  const isHomePage = location.pathname === "/";

  const scrollToSection = (sectionId: string) => {
    if (!isHomePage) {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const navItems = [
    { id: "profile", icon: Home, label: "Home" },
    { id: "diary", icon: BookHeart, label: "Diary" },
    { id: "travel", icon: Plane, label: "Travel" },
    { id: "tasks", icon: CheckSquare, label: "Tasks" },
    { id: "qna", icon: MessageCircleQuestion, label: "Q&A" },
    { id: "games", icon: Gamepad2, label: "Games" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        <div className="flex items-center justify-between md:justify-center md:gap-2 py-2 md:py-3">
          {/* Main Navigation Items */}
          <div className="flex items-center justify-around md:justify-center gap-1 md:gap-2 flex-1 md:flex-initial">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl transition-all duration-300",
                  "relative group",
                  isHomePage && activeSection === item.id
                    ? "text-primary bg-primary/15 shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 md:w-5 md:h-5 transition-transform duration-300",
                  isHomePage && activeSection === item.id && "scale-110"
                )} />
                <span className="text-[10px] md:text-sm font-rounded font-medium">
                  {item.label}
                </span>
                {isHomePage && activeSection === item.id && (
                  <motion.span 
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary md:hidden" 
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 md:gap-2 md:ml-4">
            {isAdmin && (
              <NavLink
                to="/admin"
                className={cn(
                  "flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl transition-all duration-300",
                  "bg-primary/10 border border-primary/30 hover:bg-primary/20"
                )}
                activeClassName="bg-primary/25 border-primary"
              >
                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-[10px] md:text-sm font-rounded font-medium">
                  Admin
                </span>
              </NavLink>
            )}
            
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {!user && (
              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <LogIn className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

import { Flower2, Sparkles } from "lucide-react";

interface FloralDecorationProps {
  className?: string;
  variant?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const FloralDecoration = ({ className = "", variant = "top-right" }: FloralDecorationProps) => {
  const positions = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div className={`absolute ${positions[variant]} pointer-events-none ${className}`}>
      <div className="relative">
        <Flower2 className="w-16 h-16 text-primary/30 animate-pulse" />
        <Sparkles className="w-8 h-8 text-secondary/40 absolute -top-2 -right-2" />
      </div>
    </div>
  );
};

export default FloralDecoration;

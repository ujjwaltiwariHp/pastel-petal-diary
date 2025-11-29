import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Gamepad2, HelpCircle } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";

const Games = () => {
  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Fun & Games 🎮
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Play games and get to know me better!
          </p>
          <FloralDecoration variant="top-right" className="hidden md:block" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/games/truth-dare">
            <Card className="p-8 hover:shadow-soft transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-pastel rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-handwriting font-bold text-foreground mb-2">
                  Truth or Dare
                </h2>
                <p className="text-muted-foreground font-rounded">
                  Random truth or dare questions - let's see how brave you are!
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/games/anonymous-questions">
            <Card className="p-8 hover:shadow-soft transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-warm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-handwriting font-bold text-foreground mb-2">
                  Anonymous Questions
                </h2>
                <p className="text-muted-foreground font-rounded">
                  Ask me anything anonymously or read fun Q&A responses!
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Games;

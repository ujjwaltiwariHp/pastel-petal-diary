import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shuffle, ArrowLeft, Send, Loader2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageLoader } from "@/components/PageLoader";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question_type: "truth" | "dare";
  question_text: string;
  difficulty_level: string;
}

const PublicTruthDare = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState("");
  const [responderName, setResponderName] = useState("");
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    if (username) fetchData();
  }, [username]);

  const fetchData = async () => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        
        const { data: questionsData } = await supabase
          .from("truth_dare_questions")
          .select("*")
          .eq("is_active", true)
          .eq("profile_id", profileData.id);

        setQuestions((questionsData || []) as Question[]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomQuestion = (type: "truth" | "dare") => {
    const filtered = questions.filter((q) => q.question_type === type);
    if (filtered.length === 0) {
      toast.error(`No ${type} questions available`);
      return;
    }
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentQuestion(random);
    setShowResponseForm(true);
    setResponse("");
  };

  const handleSubmitResponse = async () => {
    if (!response.trim() || !currentQuestion || !profile) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from("game_responses").insert({
        profile_id: profile.id,
        question_id: currentQuestion.id,
        response_text: response,
        responder_name: responderName.trim() || "Anonymous",
      });

      if (error) throw error;
      
      toast.success("Response sent! 🎉");
      setResponse("");
      setResponderName("");
      setShowResponseForm(false);
      setCurrentQuestion(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pb-24 pt-4 md:pt-20 px-4">
      {/* Back button for mobile */}
      <div className="md:hidden mb-4">
        <Link to={`/u/${username}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {profile?.name}
          </Button>
        </Link>
      </div>

      <div className="max-w-lg md:max-w-2xl mx-auto">
        <motion.div 
          className="relative mb-6 md:mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-5xl font-handwriting font-bold text-foreground mb-2">
            Truth or Dare? 🎲
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-rounded">
            Play with {profile?.name} - Choose wisely!
          </p>
          <FloralDecoration variant="top-right" className="hidden md:block" />
        </motion.div>

        <motion.div 
          className="flex gap-3 md:gap-4 justify-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            size="lg"
            className="flex-1 max-w-[150px] bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => getRandomQuestion("truth")}
          >
            <Shuffle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Truth
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 max-w-[150px]"
            onClick={() => getRandomQuestion("dare")}
          >
            <Shuffle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Dare
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="p-6 md:p-8 mb-6 shadow-card bg-gradient-pastel">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl mb-4">
                    {currentQuestion.question_type === "truth" ? "💭" : "⚡"}
                  </div>
                  <p className="text-xs md:text-sm font-rounded text-muted-foreground mb-2">
                    {currentQuestion.question_type.toUpperCase()} • {currentQuestion.difficulty_level}
                  </p>
                  <p className="text-xl md:text-2xl font-handwriting font-bold text-foreground">
                    {currentQuestion.question_text}
                  </p>
                </div>
              </Card>

              {showResponseForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-4 md:p-6 shadow-card">
                    <h3 className="text-lg md:text-xl font-handwriting font-bold text-foreground mb-4 text-center">
                      Your Response 💬
                    </h3>
                    <div className="space-y-4">
                      <Input
                        placeholder="Your name (optional)"
                        value={responderName}
                        onChange={(e) => setResponderName(e.target.value)}
                        className="text-sm md:text-base"
                      />
                      <Textarea
                        placeholder={`Type your ${currentQuestion.question_type === "truth" ? "answer" : "response"}...`}
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="min-h-24 text-sm md:text-base"
                      />
                      <Button 
                        onClick={handleSubmitResponse} 
                        disabled={!response.trim() || submitting}
                        className="w-full"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send to {profile?.name}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-muted-foreground font-rounded">
                Choose Truth or Dare to get started!
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicTruthDare;
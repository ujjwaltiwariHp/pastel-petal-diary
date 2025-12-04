import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageLoader } from "@/components/PageLoader";
import { motion } from "framer-motion";

interface GameQuestion {
  id: string;
  question_text: string;
  answer_text: string | null;
  is_answered: boolean;
  is_public: boolean;
  created_at: string;
}

const PublicAnonymous = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
          .from("anonymous_game_questions")
          .select("*")
          .eq("profile_id", profileData.id)
          .eq("is_public", true)
          .eq("is_answered", true)
          .order("created_at", { ascending: false });

        setQuestions(questionsData || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !profile) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("anonymous_game_questions").insert({
        question_text: newQuestion,
        profile_id: profile.id,
        asker_ip: "anonymous",
      });

      if (error) throw error;
      setNewQuestion("");
      toast.success("Question sent anonymously! 🎉");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit question");
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
            Ask Me Anything! 💭
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-rounded">
            Send {profile?.name} an anonymous question
          </p>
          <FloralDecoration variant="top-right" className="hidden md:block" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 md:p-6 mb-6 md:mb-8 shadow-card">
            <h3 className="text-lg md:text-xl font-handwriting font-bold text-foreground mb-4">
              Submit Your Question
            </h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Ask anything... (completely anonymous)"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="min-h-24 text-sm md:text-base"
              />
              <Button 
                onClick={handleSubmitQuestion} 
                disabled={!newQuestion.trim() || submitting}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Question
              </Button>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-handwriting font-bold text-foreground">
            Answered Questions 💬
          </h2>
          {questions.length === 0 ? (
            <Card className="p-6 md:p-8 text-center">
              <div className="text-5xl mb-4">🤫</div>
              <p className="text-muted-foreground font-rounded">
                No answered questions yet. Be the first to ask!
              </p>
            </Card>
          ) : (
            questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 md:p-6">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Question:</p>
                      <p className="text-sm md:text-base text-foreground font-rounded">{q.question_text}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Answer:</p>
                      <p className="text-sm md:text-base text-foreground font-rounded pl-3 border-l-2 border-primary">{q.answer_text}</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {new Date(q.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicAnonymous;
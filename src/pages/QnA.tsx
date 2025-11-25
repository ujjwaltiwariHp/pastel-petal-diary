import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleQuestion, Send, Eye, EyeOff, Trash2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  question: string;
  answer?: string | null;
  is_answered: boolean;
  is_public: boolean;
  created_at: string;
}

const QnA = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("qna_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error("Please write a question! 💭");
      return;
    }

    try {
      const { error } = await supabase.from("qna_questions").insert({
        question: newQuestion,
        is_answered: false,
        is_public: false,
      });

      if (error) throw error;

      await fetchQuestions();
      setNewQuestion("");
      toast.success("Question submitted anonymously! 🌸");
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Failed to submit question");
    }
  };

  const handleAnswer = async (id: string) => {
    if (!user) return;

    if (!answerText.trim()) {
      toast.error("Please write an answer! ✨");
      return;
    }

    try {
      const { error } = await supabase
        .from("qna_questions")
        .update({
          answer: answerText,
          is_answered: true,
          is_public: true,
        })
        .eq("id", id);

      if (error) throw error;

      await fetchQuestions();
      setAnswerText("");
      setAnsweringId(null);
      toast.success("Answer posted! 💕");
    } catch (error) {
      console.error("Error posting answer:", error);
      toast.error("Failed to post answer");
    }
  };

  const toggleVisibility = async (id: string, currentPublic: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("qna_questions")
        .update({ is_public: !currentPublic })
        .eq("id", id);

      if (error) throw error;
      await fetchQuestions();
      toast.success(currentPublic ? "Hidden from public" : "Made public");
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("qna_questions").delete().eq("id", id);
      if (error) throw error;
      await fetchQuestions();
      toast.success("Question deleted! 🗑️");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const publicQuestions = questions.filter((q) => q.is_public);
  const pendingQuestions = questions.filter((q) => !q.is_public && user);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Ask Me Anything 💭
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Drop your anonymous questions below!
          </p>
          <FloralDecoration variant="top-left" className="hidden md:block" />
        </div>

        {/* Submit Question Form */}
        <Card className="p-6 mb-8 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
          <h3 className="text-xl font-handwriting font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageCircleQuestion className="w-6 h-6" />
            Ask Anonymously
          </h3>

          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="What would you like to know? 🌸"
            className="mb-4 font-rounded"
            rows={3}
          />

          <Button
            onClick={handleSubmitQuestion}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Question
          </Button>
        </Card>

        {/* Pending Questions (Only visible to owner) */}
        {user && pendingQuestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-handwriting font-bold text-foreground mb-4">
              Pending Questions 📥
            </h2>
            <div className="space-y-4">
              {pendingQuestions.map((q) => (
                <Card key={q.id} className="p-6 shadow-card bg-muted/30 relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(q.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <p className="text-foreground font-rounded mb-4 pr-8">{q.question}</p>

                  {answeringId === q.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write your answer..."
                        className="font-rounded"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleAnswer(q.id)} size="sm" className="flex-1">
                          Post Answer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setAnsweringId(q.id)}
                      variant="outline"
                      size="sm"
                    >
                      Answer
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Public Q&A */}
        <div>
          <h2 className="text-2xl font-handwriting font-bold text-foreground mb-4">
            Answered Questions ✨
          </h2>
          <div className="space-y-6">
            {publicQuestions.length === 0 ? (
              <Card className="p-12 text-center bg-muted/30">
                <div className="text-6xl mb-4">💭</div>
                <p className="text-muted-foreground font-rounded">
                  No answered questions yet. Be the first to ask!
                </p>
              </Card>
            ) : (
              publicQuestions.map((q) => (
                <Card
                  key={q.id}
                  className="p-6 shadow-card hover:shadow-soft transition-all bg-card/95 backdrop-blur-sm relative group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-lg text-foreground font-rounded font-medium flex-1 pr-8">
                      Q: {q.question}
                    </p>
                    {user && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(q.id, q.is_public)}
                          className="ml-2"
                        >
                          {q.is_public ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(q.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {q.answer && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-border">
                      <p className="text-foreground/90 font-rounded">
                        <span className="font-bold">A:</span> {q.answer}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3 font-rounded">
                    {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnA;

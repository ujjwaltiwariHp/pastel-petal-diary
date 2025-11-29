import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, Check, Trash2, Eye, EyeOff } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface GameQuestion {
  id: string;
  question_text: string;
  answer_text: string | null;
  is_answered: boolean;
  is_public: boolean;
  category: string;
  created_at: string;
}

const AnonymousQuestions = () => {
  const { isAdmin } = useIsAdmin();
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("anonymous_game_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      const { error } = await supabase.from("anonymous_game_questions").insert({
        question_text: newQuestion,
        asker_ip: "anonymous",
      });

      if (error) throw error;
      setNewQuestion("");
      await fetchQuestions();
      toast.success("Question submitted!");
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Failed to submit question");
    }
  };

  const handleAnswer = async (id: string) => {
    if (!answer.trim()) return;

    try {
      const { error } = await supabase
        .from("anonymous_game_questions")
        .update({
          answer_text: answer,
          is_answered: true,
        })
        .eq("id", id);

      if (error) throw error;
      setAnsweringId(null);
      setAnswer("");
      await fetchQuestions();
      toast.success("Answer added!");
    } catch (error) {
      console.error("Error adding answer:", error);
      toast.error("Failed to add answer");
    }
  };

  const togglePublic = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("anonymous_game_questions")
        .update({ is_public: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      await fetchQuestions();
      toast.success(currentStatus ? "Hidden from public" : "Made public");
    } catch (error) {
      console.error("Error toggling public status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("anonymous_game_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchQuestions();
      toast.success("Question deleted");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const publicQuestions = questions.filter((q) => q.is_public && q.is_answered);

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Ask Me Anything! 💭
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Submit questions anonymously
          </p>
          <FloralDecoration variant="top-right" className="hidden md:block" />
        </div>

        <Card className="p-6 mb-8 shadow-card">
          <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
            Submit Your Question
          </h3>
          <div className="space-y-4">
            <Textarea
              placeholder="Ask me anything... (completely anonymous)"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-24"
            />
            <Button onClick={handleSubmitQuestion}>
              <Send className="w-4 h-4 mr-2" />
              Send Question
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-handwriting font-bold text-foreground">
            Answered Questions 💬
          </h2>
          {publicQuestions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No answered questions yet. Be the first to ask!
              </p>
            </Card>
          ) : (
            publicQuestions.map((q) => (
              <Card key={q.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Question:</p>
                    <p className="text-foreground font-rounded">{q.question_text}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Answer:</p>
                    <p className="text-foreground font-rounded">{q.answer_text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>

        {isAdmin && (
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAdmin(!showAdmin)}
              className="mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showAdmin ? "Hide Admin" : "Manage Questions"}
            </Button>

            {showAdmin && (
              <Card className="p-6">
                <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
                  All Questions ({questions.length})
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questions.map((q) => (
                    <div key={q.id} className="p-4 bg-muted/30 rounded-lg space-y-3">
                      <p className="text-foreground">{q.question_text}</p>

                      {answeringId === q.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Write your answer..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAnswer(q.id)}>
                              <Check className="w-4 h-4 mr-2" />
                              Save Answer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAnsweringId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : q.answer_text ? (
                        <div className="p-3 bg-background rounded">
                          <p className="text-sm text-muted-foreground mb-1">Answer:</p>
                          <p className="text-foreground">{q.answer_text}</p>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setAnsweringId(q.id)}>
                          Answer
                        </Button>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePublic(q.id, q.is_public)}
                        >
                          {q.is_public ? (
                            <Eye className="w-4 h-4 mr-2" />
                          ) : (
                            <EyeOff className="w-4 h-4 mr-2" />
                          )}
                          {q.is_public ? "Public" : "Hidden"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnonymousQuestions;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shuffle, Plus, Trash2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Question {
  id: string;
  question_type: "truth" | "dare";
  question_text: string;
  difficulty_level: string;
}

const TruthDare = () => {
  const { isAdmin } = useIsAdmin();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: "truth" as "truth" | "dare",
    text: "",
    difficulty: "medium",
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("truth_dare_questions")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setQuestions((data || []) as Question[]);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
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
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      const { error } = await supabase.from("truth_dare_questions").insert({
        question_type: newQuestion.type,
        question_text: newQuestion.text,
        difficulty_level: newQuestion.difficulty,
      });

      if (error) throw error;
      setNewQuestion({ type: "truth", text: "", difficulty: "medium" });
      await fetchQuestions();
      toast.success("Question added!");
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("truth_dare_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchQuestions();
      if (currentQuestion?.id === id) setCurrentQuestion(null);
      toast.success("Question deleted");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Truth or Dare? 🎲
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Dare to play? Choose wisely!
          </p>
          <FloralDecoration variant="top-left" className="hidden md:block" />
        </div>

        <div className="flex gap-4 justify-center mb-8">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => getRandomQuestion("truth")}
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Truth
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => getRandomQuestion("dare")}
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Dare
          </Button>
        </div>

        {currentQuestion && (
          <Card className="p-8 mb-8 shadow-card bg-gradient-pastel">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {currentQuestion.question_type === "truth" ? "💭" : "⚡"}
              </div>
              <p className="text-sm font-rounded text-muted-foreground mb-2">
                {currentQuestion.question_type.toUpperCase()} •{" "}
                {currentQuestion.difficulty_level}
              </p>
              <p className="text-2xl font-handwriting font-bold text-foreground">
                {currentQuestion.question_text}
              </p>
            </div>
          </Card>
        )}

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
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
                    Add New Question
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={newQuestion.type === "truth" ? "default" : "outline"}
                        onClick={() => setNewQuestion({ ...newQuestion, type: "truth" })}
                      >
                        Truth
                      </Button>
                      <Button
                        variant={newQuestion.type === "dare" ? "default" : "outline"}
                        onClick={() => setNewQuestion({ ...newQuestion, type: "dare" })}
                      >
                        Dare
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Enter question..."
                      value={newQuestion.text}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, text: e.target.value })
                      }
                    />
                    <select
                      className="w-full p-2 rounded-md border border-border bg-background"
                      value={newQuestion.difficulty}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, difficulty: e.target.value })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <Button onClick={handleAddQuestion}>Add Question</Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
                    All Questions ({questions.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className="flex justify-between items-start p-3 bg-muted/30 rounded-lg group"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            {q.question_type.toUpperCase()} • {q.difficulty_level}
                          </p>
                          <p className="text-foreground">{q.question_text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruthDare;

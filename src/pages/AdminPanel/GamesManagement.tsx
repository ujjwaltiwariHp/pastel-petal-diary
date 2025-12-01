import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const GamesManagement = () => {
  const [truthDareQuestions, setTruthDareQuestions] = useState<any[]>([]);
  const [anonymousQuestions, setAnonymousQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: "truth",
    text: "",
    difficulty: "medium",
  });

  useEffect(() => {
    fetchGamesData();
  }, []);

  const fetchGamesData = async () => {
    try {
      const [truthDare, anonymous] = await Promise.all([
        supabase.from("truth_dare_questions").select("*").order("created_at", { ascending: false }),
        supabase.from("anonymous_game_questions").select("*").order("created_at", { ascending: false }),
      ]);

      setTruthDareQuestions(truthDare.data || []);
      setAnonymousQuestions(anonymous.data || []);
    } catch (error) {
      console.error("Error fetching games data:", error);
      toast.error("Failed to load games data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruthDare = async () => {
    if (!newQuestion.text) {
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
      toast.success("Question added!");
      setNewQuestion({ type: "truth", text: "", difficulty: "medium" });
      setIsAdding(false);
      fetchGamesData();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    }
  };

  const handleDeleteTruthDare = async (id: string) => {
    try {
      const { error } = await supabase.from("truth_dare_questions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Question deleted!");
      fetchGamesData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const toggleAnonymousPublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("anonymous_game_questions")
        .update({ is_public: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast.success(currentStatus ? "Unpublished!" : "Published!");
      fetchGamesData();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
    }
  };

  const handleAnswerAnonymous = async (id: string, answer: string) => {
    try {
      const { error } = await supabase
        .from("anonymous_game_questions")
        .update({ answer_text: answer, is_answered: true })
        .eq("id", id);
      if (error) throw error;
      toast.success("Answer saved!");
      fetchGamesData();
    } catch (error) {
      console.error("Error answering:", error);
      toast.error("Failed to save answer");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="truthdare" className="space-y-4">
      <TabsList>
        <TabsTrigger value="truthdare">Truth or Dare ({truthDareQuestions.length})</TabsTrigger>
        <TabsTrigger value="anonymous">Anonymous Q ({anonymousQuestions.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="truthdare" className="space-y-4">
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        )}

        {isAdding && (
          <Card className="p-4">
            <h4 className="font-bold mb-4">Add New Question</h4>
            <div className="space-y-4">
              <Select
                value={newQuestion.type}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truth">Truth</SelectItem>
                  <SelectItem value="dare">Dare</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newQuestion.difficulty}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Enter question..."
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              />

              <div className="flex gap-2">
                <Button onClick={handleAddTruthDare} className="flex-1">
                  Add
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {truthDareQuestions.map((question) => (
            <Card key={question.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase text-primary">
                      {question.question_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {question.difficulty_level}
                    </span>
                  </div>
                  <p className="text-foreground">{question.question_text}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTruthDare(question.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="anonymous" className="space-y-4">
        {anonymousQuestions.map((question) => (
          <Card key={question.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-2">{question.question_text}</h4>
                {question.answer_text && (
                  <p className="text-foreground/80 bg-muted/50 p-3 rounded">
                    {question.answer_text}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {question.is_answered ? "Answered" : "Not answered"} •
                  {question.is_public ? " Public" : " Private"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAnonymousPublish(question.id, question.is_public)}
              >
                {question.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {!question.is_answered && (
              <Input
                placeholder="Type your answer..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnswerAnonymous(question.id, e.currentTarget.value);
                  }
                }}
              />
            )}
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
};

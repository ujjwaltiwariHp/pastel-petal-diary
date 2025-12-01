import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const ContentManagement = () => {
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [travelPosts, setTravelPosts] = useState<any[]>([]);
  const [qnaQuestions, setQnaQuestions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const [diary, travel, qna, taskData] = await Promise.all([
        supabase.from("diary_entries").select("*").order("date", { ascending: false }),
        supabase.from("travel_posts").select("*").order("date", { ascending: false }),
        supabase.from("qna_questions").select("*").order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      ]);

      setDiaryEntries(diary.data || []);
      setTravelPosts(travel.data || []);
      setQnaQuestions(qna.data || []);
      setTasks(taskData.data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    table: "diary_entries" | "travel_posts" | "qna_questions" | "tasks",
    id: string
  ) => {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted successfully!");
      fetchAllContent();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("qna_questions")
        .update({ is_public: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast.success(currentStatus ? "Unpublished!" : "Published!");
      fetchAllContent();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
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
    <Tabs defaultValue="diary" className="space-y-4">
      <TabsList>
        <TabsTrigger value="diary">Diary ({diaryEntries.length})</TabsTrigger>
        <TabsTrigger value="travel">Travel ({travelPosts.length})</TabsTrigger>
        <TabsTrigger value="qna">Q&A ({qnaQuestions.length})</TabsTrigger>
        <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="diary" className="space-y-4">
        {diaryEntries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-1">{entry.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
                <p className="text-foreground/80 line-clamp-2">{entry.content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("diary_entries", entry.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="travel" className="space-y-4">
        {travelPosts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-1">{post.destination}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="text-foreground/80 line-clamp-2">{post.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("travel_posts", post.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="qna" className="space-y-4">
        {qnaQuestions.map((question) => (
          <Card key={question.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-2">{question.question}</h4>
                {question.answer && (
                  <p className="text-foreground/80 mb-2">{question.answer}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Status: {question.is_answered ? "Answered" : "Pending"} • 
                  {question.is_public ? " Public" : " Private"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePublish(question.id, question.is_public)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete("qna_questions", question.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-1">{task.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Category: {task.category} • {task.completed ? "✓ Complete" : "○ Incomplete"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("tasks", task.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
};

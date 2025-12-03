import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export const ContentManagement = () => {
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [travelPosts, setTravelPosts] = useState<any[]>([]);
  const [qnaQuestions, setQnaQuestions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    setDeleting(id);
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted successfully!");
      fetchAllContent();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("qna_questions")
        .update({ is_public: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast.success(currentStatus ? "Hidden from public!" : "Published!");
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

  const ContentCard = ({ children, id }: { children: React.ReactNode; id: string }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        {children}
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs defaultValue="diary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diary">Diary ({diaryEntries.length})</TabsTrigger>
          <TabsTrigger value="travel">Travel ({travelPosts.length})</TabsTrigger>
          <TabsTrigger value="qna">Q&A ({qnaQuestions.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="diary" className="space-y-4">
          <AnimatePresence>
            {diaryEntries.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No diary entries yet</p>
              </Card>
            ) : (
              diaryEntries.map((entry) => (
                <ContentCard key={entry.id} id={entry.id}>
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
                      disabled={deleting === entry.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deleting === entry.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </ContentCard>
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="travel" className="space-y-4">
          <AnimatePresence>
            {travelPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No travel posts yet</p>
              </Card>
            ) : (
              travelPosts.map((post) => (
                <ContentCard key={post.id} id={post.id}>
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
                      disabled={deleting === post.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deleting === post.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </ContentCard>
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="qna" className="space-y-4">
          <AnimatePresence>
            {qnaQuestions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No questions yet</p>
              </Card>
            ) : (
              qnaQuestions.map((question) => (
                <ContentCard key={question.id} id={question.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-2">{question.question}</h4>
                      {question.answer && (
                        <p className="text-foreground/80 mb-2 pl-3 border-l-2 border-primary">{question.answer}</p>
                      )}
                      <div className="flex gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          question.is_answered ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {question.is_answered ? "Answered" : "Pending"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          question.is_public ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {question.is_public ? "Public" : "Private"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(question.id, question.is_public)}
                        title={question.is_public ? "Hide from public" : "Make public"}
                      >
                        {question.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("qna_questions", question.id)}
                        disabled={deleting === question.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === question.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </ContentCard>
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <AnimatePresence>
            {tasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No tasks yet</p>
              </Card>
            ) : (
              tasks.map((task) => (
                <ContentCard key={task.id} id={task.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-bold mb-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </h4>
                      <div className="flex gap-2 text-sm">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">
                          {task.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          task.completed ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {task.completed ? "✓ Complete" : "○ Incomplete"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete("tasks", task.id)}
                      disabled={deleting === task.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deleting === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </ContentCard>
              ))
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

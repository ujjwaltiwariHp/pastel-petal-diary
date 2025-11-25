import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Star } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: "daily" | "weekly" | "monthly";
}

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [activeCategory, setActiveCategory] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        category: task.category as "daily" | "weekly" | "monthly"
      })));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!user) {
      toast.error("Please sign in to add tasks! 🌸");
      return;
    }

    if (!newTask.trim()) {
      toast.error("Please enter a task! 📋");
      return;
    }

    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: newTask,
        category: activeCategory,
        completed: false,
      });

      if (error) throw error;

      await fetchTasks();
      setNewTask("");
      toast.success("Task added! 🎉");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;
      await fetchTasks();
      toast.success("Task updated! ✨");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      await fetchTasks();
      toast.success("Task deleted! 🗑️");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter((task) => task.category === activeCategory);
  const completedCount = filteredTasks.filter((t) => t.completed).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Task Planner 📋
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Stay organized and motivated!
          </p>
          <FloralDecoration variant="top-right" className="hidden md:block" />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          {(["daily", "weekly", "monthly"] as const).map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="capitalize font-rounded"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Progress Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-handwriting font-bold text-foreground mb-1">
                Progress
              </h3>
              <p className="text-sm text-muted-foreground font-rounded">
                {completedCount} of {filteredTasks.length} tasks completed
              </p>
            </div>
            <div className="text-4xl">
              {completedCount === filteredTasks.length && filteredTasks.length > 0 ? "🎉" : "💪"}
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </Card>

        {/* Add Task - Only for owner */}
        {user && (
          <Card className="p-6 mb-6 shadow-card">
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 font-rounded"
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
              />
              <Button onClick={handleAddTask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card className="p-12 text-center bg-muted/30">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-muted-foreground font-rounded">
                {user ? "No tasks yet. Add one to get started!" : "No tasks yet. Check back soon!"}
              </p>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`p-4 shadow-card hover:shadow-soft transition-all group ${
                  task.completed ? "bg-muted/30" : "bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  {user && (
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    />
                  )}
                  
                  <span
                    className={`flex-1 font-rounded ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>

                  {task.completed && (
                    <Star className="w-5 h-5 text-soft-yellow fill-soft-yellow" />
                  )}

                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Motivation */}
        <Card className="mt-8 p-6 text-center bg-gradient-to-br from-warm-peach/30 to-accent/30">
          <p className="text-lg font-handwriting text-foreground">
            "Every small step counts! Keep going, you're doing amazing! 💕✨"
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Tasks;

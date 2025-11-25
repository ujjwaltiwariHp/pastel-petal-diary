import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Heart, Trash2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
}

const Diary = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "😊",
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!user) {
      toast.error("Please sign in to add entries! 🌸");
      return;
    }

    if (!newEntry.title || !newEntry.content) {
      toast.error("Please fill in all fields! 🌸");
      return;
    }

    try {
      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        date: new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      await fetchEntries();
      setNewEntry({ title: "", content: "", mood: "😊" });
      setIsAdding(false);
      toast.success("Entry added! 📝✨");
    } catch (error) {
      console.error("Error adding entry:", error);
      toast.error("Failed to add entry");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("diary_entries").delete().eq("id", id);
      if (error) throw error;
      await fetchEntries();
      toast.success("Entry deleted! 🗑️");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const moods = ["😊", "💕", "🌸", "✨", "🌈", "☀️", "🌙", "💫"];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            My Daily Diary 📔
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Capturing beautiful moments, one day at a time
          </p>
          <FloralDecoration variant="top-right" className="hidden md:block" />
        </div>

        {/* Add Entry Button - Only for owner */}
        {user && !isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-rounded"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Entry
          </Button>
        )}

        {/* Add Entry Form */}
        {isAdding && (
          <Card className="p-6 mb-6 shadow-card bg-muted/30">
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
              New Entry ✨
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-rounded text-foreground mb-2 block">
                  Title
                </label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="Give your entry a title..."
                  className="font-rounded"
                />
              </div>

              <div>
                <label className="text-sm font-rounded text-foreground mb-2 block">
                  How are you feeling?
                </label>
                <div className="flex gap-2 flex-wrap">
                  {moods.map((mood) => (
                    <Button
                      key={mood}
                      variant={newEntry.mood === mood ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewEntry({ ...newEntry, mood })}
                      className="text-2xl"
                    >
                      {mood}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-rounded text-foreground mb-2 block">
                  Your thoughts
                </label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Write about your day..."
                  className="min-h-32 font-rounded"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddEntry} className="flex-1">
                  Save Entry
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Entries List */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <Card className="p-12 text-center bg-muted/30">
              <div className="text-6xl mb-4">📔</div>
              <p className="text-muted-foreground font-rounded">
                No diary entries yet. {user ? "Add your first entry!" : "Check back soon!"}
              </p>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card
                key={entry.id}
                className="p-6 shadow-card hover:shadow-soft transition-all bg-card/95 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4 text-3xl group-hover:scale-110 transition-transform">
                  {entry.mood}
                </div>

                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-4 right-16 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-rounded">
                  <Calendar className="w-4 h-4" />
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                <h3 className="text-2xl font-handwriting font-bold text-foreground mb-3">
                  {entry.title}
                </h3>

                <p className="text-foreground/80 leading-relaxed font-rounded whitespace-pre-wrap">
                  {entry.content}
                </p>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Diary;

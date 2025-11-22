import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Heart } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
}

const Diary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: "1",
      date: "2024-01-15",
      title: "A Beautiful Day ✨",
      content: "Today was absolutely magical! Spent the afternoon at the park, surrounded by blooming flowers. The weather was perfect, and I felt so grateful for these simple moments.",
      mood: "😊",
    },
    {
      id: "2",
      date: "2024-01-10",
      title: "Coffee and Dreams ☕",
      content: "Found a cozy new café today. The aesthetic was everything I dreamed of - pastel colors, fairy lights, and the most delicious lavender latte!",
      mood: "💕",
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "😊",
  });

  const handleAddEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      toast.error("Please fill in all fields! 🌸");
      return;
    }

    setEntries([
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        ...newEntry,
      },
      ...entries,
    ]);

    setNewEntry({ title: "", content: "", mood: "😊" });
    setIsAdding(false);
    toast.success("Entry added! 📝✨");
  };

  const moods = ["😊", "💕", "🌸", "✨", "🌈", "☀️", "🌙", "💫"];

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

        {/* Add Entry Button */}
        {!isAdding && (
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
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="p-6 shadow-card hover:shadow-soft transition-all bg-card/95 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute top-4 right-4 text-3xl group-hover:scale-110 transition-transform">
                {entry.mood}
              </div>

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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Diary;

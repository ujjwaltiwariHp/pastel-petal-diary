import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Upload, X, BookHeart, Plane, CheckSquare, MessageCircleQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MOOD_OPTIONS = ["😊", "😢", "😍", "😎", "🤔", "😴", "🎉", "💪", "🌸", "✨"];
const TASK_CATEGORIES = ["Work", "Personal", "Health", "Shopping", "Other"];

export const ContentCreation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("diary");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Diary form
  const [diaryForm, setDiaryForm] = useState({
    title: "",
    content: "",
    mood: "😊",
    date: new Date().toISOString().split("T")[0],
  });

  // Travel form
  const [travelForm, setTravelForm] = useState({
    destination: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Task form
  const [taskForm, setTaskForm] = useState({
    title: "",
    category: "Personal",
  });

  // Q&A Answer form
  const [qnaAnswer, setQnaAnswer] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (bucket: string, path: string): Promise<string | null> => {
    if (!imageFile) return null;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, imageFile, { upsert: true });
    
    if (error) throw error;
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCreateDiary = async () => {
    if (!user || !diaryForm.title.trim() || !diaryForm.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const path = `${user.id}/${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadImage("diary-images", path);
      }

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        title: diaryForm.title,
        content: diaryForm.content + (imageUrl ? `\n\n![Image](${imageUrl})` : ""),
        mood: diaryForm.mood,
        date: diaryForm.date,
      });

      if (error) throw error;

      toast.success("Diary entry created! 📔");
      setDiaryForm({ title: "", content: "", mood: "😊", date: new Date().toISOString().split("T")[0] });
      clearImage();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create diary entry");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTravel = async () => {
    if (!user || !travelForm.destination.trim() || !travelForm.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const path = `${user.id}/${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadImage("travel-images", path);
      }

      const { error } = await supabase.from("travel_posts").insert({
        user_id: user.id,
        destination: travelForm.destination,
        description: travelForm.description,
        date: travelForm.date,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast.success("Travel post created! ✈️");
      setTravelForm({ destination: "", description: "", date: new Date().toISOString().split("T")[0] });
      clearImage();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create travel post");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!user || !taskForm.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: taskForm.title,
        category: taskForm.category,
      });

      if (error) throw error;

      toast.success("Task created! ✅");
      setTaskForm({ title: "", category: "Personal" });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadSection = () => (
    <div className="space-y-2">
      <Label>Image (optional)</Label>
      {imagePreview ? (
        <div className="relative">
          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Click to upload image</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
        </label>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diary" className="gap-1 md:gap-2">
            <BookHeart className="w-4 h-4" />
            <span className="hidden md:inline">Diary</span>
          </TabsTrigger>
          <TabsTrigger value="travel" className="gap-1 md:gap-2">
            <Plane className="w-4 h-4" />
            <span className="hidden md:inline">Travel</span>
          </TabsTrigger>
          <TabsTrigger value="task" className="gap-1 md:gap-2">
            <CheckSquare className="w-4 h-4" />
            <span className="hidden md:inline">Task</span>
          </TabsTrigger>
          <TabsTrigger value="qna" className="gap-1 md:gap-2">
            <MessageCircleQuestion className="w-4 h-4" />
            <span className="hidden md:inline">Q&A</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diary">
          <Card className="p-4 md:p-6">
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-4 flex items-center gap-2">
              <BookHeart className="w-5 h-5 text-primary" />
              New Diary Entry
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diary-date">Date</Label>
                  <Input
                    id="diary-date"
                    type="date"
                    value={diaryForm.date}
                    onChange={(e) => setDiaryForm({ ...diaryForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <Select value={diaryForm.mood} onValueChange={(v) => setDiaryForm({ ...diaryForm, mood: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOOD_OPTIONS.map((mood) => (
                        <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diary-title">Title *</Label>
                <Input
                  id="diary-title"
                  placeholder="What happened today?"
                  value={diaryForm.title}
                  onChange={(e) => setDiaryForm({ ...diaryForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diary-content">Content *</Label>
                <Textarea
                  id="diary-content"
                  placeholder="Write your thoughts..."
                  value={diaryForm.content}
                  onChange={(e) => setDiaryForm({ ...diaryForm, content: e.target.value })}
                  className="min-h-32"
                />
              </div>
              <ImageUploadSection />
              <Button onClick={handleCreateDiary} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Entry
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="travel">
          <Card className="p-4 md:p-6">
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              New Travel Post
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="travel-dest">Destination *</Label>
                  <Input
                    id="travel-dest"
                    placeholder="Where did you go?"
                    value={travelForm.destination}
                    onChange={(e) => setTravelForm({ ...travelForm, destination: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travel-date">Date</Label>
                  <Input
                    id="travel-date"
                    type="date"
                    value={travelForm.date}
                    onChange={(e) => setTravelForm({ ...travelForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="travel-desc">Description *</Label>
                <Textarea
                  id="travel-desc"
                  placeholder="Share your adventure..."
                  value={travelForm.description}
                  onChange={(e) => setTravelForm({ ...travelForm, description: e.target.value })}
                  className="min-h-32"
                />
              </div>
              <ImageUploadSection />
              <Button onClick={handleCreateTravel} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Post
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="task">
          <Card className="p-4 md:p-6">
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              New Task
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title *</Label>
                <Input
                  id="task-title"
                  placeholder="What needs to be done?"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={taskForm.category} onValueChange={(v) => setTaskForm({ ...taskForm, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTask} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Task
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="qna">
          <Card className="p-4 md:p-6">
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-4 flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
              Answer Questions
            </h3>
            <p className="text-muted-foreground font-rounded text-center py-8">
              Go to the Content tab to view and answer pending questions from your visitors.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
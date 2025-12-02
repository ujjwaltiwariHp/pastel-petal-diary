import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Edit2, Save, BookHeart, Plane, CheckSquare, MessageCircleQuestion, MessageSquare, Gamepad2, Calendar } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import heroBg from "@/assets/hero-bg.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const Home = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Your Name ✿",
    bio: "Welcome to my little corner of the internet! 🌸",
    location: "🌍 Somewhere magical",
    hobbies: "✨ Photography, Travel, Writing, Art",
    profile_picture_url: null as string | null,
    cover_photo_url: null as string | null,
  });
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [travelPosts, setTravelPosts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [qnaQuestions, setQnaQuestions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerProfileId, setOwnerProfileId] = useState<string | null>(null);

  const sectionIds = ["profile", "diary", "travel", "tasks", "qna", "messages", "games"];
  const activeSection = useScrollSpy(sectionIds);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      // Fetch owner profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_owner", true)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (profileData) {
        setProfile({
          name: profileData.name || "Your Name ✿",
          bio: profileData.bio || "",
          location: profileData.location || "",
          hobbies: profileData.hobbies || "",
          profile_picture_url: profileData.profile_picture_url,
          cover_photo_url: profileData.cover_photo_url,
        });
        setOwnerProfileId(profileData.id);
      }

      // Fetch diary entries (limited to recent 3)
      const { data: diaryData } = await supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      setDiaryEntries(diaryData || []);

      // Fetch travel posts (limited to recent 3)
      const { data: travelData } = await supabase
        .from("travel_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      setTravelPosts(travelData || []);

      // Fetch tasks (limited to 5)
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setTasks(tasksData || []);

      // Fetch public Q&A questions
      const { data: qnaData } = await supabase
        .from("qna_questions")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(3);
      setQnaQuestions(qnaData || []);

      // Fetch recent messages (only if admin)
      if (user) {
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          bio: profile.bio,
          location: profile.location,
          hobbies: profile.hobbies,
        })
        .eq("id", user.id);

      if (error) throw error;
      setIsEditing(false);
      toast.success("Profile updated! 🌸");
      fetchAllContent();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const coverImage = profile.cover_photo_url || heroBg;

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      {/* Hero Section */}
      <section id="profile" className="relative overflow-hidden scroll-mt-20 md:scroll-mt-24">
        <div 
          className="h-64 md:h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        </div>
        <FloralDecoration variant="top-right" className="hidden md:block" />

        <div className="max-w-4xl mx-auto px-4 -mt-20">
          <Card className="relative p-8 shadow-card backdrop-blur-sm bg-card/95">
            <FloralDecoration variant="top-left" className="scale-75" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-pastel p-1">
                  {profile.profile_picture_url ? (
                    <img 
                      src={profile.profile_picture_url} 
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-4xl">
                      🌸
                    </div>
                  )}
                </div>
                <Heart className="absolute -bottom-2 -right-2 w-8 h-8 text-primary fill-primary" />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="text-3xl font-handwriting font-bold mb-2 text-center md:text-left"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-handwriting font-bold text-foreground mb-2">
                    {profile.name}
                  </h1>
                )}
                
                {isEditing ? (
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="text-muted-foreground mb-4"
                  />
                ) : (
                  <p className="text-muted-foreground mb-4 font-rounded">{profile.location}</p>
                )}

                {ownerProfileId && <SocialLinksDisplay profileId={ownerProfileId} />}
              </div>

              {/* Edit Button - Only for admin */}
              {isAdmin && (
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  variant={isEditing ? "default" : "outline"}
                  className="absolute top-4 right-4"
                >
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {isEditing ? "Save" : "Edit"}
                </Button>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-handwriting font-bold text-foreground mb-2">About Me</h3>
                {isEditing ? (
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="min-h-24"
                  />
                ) : (
                  <p className="text-foreground/80 leading-relaxed font-rounded">{profile.bio}</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-handwriting font-bold text-foreground mb-2">My Hobbies</h3>
                {isEditing ? (
                  <Input
                    value={profile.hobbies}
                    onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground/80 font-rounded">{profile.hobbies}</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Diary Section */}
      <section id="diary" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <BookHeart className="w-8 h-8 text-primary" />
            Daily Diary
          </h2>
        </div>
        <div className="grid gap-6">
          {diaryEntries.length > 0 ? diaryEntries.map((entry) => (
            <Card key={entry.id} className="p-6 hover:shadow-soft transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">{entry.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    {entry.mood && <span className="text-lg">{entry.mood}</span>}
                  </div>
                </div>
                <LikeButton postId={entry.id} postType="diary" />
              </div>
              <p className="text-foreground/80 font-rounded mb-4 whitespace-pre-wrap">{entry.content}</p>
              <CommentSection postId={entry.id} postType="diary" />
            </Card>
          )) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No diary entries yet 📔</p>
            </Card>
          )}
        </div>
      </section>

      {/* Travel Section */}
      <section id="travel" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <Plane className="w-8 h-8 text-primary" />
            Travel Adventures
          </h2>
        </div>
        <div className="grid gap-6">
          {travelPosts.length > 0 ? travelPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-soft transition-all">
              {post.image_url && (
                <img src={post.image_url} alt={post.destination} className="w-full h-64 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">{post.destination}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                  <LikeButton postId={post.id} postType="travel" />
                </div>
                <p className="text-foreground/80 font-rounded mb-4 whitespace-pre-wrap">{post.description}</p>
                <CommentSection postId={post.id} postType="travel" />
              </div>
            </Card>
          )) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No travel posts yet ✈️</p>
            </Card>
          )}
        </div>
      </section>

      {/* Tasks Section */}
      <section id="tasks" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-primary" />
            My Tasks
          </h2>
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {tasks.length > 0 ? tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`}>
                  {task.completed && <span className="text-primary-foreground text-xs">✓</span>}
                </div>
                <span className={`flex-1 font-rounded ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-rounded">
                  {task.category}
                </span>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No tasks yet ✅</p>
            )}
          </div>
        </Card>
      </section>

      {/* Q&A Section */}
      <section id="qna" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <MessageCircleQuestion className="w-8 h-8 text-primary" />
            Questions & Answers
          </h2>
        </div>
        <div className="grid gap-6">
          {qnaQuestions.length > 0 ? qnaQuestions.map((qa) => (
            <Card key={qa.id} className="p-6 hover:shadow-soft transition-all">
              <h3 className="text-lg font-handwriting font-bold text-foreground mb-3">Q: {qa.question}</h3>
              {qa.is_answered && qa.answer && (
                <p className="text-foreground/80 font-rounded pl-4 border-l-2 border-primary">
                  A: {qa.answer}
                </p>
              )}
            </Card>
          )) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No questions yet 💭</p>
            </Card>
          )}
        </div>
      </section>

      {/* Messages Section */}
      {isAdmin && messages.length > 0 && (
        <section id="messages" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              Recent Messages
            </h2>
          </div>
          <div className="grid gap-4">
            {messages.map((message) => (
              <Card key={message.id} className="p-6 hover:shadow-soft transition-all">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-handwriting font-bold text-foreground">{message.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-foreground/80 font-rounded">{message.message}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Games Section */}
      <section id="games" className="max-w-4xl mx-auto px-4 mt-16 mb-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            Fun & Games
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 text-center hover:shadow-soft transition-all cursor-pointer group" onClick={() => window.location.href = '/games/truth-dare'}>
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎭</div>
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">Truth or Dare</h3>
            <p className="text-sm text-muted-foreground font-rounded mb-4">Play the classic game</p>
            <Button variant="outline">Play Now</Button>
          </Card>
          <Card className="p-8 text-center hover:shadow-soft transition-all cursor-pointer group" onClick={() => window.location.href = '/games/anonymous-questions'}>
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">❓</div>
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">Anonymous Questions</h3>
            <p className="text-sm text-muted-foreground font-rounded mb-4">Ask me anything!</p>
            <Button variant="outline">Ask Question</Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;

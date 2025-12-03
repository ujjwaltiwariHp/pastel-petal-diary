import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BookHeart, Plane, CheckSquare, MessageCircleQuestion, Gamepad2, Calendar } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import heroBg from "@/assets/hero-bg.png";
import { supabase } from "@/integrations/supabase/client";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { PageLoader } from "@/components/PageLoader";
import { AnimatedSection } from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const Home = () => {
  const [profile, setProfile] = useState<{
    name: string;
    bio: string;
    location: string;
    hobbies: string;
    profile_picture_url: string | null;
    cover_photo_url: string | null;
  } | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [travelPosts, setTravelPosts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [qnaQuestions, setQnaQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerProfileId, setOwnerProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      // Fetch owner profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_owner", true)
        .limit(1)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name,
          bio: profileData.bio || "",
          location: profileData.location || "",
          hobbies: profileData.hobbies || "",
          profile_picture_url: profileData.profile_picture_url,
          cover_photo_url: profileData.cover_photo_url,
        });
        setOwnerProfileId(profileData.id);
      }

      // Fetch all content in parallel
      const [diaryRes, travelRes, tasksRes, qnaRes] = await Promise.all([
        supabase.from("diary_entries").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("travel_posts").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("qna_questions").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(6),
      ]);

      setDiaryEntries(diaryRes.data || []);
      setTravelPosts(travelRes.data || []);
      setTasks(tasksRes.data || []);
      setQnaQuestions(qnaRes.data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  const coverImage = profile?.cover_photo_url || heroBg;

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      {/* Hero Section */}
      <motion.section 
        id="profile" 
        className="relative overflow-hidden scroll-mt-20 md:scroll-mt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div 
          className="h-64 md:h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        </div>
        <FloralDecoration variant="top-right" className="hidden md:block" />

        <div className="max-w-4xl mx-auto px-4 -mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative p-8 shadow-card backdrop-blur-sm bg-card/95">
              <FloralDecoration variant="top-left" className="scale-75" />
              
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                {/* Profile Picture */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-pastel p-1">
                    {profile?.profile_picture_url ? (
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
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-handwriting font-bold text-foreground mb-2">
                    {profile?.name || "Welcome"}
                  </h1>
                  <p className="text-muted-foreground mb-4 font-rounded">{profile?.location}</p>
                  {ownerProfileId && <SocialLinksDisplay profileId={ownerProfileId} />}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4">
                {profile?.bio && (
                  <div>
                    <h3 className="text-lg font-handwriting font-bold text-foreground mb-2">About Me</h3>
                    <p className="text-foreground/80 leading-relaxed font-rounded">{profile.bio}</p>
                  </div>
                )}

                {profile?.hobbies && (
                  <div>
                    <h3 className="text-lg font-handwriting font-bold text-foreground mb-2">My Hobbies</h3>
                    <p className="text-foreground/80 font-rounded">{profile.hobbies}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Diary Section */}
      <AnimatedSection id="diary" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <BookHeart className="w-8 h-8 text-primary" />
            Daily Diary
          </h2>
        </div>
        <div className="grid gap-6">
          {diaryEntries.length > 0 ? diaryEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-soft transition-all">
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
            </motion.div>
          )) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No diary entries yet 📔</p>
            </Card>
          )}
        </div>
      </AnimatedSection>

      {/* Travel Section */}
      <AnimatedSection id="travel" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <Plane className="w-8 h-8 text-primary" />
            Travel Adventures
          </h2>
        </div>
        <div className="grid gap-6">
          {travelPosts.length > 0 ? travelPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-soft transition-all">
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
            </motion.div>
          )) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No travel posts yet ✈️</p>
            </Card>
          )}
        </div>
      </AnimatedSection>

      {/* Tasks Section */}
      <AnimatedSection id="tasks" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-primary" />
            My Tasks
          </h2>
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {tasks.length > 0 ? tasks.map((task, index) => (
              <motion.div 
                key={task.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
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
              </motion.div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No tasks yet ✅</p>
            )}
          </div>
        </Card>
      </AnimatedSection>

      {/* Q&A Section */}
      <AnimatedSection id="qna" className="max-w-4xl mx-auto px-4 mt-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <MessageCircleQuestion className="w-8 h-8 text-primary" />
            Questions & Answers
          </h2>
        </div>
        <div className="grid gap-6">
          {qnaQuestions.length > 0 ? qnaQuestions.map((qa, index) => (
            <motion.div
              key={qa.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-soft transition-all">
                <h3 className="text-lg font-handwriting font-bold text-foreground mb-3">Q: {qa.question}</h3>
                {qa.is_answered && qa.answer && (
                  <p className="text-foreground/80 font-rounded pl-4 border-l-2 border-primary">
                    A: {qa.answer}
                  </p>
                )}
              </Card>
            </motion.div>
          )) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No questions yet 💭</p>
            </Card>
          )}
        </div>
      </AnimatedSection>

      {/* Games Section */}
      <AnimatedSection id="games" className="max-w-4xl mx-auto px-4 mt-16 mb-16 scroll-mt-20 md:scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-handwriting font-bold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            Fun & Games
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="p-8 text-center hover:shadow-soft transition-all cursor-pointer group" 
              onClick={() => window.location.href = '/games/truth-dare'}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎭</div>
              <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">Truth or Dare</h3>
              <p className="text-sm text-muted-foreground font-rounded mb-4">Play the classic game</p>
              <Button variant="outline">Play Now</Button>
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="p-8 text-center hover:shadow-soft transition-all cursor-pointer group" 
              onClick={() => window.location.href = '/games/anonymous-questions'}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">❓</div>
              <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">Ask Me Anything</h3>
              <p className="text-sm text-muted-foreground font-rounded mb-4">Send anonymous questions</p>
              <Button variant="outline">Ask Now</Button>
            </Card>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Home;

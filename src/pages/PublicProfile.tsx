import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BookHeart, Plane, CheckSquare, MessageCircleQuestion, Gamepad2, Calendar, MapPin, ArrowLeft, Share2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import heroBg from "@/assets/hero-bg.png";
import { supabase } from "@/integrations/supabase/client";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { PageLoader } from "@/components/PageLoader";
import { AnimatedSection } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [travelPosts, setTravelPosts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [qnaQuestions, setQnaQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfileByUsername();
    }
  }, [username]);

  const fetchProfileByUsername = async () => {
    try {
      // Fetch profile by username
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      
      if (!profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch all content for this user
      const [diaryRes, travelRes, tasksRes, qnaRes] = await Promise.all([
        supabase.from("diary_entries").select("*").eq("user_id", profileData.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("travel_posts").select("*").eq("user_id", profileData.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("tasks").select("*").eq("user_id", profileData.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("qna_questions").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(10),
      ]);

      setDiaryEntries(diaryRes.data || []);
      setTravelPosts(travelRes.data || []);
      setTasks(tasksRes.data || []);
      setQnaQuestions(qnaRes.data || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) return <PageLoader />;

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-handwriting font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6 font-rounded">The profile you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const coverImage = profile?.cover_photo_url || heroBg;

  return (
    <div className="min-h-screen pb-24">
      {/* Fixed Header for Mobile */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border md:hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between p-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="font-handwriting font-bold text-foreground">@{username}</span>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.section 
        id="profile" 
        className="relative overflow-hidden pt-14 md:pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div 
          className="h-48 md:h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        </div>
        <FloralDecoration variant="top-right" className="hidden md:block" />

        <div className="max-w-lg md:max-w-4xl mx-auto px-4 -mt-16 md:-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative p-6 md:p-8 shadow-card backdrop-blur-sm bg-card/95">
              <FloralDecoration variant="top-left" className="scale-50 md:scale-75" />
              
              {/* Instagram-style profile header */}
              <div className="flex items-center gap-4 md:gap-6 mb-4">
                {/* Profile Picture */}
                <motion.div 
                  className="relative shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-pastel p-0.5 md:p-1">
                    {profile?.profile_picture_url ? (
                      <img 
                        src={profile.profile_picture_url} 
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-2xl md:text-4xl">
                        🌸
                      </div>
                    )}
                  </div>
                  <Heart className="absolute -bottom-1 -right-1 w-5 h-5 md:w-8 md:h-8 text-primary fill-primary" />
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-4xl font-handwriting font-bold text-foreground truncate">
                    {profile?.name || "Welcome"}
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground font-rounded flex items-center gap-1">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    {profile?.location || "Somewhere magical"}
                  </p>
                  <div className="mt-2">
                    <SocialLinksDisplay profileId={profile?.id} />
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <p className="text-sm md:text-base text-foreground/80 font-rounded mb-3">{profile.bio}</p>
              )}

              {profile?.hobbies && (
                <p className="text-xs md:text-sm text-muted-foreground font-rounded">{profile.hobbies}</p>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Sections */}
      {diaryEntries.length > 0 && (
        <AnimatedSection id="diary" className="max-w-lg md:max-w-4xl mx-auto px-4 mt-8 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-handwriting font-bold text-foreground flex items-center gap-2 mb-4 md:mb-6">
            <BookHeart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Daily Diary
          </h2>
          <div className="grid gap-4 md:gap-6">
            {diaryEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 md:p-6 hover:shadow-soft transition-all">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-handwriting font-bold text-foreground mb-1 md:mb-2 truncate">{entry.title}</h3>
                      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        {entry.mood && <span className="text-base md:text-lg">{entry.mood}</span>}
                      </div>
                    </div>
                    <LikeButton postId={entry.id} postType="diary" />
                  </div>
                  <p className="text-sm md:text-base text-foreground/80 font-rounded mb-3 md:mb-4 whitespace-pre-wrap line-clamp-4">{entry.content}</p>
                  <CommentSection postId={entry.id} postType="diary" />
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {travelPosts.length > 0 && (
        <AnimatedSection id="travel" className="max-w-lg md:max-w-4xl mx-auto px-4 mt-8 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-handwriting font-bold text-foreground flex items-center gap-2 mb-4 md:mb-6">
            <Plane className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Travel Adventures
          </h2>
          <div className="grid gap-4 md:gap-6">
            {travelPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-soft transition-all">
                  {post.image_url && (
                    <img src={post.image_url} alt={post.destination} className="w-full h-48 md:h-64 object-cover" />
                  )}
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-handwriting font-bold text-foreground mb-1 md:mb-2 truncate">{post.destination}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                          {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                      <LikeButton postId={post.id} postType="travel" />
                    </div>
                    <p className="text-sm md:text-base text-foreground/80 font-rounded mb-3 md:mb-4 whitespace-pre-wrap line-clamp-4">{post.description}</p>
                    <CommentSection postId={post.id} postType="travel" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {tasks.length > 0 && (
        <AnimatedSection id="tasks" className="max-w-lg md:max-w-4xl mx-auto px-4 mt-8 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-handwriting font-bold text-foreground flex items-center gap-2 mb-4 md:mb-6">
            <CheckSquare className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            My Tasks
          </h2>
          <Card className="p-4 md:p-6">
            <div className="space-y-2 md:space-y-3">
              {tasks.map((task, index) => (
                <motion.div 
                  key={task.id} 
                  className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`w-4 h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}>
                    {task.completed && <span className="text-primary-foreground text-[10px] md:text-xs">✓</span>}
                  </div>
                  <span className={`flex-1 text-sm md:text-base font-rounded truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                  <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded-full bg-primary/10 text-primary font-rounded shrink-0">
                    {task.category}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </AnimatedSection>
      )}

      {qnaQuestions.length > 0 && (
        <AnimatedSection id="qna" className="max-w-lg md:max-w-4xl mx-auto px-4 mt-8 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-handwriting font-bold text-foreground flex items-center gap-2 mb-4 md:mb-6">
            <MessageCircleQuestion className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Q&A
          </h2>
          <div className="grid gap-4 md:gap-6">
            {qnaQuestions.map((qa, index) => (
              <motion.div
                key={qa.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 md:p-6 hover:shadow-soft transition-all">
                  <h3 className="text-base md:text-lg font-handwriting font-bold text-foreground mb-2 md:mb-3">Q: {qa.question}</h3>
                  {qa.is_answered && qa.answer && (
                    <p className="text-sm md:text-base text-foreground/80 font-rounded pl-3 md:pl-4 border-l-2 border-primary">
                      A: {qa.answer}
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Games Section */}
      <AnimatedSection id="games" className="max-w-lg md:max-w-4xl mx-auto px-4 mt-8 md:mt-16 mb-8">
        <h2 className="text-2xl md:text-3xl font-handwriting font-bold text-foreground flex items-center gap-2 mb-4 md:mb-6">
          <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          Fun & Games
        </h2>
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to={`/u/${username}/games/truth-dare`}>
              <Card className="p-4 md:p-8 text-center hover:shadow-soft transition-all cursor-pointer group h-full">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">🎭</div>
                <h3 className="text-base md:text-xl font-handwriting font-bold text-foreground mb-1 md:mb-2">Truth or Dare</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-rounded hidden md:block mb-4">Play the classic game</p>
                <Button variant="outline" size="sm" className="text-xs md:text-sm">Play</Button>
              </Card>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to={`/u/${username}/games/anonymous`}>
              <Card className="p-4 md:p-8 text-center hover:shadow-soft transition-all cursor-pointer group h-full">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">❓</div>
                <h3 className="text-base md:text-xl font-handwriting font-bold text-foreground mb-1 md:mb-2">Ask Anything</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-rounded hidden md:block mb-4">Anonymous questions</p>
                <Button variant="outline" size="sm" className="text-xs md:text-sm">Ask</Button>
              </Card>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default PublicProfile;
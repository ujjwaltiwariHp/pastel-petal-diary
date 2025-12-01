import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Edit2, Save } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import heroBg from "@/assets/hero-bg.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";

const Home = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Your Name ✿",
    bio: "Welcome to my little corner of the internet! 🌸",
    location: "🌍 Somewhere magical",
    hobbies: "✨ Photography, Travel, Writing, Art",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_owner", true)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          name: data.name || "Your Name ✿",
          bio: data.bio || "",
          location: data.location || "",
          hobbies: data.hobbies || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-64 md:h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        </div>
        <FloralDecoration variant="top-right" className="hidden md:block" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20">
        {/* Profile Card */}
        <Card className="relative p-8 shadow-card backdrop-blur-sm bg-card/95">
          <FloralDecoration variant="top-left" className="scale-75" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-pastel p-1">
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-4xl">
                  🌸
                </div>
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

              {user && <SocialLinksDisplay profileId={user.id} />}
            </div>

            {/* Edit Button - Only for logged in owner */}
            {user && (
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

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { emoji: "📔", title: "Daily Diary", count: "12 entries" },
            { emoji: "✈️", title: "Adventures", count: "8 trips" },
            { emoji: "💭", title: "Questions", count: "24 answered" },
            { emoji: "💌", title: "Messages", count: "15 new" },
          ].map((item, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-soft transition-all cursor-pointer group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <h4 className="font-handwriting font-bold text-foreground mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground font-rounded">{item.count}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

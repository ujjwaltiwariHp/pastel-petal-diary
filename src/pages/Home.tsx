import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageLoader } from "@/components/PageLoader";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  profile_picture_url: string | null;
  location: string | null;
}

const Home = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  // Live-update the profiles grid when admins make changes
  useRealtimeSync(["profiles"], () => fetchProfiles());

  const fetchProfiles = async () => {
    try {
      // Fetch all profiles with usernames
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, username, bio, profile_picture_url, location")
        .not("username", "is", null)
        .order("created_at", { ascending: false });

      setProfiles(profilesData || []);

      // Check if current user has a profile
      if (user) {
        const { data: userProfileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setUserProfile(userProfileData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pb-24 pt-4 md:pt-8 px-4">
      <div className="max-w-lg md:max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-6xl font-handwriting font-bold text-foreground mb-2 md:mb-4">
            🌸 Portfolio Hub
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-rounded max-w-md mx-auto">
            Beautiful personal portfolios with diary, travel stories, and fun games
          </p>
        </motion.div>

        {/* User actions */}
        <motion.div 
          className="flex justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {user ? (
            <>
              {userProfile?.username ? (
                <Link to={`/u/${userProfile.username}`}>
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    View My Profile
                  </Button>
                </Link>
              ) : null}
              <Link to="/admin">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Portfolio
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/auth">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Your Portfolio
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/u/${profile.username}`}>
                <Card className="p-4 md:p-6 hover:shadow-soft transition-all cursor-pointer group h-full">
                  <div className="text-center">
                    <motion.div 
                      className="relative mx-auto mb-3 md:mb-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-pastel p-0.5 mx-auto">
                        {profile.profile_picture_url ? (
                          <img 
                            src={profile.profile_picture_url} 
                            alt={profile.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-2xl md:text-3xl">
                            🌸
                          </div>
                        )}
                      </div>
                      <Heart className="absolute -bottom-1 -right-1 w-4 h-4 md:w-6 md:h-6 text-primary fill-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                    <h3 className="text-sm md:text-lg font-handwriting font-bold text-foreground truncate">
                      {profile.name}
                    </h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-rounded truncate">
                      @{profile.username}
                    </p>
                    {profile.location && (
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">
                        📍 {profile.location}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {profiles.length === 0 && (
          <Card className="p-8 md:p-12 text-center">
            <div className="text-6xl mb-4">🌸</div>
            <h2 className="text-xl md:text-2xl font-handwriting font-bold text-foreground mb-2">
              No profiles yet
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-rounded mb-6">
              Be the first to create a beautiful portfolio!
            </p>
            <Link to="/auth">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Portfolio
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
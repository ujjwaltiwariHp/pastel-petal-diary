import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Plus, Trash2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TravelPost {
  id: string;
  destination: string;
  date: string;
  description: string;
  image_url?: string;
}

const Travel = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("travel_posts")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = async () => {
    if (!user) {
      toast.error("Please sign in to add trips! 🌸");
      return;
    }

    if (!newTrip.destination || !newTrip.date || !newTrip.description) {
      toast.error("Please fill in all fields! 🌸");
      return;
    }

    try {
      const { error } = await supabase.from("travel_posts").insert({
        user_id: user.id,
        destination: newTrip.destination,
        date: newTrip.date,
        description: newTrip.description,
      });

      if (error) throw error;

      await fetchTrips();
      setNewTrip({ destination: "", date: "", description: "" });
      setIsAdding(false);
      toast.success("Trip added! ✈️✨");
    } catch (error) {
      console.error("Error adding trip:", error);
      toast.error("Failed to add trip");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("travel_posts").delete().eq("id", id);
      if (error) throw error;
      await fetchTrips();
      toast.success("Trip deleted! 🗑️");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip");
    }
  };

  const getRandomEmoji = () => {
    const emojis = ["🗼", "🌸", "🏖️", "🏔️", "🌴", "🗿", "🎡", "🏰", "🌉", "🗽"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const getRandomGradient = () => {
    const gradients = [
      "from-primary/20 to-secondary/20",
      "from-accent/20 to-primary/20",
      "from-secondary/20 to-accent/20",
      "from-warm-peach/20 to-soft-yellow/20",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Travel Adventures ✈️
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Exploring the world, one destination at a time
          </p>
          <FloralDecoration variant="top-left" className="hidden md:block" />
        </div>

        {/* Add Trip Button - Only for owner */}
        {user && !isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-rounded"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Trip
          </Button>
        )}

        {/* Add Trip Form */}
        {isAdding && (
          <Card className="p-6 mb-6 shadow-card bg-muted/30">
            <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
              New Adventure ✨
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-rounded text-foreground mb-2 block">
                  Destination
                </label>
                <Input
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                  placeholder="e.g. Paris, France 🇫🇷"
                  className="font-rounded"
                />
              </div>

              <div>
                <label className="text-sm font-rounded text-foreground mb-2 block">
                  Date
                </label>
                <Input
                  type="date"
                  value={newTrip.date}
                  onChange={(e) => setNewTrip({ ...newTrip, date: e.target.value })}
                  className="font-rounded"
                />
              </div>

              <div>
                <label className="text-sm font-rounded text-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  value={newTrip.description}
                  onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                  placeholder="Share your travel memories..."
                  className="min-h-24 font-rounded"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddTrip} className="flex-1">
                  Save Trip
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="overflow-hidden shadow-card hover:shadow-soft transition-all group cursor-pointer"
            >
              <div className={`h-48 bg-gradient-to-br ${getRandomGradient()} flex items-center justify-center text-8xl group-hover:scale-110 transition-transform relative`}>
                {getRandomEmoji()}
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(trip.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive bg-background/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-handwriting font-bold text-foreground mb-3">
                  {trip.destination}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-rounded">
                  <Calendar className="w-4 h-4" />
                  {new Date(trip.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>

                <p className="text-foreground/80 font-rounded leading-relaxed">
                  {trip.description}
                </p>

                <div className="mt-4 pt-4 border-t border-border flex items-center text-sm text-primary font-rounded">
                  <MapPin className="w-4 h-4 mr-1" />
                  View memories
                </div>
              </div>
            </Card>
          ))}
        </div>

        {trips.length === 0 && (
          <Card className="mt-8 p-12 text-center bg-muted/30">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-muted-foreground font-rounded">
              {user ? "Add your first travel adventure!" : "No trips yet. Check back soon!"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Travel;

import { Card } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";

const Travel = () => {
  const trips = [
    {
      id: "1",
      destination: "Paris, France 🇫🇷",
      date: "Summer 2023",
      description: "The city of love! Explored the Eiffel Tower, enjoyed croissants, and wandered through charming streets.",
      image: "🗼",
      color: "from-primary/20 to-secondary/20",
    },
    {
      id: "2",
      destination: "Tokyo, Japan 🇯🇵",
      date: "Spring 2023",
      description: "Cherry blossoms everywhere! Visited temples, tried amazing food, and fell in love with the culture.",
      image: "🌸",
      color: "from-accent/20 to-primary/20",
    },
    {
      id: "3",
      destination: "Santorini, Greece 🇬🇷",
      date: "Fall 2022",
      description: "Blue domes and white buildings against the sunset. Absolutely breathtaking views!",
      image: "🏖️",
      color: "from-secondary/20 to-accent/20",
    },
  ];

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

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="overflow-hidden shadow-card hover:shadow-soft transition-all group cursor-pointer"
            >
              <div className={`h-48 bg-gradient-to-br ${trip.color} flex items-center justify-center text-8xl group-hover:scale-110 transition-transform`}>
                {trip.image}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-handwriting font-bold text-foreground mb-3">
                  {trip.destination}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-rounded">
                  <Calendar className="w-4 h-4" />
                  {trip.date}
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

        {/* Coming Soon */}
        <Card className="mt-8 p-8 text-center bg-gradient-to-br from-warm-peach/30 to-soft-yellow/30">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-2xl font-handwriting font-bold text-foreground mb-2">
            More Adventures Coming Soon!
          </h3>
          <p className="text-muted-foreground font-rounded">
            Planning my next trip... Where should I go? 🌍✨
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Travel;

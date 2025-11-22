import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleQuestion, Send, Eye, EyeOff } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  answer?: string;
  date: string;
  isPublic: boolean;
}

const QnA = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "What inspired you to create this website?",
      answer:
        "I wanted a cozy space to share my thoughts and connect with lovely people like you! 🌸",
      date: "2024-01-15",
      isPublic: true,
    },
    {
      id: "2",
      question: "What's your favorite place you've traveled to?",
      answer: "Japan! The cherry blossoms, the culture, everything was magical ✨",
      date: "2024-01-12",
      isPublic: true,
    },
    {
      id: "3",
      question: "How do you stay motivated?",
      date: "2024-01-10",
      isPublic: false,
    },
  ]);

  const [newQuestion, setNewQuestion] = useState("");
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error("Please write a question! 💭");
      return;
    }

    setQuestions([
      {
        id: Date.now().toString(),
        question: newQuestion,
        date: new Date().toISOString(),
        isPublic: false,
      },
      ...questions,
    ]);

    setNewQuestion("");
    toast.success("Question submitted anonymously! 🌸");
  };

  const handleAnswer = (id: string) => {
    if (!answerText.trim()) {
      toast.error("Please write an answer! ✨");
      return;
    }

    setQuestions(
      questions.map((q) =>
        q.id === id
          ? { ...q, answer: answerText, isPublic: true }
          : q
      )
    );

    setAnswerText("");
    setAnsweringId(null);
    toast.success("Answer posted! 💕");
  };

  const toggleVisibility = (id: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, isPublic: !q.isPublic } : q
      )
    );
  };

  const publicQuestions = questions.filter((q) => q.isPublic);
  const pendingQuestions = questions.filter((q) => !q.isPublic);

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Ask Me Anything 💭
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Drop your anonymous questions below!
          </p>
          <FloralDecoration variant="top-left" className="hidden md:block" />
        </div>

        {/* Submit Question Form */}
        <Card className="p-6 mb-8 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
          <h3 className="text-xl font-handwriting font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageCircleQuestion className="w-6 h-6" />
            Ask Anonymously
          </h3>

          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="What would you like to know? 🌸"
            className="mb-4 font-rounded"
            rows={3}
          />

          <Button
            onClick={handleSubmitQuestion}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Question
          </Button>
        </Card>

        {/* Pending Questions (Only visible to owner) */}
        {pendingQuestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-handwriting font-bold text-foreground mb-4">
              Pending Questions 📥
            </h2>
            <div className="space-y-4">
              {pendingQuestions.map((q) => (
                <Card key={q.id} className="p-6 shadow-card bg-muted/30">
                  <p className="text-foreground font-rounded mb-4">{q.question}</p>

                  {answeringId === q.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write your answer..."
                        className="font-rounded"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleAnswer(q.id)} size="sm" className="flex-1">
                          Post Answer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setAnsweringId(q.id)}
                      variant="outline"
                      size="sm"
                    >
                      Answer
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Public Q&A */}
        <div>
          <h2 className="text-2xl font-handwriting font-bold text-foreground mb-4">
            Answered Questions ✨
          </h2>
          <div className="space-y-6">
            {publicQuestions.map((q) => (
              <Card
                key={q.id}
                className="p-6 shadow-card hover:shadow-soft transition-all bg-card/95 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-lg text-foreground font-rounded font-medium flex-1">
                    Q: {q.question}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(q.id)}
                    className="ml-2"
                  >
                    {q.isPublic ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {q.answer && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-border">
                    <p className="text-foreground/90 font-rounded">
                      <span className="font-bold">A:</span> {q.answer}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3 font-rounded">
                  {new Date(q.date).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnA;

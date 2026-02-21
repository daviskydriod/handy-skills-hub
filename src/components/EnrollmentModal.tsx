import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, Clock, Award, Loader2 } from "lucide-react";

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    id: string;
    title: string;
    price: number;
    lessons: number;
    duration: string;
    instructor: string;
    image: string;
  };
}

export default function EnrollmentModal({ open, onOpenChange, course }: EnrollmentModalProps) {
  const [step, setStep] = useState<"confirm" | "enrolling" | "success">("confirm");

  const handleEnroll = () => {
    setStep("enrolling");
    setTimeout(() => {
      // Save progress to localStorage
      const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
      if (!enrolled.find((c: any) => c.id === course.id)) {
        enrolled.push({ id: course.id, progress: 0, enrolledAt: new Date().toISOString() });
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolled));
      }
      setStep("success");
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setStep("confirm"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">Enroll in this Course</DialogTitle>
              <DialogDescription>You're about to start your learning journey!</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 items-start mt-2">
              <img src={course.image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
              <div>
                <h4 className="font-heading font-semibold text-sm text-foreground">{course.title}</h4>
                <p className="text-xs text-muted-foreground">by {course.instructor}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="bg-secondary rounded-lg p-3">
                <BookOpen size={16} className="mx-auto mb-1 text-accent" />
                <p className="text-xs text-muted-foreground">{course.lessons} Lessons</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <Clock size={16} className="mx-auto mb-1 text-accent" />
                <p className="text-xs text-muted-foreground">{course.duration}</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <Award size={16} className="mx-auto mb-1 text-accent" />
                <p className="text-xs text-muted-foreground">Certificate</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="font-heading font-bold text-xl text-foreground">₦{course.price.toLocaleString()}</span>
              <Button onClick={handleEnroll} className="gradient-accent text-accent-foreground border-0">
                Enroll & Start Now
              </Button>
            </div>
          </>
        )}

        {step === "enrolling" && (
          <div className="py-10 text-center">
            <Loader2 size={40} className="mx-auto mb-4 text-accent animate-spin" />
            <p className="font-heading font-semibold text-foreground">Setting up your course...</p>
            <p className="text-sm text-muted-foreground mt-1">Saving your progress</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-accent" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">You're Enrolled! 🎉</h3>
            <p className="text-sm text-muted-foreground mb-6">Your progress will be saved automatically.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleClose} variant="outline">Close</Button>
              <Button className="gradient-accent text-accent-foreground border-0" onClick={handleClose}>
                Start Learning
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

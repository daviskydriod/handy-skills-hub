import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import { categories } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

interface QuickAddCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickAddCourseModal({ open, onOpenChange }: QuickAddCourseModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: "Course submitted!", description: "Awaiting admin approval." });
    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle size={40} className="mx-auto mb-3 text-accent" />
            <h3 className="font-heading font-bold text-lg text-foreground">Course Submitted!</h3>
            <p className="text-sm text-muted-foreground mt-1">It will be reviewed by admin shortly.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">Quick Add Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Course Title</label>
                <Input placeholder="e.g. Advanced Paper Craft" required />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Category</label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Price (₦)</label>
                  <Input type="number" placeholder="25000" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Duration</label>
                  <Input placeholder="e.g. 6h 30m" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
                <Textarea placeholder="Brief course description..." rows={3} required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" className="gradient-accent text-accent-foreground border-0">Submit for Review</Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

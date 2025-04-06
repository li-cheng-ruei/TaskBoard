
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTasks } from "@/contexts/TasksContext";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format, addHours, addMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema for task validation
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  durationHours: z.coerce.number(),
  durationMinutes: z.coerce.number(),
  registrationDeadline: z.date({
    required_error: "Registration deadline is required",
  }),
}).refine(
  (data) => data.registrationDeadline <= data.startDate,
  {
    message: "Registration deadline must be before or on the start date",
    path: ["registrationDeadline"],
  }
);

type TaskFormValues = z.infer<typeof taskSchema>;

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onOpenChange }) => {
  const { addTask, tasks } = useTasks();
  const [prevTemplates, setPrevTemplates] = useState<string[]>([]);
  
  // Extract unique task titles for templates
  React.useEffect(() => {
    const uniqueTitles = Array.from(new Set(tasks.map(task => task.title)));
    setPrevTemplates(uniqueTitles);
  }, [tasks]);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      durationHours: 1,
      durationMinutes: 0,
      registrationDeadline: new Date(),
    },
  });

  // Function to find and apply task template
  const applyTemplate = (title: string) => {
    const templateTask = tasks.find(task => task.title === title);
    if (templateTask) {
      form.setValue("title", templateTask.title);
      form.setValue("description", templateTask.description || "");
      form.setValue("durationHours", templateTask.duration.hours);
      form.setValue("durationMinutes", templateTask.duration.minutes);
    }
  };

  function onSubmit(data: TaskFormValues) {
    const startDate = data.startDate;
    const hours = data.durationHours;
    const minutes = data.durationMinutes;
    
    // Calculate end date based on duration
    const endDate = addMinutes(addHours(startDate, hours), minutes);
    
    addTask({
      title: data.title,
      description: data.description || "",
      startDate: data.startDate,
      endDate: endDate,
      duration: {
        hours: hours,
        minutes: minutes
      },
      registrationDeadline: data.registrationDeadline,
    });
    
    form.reset();
    onOpenChange(false);
  }

  // Generate hours options (0-24)
  const hoursOptions = Array.from({ length: 25 }, (_, i) => i.toString());
  
  // Generate minutes options (0, 15, 30, 45)
  const minutesOptions = ["0", "15", "30", "45"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    {prevTemplates.length > 0 && (
                      <Select 
                        onValueChange={(value) => applyTemplate(value)}
                      >
                        <SelectTrigger className="w-auto whitespace-nowrap">
                          <SelectValue placeholder="Use template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Previous Tasks</SelectLabel>
                            {prevTemplates.map((title) => (
                              <SelectItem key={title} value={title}>
                                {title}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the task details" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date and Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMM d HH:mm")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // Keep the time from the current value
                            const currentDate = field.value || new Date();
                            date.setHours(currentDate.getHours());
                            date.setMinutes(currentDate.getMinutes());
                            field.onChange(date);
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="p-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Time:</label>
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              value={field.value ? field.value.getHours() : 0}
                              onChange={(e) => {
                                const date = new Date(field.value);
                                date.setHours(parseInt(e.target.value, 10) || 0);
                                field.onChange(date);
                              }}
                              className="w-16"
                              min={0}
                              max={23}
                            />
                            <span className="text-sm self-center">:</span>
                            <Input
                              type="number"
                              value={field.value ? field.value.getMinutes() : 0}
                              onChange={(e) => {
                                const date = new Date(field.value);
                                date.setMinutes(parseInt(e.target.value, 10) || 0);
                                field.onChange(date);
                              }}
                              className="w-16"
                              min={0}
                              max={59}
                              step={15}
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Hours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Hours</SelectLabel>
                          {hoursOptions.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour} {parseInt(hour) === 1 ? "hour" : "hours"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Minutes)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Minutes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Minutes</SelectLabel>
                          {minutesOptions.map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute} {parseInt(minute) === 1 ? "minute" : "minutes"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="registrationDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Registration Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMM d HH:mm")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // Keep the time from the current value
                            const currentDate = field.value || new Date();
                            date.setHours(currentDate.getHours());
                            date.setMinutes(currentDate.getMinutes());
                            field.onChange(date);
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="p-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Time:</label>
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              value={field.value ? field.value.getHours() : 0}
                              onChange={(e) => {
                                const date = new Date(field.value);
                                date.setHours(parseInt(e.target.value, 10) || 0);
                                field.onChange(date);
                              }}
                              className="w-16"
                              min={0}
                              max={23}
                            />
                            <span className="text-sm self-center">:</span>
                            <Input
                              type="number"
                              value={field.value ? field.value.getMinutes() : 0}
                              onChange={(e) => {
                                const date = new Date(field.value);
                                date.setMinutes(parseInt(e.target.value, 10) || 0);
                                field.onChange(date);
                              }}
                              className="w-16"
                              min={0}
                              max={59}
                              step={15}
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;

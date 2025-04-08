
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
  DialogDescription,
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
import { CalendarIcon, Clock, Plus, Save, Trash2 } from "lucide-react";
import { format, addDays, set } from "date-fns";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

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
  startHour: z.coerce.number().min(0).max(23),
  startMinute: z.coerce.number().min(0).max(59),
  durationHours: z.coerce.number().min(0).max(24),
  durationMinutes: z.coerce.number().min(0).max(59),
  // Registration deadline is auto-calculated
});

type TaskFormValues = z.infer<typeof taskSchema>;

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onOpenChange }) => {
  const { addTask, tasks } = useTasks();
  const [templates, setTemplates] = useState<Record<string, any>>(() => {
    const savedTemplates = localStorage.getItem("taskTemplates");
    return savedTemplates ? JSON.parse(savedTemplates) : {};
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const { toast } = useToast();
  
  // Extract unique task titles for templates
  const templateOptions = Object.keys(templates);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      startHour: new Date().getHours(),
      startMinute: Math.floor(new Date().getMinutes() / 15) * 15,
      durationHours: 1,
      durationMinutes: 0,
    },
  });

  // Function to apply task template
  const applyTemplate = (name: string) => {
    const templateData = templates[name];
    if (templateData) {
      setSelectedTemplate(name);
      form.setValue("title", templateData.title);
      form.setValue("description", templateData.description || "");
      form.setValue("durationHours", templateData.durationHours);
      form.setValue("durationMinutes", templateData.durationMinutes);
    }
  };
  
  // Function to save current form as template
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Error",
        description: "Please provide a template name",
        variant: "destructive",
      });
      return;
    }
    
    const formData = form.getValues();
    const newTemplate = {
      title: formData.title,
      description: formData.description,
      durationHours: formData.durationHours,
      durationMinutes: formData.durationMinutes,
    };
    
    const updatedTemplates = { ...templates, [templateName]: newTemplate };
    localStorage.setItem("taskTemplates", JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    setSaveTemplateDialogOpen(false);
    setTemplateName("");
    
    toast({
      title: "Template Saved",
      description: `Template "${templateName}" has been saved`,
    });
  };
  
  // Function to delete template
  const deleteTemplate = (name: string) => {
    const { [name]: _, ...remainingTemplates } = templates;
    localStorage.setItem("taskTemplates", JSON.stringify(remainingTemplates));
    setTemplates(remainingTemplates);
    setSelectedTemplate(null);
    
    toast({
      title: "Template Deleted",
      description: `Template "${name}" has been deleted`,
    });
  };

  function onSubmit(data: TaskFormValues) {
    // Create a start date with the combined date and time
    const startDate = new Date(data.startDate);
    startDate.setHours(data.startHour);
    startDate.setMinutes(data.startMinute);
    
    // Calculate registration deadline (7 days before start date)
    const registrationDeadline = addDays(startDate, -7);
    
    // Calculate end date based on duration
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + data.durationHours);
    endDate.setMinutes(startDate.getMinutes() + data.durationMinutes);
    
    addTask({
      title: data.title,
      description: data.description || "",
      startDate: startDate,
      endDate: endDate,
      duration: {
        hours: data.durationHours,
        minutes: data.durationMinutes
      },
      registrationDeadline: registrationDeadline,
    });
    
    form.reset();
    onOpenChange(false);
  }

  // Generate hours options (0-23)
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minutes options (0, 15, 30, 45)
  const minutesOptions = [0, 15, 30, 45];
  
  // Generate duration hours options (0-24)
  const durationHoursOptions = Array.from({ length: 25 }, (_, i) => i);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Fill in the details to create a new task</DialogDescription>
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
                      <div className="flex gap-1">
                        {templateOptions.length > 0 && (
                          <Select 
                            value={selectedTemplate || ""}
                            onValueChange={(value) => applyTemplate(value)}
                          >
                            <SelectTrigger className="w-auto whitespace-nowrap">
                              <SelectValue placeholder="Use template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Templates</SelectLabel>
                                {templateOptions.map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                        
                        {selectedTemplate ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" title="Delete template">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{selectedTemplate}" template? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteTemplate(selectedTemplate)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            onClick={() => setSaveTemplateDialogOpen(true)} 
                            title="Save as template"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
              
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal flex justify-between items-center",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => date && field.onChange(date)}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Start Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (Hour)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hoursOptions.map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (Minute)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Minute" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {minutesOptions.map((minute) => (
                            <SelectItem key={minute} value={minute.toString()}>
                              {minute.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Duration */}
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
                          {durationHoursOptions.map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour} {hour === 1 ? "hour" : "hours"}
                            </SelectItem>
                          ))}
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
                          {minutesOptions.map((minute) => (
                            <SelectItem key={minute} value={minute.toString()}>
                              {minute} {minute === 1 ? "minute" : "minutes"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Registration deadline will be automatically set to 7 days before the task start date.
                </p>
              </div>

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
      
      {/* Save Template Dialog */}
      <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="templateName" className="text-sm font-medium leading-none">
                Template Name
              </label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAsTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateTaskDialog;

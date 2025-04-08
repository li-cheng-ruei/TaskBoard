
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
import { CalendarIcon, Save, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { getTemplates, saveTemplate, deleteTemplate } from "@/utils/templateUtils";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema for task validation
const taskSchema = z.object({
  title: z.string().min(1, "標題是必填的"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "開始日期是必填的",
  }),
  startHour: z.string().regex(/^([0-1]?[0-9]|2[0-3])$/, "小時格式不正確"),
  startMinute: z.string().regex(/^[0-5]?[0-9]$/, "分鐘格式不正確"),
  durationHours: z.coerce.number().min(0).max(24),
  durationMinutes: z.coerce.number().min(0).max(59),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onOpenChange }) => {
  const { addTask } = useTasks();
  const [templates, setTemplates] = useState<Record<string, any>>(getTemplates);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const { toast } = useToast();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      startHour: new Date().getHours().toString(),
      startMinute: Math.floor(new Date().getMinutes() / 15) * 15 === 0 ? "00" : (Math.floor(new Date().getMinutes() / 15) * 15).toString(),
      durationHours: 1,
      durationMinutes: 0,
    },
  });

  // Function to apply task template
  const applyTemplate = (name: string) => {
    const templateData = templates[name];
    if (templateData) {
      form.setValue("title", templateData.title);
      form.setValue("description", templateData.description || "");
      form.setValue("durationHours", templateData.durationHours);
      form.setValue("durationMinutes", templateData.durationMinutes);
    }
  };
  
  // Function to save current form as template
  const saveAsTemplate = () => {
    const result = saveTemplate(templateName, {
      title: form.getValues("title"),
      description: form.getValues("description"),
      durationHours: form.getValues("durationHours"),
      durationMinutes: form.getValues("durationMinutes"),
    });
    
    if (result) {
      setTemplates(getTemplates());
      setSaveTemplateDialogOpen(false);
      setTemplateName("");
    }
  };
  
  // Function to handle template deletion
  const handleDeleteTemplate = (name: string) => {
    deleteTemplate(name);
    setTemplates(getTemplates());
  };

  function onSubmit(data: TaskFormValues) {
    // Create a start date with the combined date and time
    const startDate = new Date(data.startDate);
    startDate.setHours(parseInt(data.startHour));
    startDate.setMinutes(parseInt(data.startMinute));
    
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

  // Generate minutes options (0, 15, 30, 45)
  const minutesOptions = [0, 15, 30, 45];
  
  // Template options
  const templateOptions = Object.keys(templates);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>創建新任務</DialogTitle>
            <DialogDescription>填寫詳細信息以創建新任務</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>標題</FormLabel>
                    <div className="flex gap-2">
                      <FormControl className="flex-1">
                        <Input placeholder="任務標題" {...field} />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setSaveTemplateDialogOpen(true)} 
                        title="保存為模板"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {templateOptions.length > 0 && (
                <div>
                  <label className="text-sm font-medium">模板</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {templateOptions.map((name) => (
                      <div key={name} className="flex items-center gap-1 border rounded-md p-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7"
                          onClick={() => applyTemplate(name)}
                        >
                          {name}
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleDeleteTemplate(name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述 (選填)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="描述任務詳情" 
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
                    <FormLabel>開始日期</FormLabel>
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
                              <span>選擇日期</span>
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
                      <FormLabel>開始時間 (小時)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="00-23" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>開始時間 (分鐘)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="00-59" 
                          {...field} 
                        />
                      </FormControl>
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
                      <FormLabel>持續時間 (小時)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>持續時間 (分鐘)</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {minutesOptions.map((minute) => (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  報名截止日期將自動設定為任務開始日期的7天前。
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button type="submit">創建任務</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Save Template Dialog */}
      <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>保存為模板</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="templateName" className="text-sm font-medium leading-none">
                模板名稱
              </label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="輸入模板名稱"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveTemplateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={saveAsTemplate}>保存模板</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateTaskDialog;

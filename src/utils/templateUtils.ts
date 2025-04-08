
import { toast } from "@/components/ui/use-toast";

interface TaskTemplate {
  title: string;
  description?: string;
  durationHours: number;
  durationMinutes: number;
}

// Get all saved templates
export const getTemplates = (): Record<string, TaskTemplate> => {
  const savedTemplates = localStorage.getItem("taskTemplates");
  return savedTemplates ? JSON.parse(savedTemplates) : {};
};

// Save a new template
export const saveTemplate = (name: string, template: TaskTemplate): boolean => {
  if (!name.trim()) {
    toast({
      title: "Template Error",
      description: "Please provide a template name",
      variant: "destructive",
    });
    return false;
  }
  
  const templates = getTemplates();
  const updatedTemplates = { ...templates, [name]: template };
  localStorage.setItem("taskTemplates", JSON.stringify(updatedTemplates));
  
  toast({
    title: "Template Saved",
    description: `Template "${name}" has been saved`,
  });
  
  return true;
};

// Delete a template
export const deleteTemplate = (name: string): void => {
  const templates = getTemplates();
  const { [name]: _, ...remainingTemplates } = templates;
  localStorage.setItem("taskTemplates", JSON.stringify(remainingTemplates));
  
  toast({
    title: "Template Deleted",
    description: `Template "${name}" has been deleted`,
  });
};

export default {
  getTemplates,
  saveTemplate,
  deleteTemplate
};

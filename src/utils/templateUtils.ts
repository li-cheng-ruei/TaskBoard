
import { toast } from "@/components/ui/use-toast";

interface TaskTemplate {
  title: string;
  description?: string;
  duration: string;
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
      title: "模板錯誤",
      description: "請提供模板名稱",
      variant: "destructive",
    });
    return false;
  }
  
  const templates = getTemplates();
  const updatedTemplates = { ...templates, [name]: template };
  localStorage.setItem("taskTemplates", JSON.stringify(updatedTemplates));
  
  toast({
    title: "模板已保存",
    description: `模板 "${name}" 已成功保存`,
  });
  
  return true;
};

// Delete a template
export const deleteTemplate = (name: string): void => {
  const templates = getTemplates();
  const { [name]: _, ...remainingTemplates } = templates;
  localStorage.setItem("taskTemplates", JSON.stringify(remainingTemplates));
  
  toast({
    title: "模板已刪除",
    description: `模板 "${name}" 已被刪除`,
  });
};

export default {
  getTemplates,
  saveTemplate,
  deleteTemplate
};

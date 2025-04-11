
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListIcon, PlusIcon, UsersIcon, FileTextIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/TaskList";
import TaskCalendar from "@/components/TaskCalendar";
import Header from "@/components/Header";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import EmployeeManagement from "@/components/EmployeeManagement";
import BatchCreateTaskDialog from "@/components/BatchCreateTaskDialog";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserTasks, tasks } = useTasks();
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openBatchCreateTask, setOpenBatchCreateTask] = useState(false);
  const [selectedTab, setSelectedTab] = useState("list");
  const userTasks = getUserTasks();
  
  // For managers, show all tasks, for employees only their tasks
  const tasksToDisplay = user?.role === 'manager' ? tasks : userTasks;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 px-4 md:px-6 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">儀表板</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'manager' 
                ? '管理任務並監控進度' 
                : '查看您分配的和已報名的任務'}
            </p>
          </div>

          {user?.role === 'manager' && (
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button 
                onClick={() => setOpenCreateTask(true)}
              >
                <PlusIcon className="mr-2 h-4 w-4" /> 創建任務
              </Button>
              <Button 
                variant="outline"
                onClick={() => setOpenBatchCreateTask(true)}
              >
                <FileTextIcon className="mr-2 h-4 w-4" /> 批量創建
              </Button>
            </div>
          )}
        </div>

        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full flex-1 flex flex-col"
        >
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center">
                <ListIcon className="h-4 w-4 mr-2" />
                列表視圖
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                日曆視圖
              </TabsTrigger>
              {user?.role === 'manager' && (
                <TabsTrigger value="employees" className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  員工管理
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="list" className="mt-2 space-y-4 flex-1">
            <TaskList tasks={tasksToDisplay} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-2 flex-1 min-h-[500px]">
            <TaskCalendar />
          </TabsContent>

          {user?.role === 'manager' && (
            <TabsContent value="employees" className="mt-2 flex-1">
              <EmployeeManagement />
            </TabsContent>
          )}
        </Tabs>

        <CreateTaskDialog 
          open={openCreateTask}
          onOpenChange={setOpenCreateTask}
        />
        
        <BatchCreateTaskDialog 
          open={openBatchCreateTask}
          onOpenChange={setOpenBatchCreateTask}
        />
      </main>
    </div>
  );
};

export default Dashboard;

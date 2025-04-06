
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListIcon, PlusIcon, UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/TaskList";
import TaskCalendar from "@/components/TaskCalendar";
import Header from "@/components/Header";
import { Task } from "@/types";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import EmployeeManagement from "@/components/EmployeeManagement";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserTasks, tasks } = useTasks();
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [selectedTab, setSelectedTab] = useState("list");
  const userTasks = getUserTasks();
  
  // For managers, show all tasks, for employees only their tasks
  const tasksToDisplay = user?.role === 'manager' ? tasks : userTasks;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'manager' 
                ? 'Manage tasks and monitor progress' 
                : 'View your assigned and registered tasks'}
            </p>
          </div>

          {user?.role === 'manager' && (
            <Button 
              className="mt-4 md:mt-0" 
              onClick={() => setOpenCreateTask(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Create Task
            </Button>
          )}
        </div>

        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full h-full"
        >
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center">
                <ListIcon className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
              {user?.role === 'manager' && (
                <TabsTrigger value="employees" className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Employees
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="list" className="mt-2 space-y-4">
            <TaskList tasks={tasksToDisplay} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-2 h-[calc(100vh-250px)]">
            <TaskCalendar />
          </TabsContent>

          {user?.role === 'manager' && (
            <TabsContent value="employees" className="mt-2">
              <EmployeeManagement />
            </TabsContent>
          )}
        </Tabs>

        <CreateTaskDialog 
          open={openCreateTask}
          onOpenChange={setOpenCreateTask}
        />
      </main>
    </div>
  );
};

export default Dashboard;

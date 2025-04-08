
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SearchIcon, Trash2, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EmployeeManagement = () => {
  const { allUsers, updateUserRole, updateUserStatus, deleteUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Filter employees (exclude the current user if they are a manager)
  const employees = allUsers.filter((user) => user.role === "employee" || user.role === "manager");
  
  // Handle search functionality
  const filteredEmployees = searchQuery 
    ? employees.filter(
        (employee) => 
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (employee.facility && employee.facility.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : employees;

  // Handle role change
  const handleRoleChange = (userId: string, newRole: "manager" | "employee") => {
    updateUserRole(userId, newRole);
    
    toast({
      title: "角色已更新",
      description: `用戶角色已成功更新。`,
      duration: 3000,
    });
  };

  // Handle status change
  const handleStatusChange = (userId: string, isActive: boolean) => {
    updateUserStatus(userId, isActive);
    
    toast({
      title: isActive ? "用戶已啟用" : "用戶已停用",
      description: `用戶已成功${isActive ? "啟用" : "停用"}。`,
      duration: 3000,
    });
  };

  // Handle user delete
  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    
    toast({
      title: "用戶已刪除",
      description: "用戶已成功刪除。",
      duration: 3000,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>員工管理</CardTitle>
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索員工..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>郵箱</TableHead>
                <TableHead>醫療機構</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className={!employee.isActive ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.facility || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${employee.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {employee.isActive ? "啟用" : "停用"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={employee.role}
                        onValueChange={(value) => 
                          handleRoleChange(employee.id, value as "manager" | "employee")
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="選擇角色" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">員工</SelectItem>
                          <SelectItem value="manager">管理員</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            操作
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>管理用戶</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(employee.id, !employee.isActive)}>
                            <UserX className="mr-2 h-4 w-4" />
                            {employee.isActive ? "停用用戶" : "啟用用戶"}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                刪除用戶
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>刪除用戶</AlertDialogTitle>
                                <AlertDialogDescription>
                                  您確定要刪除 {employee.name} 嗎？此操作無法撤銷。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUser(employee.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  刪除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    未找到員工。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeManagement;

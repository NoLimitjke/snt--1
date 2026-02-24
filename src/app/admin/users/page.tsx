'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER';
  isBanned: boolean;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${pageNum}&limit=20`);
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'USER') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        toast.success('Роль изменена');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Ошибка при изменении роли');
    }
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !isBanned }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, isBanned: !isBanned } : u)));
        toast.success(isBanned ? 'Пользователь разбанен' : 'Пользователь забанен');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Ошибка при изменении статуса');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        toast.success('Пользователь удален');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Ошибка при удалении');
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Управление пользователями</h1>
        <p className="text-muted-foreground">Просмотр и редактирование пользователей</p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Пользователи ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Посты</TableHead>
                        <TableHead>Комментарии</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, key) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.name || '-'}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value: 'ADMIN' | 'USER') =>
                                handleRoleChange(user.id, value)
                              }>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">USER</SelectItem>
                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{user._count.posts}</TableCell>
                          <TableCell>{user._count.comments}</TableCell>
                          <TableCell>
                            <Badge variant={user.isBanned ? 'destructive' : 'default'}>
                              {user.isBanned ? 'Забанен' : 'Активен'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant={user.isBanned ? 'outline' : 'destructive'}
                                size="sm"
                                onClick={() => handleBanToggle(user.id, user.isBanned)}>
                                {user.isBanned ? 'Разбанить' : 'Забанить'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(user.id)}>
                                Удалить
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fetchUsers(page - 1)}
                      disabled={page === 1}>
                      Назад
                    </Button>
                    <span className="flex items-center px-4">
                      Страница {page} из {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => fetchUsers(page + 1)}
                      disabled={page === totalPages}>
                      Вперед
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

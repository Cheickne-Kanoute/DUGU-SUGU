import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, MoreHorizontalIcon, Trash2Icon, BanIcon, CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'client' | 'seller' | 'admin';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  is_blocked?: boolean;
}

const roleVariant: Record<UserRole, 'default' | 'secondary' | 'destructive'> = {
  admin: 'destructive',
  seller: 'default',
  client: 'secondary',
};
const roleLabel: Record<UserRole, string> = { admin: 'Admin', seller: 'Vendeur (Producteur)', client: 'Client' };

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          full_name: data.full_name || `${data.prenom || ''} ${data.nom || ''}`.trim() || data.email || 'Utilisateur',
          email: data.email || '',
          role: (data.role as UserRole) || 'client',
          avatar_url: data.avatar_url,
          created_at: data.created_at || data.createdAt || new Date().toISOString(),
          is_blocked: data.is_blocked || data.isBlocked || false,
        };
      });

      let filtered = list;
      if (roleFilter !== 'all') {
        filtered = filtered.filter(u => u.role === roleFilter);
      }
      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(u => u.full_name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
      }

      setUsers(filtered);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Rôle mis à jour');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de rôle');
    }
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { is_blocked: isBlocked, isBlocked: isBlocked });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: isBlocked } : u));
      toast.success(isBlocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du blocage');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Utilisateur supprimé');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs (PFE)</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez les comptes clients, vendeurs (producteurs) et administrateurs.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val || 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="seller">Vendeur</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Aucun utilisateur trouvé.</div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Inscrit le</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={u.avatar_url} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {u.full_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.full_name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleVariant[u.role]}>{roleLabel[u.role]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_blocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <BanIcon className="size-3" /> Bloqué
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300">
                            <CheckCircleIcon className="size-3" /> Actif
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-8">
                            <MoreHorizontalIcon className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, u.role === 'seller' ? 'client' : 'seller')}>
                              Changer rôle en {u.role === 'seller' ? 'Client' : 'Vendeur'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlockUser(u.id, !u.is_blocked)}>
                              {u.is_blocked ? 'Débloquer' : 'Bloquer'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(u.id)} className="text-destructive">
                              <Trash2Icon className="mr-2 size-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

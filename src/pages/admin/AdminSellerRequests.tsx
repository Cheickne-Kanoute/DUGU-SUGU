import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface SellerRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
  };
}

const statusConfig = {
  pending: { label: 'En attente', variant: 'secondary' as const, icon: <ClockIcon className="size-3" /> },
  approved: { label: 'Approuvé', variant: 'default' as const, icon: <CheckCircleIcon className="size-3" /> },
  rejected: { label: 'Rejeté', variant: 'destructive' as const, icon: <XCircleIcon className="size-3" /> },
};

export default function AdminSellerRequests() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ status: statusFilter });
      const res = await fetch(`${API_BASE}/admin/seller-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (req: SellerRequest, status: 'approved' | 'rejected') => {
    setActionLoading(req.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/seller-requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, user_id: req.user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(status === 'approved' ? `${req.user.full_name} est maintenant vendeur` : 'Demande rejetée');
        // Update locally immediately so UI reacts without waiting for full refresh
        // By not calling fetchRequests here, the card stays visible on screen 
        // to let the admin "consulter" it, but the action buttons will disappear.
        setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status } : r));
      } else {
        toast.error(data.error || 'Erreur');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Demandes vendeur</h1>
          <p className="text-sm text-muted-foreground mt-1">{requests.length} demande(s) {statusFilter === 'pending' ? 'en attente' : ''}</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || 'pending')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvées</SelectItem>
            <SelectItem value="rejected">Rejetées</SelectItem>
            <SelectItem value="all">Toutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <UserIcon className="size-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">Aucune demande {statusFilter === 'pending' ? 'en attente' : ''}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const config = statusConfig[req.status];
            return (
              <Card key={req.id} className="border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="size-10 flex-shrink-0">
                      <AvatarImage src={req.user.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {getInitials(req.user.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{req.user.full_name}</span>
                        <Badge variant={config.variant} className="gap-1 text-xs">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.user.email}</p>
                      {req.message && (
                        <p className="text-sm mt-2 p-2 bg-muted/50 rounded-md italic">"{req.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Demande envoyée {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-1"
                          onClick={() => handleAction(req, 'rejected')}
                          disabled={actionLoading === req.id}
                        >
                          <XCircleIcon className="size-3.5" />
                          Rejeter
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleAction(req, 'approved')}
                          disabled={actionLoading === req.id}
                        >
                          <CheckCircleIcon className="size-3.5" />
                          Approuver
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

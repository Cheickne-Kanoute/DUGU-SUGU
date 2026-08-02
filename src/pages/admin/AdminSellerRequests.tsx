import { useEffect, useState, useCallback } from 'react';
import { getSellerRequests, approveSellerRequest, rejectSellerRequest } from '@/lib/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SellerRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  created_at?: string;
  user_id?: string;
  profiles?: {
    full_name: string;
    email: string;
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

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSellerRequests();
      setRequests(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (req: SellerRequest) => {
    setActionLoading(req.id);
    try {
      await approveSellerRequest(req.id, req.user_id || req.id);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
      toast.success('Demande approuvée : l\'utilisateur est maintenant Vendeur (Producteur)');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (req: SellerRequest) => {
    setActionLoading(req.id);
    try {
      await rejectSellerRequest(req.id);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
      toast.success('Demande rejetée');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du rejet');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Demandes Vendeur</h1>
        <p className="text-sm text-muted-foreground mt-1">Examinez et approuvez les demandes des clients souhaitant devenir Producteurs.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'pending')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les demandes</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Chargement...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Aucune demande trouvée.</div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const conf = statusConfig[req.status] || statusConfig.pending;
                const name = req.profiles?.full_name || 'Demandeur';
                const email = req.profiles?.email || '';

                return (
                  <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="size-10 mt-0.5">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{name}</span>
                          <span className="text-xs text-muted-foreground">{email}</span>
                          <Badge variant={conf.variant} className="gap-1 text-xs">
                            {conf.icon}
                            {conf.label}
                          </Badge>
                        </div>
                        {req.message && (
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-w-xl">
                            "{req.message}"
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          Soumis {formatDistanceToNow(new Date(req.created_at || Date.now()), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleReject(req)}
                          disabled={actionLoading === req.id}
                        >
                          Rejeter
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleApprove(req)}
                          disabled={actionLoading === req.id}
                        >
                          Approuver Vendeur
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

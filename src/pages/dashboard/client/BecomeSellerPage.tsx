import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2Icon, ClockIcon, XCircleIcon, StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

interface SellerRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function BecomeSellerPage() {
  const { user } = useAuth();
  const [request, setRequest] = useState<SellerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    
    const fetchRequest = async () => {
      try {
        const { data, error } = await supabase
          .from("seller_requests")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching request:", error);
        } else if (data) {
          setRequest(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  if (user.role === "seller" || user.role === "admin") {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 mt-8">
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6">
              <StoreIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Vous êtes déjà vendeur</h2>
            <p className="text-emerald-700 dark:text-emerald-300">
              Vous avez déjà accès au tableau de bord vendeur. Vous pouvez commencer à gérer vos produits et commandes.
            </p>
            <Button asChild className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white">
              <a href="/dashboard/products">Gérer mes produits</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (request && request.status === "rejected") {
        const { error } = await (supabase as any)
          .from('seller_requests')
          .update({ status: 'pending', message: message || '' })
          .eq('id', request.id)
          .eq('user_id', user.id)
          .eq('status', 'rejected')
          .select()
          .single();
          
        if (error) throw new Error(error.message || "Erreur lors de la soumission");

        // Notification Email
        fetch(`${API_BASE}/email/seller-request-submitted`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            customerName: user.full_name || 'Client',
          }),
        }).catch(console.error);

        setRequest({ ...request, status: "pending", message });
        toast.success("Votre demande a été soumise à nouveau.");
      } else {
        // Create new request
        const { data, error } = await (supabase as any)
          .from("seller_requests")
          .insert({
            user_id: user.id,
            message
          })
          .select()
          .single();

        if (error) throw error;
        
        // Notification Email
        fetch(`${API_BASE}/email/seller-request-submitted`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            customerName: user.full_name || 'Client',
          }),
        }).catch(console.error);

        setRequest(data);
        toast.success("Votre demande a été soumise avec succès.");
      }
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Devenir Vendeur</h1>
        <p className="text-muted-foreground mt-2">
          Rejoignez notre plateforme en tant que vendeur et commencez à proposer vos produits à nos clients.
        </p>
      </div>

      {request?.status === "pending" ? (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6">
              <ClockIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Demande en cours d'examen</h2>
            <p className="text-emerald-700 dark:text-emerald-300">
              Votre demande pour devenir vendeur a bien été reçue. Notre équipe l'examine actuellement. 
              Vous recevrez une notification dès qu'elle aura été traitée.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {request?.status === "rejected" ? <XCircleIcon className="size-5 text-destructive" /> : <StoreIcon className="size-5" />}
              {request?.status === "rejected" ? "Demande précédente refusée" : "Formulaire de candidature"}
            </CardTitle>
            <CardDescription>
              {request?.status === "rejected" 
                ? "Votre précédente demande a été refusée. Vous pouvez soumettre une nouvelle demande en modifiant votre message ci-dessous."
                : "Veuillez nous en dire un peu plus sur vous et les produits que vous souhaitez vendre."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="message">Pourquoi souhaitez-vous devenir vendeur ? (Optionnel)</Label>
                <Textarea 
                  id="message" 
                  placeholder="Décrivez brièvement votre activité, les produits que vous souhaitez vendre, etc."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                Soumettre ma demande
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

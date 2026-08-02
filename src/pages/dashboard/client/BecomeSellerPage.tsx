import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createSellerRequest } from "@/lib/api/admin";
import { sendSellerRequestEmail } from "@/lib/api/email";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
        const q = query(collection(db, 'demandesVendeur'), where('user_id', '==', user.id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setRequest({
            id: snap.docs[0].id,
            status: data.status || data.statut || 'pending',
            message: data.message,
          });
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
              Vous avez déjà accès au tableau de bord vendeur (Producteur). Vous pouvez commencer à gérer vos produits et commandes.
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
      await createSellerRequest(message);
      if (user?.email) {
        sendSellerRequestEmail(user.email, user.full_name || 'Client').catch(() => {});
      }
      setRequest({ id: 'temp', status: 'pending', message });
      toast.success("Demande envoyée avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la soumission de la demande");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (request?.status === "pending") {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 mt-8">
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="size-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-6">
              <ClockIcon className="size-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">Demande en cours d'examen</h2>
            <p className="text-amber-700 dark:text-amber-300 max-w-md">
              Votre demande pour devenir vendeur (Producteur) a bien été reçue. Un administrateur va l'examiner prochainement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 mt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Devenir Vendeur / Producteur</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Soumettez une demande pour vendre vos produits agricoles sur Dugu Sugu.
        </p>
      </div>

      {request?.status === "rejected" && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-4 p-4">
            <XCircleIcon className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-destructive text-sm">Votre précédente demande a été refusée</p>
              <p className="text-xs text-muted-foreground">
                Vous pouvez soumettre une nouvelle demande ci-dessous en apportant plus de précisions sur vos activités agricoles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Demande de compte Producteur</CardTitle>
          <CardDescription>
            Présentez brièvement vos produits et votre activité agricole au Mali.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Présentation de votre activité agricole</Label>
              <Textarea
                id="message"
                required
                minLength={20}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez vos cultures, vos produits (légumes, fruits, céréales...), votre localisation au Mali..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">Minimum 20 caractères.</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Soumettre la demande"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

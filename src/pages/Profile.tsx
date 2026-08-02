import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/api/profiles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  FileTextIcon,
  SaveIcon,
  Loader2Icon,
  MailIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  useEffect(() => {
    if (user) {
      const parts = (user.full_name || "").split(" ");
      setForm({
        nom: user.nom || parts.slice(1).join(" ") || "",
        prenom: user.prenom || parts[0] || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || user.address || "",
      });
    }
  }, [user]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "seller": return "Vendeur (Producteur)";
      case "client": return "Client (Consommateur)";
      default: return "Visiteur";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile(user.id, {
        nom: form.nom,
        prenom: form.prenom,
        full_name: `${form.prenom} ${form.nom}`.trim(),
        phone: form.phone || null,
        bio: form.bio || null,
        location: form.location || null,
        address: form.location || null,
      });

      await refreshUser();
      setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur de mise à jour" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations personnelles et préférences de compte.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xl font-bold">
                {getInitials(user?.full_name || `${form.prenom} ${form.nom}` || "DU")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h2 className="font-semibold text-lg">{user?.full_name || `${form.prenom} ${form.nom}`}</h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MailIcon className="size-3.5" />
                {user?.email}
              </p>
            </div>

            <Badge variant="secondary" className="gap-1">
              <ShieldCheckIcon className="size-3.5" />
              {getRoleLabel(user?.role)}
            </Badge>

            <Separator />

            <div className="w-full text-left space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 shrink-0" />
                <span>Inscrit le {formatDate(user?.created_at || user?.createdAt)}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="size-3.5 shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {(user?.location || user?.address) && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="size-3.5 shrink-0" />
                  <span>{user.location || user.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Coulibaly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenom" className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    Prénom
                  </Label>
                  <Input
                    id="prenom"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder="Amadou"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <PhoneIcon className="size-4 text-muted-foreground" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+223 00 00 00 00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPinIcon className="size-4 text-muted-foreground" />
                  Localisation / Adresse
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Bamako, Mali"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  Bio / Description
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Parlez-nous un peu de vous..."
                  rows={3}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSaving ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 size-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

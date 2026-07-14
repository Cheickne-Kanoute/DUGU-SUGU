import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AppShell } from "@/components/app-shell";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    full_name: user?.full_name ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
    location: user?.location ?? "",
  });

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "seller": return "Vendeur";
      case "client": return "Client";
      default: return "Visiteur";
    }
  };

  const getRoleVariant = (role?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "admin": return "destructive";
      case "seller": return "default";
      case "client": return "secondary";
      default: return "outline";
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
      const { error } = await supabase
        .from("profiles")
        // @ts-ignore
        .update({
          full_name: form.full_name,
          phone: form.phone || null,
          bio: form.bio || null,
          location: form.location || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshUser();
      setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Une erreur est survenue." });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <AppShell>
      <div className="w-full space-y-6 p-1">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos informations personnelles et paramètres de compte.
          </p>
        </div>

        {/* Identity card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="size-20 ring-4 ring-primary/10">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h2 className="text-xl font-semibold">{user.full_name}</h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant={getRoleVariant(user.role)}>
                    <ShieldCheckIcon className="size-3 mr-1" />
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-center">
                {user.role === "seller" && (
                  <div>
                    <p className="text-2xl font-bold">{user.product_count ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Produits</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-5" />

            {/* Read-only info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MailIcon className="size-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-4 flex-shrink-0" />
                <span>Membre depuis {formatDate(user.created_at)}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PhoneIcon className="size-4 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPinIcon className="size-4 flex-shrink-0" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="size-4" />
              Modifier mes informations
            </CardTitle>
            <CardDescription>
              Ces informations sont visibles sur votre profil public.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-full-name" className="flex items-center gap-1.5 text-sm font-medium">
                    <UserIcon className="size-3.5 text-muted-foreground" />
                    Nom complet *
                  </Label>
                  <Input
                    id="profile-full-name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Votre nom complet"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone" className="flex items-center gap-1.5 text-sm font-medium">
                    <PhoneIcon className="size-3.5 text-muted-foreground" />
                    Téléphone
                  </Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+223 00 00 00 00"
                  />
                </div>
              </div>

              {/* Localisation */}
              <div className="space-y-1.5">
                <Label htmlFor="profile-location" className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPinIcon className="size-3.5 text-muted-foreground" />
                  Localisation (ville, pays)
                </Label>
                <Input
                  id="profile-location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: Bamako, Mali"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="profile-bio" className="flex items-center gap-1.5 text-sm font-medium">
                  <FileTextIcon className="size-3.5 text-muted-foreground" />
                  Bio
                </Label>
                <Textarea
                  id="profile-bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Parlez un peu de vous..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Feedback message */}
              {message && (
                <p className={`text-sm rounded-md px-3 py-2.5 font-medium ${message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}>
                  {message.text}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <SaveIcon className="size-4" />
                  )}
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

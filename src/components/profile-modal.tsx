import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserIcon, PhoneIcon, MapPinIcon, FileTextIcon, SaveIcon, Loader2Icon } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    full_name: user?.full_name ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
    location: user?.location ?? "",
  });

  // Reset form when user changes or modal opens
  const handleOpenChange = (val: boolean) => {
    if (val && user) {
      setForm({
        full_name: user.full_name ?? "",
        phone: user.phone ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
      });
      setMessage(null);
    }
    onOpenChange(val);
  };

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

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Mon Profil</DialogTitle>
          <DialogDescription>
            Gérez vos informations personnelles et votre compte.
          </DialogDescription>
        </DialogHeader>

        {/* Avatar + Identity section */}
        <div className="flex items-center gap-4 py-2">
          <div className="relative">
            <Avatar className="size-16 ring-2 ring-primary/20">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{user.full_name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <Badge variant={getRoleVariant(user.role)} className="mt-1 text-xs">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Edit form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="profile-full-name" className="flex items-center gap-1.5 text-sm font-medium">
              <UserIcon className="size-3.5 text-muted-foreground" />
              Nom complet
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
              rows={3}
              className="resize-none"
            />
          </div>

          {message && (
            <p className={`text-sm rounded-md px-3 py-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}>
              {message.text}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

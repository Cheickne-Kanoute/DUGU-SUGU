import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/api/profiles";
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
  }, [user, open]);

  const handleOpenChange = (val: boolean) => {
    if (val && user) {
      const parts = (user.full_name || "").split(" ");
      setForm({
        nom: user.nom || parts.slice(1).join(" ") || "",
        prenom: user.prenom || parts[0] || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || user.address || "",
      });
      setMessage(null);
    }
    onOpenChange(val);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "seller": return "Vendeur (Producteur)";
      case "client": return "Client (Consommateur)";
      default: return "Visiteur";
    }
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
      setMessage({ type: "success", text: "Profil mis à jour !" });
      setTimeout(() => onOpenChange(false), 1200);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur de mise à jour" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Mon Profil</DialogTitle>
          <DialogDescription>
            Consultez et modifiez vos informations personnelles (Nom et Prénom PFE).
          </DialogDescription>
        </DialogHeader>

        {/* Identity Header */}
        <div className="flex items-center gap-4 py-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {getInitials(user?.full_name || `${form.prenom} ${form.nom}` || "DU")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate">{user?.full_name || `${form.prenom} ${form.nom}`}</h3>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {getRoleLabel(user?.role)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <Separator />

        {message && (
          <div className={`p-3 rounded-md text-xs ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="modal-nom" className="text-xs flex items-center gap-1.5">
                <UserIcon className="size-3.5 text-muted-foreground" />
                Nom
              </Label>
              <Input
                id="modal-nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Coulibaly"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal-prenom" className="text-xs flex items-center gap-1.5">
                <UserIcon className="size-3.5 text-muted-foreground" />
                Prénom
              </Label>
              <Input
                id="modal-prenom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Amadou"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modal-phone" className="text-xs flex items-center gap-1.5">
              <PhoneIcon className="size-3.5 text-muted-foreground" />
              Téléphone
            </Label>
            <Input
              id="modal-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+223 00 00 00 00"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modal-location" className="text-xs flex items-center gap-1.5">
              <MapPinIcon className="size-3.5 text-muted-foreground" />
              Localisation
            </Label>
            <Input
              id="modal-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Bamako, Mali"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modal-bio" className="text-xs flex items-center gap-1.5">
              <FileTextIcon className="size-3.5 text-muted-foreground" />
              Bio
            </Label>
            <Textarea
              id="modal-bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Parlez-nous un peu de vous..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" size="sm" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? (
                <>
                  <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-1.5 size-3.5" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCategories } from '@/lib/api/categories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusIcon, PencilIcon, Trash2Icon, TagIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  nom?: string;
  description?: string | null;
  product_count?: number;
}

const slugify = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ id: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ id: '', name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ id: cat.id, name: cat.name || cat.nom || '', description: cat.description || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      const catId = editTarget ? editTarget.id : (form.id || slugify(form.name));
      const payload = {
        id: catId,
        name: form.name.trim(),
        nom: form.name.trim(),
        description: form.description.trim() || '',
        image: `/images/categories/${catId}.jpg`,
      };

      await setDoc(doc(db, 'categories', catId), payload);
      toast.success(editTarget ? 'Catégorie modifiée' : 'Catégorie créée');
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'categories', deleteTarget.id));
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success('Catégorie supprimée');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catégories de Produits</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez la classification des produits agricoles sur Dugu Sugu.</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <PlusIcon className="mr-2 size-4" /> Nouvelle Catégorie
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Chargement...</div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Aucune catégorie.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border bg-card flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      <TagIcon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{c.name || c.nom}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {c.description || 'Pas de description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <PencilIcon className="mr-1 size-3.5" /> Modifier
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(c)} className="text-destructive">
                      <Trash2Icon className="mr-1 size-3.5" /> Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-112.5">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Légumes, Fruits, Céréales..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteTarget?.name}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

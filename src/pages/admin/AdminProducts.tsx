import { useEffect, useState, useCallback } from 'react';
import { getProducts, deleteProduct, type Product } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchIcon, PackageIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data.map(c => ({ id: c.id, name: c.name || c.nom || c.id })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ category: categoryFilter, search });
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success('Produit supprimé');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Supervision des Produits</h1>
        <p className="text-sm text-muted-foreground mt-1">Supervisez et gérez l'ensemble des produits référencés sur Dugu Sugu.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'all')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Chargement...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Aucun produit trouvé.</div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3">Prix</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Vendeur</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.name} className="size-full object-cover" />
                            ) : (
                              <PackageIcon className="size-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.stock <= p.low_stock_threshold ? "destructive" : "outline"}>
                          {p.stock} {p.unit}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.seller?.full_name || 'Vendeur inconnu'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteTarget(p)}>
                          <Trash2Icon className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteTarget?.name}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

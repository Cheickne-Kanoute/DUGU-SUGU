import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { createProduct, deleteProduct, updateProduct, type Product } from "@/lib/api/products";
import { uploadProductImages } from "@/lib/api/upload";
import { supabase } from "@/lib/supabase";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Category = {
  id: string;
  name: string;
};

type ProductFormState = {
  category_id: string;
  name: string;
  description: string;
  price: string;
  images: string[];

  stock: string;
  unit: string;
  low_stock_threshold: string;
};

const initialForm = (categoryId = ""): ProductFormState => ({
  category_id: categoryId,
  name: "",
  description: "",
  price: "",
  images: [],
  stock: "0",
  unit: "kg",
  low_stock_threshold: "10",
});

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

const toFormState = (product: Product): ProductFormState => ({
  category_id: product.category_id,
  name: product.name,
  description: product.description,
  price: String(product.price ?? ""),
  images: product.images || [],
  stock: String(product.stock ?? 0),
  unit: product.unit ?? "kg",
  low_stock_threshold: String(product.low_stock_threshold ?? 10),
});

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialForm());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const categoryLabelById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const canSubmit = useMemo(
    () =>
      !!user?.id &&
      !!form.category_id &&
      !!form.name.trim() &&
      !!form.description.trim() &&
      !!form.price &&
      (form.images.length > 0 || selectedFiles.length > 0) &&
      !!form.unit.trim(),
    [form, selectedFiles, user?.id]
  );

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from("products")
            .select("*, categories:category_id(name, image)")
            .eq("seller_id", user.id)
            .order("created_at", { ascending: false }),
          supabase.from("categories").select("id, name").order("name", { ascending: true }),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        setProducts((productsRes.data || []) as Product[]);
        setCategories((categoriesRes.data || []) as Category[]);
      } catch (err: any) {
        toast.error(err.message || "Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  useEffect(() => {
    if (!formOpen || editingProduct) return;
    setForm((current) =>
      current.category_id
        ? current
        : { ...current, category_id: categories[0]?.id ?? "" }
    );
  }, [categories, editingProduct, formOpen]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(initialForm(categories[0]?.id || ""));
    setSelectedFiles([]);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm(toFormState(product));
    setSelectedFiles([]);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
    setForm(initialForm(categories[0]?.id || ""));
    setSelectedFiles([]);
  };

  const handleSave = async () => {
    if (!user?.id || !canSubmit) return;

    setSaving(true);
    try {
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedUrls = await uploadProductImages(selectedFiles);
      }

      const payload = {
        seller_id: user.id,
        category_id: form.category_id,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        images: [...form.images, ...uploadedUrls],
        stock: Number(form.stock || 0),
        unit: form.unit.trim(),
        low_stock_threshold: Number(form.low_stock_threshold || 10),
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        const nextProduct = updated as Product;
        setProducts((current) =>
          current.map((product) => (product.id === editingProduct.id ? nextProduct : product))
        );
        toast.success("Produit mis a jour");
      } else {
        const created = await createProduct(payload);
        const nextProduct = created as Product;
        setProducts((current) => [nextProduct, ...current]);
        toast.success("Produit cree");
      }

      closeForm();
    } catch (err: any) {
      toast.error(err.message || "Impossible d'enregistrer le produit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
      toast.success("Produit supprime");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer le produit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mes produits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tous tes produits sont listés dans un tableau unique. Les actions se font dans des fenetres modales.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2 sm:self-start">
          <PlusIcon className="size-4" />
          Nouveau produit
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Opérations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Aucun produit pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const isLowStock = product.stock <= product.low_stock_threshold;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {product.categories?.name || categoryLabelById.get(product.category_id) || "Categorie"}
                        </span>
                      </TableCell>
                      <TableCell>{currencyFormatter.format(Number(product.price || 0))}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{product.stock} {product.unit}</span>
                          {isLowStock ? <Badge variant="secondary">Stock faible</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
            <DialogDescription>
              Renseigne les informations du produit dans cette fenetre. Le tableau reste la seule vue de liste.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Categorie</Label>
              <Select
                value={form.category_id}
                onValueChange={(value) => setForm((current) => ({ ...current, category_id: value || "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Prix</Label>
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Unite</Label>
              <Input
                value={form.unit}
                onChange={(e) => setForm((current) => ({ ...current, unit: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Seuil d'alerte</Label>
              <Input
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) =>
                  setForm((current) => ({ ...current, low_stock_threshold: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Images du produit</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative h-16 w-16 border rounded overflow-hidden group">
                    <img src={img} alt="preview" className="h-full w-full object-cover" />
                    <button
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5"
                      onClick={() => setForm(c => ({ ...c, images: c.images.filter((_, i) => i !== idx) }))}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative h-16 w-16 border rounded overflow-hidden group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover opacity-70" />
                    <button
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5"
                      onClick={() => setSelectedFiles(c => c.filter((_, i) => i !== idx))}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(c => [...c, ...Array.from(e.target.files!)]);
                  }
                  e.target.value = "";
                }}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving || !canSubmit}>
              {saving ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Enregistrement...
                </>
              ) : editingProduct ? (
                "Modifier"
              ) : (
                "Creer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} sera supprime definitivement. Cette action ne peut pas etre annulee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

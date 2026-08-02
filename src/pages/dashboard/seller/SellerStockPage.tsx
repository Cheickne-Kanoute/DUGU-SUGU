import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { updateProduct, getProducts, type Product } from "@/lib/api/products";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

type StockFormState = {
  addedStock: string;
  low_stock_threshold: string;
};

export default function SellerStockPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Track local edits before saving
  const [edits, setEdits] = useState<Record<string, StockFormState>>({});

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const typedData = await getProducts({ sellerId: user.id });
        setProducts(typedData);
        
        // Initialize edits state
        const initialEdits: Record<string, StockFormState> = {};
        typedData.forEach(p => {
          initialEdits[p.id] = {
            addedStock: "",
            low_stock_threshold: String(p.low_stock_threshold ?? 10)
          };
        });
        setEdits(initialEdits);
      } catch (err: any) {
        toast.error(err.message || "Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.id]);

  const handleEditChange = (productId: string, field: keyof StockFormState, value: string) => {
    setEdits(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSaveStock = async (product: Product) => {
    if (!user?.id) return;
    const edit = edits[product.id];
    if (!edit) return;

    setSavingId(product.id);
    try {
      const added = Number(edit.addedStock || 0);
      const newStock = (product.stock || 0) + added;
      
      const payload = {
        stock: newStock,
        low_stock_threshold: Number(edit.low_stock_threshold || 0),
      };
      
      const updated = await updateProduct(product.id, payload) as Product;
      
      setProducts(current =>
        current.map(p => (p.id === product.id ? { ...p, ...updated } : p))
      );
      
      setEdits(prev => ({
        ...prev,
        [product.id]: {
          ...prev[product.id],
          addedStock: ""
        }
      }));
      
      toast.success("Stock mis à jour pour " + product.name);
    } catch (err: any) {
      toast.error(err.message || "Impossible d'enregistrer le stock");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestion du stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajustez rapidement vos quantités en stock et vos seuils d'alerte sans éditer la fiche complète.
          </p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-24">Stock Actuel</TableHead>
                <TableHead className="w-32">Approvisionnement</TableHead>
                <TableHead className="w-32">Seuil d'alerte</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Aucun produit pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const currentEdit = edits[product.id] || { addedStock: "", low_stock_threshold: String(product.low_stock_threshold ?? 10) };
                  const currentStock = product.stock ?? 0;
                  const isLowStock = currentStock <= Number(currentEdit.low_stock_threshold);
                  
                  const thresholdChanged = String(product.low_stock_threshold ?? 10) !== currentEdit.low_stock_threshold;
                  const stockAdded = currentEdit.addedStock !== "" && Number(currentEdit.addedStock) !== 0;
                  const hasChanges = thresholdChanged || stockAdded;
                  
                  const isSaving = savingId === product.id;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Unité: {product.unit}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="destructive">Stock faible</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">En stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-base">{currentStock}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground font-medium">+</span>
                          <Input
                            type="number"
                            placeholder="0"
                            value={currentEdit.addedStock}
                            onChange={(e) => handleEditChange(product.id, "addedStock", e.target.value)}
                            className="w-20 text-center"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={currentEdit.low_stock_threshold}
                          onChange={(e) => handleEditChange(product.id, "low_stock_threshold", e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant={hasChanges ? "default" : "outline"}
                            size="sm" 
                            onClick={() => handleSaveStock(product)}
                            disabled={!hasChanges || isSaving}
                          >
                            {isSaving ? (
                              <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                              <div className="flex items-center">
                                <SaveIcon className="size-4 mr-1" />
                                <span>Enregistrer</span>
                              </div>
                            )}
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
    </div>
  );
}

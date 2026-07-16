import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, type Category } from '@/lib/api/categories';
import { Leaf, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mx-auto flex flex-col items-center justify-center gap-4 mb-8">
        <h2 className="font-bold text-center text-3xl tracking-tighter lg:text-4xl">
          Explorez par Catégorie
        </h2>
        <p className="text-center text-muted-foreground text-sm">
          Trouvez rapidement ce que vous cherchez parmi nos produits frais.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#166534]"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10 text-[#888877]">
          Aucune catégorie trouvée.
        </div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-6 gap-4",
                  "bg-white rounded-2xl border border-[#e0dec8]/50 shadow-sm overflow-hidden",
                  "transition-all duration-500 hover:-translate-y-1 hover:shadow-md hover:border-[#166534]/30"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#166534]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-[#f8f6f0] text-[#166534] group-hover:scale-110 transition-transform duration-500">
                  <Leaf className="w-8 h-8" />
                </div>
                
                <div className="relative text-center w-full">
                  <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#166534] transition-colors duration-300 truncate">
                    {category.name}
                  </h3>
                </div>
                
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <div className="bg-[#166534] text-white p-1.5 rounded-full">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
      )}
    </section>
  );
}

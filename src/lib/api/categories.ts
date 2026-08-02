import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Categorie } from '../../types/database';

export type Category = Categorie;

const DEFAULT_CATEGORIES: Categorie[] = [
  { id: 'legumes', name: 'Légumes', nom: 'Légumes', image: '/images/categories/legumes.jpg', description: 'Légumes frais' },
  { id: 'fruits', name: 'Fruits', nom: 'Fruits', image: '/images/categories/fruits.jpg', description: 'Fruits de saison' },
  { id: 'cereales', name: 'Céréales', nom: 'Céréales', image: '/images/categories/cereales.jpg', description: 'Céréales locales' },
  { id: 'tubercules', name: 'Tubercules', nom: 'Tubercules', image: '/images/categories/tubercules.jpg', description: 'Tubercules frais' },
  { id: 'epices', name: 'Épices', nom: 'Épices', image: '/images/categories/epices.jpg', description: 'Épices et condiments' },
  { id: 'elevage', name: 'Élevage', nom: 'Élevage', image: '/images/categories/elevage.jpg', description: "Produits d'élevage" },
  { id: 'legumineuses', name: 'Légumineuses', nom: 'Légumineuses', image: '/images/categories/legumineuses.jpg', description: 'Haricots, arachides...' },
  { id: 'autres', name: 'Autres', nom: 'Autres', image: '/images/categories/autres.jpg', description: 'Autres produits' },
];

export async function getCategories() {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
      // Seed default categories if empty
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      return DEFAULT_CATEGORIES;
    }
    return snap.docs.map(d => {
      const data = d.data() as Categorie;
      return {
        ...data,
        id: d.id,
        name: data.name || data.nom || d.id,
      };
    });
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

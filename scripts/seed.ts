import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker/locale/fr';
import dotenv from 'dotenv';
import path from 'path';
import WebSocket from 'ws';

// Polyfill for WebSocket in Node v20 for Supabase
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Charge les variables d'environnement depuis le fichier .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Veuillez définir VITE_SUPABASE_URL et SUPABASE_SERVICE_KEY dans votre fichier .env");
}

// On utilise la Service Key pour contourner les règles RLS et avoir les droits admin (notamment pour créer les users)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Tableaux de noms typiquement Maliens
const malianFirstNames = [
  'Mamadou', 'Oumar', 'Amadou', 'Moussa', 'Ibrahim', 'Fatoumata', 
  'Aminata', 'Awa', 'Mariam', 'Oumou', 'Bintou', 'Seydou', 'Cheick', 'Modibo', 'Salif', 'Ousmane', 'Fanta', 'Kadia', 'Sekou', 'Bakary'
];
const malianLastNames = [
  'Traoré', 'Keïta', 'Coulibaly', 'Diallo', 'Diarra', 'Sidibé', 
  'Sangaré', 'Cissé', 'Touré', 'Kanté', 'Konaté', 'Dembélé', 'Camara', 'Sissoko', 'Samaké', 'Maïga', 'Sylla', 'Sacko'
];
const malianCities = ['Bamako', 'Ségou', 'Sikasso', 'Mopti', 'Gao', 'Kayes', 'Koulikoro', 'Tombouctou'];

const randomMalianName = () => {
  const firstName = faker.helpers.arrayElement(malianFirstNames);
  const lastName = faker.helpers.arrayElement(malianLastNames);
  return `${firstName} ${lastName}`;
};

async function seed() {
  console.log('🌱 Démarrage du script de seed (Noms Maliens)...');
  
  // 1. Vérification et récupération des catégories
  const { data: categories, error: catError } = await supabase.from('categories').select('id');
  if (catError || !categories?.length) {
    console.error('❌ Erreur: Aucune catégorie trouvée. Avez-vous exécuté init_database.sql ?');
    return;
  }
  console.log(`✅ ${categories.length} catégories trouvées.`);

  // 2. Création des Utilisateurs (Vendeurs et Clients)
  console.log('👤 Création des utilisateurs (Vendeurs et Clients)...');
  const sellers: string[] = [];
  const clients: string[] = [];

  // Créons 20 utilisateurs au total (8 vendeurs, 12 clients)
  for (let i = 0; i < 20; i++) {
    const isSeller = i < 8; 
    const fullName = randomMalianName();
    const email = faker.internet.email({ firstName: fullName.split(' ')[0], lastName: fullName.split(' ')[1] }).toLowerCase();
    const password = 'password123';
    
    // Création via Auth Admin API (pour que le trigger 'handle_new_user' se déclenche)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      console.error(`Erreur lors de la création de l'utilisateur ${email}:`, authError.message);
      continue;
    }

    if (authData.user) {
      const userId = authData.user.id;
      const role = isSeller ? 'seller' : 'client';
      const city = faker.helpers.arrayElement(malianCities);
      const address = `${faker.location.streetAddress()}, ${city}, Mali`;
      const phone = `+223 ${faker.helpers.arrayElement(['7', '6', '8', '9'])}${faker.string.numeric(7)}`;

      // Mise à jour du profil (le profil a été créé automatiquement par le trigger)
      const { error: profileError } = await supabase.from('profiles').update({
        role,
        address,
        phone,
        location: city,
        bio: isSeller ? `Commerçant passionné basé à ${city}, offrant les meilleurs produits locaux.` : null
      }).eq('id', userId);

      if (profileError) {
        console.error(`Erreur màj profil ${userId}:`, profileError.message);
      } else {
        if (isSeller) sellers.push(userId);
        else clients.push(userId);
      }
    }
  }

  if (sellers.length === 0) {
    console.error('❌ Aucun vendeur créé, arrêt du script. Impossible de créer des produits.');
    return;
  }
  console.log(`✅ ${sellers.length} Vendeurs et ${clients.length} Clients créés.`);

  // 3. Création des Produits
  console.log(`🛒 Création des produits pour les vendeurs...`);
  const products: string[] = [];
  
  for (let i = 0; i < 60; i++) {
    const category = faker.helpers.arrayElement(categories);
    const seller_id = faker.helpers.arrayElement(sellers);
    
    const product = {
      seller_id,
      category_id: category.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 500, max: 20000 })),
      stock: faker.number.int({ min: 10, max: 500 }),
      unit: faker.helpers.arrayElement(['kg', 'sac', 'carton', 'pièce', 'botte']),
      images: [faker.image.urlLoremFlickr({ category: 'food' })],
      is_bio: faker.datatype.boolean()
    };
    
    const { data: pData, error: pError } = await supabase.from('products').insert(product).select('id').single();
    if (pError) console.error('Erreur produit:', pError);
    else if (pData) products.push(pData.id);
  }
  console.log(`✅ ${products.length} produits générés.`);

  // 4. Création des Commandes
  console.log(`📦 Création de fausses commandes...`);
  for (let i = 0; i < 40; i++) {
    const buyer_id = faker.helpers.arrayElement(clients);
    const seller_id = faker.helpers.arrayElement(sellers);
    const total = parseFloat(faker.commerce.price({ min: 2000, max: 50000 }));
    
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      buyer_id,
      seller_id,
      total,
      shipping_address: `${faker.location.streetAddress()}, ${faker.helpers.arrayElement(malianCities)}`,
      status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered'])
    }).select('id').single();

    if (orderError) {
      console.error('Erreur création commande:', orderError);
    } else if (orderData) {
      // Ajout de 1 à 4 articles par commande
      const numItems = faker.number.int({ min: 1, max: 4 });
      for (let j = 0; j < numItems; j++) {
        const product_id = faker.helpers.arrayElement(products);
        await supabase.from('order_items').insert({
          order_id: orderData.id,
          product_id,
          quantity: faker.number.int({ min: 1, max: 10 }),
          price_at_time: parseFloat(faker.commerce.price({ min: 500, max: 10000 }))
        });
      }
    }
  }

  console.log('✅🎉 Base de données remplie avec succès !');
  console.log('----------------------------------------------------');
  console.log('👉 Vous pouvez tester en vous connectant avec n\'importe quel email généré.');
  console.log('🔑 TOUS les mots de passe sont : password123');
  console.log('----------------------------------------------------');
}

seed().catch(console.error);

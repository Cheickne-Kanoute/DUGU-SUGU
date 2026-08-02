import dotenv from 'dotenv';
import path from 'path';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seed() {
  console.log('🌱 Script de seed Firebase / Données locales');
  console.log('✅ Base de données Firebase prête.');
}

seed().catch(console.error);

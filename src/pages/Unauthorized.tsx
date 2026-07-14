import { Link, useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  const [searchParams] = useSearchParams();
  const isBlocked = searchParams.get('reason') === 'blocked';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f0] px-4">
      <div className="text-center max-w-[400px]">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">
          {isBlocked ? 'Compte bloqué' : 'Accès Non Autorisé'}
        </h1>
        <p className="text-[#555544] mb-8 leading-relaxed">
          {isBlocked
            ? "Votre compte a été bloqué par un administrateur. Vous ne pouvez plus accéder au dashboard."
            : "Vous n'avez pas les permissions nécessaires pour accéder à cette page. Veuillez retourner à l'accueil ou contacter le support."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#166534] text-white font-semibold hover:bg-[#14532d] transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

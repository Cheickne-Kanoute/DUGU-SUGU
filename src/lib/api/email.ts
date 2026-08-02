import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface EmailData {
  to: string | string[];
  message: {
    subject: string;
    text?: string;
    html?: string;
  };
}

/**
 * Envoie un email transactionnel (Commandes, Demandes Vendeurs, Statuts).
 * Compatible avec l'extension officielle Firebase "Trigger Email" 
 * ou via un appel API backend (Resend/SendGrid/SMTP).
 */
export async function sendEmailNotification(data: EmailData) {
  try {
    // 1. Ajouter dans la collection /mail/ (déclenche l'extension Firebase Trigger Email si installée)
    await addDoc(collection(db, 'mail'), {
      to: data.to,
      message: data.message,
      createdAt: new Date().toISOString(),
    });

    // 2. Appel fallback optionnel vers l'API backend si disponible
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiBase}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});

  } catch (err) {
    console.warn('Notification par email enregistrée en file d\'attente:', err);
  }
}

/**
 * Email de confirmation de commande (Client & Vendeur)
 */
export async function sendOrderConfirmationEmail(buyerEmail: string, orderId: string, total: number) {
  return sendEmailNotification({
    to: buyerEmail,
    message: {
      subject: `DUGU SUGU — Confirmation de votre commande #${orderId.slice(0, 8)}`,
      html: `
        <h2>Merci pour votre commande sur DUGU SUGU !</h2>
        <p>Votre commande <strong>#${orderId.slice(0, 8)}</strong> d'un montant de <strong>${total.toLocaleString('fr-FR')} FCFA</strong> a bien été enregistrée.</p>
        <p>Vous recevrez une notification dès que le producteur expédiera vos produits.</p>
      `,
    },
  });
}

/**
 * Email d'expédition de commande
 */
export async function sendOrderShippedEmail(buyerEmail: string, orderId: string) {
  return sendEmailNotification({
    to: buyerEmail,
    message: {
      subject: `DUGU SUGU — Votre commande #${orderId.slice(0, 8)} a été expédiée !`,
      html: `
        <h2>Votre commande est en cours de livraison 🚚</h2>
        <p>La commande <strong>#${orderId.slice(0, 8)}</strong> a été marquée comme expédiée par le producteur.</p>
        <p>Rendez-vous dans votre espace client pour confirmer la réception dès que vous recevrez vos produits.</p>
      `,
    },
  });
}

/**
 * Email de demande de compte Vendeur / Producteur
 */
export async function sendSellerRequestEmail(userEmail: string, userName: string) {
  return sendEmailNotification({
    to: userEmail,
    message: {
      subject: `DUGU SUGU — Demande de compte Vendeur reçue`,
      html: `
        <h2>Bonjour ${userName},</h2>
        <p>Votre demande pour devenir Vendeur/Producteur sur DUGU SUGU a bien été reçue.</p>
        <p>Un administrateur va l'examiner sous peu et vous recevrez une confirmation dès sa validation.</p>
      `,
    },
  });
}

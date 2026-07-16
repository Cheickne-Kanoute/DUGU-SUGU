import nodemailer from 'nodemailer';

// Création du transporteur SMTP réutilisable
const createTransporter = () => {
  const email = process.env.GMAIL_EMAIL;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!email || !password) {
    console.warn("WARNING: GMAIL_EMAIL ou GMAIL_APP_PASSWORD n'est pas configuré dans .env. Les emails ne partiront pas.");
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true pour le port 465, false pour les autres
    auth: {
      user: email,
      pass: password,
    },
  });
};

/**
 * Envoie un email de confirmation de commande
 */
export const sendOrderConfirmationEmail = async (
  toEmail: string,
  customerName: string,
  orderId: string,
  totalAmount: number
) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"Dugu Sugu" <${process.env.GMAIL_EMAIL}>`,
      to: toEmail,
      subject: `Confirmation de commande #${orderId.substring(0, 8)} - Dugu Sugu`,
      html: `
        <p>Bonjour ${customerName},</p>
        <p>Votre commande <strong>#${orderId.substring(0, 8)}</strong> a bien été enregistrée.</p>
        <p><strong>Montant total à payer à la livraison :</strong> ${totalAmount.toLocaleString('fr-FR')} FCFA</p>
        <p>Merci pour votre confiance !<br/>L'équipe Dugu Sugu</p>
      `,
    });

    console.log("Message envoyé: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception lors de l'envoi de l'email:", error);
    return { success: false, error };
  }
};

/**
 * Envoie un email de notification au vendeur
 */
export const sendSellerStatusEmail = async (
  toEmail: string,
  status: 'approved' | 'rejected'
) => {
  try {
    const transporter = createTransporter();
    
    const isApproved = status === 'approved';
    const subject = isApproved 
      ? 'Félicitations ! Votre compte Vendeur Dugu Sugu est activé' 
      : 'Information concernant votre demande de compte Vendeur';
    
    const message = isApproved 
      ? 'Votre demande pour devenir vendeur sur Dugu Sugu a été acceptée. Vous pouvez dès à présent vous connecter et ajouter vos produits !' 
      : 'Malheureusement, votre demande pour devenir vendeur n\'a pas été retenue pour le moment.';

    const info = await transporter.sendMail({
      from: `"Dugu Sugu" <${process.env.GMAIL_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: `
        <p>Bonjour,</p>
        <p>${message}</p>
        <p>L'équipe Dugu Sugu</p>
      `,
    });

    console.log("Message envoyé: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception lors de l'envoi de l'email vendeur:", error);
    return { success: false, error };
  }
};

/**
 * Envoie un accusé de réception au client pour sa demande vendeur
 */
export const sendSellerRequestAcknowledgmentEmail = async (
  toEmail: string,
  customerName: string
) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"Dugu Sugu" <${process.env.GMAIL_EMAIL}>`,
      to: toEmail,
      subject: "Votre demande vendeur est en cours de traitement - Dugu Sugu",
      html: `
        <p>Bonjour ${customerName},</p>
        <p>Votre demande pour devenir vendeur sur Dugu Sugu a bien été reçue et est en cours d'analyse.</p>
        <p>Notre équipe l'examine actuellement. Vous recevrez une notification par email dès qu'elle aura été traitée.</p>
        <p>L'équipe Dugu Sugu</p>
      `,
    });

    console.log("Accusé de réception envoyé: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception lors de l'envoi de l'accusé de réception:", error);
    return { success: false, error };
  }
};

/**
 * Envoie une alerte à l'admin pour une nouvelle demande vendeur
 */
export const sendNewSellerRequestAlertEmail = async (
  customerName: string,
  customerEmail: string
) => {
  try {
    const transporter = createTransporter();
    
    // On envoie l'alerte à l'adresse admin (celle du compte Gmail)
    const adminEmail = process.env.GMAIL_EMAIL;
    
    if (!adminEmail) return { success: false, error: 'GMAIL_EMAIL non configuré' };

    const info = await transporter.sendMail({
      from: `"Dugu Sugu Alert" <${process.env.GMAIL_EMAIL}>`,
      to: adminEmail,
      subject: "Nouvelle demande Vendeur reçue !",
      html: `
        <p>Bonjour Admin,</p>
        <p>Un nouveau client a fait une demande pour devenir vendeur :</p>
        <ul>
          <li><strong>Nom :</strong> ${customerName}</li>
          <li><strong>Email :</strong> ${customerEmail}</li>
        </ul>
        <p>Veuillez vous connecter au tableau de bord administrateur pour l'accepter ou la refuser.</p>
      `,
    });

    console.log("Alerte admin envoyée: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception lors de l'envoi de l'alerte admin:", error);
    return { success: false, error };
  }
};

/**
 * Envoie une notification au vendeur pour une nouvelle commande
 */
export const sendNewOrderToSellerEmail = async (
  sellerEmail: string,
  sellerName: string,
  customerName: string,
  orderId: string,
  totalAmount: number
) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"Dugu Sugu" <${process.env.GMAIL_EMAIL}>`,
      to: sellerEmail,
      subject: `Nouvelle commande reçue ! (#${orderId.substring(0, 8)}) - Dugu Sugu`,
      html: `
        <p>Bonjour ${sellerName},</p>
        <p>Excellente nouvelle ! Vous avez reçu une nouvelle commande de la part de <strong>${customerName}</strong>.</p>
        <p><strong>Détails de la commande :</strong></p>
        <ul>
          <li><strong>ID de commande :</strong> #${orderId.substring(0, 8)}</li>
          <li><strong>Montant de vos produits :</strong> ${totalAmount.toLocaleString('fr-FR')} FCFA</li>
        </ul>
        <p>Veuillez vous connecter à votre tableau de bord vendeur sur Dugu Sugu pour préparer les produits.</p>
        <p>L'équipe Dugu Sugu</p>
      `,
    });

    console.log("Email vendeur pour commande envoyé: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception lors de l'envoi de l'email vendeur pour commande:", error);
    return { success: false, error };
  }
};

/**
 * Envoie une notification au client pour un changement de statut de commande
 */
export const sendOrderStatusEmail = async (
  buyerEmail: string,
  buyerName: string,
  sellerName: string,
  orderId: string,
  newStatus: string
) => {
  try {
    const transporter = createTransporter();
    
    // Traduire le statut pour le client
    const statusMap: Record<string, string> = {
      'processing': 'En cours de préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    
    const statusText = statusMap[newStatus] || newStatus;
    
    const info = await transporter.sendMail({
      from: `"Dugu Sugu" <${process.env.GMAIL_EMAIL}>`,
      to: buyerEmail,
      subject: `Mise à jour de votre commande #${orderId.substring(0, 8)} - Dugu Sugu`,
      html: `
        <p>Bonjour ${buyerName},</p>
        <p>Le statut de votre commande <strong>#${orderId.substring(0, 8)}</strong> chez le vendeur <strong>${sellerName}</strong> a été mis à jour.</p>
        <p>Nouveau statut : <strong>${statusText}</strong></p>
        <br/>
        <p>Merci pour votre confiance,</p>
        <p>L'équipe Dugu Sugu</p>
      `,
    });

    console.log("Email changement statut envoyé: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception lors de l'envoi de l'email de changement de statut:", error);
    return { success: false, error };
  }
};





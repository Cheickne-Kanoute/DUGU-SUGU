import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqsSection() {
	return (
		<section className="py-16 px-4">
			<div className="mx-auto w-full max-w-2xl space-y-7">
				<div className="space-y-2">
					<h2 className="text-center font-semibold text-3xl md:text-4xl">
						Questions fréquentes
					</h2>
					<p className="text-center max-w-2xl text-muted-foreground">
						Vous avez des questions sur DUGU SUGU ? Trouvez ici les réponses aux
						interrogations les plus courantes. Pour tout autre besoin, notre
						équipe est disponible pour vous aider.
					</p>
				</div>
				<Accordion className="rounded-lg border">
					{questions.map((item) => (
						<AccordionItem className="px-4" key={item.id} value={item.id}>
							<AccordionTrigger className="py-4 hover:no-underline focus-visible:underline focus-visible:ring-0">
								{item.title}
							</AccordionTrigger>
							<AccordionContent className="pb-4! text-muted-foreground">
								{item.content}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
				<p className="text-muted-foreground">
					Vous ne trouvez pas votre réponse ?{" "}
					<a className="text-primary hover:underline" href="#">
						Contactez notre équipe support
					</a>
				</p>
			</div>
		</section>
	);
}

const questions = [
	{
		id: "item-1",
		title: "Qu'est-ce que DUGU SUGU ?",
		content:
			"DUGU SUGU est une plateforme de commerce en ligne conçue pour l'Afrique de l'Ouest. Elle vous permet de commander des produits de qualité, de suivre vos livraisons en temps réel et de payer en toute sécurité.",
	},
	{
		id: "item-2",
		title: "Comment passer une commande ?",
		content:
			"Il vous suffit de créer un compte, de parcourir notre catalogue, d'ajouter les articles de votre choix au panier, puis de valider votre commande en choisissant votre mode de paiement et votre adresse de livraison.",
	},
	{
		id: "item-3",
		title: "Quels modes de paiement sont acceptés ?",
		content:
			"Nous acceptons Mobile Money (Orange Money, MTN Mobile Money, Wave), les cartes bancaires Visa/Mastercard, ainsi que le paiement à la livraison dans certaines zones couvertes.",
	},
	{
		id: "item-4",
		title: "Quels sont les délais de livraison ?",
		content:
			"Les délais varient selon votre localisation. En zone urbaine (Dakar, Abidjan, Bamako, Conakry), la livraison est généralement effectuée sous 24 à 48 heures. Pour les zones périphériques, comptez 3 à 5 jours ouvrables.",
	},
	{
		id: "item-5",
		title: "Comment suivre ma commande ?",
		content:
			"Après confirmation de votre commande, vous recevrez un lien de suivi par SMS et par e-mail. Vous pouvez également consulter l'état de votre commande directement depuis votre espace personnel sur DUGU SUGU.",
	},
	{
		id: "item-6",
		title: "Que faire si je reçois un article endommagé ou incorrect ?",
		content:
			"Contactez notre service client dans les 48 heures suivant la réception. Nous procéderons à un échange ou un remboursement complet selon votre préférence, sans frais supplémentaires.",
	},
	{
		id: "item-7",
		title: "Mes données personnelles sont-elles protégées ?",
		content:
			"Oui. DUGU SUGU applique des mesures de sécurité strictes pour protéger vos informations personnelles et financières. Vos données ne sont jamais partagées avec des tiers sans votre consentement.",
	},
];


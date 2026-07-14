import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/infinite-slider";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";

type Testimonial = {
	quote: string;
	image: string;
	name: string;
	role: string;
	company?: string;
};

const testimonials: Testimonial[] = [
	{
		quote:
			"DUGU SUGU a complètement transformé ma façon de gérer mes achats. Simple, rapide et fiable — je ne reviens plus en arrière.",
		image: "https://i.pravatar.cc/150?img=1",
		name: "Aminata Diallo",
		role: "Cliente fidèle",
		company: "Dakar",
	},
	{
		quote:
			"La livraison était parfaite et le service client m'a aidé en quelques minutes. Une expérience vraiment premium.",
		image: "https://i.pravatar.cc/150?img=5",
		name: "Moussa Konaté",
		role: "Entrepreneur",
		company: "Abidjan",
	},
	{
		quote:
			"Je recommande DUGU SUGU à tous mes proches. La qualité des produits et la rapidité du service sont incomparables.",
		image: "https://i.pravatar.cc/150?img=9",
		name: "Fatoumata Traoré",
		role: "Professeure",
		company: "Bamako",
	},
	{
		quote:
			"Enfin une plateforme pensée pour nous ! Tout est en français, clair, et on se sent accompagné à chaque étape.",
		image: "https://i.pravatar.cc/150?img=12",
		name: "Ibrahim Coulibaly",
		role: "Ingénieur",
		company: "Conakry",
	},
	{
		quote:
			"Les prix sont honnêtes et la transparence sur les délais m'a vraiment convaincu. Je reviendrai sans hésiter.",
		image: "https://i.pravatar.cc/150?img=20",
		name: "Mariama Bah",
		role: "Médecin",
		company: "Dakar",
	},
	{
		quote:
			"DUGU SUGU, c'est la confiance avant tout. J'ai commandé plusieurs fois et je n'ai jamais été déçue.",
		image: "https://i.pravatar.cc/150?img=25",
		name: "Kadiatou Sylla",
		role: "Gestionnaire",
		company: "Abidjan",
	},
	{
		quote:
			"Le suivi en temps réel de ma commande était rassurant. Une startup africaine qui fait les choses bien.",
		image: "https://i.pravatar.cc/150?img=33",
		name: "Seydou Ouédraogo",
		role: "Commerçant",
		company: "Ouagadougou",
	},
	{
		quote:
			"Interface fluide, paiement sécurisé, livraison dans les délais. DUGU SUGU coche toutes les cases.",
		image: "https://i.pravatar.cc/150?img=40",
		name: "Aïssatou Camara",
		role: "Juriste",
		company: "Conakry",
	},
	{
		quote:
			"J'utilise DUGU SUGU chaque semaine pour mon business. C'est devenu indispensable dans mon quotidien.",
		image: "https://i.pravatar.cc/150?img=47",
		name: "Lamine Ndoye",
		role: "Chef d'entreprise",
		company: "Saint-Louis",
	},
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection() {
	return (
		<section className="relative py-10">
			<div className="mx-auto max-w-5xl">
				<div className="mx-auto flex flex-col items-center justify-center gap-4">

					<h2 className="font-bold text-center text-3xl tracking-tighter lg:text-4xl">
						Ce que disent nos clients
					</h2>
					<p className="text-center text-muted-foreground text-sm">
						Des milliers de clients nous font confiance à travers l'Afrique de l'Ouest.
					</p>
				</div>

				<div
					className={cn(
						"mt-10 flex max-h-160 justify-center gap-6 overflow-hidden",
						"mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
					)}
				>
					<InfiniteSlider direction="vertical" speed={30} speedOnHover={15}>
						{firstColumn.map((testimonial) => (
							<TestimonialsCard
								key={testimonial.name}
								testimonial={testimonial}
							/>
						))}
					</InfiniteSlider>
					<InfiniteSlider
						className="hidden md:block"
						direction="vertical"
						speed={50}
						speedOnHover={25}
					>
						{secondColumn.map((testimonial) => (
							<TestimonialsCard
								key={testimonial.name}
								testimonial={testimonial}
							/>
						))}
					</InfiniteSlider>
					<InfiniteSlider
						className="hidden lg:block"
						direction="vertical"
						speed={35}
						speedOnHover={17}
					>
						{thirdColumn.map((testimonial) => (
							<TestimonialsCard
								key={testimonial.name}
								testimonial={testimonial}
							/>
						))}
					</InfiniteSlider>
				</div>
			</div>
		</section>
	);
}

function TestimonialsCard({
	testimonial,
	className,
	...props
}: React.ComponentProps<"figure"> & {
	testimonial: Testimonial;
}) {
	const { quote, image, name, role, company } = testimonial;
	return (
		<figure
			className={cn(
				"w-full max-w-xs rounded-3xl border bg-card p-8 shadow-foreground/10 shadow-lg dark:bg-card/20",
				className
			)}
			{...props}
		>
			<blockquote>{quote}</blockquote>
			<figcaption className="mt-5 flex items-center gap-2">
				<Avatar className="size-8 rounded-full">
					<AvatarImage alt={`${name}'s profile picture`} src={image} />
					<AvatarFallback>{name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<cite className="font-medium not-italic leading-5 tracking-tight">
						{name}
					</cite>
					<span className="text-muted-foreground text-sm leading-5 tracking-tight">
						{role} {company && `, ${company}`}
					</span>
				</div>
			</figcaption>
		</figure>
	);
}

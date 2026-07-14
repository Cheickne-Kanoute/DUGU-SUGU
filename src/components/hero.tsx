import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, PhoneCallIcon } from "lucide-react";
import { LogoCloud } from "@/components/logo-cloud";

export function HeroSection() {
	return (
		<section>
			<div className="relative flex flex-col items-center justify-center gap-5 px-4 py-12 md:px-4 md:py-24 lg:py-28">
				<div
					aria-hidden="true"
					className="absolute inset-0 -z-10 size-full overflow-hidden"
				>
					<div
						className={cn(
							"absolute -inset-x-20 inset-y-0 z-0 rounded-full",
							"bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent,transparent)]",
							"blur-[50px]"
						)}
					/>
					<div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-border to-border md:left-8" />
					<div className="absolute inset-y-0 right-4 w-px bg-gradient-to-b from-transparent via-border to-border md:right-8" />
					<div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-border/50 to-border/50 md:left-12" />
					<div className="absolute inset-y-0 right-8 w-px bg-gradient-to-b from-transparent via-border/50 to-border/50 md:right-12" />
				</div>

				<a
					className={cn(
						"group mx-auto flex w-fit items-center gap-3 rounded-full border border-primary/15 bg-card px-2 py-1 shadow-sm",
						"fade-in slide-in-from-bottom-10 animate-in [animation-fill-mode:backwards] transition-all delay-500 duration-500 ease-out"
					)}
					href="/products"
				>
					<div className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 shadow-sm">
						<p className="text-xs font-medium text-primary">NOUVEAU</p>
					</div>
					<span className="text-xs text-muted-foreground">marché agricole du Mali</span>
					<span className="block h-5 border-l" />
					<div className="pr-1">
						<ArrowRightIcon className="size-3 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0.5" />
					</div>
				</a>

				<h1
					className={cn(
						"max-w-2xl text-balance text-center text-3xl md:text-5xl lg:text-6xl",
						"fade-in slide-in-from-bottom-10 animate-in [animation-fill-mode:backwards] delay-100 duration-500 ease-out"
					)}
				>
					Achetez et vendez vos{" "}
					<span className="italic font-cursive">produits</span>{" "}
					agricoles en toute simplicité
				</h1>

				<p
					className={cn(
						"text-center text-sm tracking-normal text-muted-foreground sm:text-lg",
						"fade-in slide-in-from-bottom-10 animate-in [animation-fill-mode:backwards] delay-200 duration-500 ease-out"
					)}
				>
					Dugu Sugu connecte les producteurs, les vendeurs et les acheteurs au <br />
					Mali pour découvrir des produits frais et développer votre activité.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in items-center justify-center gap-3 [animation-fill-mode:backwards] pt-2 delay-300 duration-500 ease-out">
					<Button variant={'outline'} className="h-11 rounded-full px-6">
						<PhoneCallIcon data-icon="inline-start" />
						Explorer les produits
					</Button>
					<Button className="h-11 rounded-full px-6">
						Créer un compte
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
				</div>
			</div>
			<LogoCloud />
		</section>
	);
}

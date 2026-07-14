import { InfiniteSlider } from "@/components/infinite-slider";

export function LogoCloud() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="mb-6 text-center">
				<p className="text-xl font-medium">
					Utilisé par les leaders.
				</p>
			</div>

			<div className="mask-[linear-gradient(to_right,transparent,black,transparent)] overflow-hidden py-4">
				<InfiniteSlider gap={48} speed={60} speedOnHover={20}>
					{logos.map((logo) => (
						<img
							alt={logo.alt}
							className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
							height="auto"
							key={`logo-${logo.alt}`}
							loading="lazy"
							src={logo.src}
							width="auto"
						/>
					))}
				</InfiniteSlider>
			</div>
		</div>
	);
}

const logos = [
	{
		src: "https://storage.efferd.com/logo/supabase-wordmark.svg",
		alt: "Supabase Logo",
	},
	{
		src: "https://storage.efferd.com/logo/openai-wordmark.svg",
		alt: "OpenAI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/turso-wordmark.svg",
		alt: "Turso Logo",
	},
	{
		src: "https://storage.efferd.com/logo/vercel-wordmark.svg",
		alt: "Vercel Logo",
	},
	{
		src: "https://storage.efferd.com/logo/github-wordmark.svg",
		alt: "GitHub Logo",
	},
	{
		src: "https://storage.efferd.com/logo/claude-wordmark.svg",
		alt: "Claude AI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/clerk-wordmark.svg",
		alt: "Clerk Logo",
	},
	{
		src: "https://storage.efferd.com/logo/nvidia-wordmark.svg",
		alt: "Nvidia Logo",
	},
];

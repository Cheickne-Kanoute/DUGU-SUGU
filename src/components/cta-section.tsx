import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";

const avatars = [
  { src: "https://i.pravatar.cc/150?img=1", fallback: "A" },
  { src: "https://i.pravatar.cc/150?img=5", fallback: "M" },
  { src: "https://i.pravatar.cc/150?img=9", fallback: "F" },
  { src: "https://i.pravatar.cc/150?img=12", fallback: "I" },
  { src: "https://i.pravatar.cc/150?img=20", fallback: "K" },
];

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="size-4 fill-primary text-primary"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function CtaSection() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-4">
          <AvatarGroup>
            {avatars.map((a) => (
              <Avatar key={a.fallback} size="default">
                <AvatarImage src={a.src} alt={a.fallback} />
                <AvatarFallback>{a.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <div className="flex flex-col items-start gap-0.5">
            <StarRating />
            <span className="text-xs text-muted-foreground">
              140+ clients satisfaits
            </span>
          </div>
        </div>

        <h2 className="text-4xl font-medium text-center tracking-tight md:text-5xl leading-tight">
          Prêt à simplifier vos achats avec DUGU SUGU ?
        </h2>

        <p className="text-center max-w-md text-muted-foreground">
          Nous vous offrons une expérience d'achat rapide, sécurisée et adaptée
          à l'Afrique de l'Ouest. Si un service fiable et accessible est votre
          priorité, vous êtes au bon endroit.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="lg" className="rounded-full px-6">
            En savoir plus
          </Button>
          <Button size="lg" className="rounded-full px-6">
            Commencer maintenant
          </Button>
        </div>
      </div>
    </section>
  );
}

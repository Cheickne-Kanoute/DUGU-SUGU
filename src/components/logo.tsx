import type React from "react";
import { cn } from "@/lib/utils";

export const LogoIcon = (props: React.ComponentProps<"span">) => (
	<span {...props} className={cn("font-bold text-2xl text-[#166534] font-['Caveat',_cursive]", props.className)}>
		DS
	</span>
);

export const Logo = (props: React.ComponentProps<"span">) => (
	<span {...props} className={cn("font-bold text-3xl text-[#166534] font-['Caveat',_cursive] tracking-wide", props.className)}>
		DuguSugu
	</span>
);

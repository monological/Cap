"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider as NASessionProvider } from "next-auth/react";
import { type PropsWithChildren, useState } from "react";

export function ReactQueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

export function SessionProvider({ children }: PropsWithChildren) {
	return <NASessionProvider>{children}</NASessionProvider>;
}

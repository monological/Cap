import { getCurrentUser } from "@cap/database/auth/session";
import Link from "next/link";
import { redirect } from "next/navigation";

const actions = [
	{
		title: "Dashboard",
		description: "Manage recordings, folders, and sharing settings.",
		href: "/dashboard/caps",
	},
	{
		title: "Record",
		description: "Capture your screen from the browser.",
		href: "/dashboard/caps/record",
	},
	{
		title: "Upload",
		description: "Add an existing video and create a share link.",
		href: "/dashboard/import/file",
	},
];

export default async function Home() {
	const user = await getCurrentUser();

	if (user) {
		redirect("/dashboard/caps");
	}

	return (
		<main className="min-h-screen bg-gray-1 text-gray-12">
			<header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
				<Link
					href="/"
					className="text-4xl font-semibold leading-none text-gray-12"
				>
					<span>Cap</span>
				</Link>
				<nav className="flex items-center gap-2">
					<Link
						href="/login"
						className="rounded-full border border-gray-5 bg-white px-4 py-2 text-sm font-medium text-gray-11 transition-colors hover:border-gray-8"
					>
						Log in
					</Link>
					<Link
						href="/signup"
						className="rounded-full bg-gray-12 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-11"
					>
						Sign up
					</Link>
				</nav>
			</header>

			<section className="mx-auto grid w-full max-w-5xl gap-10 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
				<div className="max-w-2xl">
					<p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-blue-10">
						Video workspace
					</p>
					<h1 className="text-5xl font-semibold leading-tight text-gray-12 sm:text-6xl">
						Record, upload, and share videos.
					</h1>
					<p className="mt-6 max-w-xl text-lg leading-8 text-gray-10">
						A clean place to capture your screen, keep recordings organized, and
						send links when something needs to be shared.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							href="/signup"
							className="rounded-full bg-blue-9 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-10"
						>
							Get started
						</Link>
						<Link
							href="/login"
							className="rounded-full border border-gray-5 bg-white px-5 py-3 text-sm font-semibold text-gray-12 transition-colors hover:border-gray-8"
						>
							Open dashboard
						</Link>
					</div>
				</div>

				<div className="rounded-lg border border-gray-4 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between border-b border-gray-3 pb-4">
						<div>
							<p className="text-sm font-semibold text-gray-12">
								Recent videos
							</p>
							<p className="text-xs text-gray-9">Ready to share</p>
						</div>
						<Link
							href="/dashboard/caps"
							className="rounded-full bg-gray-12 px-4 py-2 text-sm font-medium text-white"
						>
							Open
						</Link>
					</div>
					<div className="mt-4 grid gap-3">
						{actions.map((action) => (
							<Link
								key={action.href}
								href={action.href}
								className="rounded-lg border border-gray-4 bg-gray-1 p-4 transition-colors hover:border-blue-7 hover:bg-white"
							>
								<div className="flex items-center justify-between gap-4">
									<h2 className="text-base font-semibold text-gray-12">
										{action.title}
									</h2>
									<span className="text-lg text-blue-10">-&gt;</span>
								</div>
								<p className="mt-2 text-sm leading-6 text-gray-10">
									{action.description}
								</p>
							</Link>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}

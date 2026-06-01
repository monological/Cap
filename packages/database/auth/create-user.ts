import { STRIPE_AVAILABLE, stripe } from "@cap/utils";
import { type ImageUpload, Organisation, User } from "@cap/web-domain";
import { and, eq } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import type Stripe from "stripe";
import { nanoId } from "../helpers.ts";
import {
	organizationInvites,
	organizationMembers,
	organizations,
	users,
} from "../schema.ts";

type CreateUserInput = {
	email: string;
	emailVerified?: Date | null;
	name?: string | null;
	image?: ImageUpload.ImageUrlOrKey | string | null;
	passwordHash?: string | null;
};

export async function createUserWithDefaults(
	db: MySql2Database,
	userData: CreateUserInput,
) {
	const normalizedEmail = userData.email?.toLowerCase() ?? "";
	const userId = User.UserId.make(nanoId());
	await db.transaction(async (tx) => {
		const [pendingInvite] = await tx
			.select({ id: organizationInvites.id })
			.from(organizationInvites)
			.where(
				and(
					eq(organizationInvites.invitedEmail, normalizedEmail),
					eq(organizationInvites.status, "pending"),
				),
			)
			.limit(1);

		await tx.insert(users).values({
			id: userId,
			email: normalizedEmail,
			emailVerified: userData.emailVerified ?? null,
			name: userData.name,
			image: userData.image as ImageUpload.ImageUrlOrKey | null,
			passwordHash: userData.passwordHash ?? null,
			activeOrganizationId: Organisation.OrganisationId.make(""),
		});

		if (pendingInvite) {
			return;
		}

		const organizationId = Organisation.OrganisationId.make(nanoId());

		await tx.insert(organizations).values({
			id: organizationId,
			ownerId: userId,
			name: "My Organization",
		});

		await tx.insert(organizationMembers).values({
			id: nanoId(),
			organizationId,
			userId,
			role: "owner",
		});

		await tx
			.update(users)
			.set({
				activeOrganizationId: organizationId,
				defaultOrgId: organizationId,
			})
			.where(eq(users.id, userId));
	});

	const rows = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	let row = rows[0];
	if (!row) throw new Error("User not found");

	if (STRIPE_AVAILABLE()) {
		const existingCustomers = await stripe().customers.list({
			email: normalizedEmail,
			limit: 1,
		});

		let customer: Stripe.Customer;
		if (existingCustomers.data.length > 0 && existingCustomers.data[0]) {
			customer = existingCustomers.data[0];

			customer = await stripe().customers.update(customer.id, {
				metadata: {
					...customer.metadata,
					userId: row.id,
				},
			});
		} else {
			customer = await stripe().customers.create({
				email: normalizedEmail,
				metadata: {
					userId: row.id,
				},
			});
		}

		const subscriptions = await stripe().subscriptions.list({
			customer: customer.id,
			status: "active",
			limit: 100,
		});

		const inviteQuota = subscriptions.data.reduce((total, sub) => {
			return (
				total +
				sub.items.data.reduce(
					(subTotal, item) => subTotal + (item.quantity || 1),
					0,
				)
			);
		}, 0);

		const mostRecentSubscription = subscriptions.data[0];

		await db
			.update(users)
			.set({
				stripeCustomerId: customer.id,
				...(mostRecentSubscription && {
					stripeSubscriptionId: mostRecentSubscription.id,
					stripeSubscriptionStatus: mostRecentSubscription.status,
					inviteQuota: inviteQuota || 1,
				}),
			})
			.where(eq(users.id, row.id));

		const [updatedRow] = await db
			.select()
			.from(users)
			.where(eq(users.id, row.id))
			.limit(1);
		if (updatedRow) {
			row = updatedRow;
		}
	}

	return row;
}

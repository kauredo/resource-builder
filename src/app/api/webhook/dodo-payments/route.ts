import { Webhooks } from "@dodopayments/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function getData(payload: Record<string, unknown>): Record<string, unknown> {
  return (payload.data as Record<string, unknown>) ?? payload;
}

function getCustomerEmail(payload: Record<string, unknown>): string | null {
  const data = getData(payload);
  const customer = data.customer as Record<string, unknown> | undefined;
  return (customer?.email as string) ?? null;
}

function getCustomerId(payload: Record<string, unknown>): string {
  const data = getData(payload);
  const customer = data.customer as Record<string, unknown> | undefined;
  return (customer?.customer_id as string) ?? "";
}

function getSubscriptionId(payload: Record<string, unknown>): string {
  const data = getData(payload);
  return (data.subscription_id as string) ?? "";
}

async function activateSubscription(payload: Record<string, unknown>) {
  const email = getCustomerEmail(payload);
  if (!email) {
    console.error("Webhook: no customer email in payload");
    return;
  }

  await convex.mutation(api.users.handleSubscriptionWebhook, {
    email,
    dodoCustomerId: getCustomerId(payload),
    dodoSubscriptionId: getSubscriptionId(payload),
    status: "pro",
  });
}

async function deactivateSubscription(payload: Record<string, unknown>) {
  const email = getCustomerEmail(payload);
  if (!email) {
    console.error("Webhook: no customer email in payload");
    return;
  }

  await convex.mutation(api.users.handleSubscriptionWebhook, {
    email,
    dodoCustomerId: getCustomerId(payload),
    dodoSubscriptionId: getSubscriptionId(payload),
    status: "free",
  });
}

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  onSubscriptionActive: async (payload) => {
    await activateSubscription(payload as Record<string, unknown>);
  },

  onSubscriptionRenewed: async (payload) => {
    await activateSubscription(payload as Record<string, unknown>);
  },

  onSubscriptionCancelled: async (payload) => {
    await deactivateSubscription(payload as Record<string, unknown>);
  },

  onSubscriptionExpired: async (payload) => {
    await deactivateSubscription(payload as Record<string, unknown>);
  },

  onSubscriptionFailed: async (payload) => {
    await deactivateSubscription(payload as Record<string, unknown>);
  },

  onSubscriptionOnHold: async (payload) => {
    await deactivateSubscription(payload as Record<string, unknown>);
  },

  onPaymentSucceeded: async (payload) => {
    // For one-time payments (if used), also activate
    await activateSubscription(payload as Record<string, unknown>);
  },
});

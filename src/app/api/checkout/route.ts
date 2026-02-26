import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const DODO_API_BASE =
  process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";

export async function POST(request: NextRequest) {
  const { email, name, plan } = await request.json();

  if (!email || !name) {
    return NextResponse.json(
      { error: "Missing email or name" },
      { status: 400 },
    );
  }

  // Prevent duplicate subscriptions
  const user = await convex.query(api.users.getUser, { email });
  if (user?.subscription === "pro") {
    return NextResponse.json(
      { error: "You already have an active subscription" },
      { status: 400 },
    );
  }

  const productId =
    plan === "annual"
      ? process.env.DODO_PRODUCT_ID_ANNUAL
      : process.env.DODO_PRODUCT_ID_MONTHLY;

  if (!productId) {
    return NextResponse.json(
      { error: "Product not configured" },
      { status: 500 },
    );
  }

  const response = await fetch(`${DODO_API_BASE}/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      billing: { country: "US" },
      customer: { email, name },
      product_id: productId,
      quantity: 1,
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?upgraded=true`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Dodo checkout error:", text);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }

  const data = await response.json();
  return NextResponse.json({ payment_link: data.payment_link });
}

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RZ_KEY!,
  key_secret: process.env.RZ_SECRET!,
});

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  const order = await razorpay.orders.create({
    amount, 
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  return NextResponse.json(order);
}

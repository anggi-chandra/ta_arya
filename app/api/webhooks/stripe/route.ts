import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

// Ensure this runs in the Node.js runtime so we can read raw body
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(status: number, data: any) {
  return NextResponse.json(data, { status })
}

// Simple health check for the webhook endpoint
export async function GET() {
  return json(200, { ok: true })
}

// Stripe webhook handler
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return json(500, { error: 'Missing STRIPE_WEBHOOK_SECRET in environment' })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return json(400, { error: 'Missing Stripe-Signature header' })
  }

  // Read raw body for signature verification
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    // Verify the signature and parse the event
    event = Stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error('Stripe signature verification failed:', err?.message || err)
    return json(400, { error: 'Invalid signature' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed', {
          id: session.id,
          amount_total: session.amount_total,
          customer: session.customer,
          mode: session.mode,
        })
        // TODO: update order/registration status in DB here
        break
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded', {
          id: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          customer: pi.customer,
        })
        // TODO: persist payment details in DB here
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment succeeded', {
          id: invoice.id,
          customer: invoice.customer,
          amount_paid: invoice.amount_paid,
        })
        // TODO: record subscription/renewal in DB here
        break
      }
      default: {
        console.log('Unhandled Stripe event type:', event.type)
      }
    }

    return json(200, { received: true })
  } catch (error) {
    console.error('Error handling Stripe event:', error)
    return json(500, { error: 'Server error while processing event' })
  }
}
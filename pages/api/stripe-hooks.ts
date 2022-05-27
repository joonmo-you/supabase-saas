import { NextApiRequest, NextApiResponse } from 'next/types'
import Stripe from 'stripe'
import { buffer } from 'micro'
import { getServiceSupabase } from '../../utils/supabase'

export const config = { api: { bodyParser: false } }

type Data = {
  message: string
}

const secretKey = process.env.STRIPE_SECRET_KEY as string
const signingKey = process.env.STRIPE_SIGNING_KEY as string

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const stripe = new Stripe(secretKey, { apiVersion: '2020-08-27' })
  const signature = req.headers['stripe-signature'] as string
  const payload = await buffer(req)
  let event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, signingKey)
    const customer = event.data.object.customer
    const supabase = getServiceSupabase()

    switch (event.type) {
      case 'customer.subscription.created':
        const interval = event.data.object.items.data[0].plan.interval
        await supabase
          .from('profile')
          .update({ is_subscribed: true, interval })
          .eq('stripe_customer', customer)
    }
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      res.status(400).send({ message: `Error ${error?.message}` })
      return
    }
  }

  res.status(200).send({ message: `${event?.type}` })
}

export default handler

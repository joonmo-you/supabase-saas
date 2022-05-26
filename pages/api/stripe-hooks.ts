import { NextApiRequest, NextApiResponse } from 'next/types'
import Stripe from 'stripe'
import { buffer } from 'micro'

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

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, signingKey)
    res.status(200).send({ message: `${event}` })
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      res.status(400).send({ message: `Error ${error?.message}` })
    }
  }
}

export default handler

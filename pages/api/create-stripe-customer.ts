import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { supabase } from '../../utils/supabase'

type Data = {
  message: string
}

const secretKey = process.env.STRIPE_SECRET_KEY as string

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const stripe = new Stripe(secretKey, { apiVersion: '2020-08-27' })
  const customer = await stripe.customers.create({
    email: req.body.record.email,
  })
  await supabase
    .from('profile')
    .update({ stripe_customer: customer.id })
    .eq('id', req.body.record.id)
  res.status(200).json({ message: `stripe customer created: ${customer.id}` })
}

export default handler

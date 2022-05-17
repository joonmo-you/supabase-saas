import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { supabase } from '../../utils/supabase'

type Data = {
  message: string
}

const secretKey = process.env.STRIPE_SECRET_KEY as string
const apiSecret = process.env.API_ROUTE_SECRET as string

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.query.API_ROUTE_SECRET !== apiSecret) {
    res.status(401).send({ message: 'Unauthorized Request' })
    return
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2020-08-27' })
  const customer = await stripe.customers.create({
    email: req.body.record.email,
  })

  await supabase
    .from('profile')
    .update({ stripe_customer: customer.id })
    .eq('id', req.body.record.id)

  res.status(200).send({ message: `stripe customer created: ${customer.id}` })
}

export default handler

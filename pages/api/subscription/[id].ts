import { NextApiRequest, NextApiResponse } from 'next/types'
import cookie from 'cookie'
import { User } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { supabase } from './../../../utils/supabase'

type Data = {
  id?: string
  message?: string
}

const secretKey = process.env.STRIPE_SECRET_KEY as string
const successUrl = process.env.SUCCESS_URL as string
const cancelUrl = process.env.CANCEL_URL as string

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user } = await supabase.auth.api.getUserByCookie(req, res)
  const token = cookie.parse(req.headers.cookie as string)['sb-access-token']
  const stripe = new Stripe(secretKey, { apiVersion: '2020-08-27' })
  const { id: price_id } = req.query

  if (!user || !token) {
    res.status(401).send({ message: 'Unauthorized Request' })
    return
  }

  supabase.auth.session = () => ({
    access_token: token,
    token_type: 'access_token',
    user,
  })
  supabase
    .from('profile')
    .select('stripe_customer')
    .eq('id', user.id)
    .single()
    .then(
      async ({ data: { stripe_customer } }) => {
        const session = await stripe.checkout.sessions.create({
          customer: stripe_customer,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: price_id as string, quantity: 1 }],
          success_url: successUrl,
          cancel_url: cancelUrl,
        })
        res.status(200).send({ id: session.id })
      },
      (error) => res.status(400).send({ message: error })
    )
}

export default handler

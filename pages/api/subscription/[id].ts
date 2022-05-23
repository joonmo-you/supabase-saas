import { NextApiRequest, NextApiResponse } from 'next/types'
import cookie from 'cookie'
import { User } from '@supabase/supabase-js'
import { supabase } from './../../../utils/supabase'

type Data = {
  data?: User
  message?: string
}

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { user } = await supabase.auth.api.getUserByCookie(req, res)
  const token = cookie.parse(req.headers.cookie as string)['sb-access-token']

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
      ({ data: { stripe_customer } }) =>
        res.status(200).send({
          data: {
            ...user,
            user_metadata: { ...user.user_metadata, stripe_customer },
          },
        }),
      (error) => res.status(400).send({ message: error })
    )
}

export default handler

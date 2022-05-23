import { NextApiRequest, NextApiResponse } from 'next/types'
import { supabase } from '../../utils/supabase'

async function handler(req: NextApiRequest, res: NextApiResponse<void>) {
  supabase.auth.api.setAuthCookie(req, res)
}

export default handler

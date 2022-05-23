import { User } from '@supabase/supabase-js'
import React from 'react'
import { GetStaticProps } from 'next/types'
import Stripe from 'stripe'
import { useAuth } from '../contexts/auth-context'

type Price = {
  id: string
  price: number
  interval?: 'month' | 'year'
  currency: string
}

type Plan = {
  product: 'Basic Plan' | 'Premium Plan'
  prices: Array<Price>
}

type State = { message: string | undefined }

type Action = { auth: User | null }

interface Props {
  plans: Array<Plan>
}

const secretKey = process.env.STRIPE_SECRET_KEY as string

function Reducer(state: State, { auth }: Action): State {
  if (auth === null) return { message: 'Create Account' }
  return auth.user_metadata?.is_subscribed
    ? { message: 'Manage Subscription' }
    : { message: 'Subscribe' }
}

export default function Subscription({ plans }: Props) {
  const [state, dispatch] = React.useReducer(Reducer, { message: undefined })
  const { auth, isLoading } = useAuth()

  React.useEffect(() => {
    dispatch({ auth })
  }, [auth])

  return (
    <div className="mx-auto flex w-full max-w-3xl justify-around py-16">
      {plans.map(({ product, prices }) => (
        <div key={product} className="h-40 w-80 rounded px-6 shadow">
          <h2 className="text-xl">{product}</h2>
          {prices.map(({ id, price, interval }) => (
            <p key={id} className="text-gray-500">
              ${(price / 100).toFixed(2)}{' '}
              {interval !== undefined ? `/ ${interval}` : null}
            </p>
          ))}
          {!isLoading ? <button>{state.message}</button> : null}
        </div>
      ))}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const stripe = new Stripe(secretKey, { apiVersion: '2020-08-27' })
  const { data: prices } = await stripe.prices.list()
  const plans = await Promise.all(
    prices.map(async (price) => {
      const { name } = await stripe.products.retrieve(price.product as string)
      return { ...price, product: name }
    })
  )

  return {
    props: {
      plans: Array.from(new Set(plans.map((plan) => plan.product)))
        .sort((product1, product2) =>
          product1.toLowerCase().localeCompare(product2.toLowerCase())
        )
        .map((product) => ({
          product,
          prices: plans
            .filter((plan) => plan.product === product)
            .map(({ id, unit_amount, recurring, currency }) => ({
              id,
              price: unit_amount,
              interval: recurring?.interval,
              currency,
            }))
            .sort(
              ({ price: price1 }, { price: price2 }) =>
                (price1 as number) - (price2 as number)
            ),
        })),
    },
  }
}

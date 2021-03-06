import React from 'react'
import { GetStaticProps } from 'next/types'
import axios from 'axios'
import { User } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'
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

const publickKey = process.env.NEXT_PUBLIC_STRIPE_KEY as string
const secretKey = process.env.STRIPE_SECRET_KEY as string

function Reducer(state: State, { auth }: Action): State {
  if (auth === null) return { message: 'Create Account' }
  return auth.user_metadata?.is_subscribed
    ? { message: 'Manage Subscription' }
    : { message: 'Subscribe' }
}

export default function Subscription({ plans }: Props) {
  const [state, dispatch] = React.useReducer(Reducer, { message: undefined })
  const [selectedPriceId, setSelectedPriceId] = React.useState('')
  const { auth, isLoading } = useAuth()

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    switch (state.message) {
      case 'Subscribe':
        axios
          .get(`/api/subscription/${selectedPriceId}`)
          .then(async ({ data }) => {
            const stripe = await loadStripe(publickKey)
            await stripe?.redirectToCheckout({ sessionId: data.id })
          })
        return
      case 'Manage Subscription':
        return
    }
  }

  React.useEffect(() => {
    dispatch({ auth })
  }, [auth])

  return (
    <div className="mx-auto flex w-full max-w-3xl justify-around py-16">
      {plans.map(({ product, prices }) => (
        <div key={product} className="h-40 w-80 rounded px-6 shadow">
          <h2 className="text-xl">{product}</h2>
          {prices.map(({ id, price, interval }) => (
            <div key={id} className="flex items-center">
              <input
                type="checkbox"
                className="mr-1 h-4 w-4 rounded-full"
                checked={selectedPriceId === id}
                onChange={() => setSelectedPriceId(id)}
              />
              <p className="text-gray-500">
                ${(price / 100).toFixed(2)}{' '}
                {interval !== undefined ? `/ ${interval}` : null}
              </p>
            </div>
          ))}
          {!isLoading ? (
            <button type="button" onClick={handleClick}>
              {state.message}
            </button>
          ) : null}
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

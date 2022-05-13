import type { GetStaticProps } from 'next'
import { supabase } from '../utils/supabase'

type Lesson = {
  id: number
  created_at: string
  title: string
  description: string
}

interface Props {
  lessons: Array<Lesson>
}

export default function Home({ lessons }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://nextjs.org">
            Next.js!
          </a>
        </h1>

        {lessons.map((lesson) => (
          <p key={lesson.id} className="mt-3 text-2xl">
            {lesson.title}
          </p>
        ))}
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { data: lessons } = await supabase.from('lesson').select('*')
  return { props: { lessons } }
}

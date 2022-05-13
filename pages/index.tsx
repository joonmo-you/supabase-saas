import type { GetStaticProps } from 'next'
import Link from 'next/link'
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
    <div className="mx-auto my-16 w-full max-w-3xl px-2">
      {lessons.map((lesson) => (
        <Link key={lesson.id} href={`/${lesson.id}`}>
          <a className="mb-4 flex h-40 rounded p-8 text-xl shadow">
            {lesson.title}
          </a>
        </Link>
      ))}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { data: lessons } = await supabase.from('lesson').select('*')
  return { props: { lessons } }
}

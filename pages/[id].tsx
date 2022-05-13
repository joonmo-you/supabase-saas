import { GetStaticPaths, GetStaticProps } from 'next'
import { supabase } from '../utils/supabase'

type Lesson = {
  id: number
  created_at: string
  title: string
  description: string
}

interface Props {
  lesson: Lesson
}

export default function LessonDetails({ lesson }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-16">
      <h1 className="mb-6 text-3xl">{lesson.title}</h1>
      <p>{lesson.description}</p>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: lessons } = await supabase.from('lesson').select('*')
  const paths =
    lessons !== null
      ? lessons.map((lesson) => ({ params: { id: lesson.id.toString() } }))
      : [{ params: { id: '' } }]
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data: lesson } = await supabase
    .from('lesson')
    .select('*')
    .eq('id', params?.id)
    .single()
  return { props: { lesson } }
}

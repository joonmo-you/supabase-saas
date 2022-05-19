import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import ReactPlayer from 'react-player/youtube'
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
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null)
  const getVideoUrl = React.useCallback(async () => {
    const { data: premium_content } = await supabase
      .from('premium_content')
      .select('video_url')
      .eq('id', lesson.id)
      .single()
    setVideoUrl(premium_content?.video_url)
  }, [])

  React.useEffect(() => {
    getVideoUrl()
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-16">
      <h1 className="mb-6 text-3xl">{lesson.title}</h1>
      <p>{lesson.description}</p>
      {videoUrl ? <ReactPlayer url={videoUrl} width="100%" /> : null}
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

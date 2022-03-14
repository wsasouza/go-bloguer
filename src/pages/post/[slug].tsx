import { useState } from 'react'
import { GetStaticProps } from 'next'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'

import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import Header from '../components/Header'

interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
}
interface Props {
  post: Post
}

function Post({ post }: Props) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>()

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data)
        setSubmitted(true)
      })
      .catch((err) => {
        console.log(err)
        setSubmitted(false)
      })
  }

  return (
    <main>
      <Header />

      <img
        src={urlFor(post.mainImage).url()!}
        alt="mainImage"
        className="h-40 w-full object-cover"
      />
      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>

        <h2 className="mb-2 text-xl font-light text-gray-500">
          {post.description}
        </h2>

        <div className="flex items-center space-x-2">
          <img
            src={urlFor(post.author.image).url()!}
            alt="authorImage"
            className="h-10 w-10 rounded-full"
          />
          <p className="text-sm font-extralight">
            Blog postado por{' '}
            <span className="font-bold text-blue-600">{post.author.name}</span>{' '}
            - publicado em {new Date(post._createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ children, href }: any) => (
                <a href={href} className="text-blue-600">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="my-5 mx-auto max-w-lg border border-orange-500" />

      {submitted ? (
        <div className="my-10 mx-auto flex max-w-2xl flex-col rounded bg-orange-500 p-10 text-white">
          <h3 className="text-3xl font-bold">
            Obrigado por enviar um comentário.
          </h3>
          <p>Assim que ele for aprovado, vai ser listado abaixo.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mb-10 flex max-w-2xl flex-col p-5"
        >
          <h3 className="text-sm text-orange-500">Gostou deste artigo?</h3>
          <h4 className="text-3xl font-bold">Deixe um comentário abaixo:</h4>

          <input
            {...register('_id')}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <label className="mb-5 block">
            <span className="text-gray-700">Nome</span>
            <input
              {...register('name', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-orange-500 focus:ring"
              placeholder="Digite o seu nome"
              type="text"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">E-mail</span>
            <input
              {...register('email', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-orange-500 focus:ring"
              placeholder="Digite seu melhor e-mail"
              type="email"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Comentário</span>
            <textarea
              {...register('comment', { required: true })}
              className="form-textarea w-full rounded border py-2 px-3 shadow outline-none ring-orange-500 focus:ring"
              placeholder="Digite a sua mensagem"
              rows={8}
            />
          </label>

          {/* errors will return when field validation fails */}
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-600">- O nome é obrigatório.</span>
            )}
            {errors.email && (
              <span className="text-red-600">- O e-mail é obrigatório.</span>
            )}
            {errors.comment && (
              <span className="text-red-600">
                - O comentário é obrigatório.
              </span>
            )}
          </div>

          <input
            type="submit"
            value="Enviar"
            className="focus:shadow-outline cursor-pointer rounded bg-orange-500 py-2 px-4 font-bold text-white shadow hover:bg-orange-600 focus:outline-none"
          />
        </form>
      )}

      {/* Comments */}
      <div className="my-10 mx-auto flex max-w-2xl flex-col space-y-2 p-10 shadow shadow-orange-500">
        <h3 className="text-4xl">Comentários:</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-orange-500">{comment.name}: </span>
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
    _id,
    slug {
      current
    }
  }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: { slug: post.slug.current },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt,
    title,   
    author -> {
      name,
      image
    },
    "comments": *[
      _type == "comment" && 
      post._ref == ^._id &&
      approved == true
    ],
    description,
    mainImage,
    slug,
    body
  }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60, // 60 seconds
  }
}

import Head from 'next/head'
import Image from 'next/image'
import Header from './components/Header'

import { sanityClient, urlFor } from '../sanity'
import { Post } from '../typings'

import homeImage from '../assets/home.png'
import Link from 'next/link'

interface Props {
  posts: [Post]
}

export default function Home({ posts }: Props) {
  console.log(posts)

  return (
    <div className="mx-auto max-w-7xl">
      <Head>
        <title>Go Bloguer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex items-center justify-between border-y border-black bg-orange-200 py-10 lg:py-0">
        <div className="space-y-5 px-10">
          <h1 className="max-w-xl font-serif text-6xl">
            <span>Go Bloguer</span> é o lugar para você ler, escrever e se
            conectar
          </h1>
          <h2>#tecnologia e dicas de carreira</h2>
        </div>
        <div className="h-65 hidden md:inline-flex lg:h-full">
          <Image src={homeImage} alt="homeImage" />
        </div>
      </div>

      {/* posts */}
      <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2 md:gap-6 md:p-6 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="group cursor-pointer overflow-hidden rounded-lg border">
              <img
                src={urlFor(post.mainImage).url()!}
                alt="PostImage"
                className="h-60 w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
              />
              <div className="flex justify-between bg-orange-700 p-5">
                <div>
                  <p className="text-lg font-bold text-white">{post.title}</p>
                  <p className="text-xs text-gray-300">
                    {post.description} por {post.author.name}
                  </p>
                </div>

                <img
                  src={urlFor(post.author.image).url()!}
                  alt="AuthorImage"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
    _id,
    title,
    slug,
    author -> {
      name,
      image
    },
    description,
    mainImage,
    slug  
  }`

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    },
  }
}

import { allPosts } from 'contentlayer/generated';
import { Card } from "@/components/Card/Card"
import { Hero } from "@/components/Hero/Hero"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home | Minimalist',
  description: 'Minimalist is template for blog built with nextjs, shadcn ui and tailwind css.',
}

export default function Page() {
  return (
    <section className="py-32">
      <div className="container flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <h2 className="mb-3 text-pretty text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            Blog Posts
          </h2>
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            Please, Login first to CREATE your OWN BLOG and enjoy!!
          </p>
        </div>

        <Hero />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {allPosts.map((item, index) => {
            // remove the fisrt post
            if (index !== 0) {
              return <Card key={item.id} item={item} />
            }
          })}
        </div>
      </div>
    </section>
  );
};

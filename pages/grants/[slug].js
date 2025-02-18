import { useRouter } from "next/router";
import {
  getPostBySlug,
  getAllPosts,
  formatDate,
  getSimilarGrants,
} from "../../lib/lib";
import Head from "next/head";
import Meta from "../../components/Meta";
import { decode } from "html-entities";
import classnames from "classnames";
import ErrorPage from "../404";
import Container from "../../components/Container";
import Markdown from "../../components/Markdown";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SingleColumn from "../../components/SingleColumn";
import GrantPreview from "../../components/GrantPreview";
import Section from "../../components/Section";
import { DateTime } from "luxon";

export default function Grant({ post, markdown, search }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage />;
  }
  const isOpen = !post?.extra?.completed && post?.extra?.assignee === "";
  const canApply = isOpen && post?.extra?.work_request_link;

  return (
    <Container>
      <Head>
        <title>{post.title} • Grants • urbit.org</title>
        {Meta(post)}
      </Head>
      <SingleColumn>
        <Header search={search} />
        <Section narrow short>
          <h1>{post.title}</h1>
          {post.extra.assignee ? (
            <div className="type-ui text-wall-500 mt-4">
              Grantee: {post.extra.assignee}
            </div>
          ) : null}
          {post.extra.ship ? (
            <div className="type-ui text-wall-500 font-mono">
              {post.extra.ship}
            </div>
          ) : null}
          <div className="type-ui text-wall-500 mt-4 md:mt-8 lg:mt-10">
            {formatDate(DateTime.fromISO(post.date))}
          </div>
          <div className="flex items-center flex-wrap mt-4 md:mt-8 lg:mt-10">
            {post.taxonomies.grant_type.map((category) => {
              const className = classnames({
                "bg-blue-400 text-white": category === "Proposal",
                "bg-green-400 text-white": category === "Apprenticeship",
                "bg-yellow-300": category === "Bounty",
              });
              return (
                <div className={`${className} badge-sm mr-1 my-1`}>
                  {category}
                </div>
              );
            })}
            {post.taxonomies.grant_category.map((category) => (
              <div className="bg-wall-500 text-wall-100 badge-sm mr-1 my-1">
                {category}
              </div>
            ))}
          </div>
        </Section>
        <Section narrow className="markdown">
          <article dangerouslySetInnerHTML={{ __html: decode(markdown) }} />
        </Section>
        {canApply && (
          <a
            className="bg-green-400 text-white button-lg"
            href={post?.extra?.work_request_link}
            target="_blank"
          >
            Apply for this grant
          </a>
        )}
      </SingleColumn>
      <Footer />
    </Container>
  );
}

//
export async function getStaticProps({ params }) {
  const post = getPostBySlug(
    params.slug,
    ["title", "slug", "date", "description", "content", "extra", "taxonomies"],
    "grants"
  );

  const markdown = await Markdown({ post });

  return {
    props: { post, markdown },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug", "date"], "grants");

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}

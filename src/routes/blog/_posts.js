import markdownPosts from "../../../posts/*.md";

const posts = markdownPosts.map((markdownPost) => {
  const { metadata, html } = markdownPost;
  return {
    title: metadata.title,
    slug: metadata.slug,
    date: metadata.date,
    html: html,
  };
});

posts.forEach((post) => {
  post.html = post.html.replace(/^\t{3}/gm, "");
});

export default posts;

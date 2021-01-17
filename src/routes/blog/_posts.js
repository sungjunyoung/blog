const fs = require("fs");
const fm = require("front-matter");
const marked = require("marked");

const posts = fs.readdirSync("./src/posts").map((postFilename) => {
  const contents = fs.readFileSync(`./src/posts/${postFilename}`, {
    encoding: "utf8",
  });
  const { body, attributes } = fm(contents);
  return {
    title: attributes.title,
    slug: attributes.slug,
    html: marked(body),
  };
});

posts.forEach((post) => {
  post.html = post.html.replace(/^\t{3}/gm, "");
});

export default posts;

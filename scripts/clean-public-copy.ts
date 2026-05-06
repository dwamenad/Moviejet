import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();

const replacements = [
  {
    from:
      "That gives your friend a straightforward publishing rhythm. Post to social for speed, then use the backend to expand the story on the site when it deserves more space.",
    to:
      "That rhythm gives Moviejet space to move fast on social while expanding the stories that deserve more context.",
  },
  {
    from:
      "Premiere week has a different energy. Instead of treating every story the same, the site can push the main release forward using the spotlight toggle, then support it with a few secondary entries.",
    to:
      "Premiere week has a different energy. Instead of treating every story the same, Moviejet can push the main release forward, then support it with a few secondary entries.",
  },
  {
    from:
      "That single control is enough to make the homepage feel fresh without requiring a full redesign. The admin can feature one story, publish the supporting posts, and let the site do the rest.",
    to:
      "That editorial shape keeps the homepage feeling fresh during release windows, giving audiences an obvious center of gravity for the week.",
  },
  {
    from:
      "The result is a cleaner workflow and a homepage that always has an obvious editorial center.",
    to:
      "The result is a sharper rhythm and a homepage that always has an obvious editorial center.",
  },
  {
    from:
      "The site should not duplicate the social feed. It should deepen it with stronger packaging, better indexing, and a clear reading flow.",
    to:
      "Moviejet turns fast social moments into fuller stories that stay easy to find after the feed moves on.",
  },
];

if (!databaseUrl) {
  console.error("DATABASE_URL is required to clean live Postgres content.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  let changedRows = 0;

  for (const replacement of replacements) {
    const result = await pool.query(
      `
        UPDATE posts
        SET body = replace(body, $1, $2),
            excerpt = replace(excerpt, $1, $2),
            updated_at = NOW()
        WHERE body LIKE '%' || $1 || '%'
           OR excerpt LIKE '%' || $1 || '%'
      `,
      [replacement.from, replacement.to],
    );

    changedRows += result.rowCount ?? 0;
  }

  console.log(`Cleaned ${changedRows} story body occurrence(s).`);
} finally {
  await pool.end();
}

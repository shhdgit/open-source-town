export default async function fetcher<JSON = any>(ignore): Promise<JSON> {
  const queryParams = new URLSearchParams({
    user: "explorer",
    default_format: "JSON",
    query: `
            SELECT *
            FROM
            (
              SELECT actor_login, t, c, row_number() OVER (PARTITION BY t ORDER BY c DESC) AS n
              FROM
              (
                SELECT actor_login, toStartOfMonth(created_at) as t, COUNT(*) as c
                FROM github_events
                WHERE startsWith(repo_name, 'apache/pulsar')
                GROUP BY t, actor_login
                ORDER BY t, c DESC
              )
            )
            WHERE n <= 5
            ORDER BY t, n ASC
            SETTINGS allow_experimental_window_functions = 1
        `,
  });
  const response = await fetch(`https://play.clickhouse.com/?${queryParams}`, {
    method: "GET",
  });
  return response.json();
}

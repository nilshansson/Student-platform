type GitHubCommitsProps = {
  username: string;
  totalCommits: number;
};

const fetchGitHubData = async (username: string, since: string) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  const userUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos`;

  const userResponse = await fetch(userUrl, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  });
  const user = await userResponse.json();

  const reposResponse = await fetch(reposUrl, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  });
  const repos = await reposResponse.json();

  let totalCommits = 0;

  for (const repo of repos) {
    const commitsUrl = `https://api.github.com/repos/${username}/${repo.name}/commits?since=${since}&per_page=1`;
    const commitsResponse = await fetch(commitsUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const commits = commitsResponse.headers.get("link");

    if (commits) {
      const match = commits.match(/&page=(\d+)>; rel="last"/);
      if (match) {
        totalCommits += parseInt(match[1], 10);
      }
    }
  }

  return {
    username: user.login,
    totalCommits,
  };
};

const GitHubCommits = async () => {
  const username = "nilshansson";

  const since = "2024-06-03T00:00:00Z";

  const { username: fetchedUsername, totalCommits } = await fetchGitHubData(
    username,
    since
  );

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>GitHub User: {fetchedUsername}</h1>
      <h2>Total Commits since start of the precourse: {totalCommits}</h2>
    </div>
  );
};

export default GitHubCommits;

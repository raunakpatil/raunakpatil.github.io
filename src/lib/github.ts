export interface GithubRepo {
  id: number
  name: string
  description: string
  html_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  stargazers_count: number
  language: string | null
  topics: string[]
  homepage?: string
}

export async function fetchGithubData(username: string): Promise<GithubRepo[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=created&direction=asc`, {
      next: { revalidate: 3600 } // Cache for 1 hour to avoid rate limits
    })

    if (!res.ok) {
      console.error(`GitHub API failed: ${res.status} ${res.statusText}`)
      // Fallback data if rate limited during dev
      return []
    }

    const repos: GithubRepo[] = await res.json()
    
    // Filter out forks or profile readme if desired
    return repos.filter(r => r.name !== username && r.name !== `${username}.github.io`)
  } catch (err) {
    console.error("Failed to fetch GitHub data:", err)
    return []
  }
}

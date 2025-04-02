const GITHUB_API_BASE = "https://api.github.com/repos";

export const fetchGitHubFolder = async (owner, repo, path = "") => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/${owner}/${repo}/contents/${path}`);
    if (!response.ok) throw new Error("Failed to fetch data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub folder:", error);
    return [];
  }
};

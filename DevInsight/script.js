/* =====================================================
   DEVINSIGHT SCRIPT
   Fetch GitHub data and generate insights
===================================================== */

let languageChart = null;
let radarChart = null;

async function getProfile() {
  const username = document.getElementById("username").value.trim();

  if (username === "") {
    alert("Enter a GitHub username");
    return;
  }

  /* =====================================================
   API ENDPOINTS
===================================================== */

  const userURL = `https://api.github.com/users/${username}`;
  const repoURL = `https://api.github.com/users/${username}/repos?per_page=100`;

  try {
    /* =====================================================
   FETCH USER + REPOSITORIES
===================================================== */

    const userRes = await fetch(userURL);
    const userData = await userRes.json();

    const repoRes = await fetch(repoURL);
    const repoData = await repoRes.json();

    /* =====================================================
   PROFILE CARD
===================================================== */

    document.getElementById("avatarImg").src = userData.avatar_url;

    document.getElementById("name").innerText = userData.name || userData.login;

    document.getElementById("bio").innerText =
      userData.bio || "No bio available";

    document.getElementById("location").innerText =
      "📍 " + (userData.location || "Unknown");

    document.getElementById("joined").innerText =
      "📅 Joined " + new Date(userData.created_at).getFullYear();

    /* =====================================================
   METRICS
===================================================== */

    document.getElementById("repoCount").innerText = userData.public_repos;
    document.getElementById("followersCount").innerText = userData.followers;
    document.getElementById("followingCount").innerText = userData.following;

    /* =====================================================
   DEVELOPER SCORE
===================================================== */

    let stars = 0;

    repoData.forEach((repo) => {
      stars += repo.stargazers_count;
    });

    const devScore = userData.public_repos + userData.followers * 2 + stars * 3;

    document.getElementById("devScore").innerText = devScore;

    /* =====================================================
   LANGUAGE DISTRIBUTION
===================================================== */

    const languageCount = {};

    repoData.forEach((repo) => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    const labels = Object.keys(languageCount);
    const values = Object.values(languageCount);

    /* destroy previous chart */

    if (languageChart) {
      languageChart.destroy();
    }

    languageChart = new Chart(document.getElementById("languageChart"), {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              "#58a6ff",
              "#2ea043",
              "#a371f7",
              "#f0883e",
              "#e3b341",
              "#ff7b72",
              "#3fb950",
            ],
          },
        ],
      },
    });

    /* =====================================================
   DEVELOPER FOCUS RADAR (Enhanced Visual Version)
===================================================== */

    let frontend = 0;
    let backend = 0;
    let devops = 0;
    let ai = 0;
    let data = 0;
    let mobile = 0;

    /* analyze repositories */

    repoData.forEach((repo) => {
      const name = repo.name.toLowerCase();
      const lang = (repo.language || "").toLowerCase();

      /* frontend indicators */

      if (
        lang === "javascript" ||
        lang === "html" ||
        lang === "css" ||
        name.includes("react") ||
        name.includes("frontend")
      ) {
        frontend++;
      }

      /* backend indicators */

      if (
        lang === "java" ||
        lang === "go" ||
        lang === "php" ||
        name.includes("api") ||
        name.includes("server")
      ) {
        backend++;
      }

      /* devops indicators */

      if (
        name.includes("docker") ||
        name.includes("kubernetes") ||
        name.includes("deploy") ||
        name.includes("infra")
      ) {
        devops++;
      }

      /* AI / ML indicators */

      if (
        lang === "python" ||
        name.includes("ai") ||
        name.includes("ml") ||
        name.includes("neural")
      ) {
        ai++;
      }

      /* data science */

      if (
        name.includes("data") ||
        name.includes("analysis") ||
        name.includes("pandas")
      ) {
        data++;
      }

      /* mobile */

      if (
        name.includes("android") ||
        name.includes("ios") ||
        name.includes("flutter") ||
        name.includes("react-native")
      ) {
        mobile++;
      }
    });

    /* destroy previous chart */

    if (radarChart) {
      radarChart.destroy();
    }

    radarChart = new Chart(document.getElementById("focusRadar"), {
      type: "radar",

      data: {
        labels: ["Frontend", "Backend", "DevOps", "AI / ML", "Data", "Mobile"],

        datasets: [
          {
            label: "Developer Focus Profile",

            data: [frontend, backend, devops, ai, data, mobile],

            backgroundColor: "rgba(88,166,255,0.25)",
            borderColor: "#58a6ff",
            pointBackgroundColor: "#58a6ff",
            pointBorderColor: "#ffffff",
            pointHoverBackgroundColor: "#ffffff",
            pointHoverBorderColor: "#58a6ff",
            borderWidth: 2,
          },
        ],
      },

      options: {
        plugins: {
          legend: {
            labels: {
              color: "#c9d1d9",
            },
          },
        },

        scales: {
          r: {
            angleLines: {
              color: "#30363d",
            },

            grid: {
              color: "#30363d",
            },

            pointLabels: {
              color: "#c9d1d9",
              font: {
                size: 13,
              },
            },

            ticks: {
              display: false,
            },

            suggestedMin: 0,
          },
        },
      },
    });

    /* =====================================================
   TOP REPOSITORY
===================================================== */

    const topRepository = repoData
      .slice()
      .sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

    const topRepoElement = document.getElementById("topRepo");

    if (topRepository) {
      topRepoElement.innerHTML = `
<h4>${topRepository.name}</h4>

<p>${topRepository.description || "No description available"}</p>

<p>
⭐ ${topRepository.stargazers_count}
|
🍴 ${topRepository.forks}
</p>

<a href="${topRepository.html_url}" target="_blank">
View Repository
</a>
`;
    }

    /* =====================================================
   REPOSITORY LIST
===================================================== */

    let repoHTML = "";

    repoData.slice(0, 10).forEach((repo) => {
      repoHTML += `
<div class="repo-card">

<h4>
<a href="${repo.html_url}" target="_blank">
${repo.name}
</a>
</h4>

<p>
${repo.description || "No description"}
</p>

<p class="repo-meta">
${repo.language || "Unknown"} • ⭐ ${repo.stargazers_count}
</p>

</div>
`;
    });

    document.getElementById("repoList").innerHTML = repoHTML;

    /* =====================================================
   IDEA VELOCITY
===================================================== */

    const reposThisYear = repoData.filter(
      (repo) =>
        new Date(repo.created_at).getFullYear() === new Date().getFullYear(),
    );

    document.getElementById("ideaVelocity").innerHTML = `
<h3>Idea Velocity</h3>
<p>${reposThisYear.length} repos created this year</p>
`;

    /* =====================================================
   PROJECT SURVIVAL
===================================================== */

    const activeRepos = repoData.filter((repo) => {
      const days =
        (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);

      return days < 180;
    });

    document.getElementById("survivalRate").innerHTML = `
<h3>Project Survival Rate</h3>
<p>Active: ${activeRepos.length}</p>
<p>Inactive: ${repoData.length - activeRepos.length}</p>
`;

    /* =====================================================
   COLLABORATION
===================================================== */

    const forks = repoData.filter((repo) => repo.fork).length;

    document.getElementById("collaborationScore").innerHTML = `
<h3>Collaboration Score</h3>
<p>Forked repos: ${forks}</p>
<p>Original repos: ${repoData.length - forks}</p>
`;

    /* =====================================================
   PROJECT DIVERSITY
===================================================== */

    const languages = new Set();

    repoData.forEach((repo) => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });

    document.getElementById("projectDiversity").innerHTML = `
<h3>Project Diversity</h3>
<p>${languages.size} languages used</p>
`;

    /* =====================================================
   TECH EVOLUTION
===================================================== */

    const oldestRepo = repoData.reduce((a, b) =>
      new Date(a.created_at) < new Date(b.created_at) ? a : b,
    );

    const newestRepo = repoData.reduce((a, b) =>
      new Date(a.created_at) > new Date(b.created_at) ? a : b,
    );

    document.getElementById("techEvolution").innerHTML = `
<h3>Tech Evolution</h3>
<p>Early: ${oldestRepo.language || "Unknown"}</p>
<p>Recent: ${newestRepo.language || "Unknown"}</p>
`;

    /* =====================================================
   CODING RHYTHM
   Analyze commit timestamps
===================================================== */

    let morning = 0,
      afternoon = 0,
      night = 0;

    for (const repo of repoData.slice(0, 5)) {
      try {
        const commitURL = repo.commits_url.replace("{/sha}", "");
        const commitRes = await fetch(commitURL);
        const commits = await commitRes.json();

        commits.slice(0, 10).forEach((commit) => {
          const hour = new Date(commit.commit.author.date).getHours();

          if (hour < 12) morning++;
          else if (hour < 18) afternoon++;
          else night++;
        });
      } catch (e) {}
    }

    let rhythm = "Balanced";

    if (morning > afternoon && morning > night) rhythm = "Morning Builder";

    if (afternoon > morning && afternoon > night) rhythm = "Afternoon Coder";

    if (night > morning && night > afternoon) rhythm = "Night Owl";

    document.getElementById("codingPattern").innerHTML = `
<h3>Coding Rhythm</h3>
<p>${rhythm}</p>
<p>Morning commits: ${morning}</p>
<p>Afternoon commits: ${afternoon}</p>
<p>Night commits: ${night}</p>
`;
  } catch (err) {
    console.error(err);
    alert("Error fetching GitHub data");
  }
}

/* =====================================================
   NAVIGATION FUNCTIONS
===================================================== */

function openDocs() {
  alert(
    `DevInsight Documentation

1. Enter a GitHub username
2. Explore developer metrics
3. Analyze technology distribution
4. View advanced insights

More documentation coming soon.`,
  );
}

function compareMode() {
  alert(
    `Developer comparison feature coming soon.

Future version will allow:

• comparing two developers
• comparing technology stacks
• contribution activity analysis`,
  );
}

function handleSearch(event) {
  event.preventDefault(); // prevents page reload

  getProfile(); // run your existing function
}
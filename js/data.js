/* =========================================================================
   EDIT ME — all of the site's content lives here.
   Pulled from github.com/raunakpatil (profile, README, repos) and LinkedIn (linkedin.com/in/raunakpatil).
   Values marked "estimate" are guesses — adjust them.
   ========================================================================= */
window.PORTFOLIO = {
  name: 'Raunak Patil',
  shortName: 'RP',
  tagline: 'AI Engineer & Designer',   // under the name on the arrival screen
  timezone: 'Asia/Kolkata', // used for the live clock in the menu
  // what Ronie leads with: newer than anything else in this file, so it wins wherever they disagree
  status: "Open to work, looking for his next role. Living in Nagpur, India right now. He's no longer at Sigma AI (he was an AI Quality Engineer there from Apr 2024).",
  bio: 'AI Quality Engineer (LLM & Generative AI), auditing RAG systems, evaluating LLMs and building RLHF quality frameworks, most recently at Sigma AI in London. Now based in Nagpur, India and open to work. MSc Data Science & AI, University of Liverpool.',

  links: [
    { label: 'Email', href: 'mailto:raunakpatil15@gmail.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/raunakpatil/' },
    { label: 'GitHub', href: 'https://github.com/raunakpatil' },
    { label: 'YouTube', href: 'https://www.youtube.com/@eldritchlore' },
    { label: 'Instagram', href: 'https://www.instagram.com/raunakpatil/' },
  ],

  /* Card 1 — greeting + ASCII art.
     Set asciiImage to a portrait (ideally on a plain/dark background, e.g. 'img/me.png')
     to render it as ASCII. Leave empty for the spinning ASCII torus.
     Local images need the site served over http (see README). */
  hello: {
    greeting: ['Hello', 'Stranger'],
  },

  /* Card 2 — hours dial. The total keeps growing by a random-but-fixed 4–6 h every day
     after `since` (the same number for every visitor), and creeps up through the day.
     Hover a marker to see each era: `start.hours` is time spent there; the rest is `end`. */
  time: {
    title: 'Time spent in AI / ML',
    hours: 8200,           // total on the `since` date (estimate)
    since: '2026-10-08',
    perDay: [4, 6],        // hours added per day
    unit: 'Hours',
    start: { year: 2021, city: 'Bengaluru', region: 'India', lat: 12.9716, lon: 77.5946, hours: 1900 }, // estimate
    end: { year: 2026, city: 'London', region: 'the UK', lat: 51.5072, lon: -0.1276 },   // his UK years, up to 2026
  },

  /* Card 3 — skill matrix: the skills (each an equal band of the bar strip, no scores). `tools` lists which entries
     from the tools column each skill uses — they light up when the skill is hovered (and vice versa). */
  skills: {
    title: 'AI skill matrix',
    items: [
      { name: 'Generative AI & LLMs', tools: ['Hugging Face', 'LangChain', 'OpenAI / Azure AI', 'Gemini', 'PyTorch'] },
      { name: 'RAG Pipelines', tools: ['LangChain', 'LlamaIndex', 'OpenAI / Azure AI', 'Hugging Face'] },
      { name: 'LLM Evaluation & RLHF', tools: ['Hugging Face', 'PyTorch', 'MLflow', 'OpenAI / Azure AI'] },
      { name: 'Python', tools: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'LangChain', 'LlamaIndex'] },
      { name: 'Machine Learning', tools: ['Scikit-learn', 'PyTorch', 'TensorFlow', 'MLflow', 'XGBoost'] },
      { name: 'AI Agents', tools: ['LangChain', 'Gemini', 'OpenAI / Azure AI', 'Cloudflare Workers'] },
      { name: 'Prompt Engineering', tools: ['OpenAI / Azure AI', 'Gemini'] },
      { name: 'Data Quality & Analysis', tools: ['SQL · R', 'Power BI'] },
      { name: 'Deep Learning', tools: ['PyTorch', 'TensorFlow', 'Hugging Face'] },
      { name: 'Data Visualization', tools: ['Power BI', 'SQL · R'] },
      { name: 'Full-stack (React / Next.js)', tools: ['React / Next.js', 'Gemini', 'Firebase'] },
      // (from the projects: Ronie, Radar, TriviaFlux and Zeul on serverless; Ronie's and YAAS's voices; the Titanic
      // predictor's SHAP explanations; Ronie's 3D body)
      { name: 'AI Deployment & Serverless', tools: ['Cloudflare Workers', 'Firebase', 'Gemini'] },
      { name: 'Voice & Speech AI', tools: ['Kokoro TTS', 'Hugging Face'] },
      { name: 'Explainable AI', tools: ['SHAP', 'XGBoost', 'Scikit-learn'] },
      { name: '3D & WebGPU', tools: ['three.js', 'Blender'] },
    ],
    tools: ['PyTorch', 'TensorFlow', 'Hugging Face', 'LangChain', 'LlamaIndex', 'OpenAI / Azure AI', 'Gemini', 'Scikit-learn', 'MLflow', 'XGBoost', 'SHAP', 'Power BI', 'SQL · R', 'React / Next.js', 'Cloudflare Workers', 'Firebase', 'Kokoro TTS', 'three.js', 'Blender'],
  },

  /* Card 4 — 3D tunnel of floating projects (uses the projects list below).
     Every hover on the answer reveals the next one (shuffled, never the same twice in a row). */
  tunnel: {
    question: 'Who are you?',
    answers: [
      'A dreamer who debugs.',
      'A teacher to machines.',
      'A hallucination hunter.',
      'The one who asks the model, "are you sure?"',
      'A translator between humans and models.',
      'A signals engineer who fell for neural nets.',
      'A detective of edge cases.',
      'A coach for stubborn language models.',
      'A guardian of honest AI.',
      'A builder of things that think.',
      'A storyteller with data.',
      'A tinkerer since the soldering iron.',
      'An explorer of latent space.',
      'A seeker of signal in the noise.',
      'A maker of free tools for everyone.',
      'A friend to robots, a critic of their facts.',
      'A night owl with a GPU.',
      'Fluent in Python, Hindi, Marathi and English.',
      'From Nagpur to London and back, still curious.',
      'A student who never logged off.',
    ],
  },

  /* Card 5 — world map. Pins are placed by lat/lon and cycle in order.
     mapBounds picks the visible region (degrees); delete it to show the whole world. */
  mapBounds: { w: -22, e: 100, n: 62, s: 2 },
  experience: [
    { years: '2015 – 2021', org: 'BE, Electrical, Electronics & Communications Engineering', role: 'GH Raisoni University', place: 'Nagpur, IN', lat: 21.1458, lon: 79.0882 },
    { years: 'Feb 2021 – Jan 2022', org: 'Junior Data Scientist · Zummit Infolabs', role: 'Internship: predictive maintenance ML, TensorFlow, DNNs', place: 'Bengaluru, IN', lat: 12.9716, lon: 77.5946 },
    { years: 'Sep 2022 – Sep 2023', org: 'MSc Data Science & AI · University of Liverpool', role: 'Dissertation: Multi-Agent Reinforcement Learning (MARL)', place: 'Liverpool, UK', lat: 53.4084, lon: -2.9916 },
    { years: 'Apr 2024 – 2026', org: 'AI Quality Engineer · Sigma AI', role: 'LLM & Generative AI: RAG auditing, RLHF, LLM QA', place: 'Hammersmith, London, UK', lat: 51.4927, lon: -0.2239 },
  ],


  /* Projects page. category drives the filter chips and the generated thumbnail style
     (AI Agents → terminal, Dashboard, App, Website, Visual; anything else → pattern).
     Add image: 'img/your-shot.jpg' to use a real screenshot instead.
     tunnelImage / tunnelImageMobile: the dashboard tunnel's own pictures (a dark object floating in the void, made to
     sit in it; 16:9 and 4:3); without them the tunnel uses image / imageMobile. */
  projects: [
    {
      title: 'Ronie: 3D AI Agent', category: 'AI Agents', year: 2026, image: 'img/projects/ronie.webp?v=5', imageMobile: 'img/projects/ronie-mobile.webp?v=2', tunnelImage: 'img/tunnel/ronie.webp?v=2', tunnelImageMobile: 'img/tunnel/ronie-mobile.webp?v=2', colors: ['#ff7a1a', '#7c5cff'],
      tags: ['three.js', 'WebGPU', 'Kokoro TTS', 'Cloudflare Workers', 'Gemini', 'Blender'],
      description: "The 3D AI agent who lives on this website: he answers visitors' questions from real facts only, speaks in a neural voice that runs on their own GPU, reacts with 23 expressions and 23 moves I authored in Blender with Python, and plays a mind-reading game, free to run. Works with any 3D character; the code is an open template.",
      link: 'https://github.com/raunakpatil/ronie-3d-ai-website-agent', linkText: 'See the case study ↗',
      demo: '#assistant', demoText: 'Meet Ronie →',
    },
    {
      title: 'Smart Glasses AI Agent', aka: ['Smart Glasses AI Agent', 'smart glasses'], category: 'AI Agents', year: 2026, image: 'img/projects/smart-glasses.webp', imageMobile: 'img/projects/smart-glasses-mobile.webp', tunnelImage: 'img/tunnel/smart-glasses.webp', tunnelImageMobile: 'img/tunnel/smart-glasses-mobile.webp', video: 'media/smart-glasses-film.mp4?v=2', videoPoster: 'img/projects/smart-glasses-film.webp?v=2',
      colors: ['#e879f9', '#111111'],
      tags: ['Python', 'FastAPI', 'Kotlin', 'Gemini Live', 'Meta Wearables SDK', 'Android TV'],
      description: 'An open-source, hands-free AI agent for Ray-Ban Meta glasses: say "Ronie" and just talk. It sees what you see, plays things on your TV and opens them on your laptop, reads a chess board, whispers answer points in interviews and remembers what matters, in Hindi, English or a mix of both. Works with Gemini, Claude, ChatGPT and DeepSeek, free to run.',
      link: 'https://github.com/raunakpatil/smart-glasses-ai-agent',
      demo: 'https://youtu.be/EHEmLr-u0OI', demoText: 'Watch the launch film ↗',
    },
    {
      title: 'Ronie Pocket: Offline AI on Your Phone', aka: ['Ronie Pocket'], category: 'App', year: 2026, image: 'img/projects/ronie-pocket.webp', imageMobile: 'img/projects/ronie-pocket-mobile.webp', tunnelImage: 'img/tunnel/ronie-pocket.webp', tunnelImageMobile: 'img/tunnel/ronie-pocket-mobile.webp',
      colors: ['#8b5cff', '#ff2bd6'],
      tags: ['Kotlin', 'Jetpack Compose', 'llama.cpp', 'Gemma 4', 'Vulkan', 'Stable Diffusion'],
      description: 'An AI assistant and image generator that runs entirely on your phone: Gemma 4 on the phone\'s own GPU through llama.cpp and Vulkan, ready in about 5 seconds, with on-device drawing, voice, encrypted memory, reminders and tools, and optional private web search. No account, no cloud, no tracking, and it works in flight mode.',
      link: 'https://github.com/raunakpatil/ronie-pocket-offline-mobile-ai',
      demo: 'https://github.com/raunakpatil/ronie-pocket-offline-mobile-ai/releases/latest', demoText: 'Download the APK ↗',
    },
    {
      title: 'Radar: Best AI Tools', aka: ['Radar', 'Best AI Tools on the Radar'], category: 'Website', year: 2026, image: 'img/projects/radar.webp', imageMobile: 'img/projects/radar-mobile.webp', tunnelImage: 'img/tunnel/radar.webp', tunnelImageMobile: 'img/tunnel/radar-mobile.webp',
      colors: ['#ff7a1a', '#7cc4ff'],
      tags: ['JavaScript', 'Cloudflare Workers', 'Workers AI', 'GitHub Actions', 'SEO', 'Open data'],
      description: 'The best AI tools on the radar, updated every week: 6,300+ AI tools ranked by category, a Top 50 and new releases, plus the latest AI news and the open models trending on Hugging Face. Ask it what you need in plain words and it suggests the tools that fit, even with typos. Rebuilt twice a week by GitHub Actions, with 1,200 pages for search engines and an open list on GitHub.',
      link: 'https://github.com/raunakpatil/best-ai-tools', linkText: 'See the list on GitHub ↗',
      demo: '#radar', demoText: 'Open Radar →',
    },
    {
      title: 'Zeul: Wallpaper App', aka: ['Zeul'], category: 'App', year: 2026, image: 'img/projects/zeul.webp', imageMobile: 'img/projects/zeul-mobile.webp', tunnelImage: 'img/tunnel/zeul.webp', tunnelImageMobile: 'img/tunnel/zeul-mobile.webp', colors: ['#eb6834', '#111111'],
      tags: ['Kotlin', 'Jetpack Compose', 'Supabase', 'Edge Functions', 'Android'],
      description: 'A free, open-source Android wallpaper app: hand-picked HD and AMOLED wallpapers, a For You feed that learns your style, search with colour filters, community uploads with built-in moderation, and an auto wallpaper changer, in a soft, tactile UI with a hamster mascot. Open source (GPL-3.0).',
      link: 'https://github.com/raunakpatil/ZeulWallpaperApp',
      demo: 'https://github.com/raunakpatil/ZeulWallpaperApp/releases/latest', demoText: 'Download the APK ↗',
    },
    {
      title: 'YouTube Agentic AI Studio', category: 'AI Agents', year: 2026, image: 'img/projects/youtube-agentic-ai-studio.webp', imageMobile: 'img/projects/youtube-agentic-ai-studio-mobile.webp', tunnelImage: 'img/tunnel/youtube-agentic-ai-studio.webp', tunnelImageMobile: 'img/tunnel/youtube-agentic-ai-studio-mobile.webp', colors: ['#c6f432', '#7c5cff'],
      tags: ['Python', 'Gemini', 'LangChain', 'Edge TTS', 'YouTube API'],
      description: 'A 100% free AI pipeline that researches, scripts, narrates, animates and auto-uploads faceless YouTube videos, one command, zero cost per video. 96★ on GitHub.',
      link: 'https://github.com/raunakpatil/youtube-agentic-ai-studio',
    },
    {
      title: 'ResRescue', category: 'App', year: 2026, image: 'img/projects/resrescue.webp', imageMobile: 'img/projects/resrescue-mobile.webp', tunnelImage: 'img/tunnel/resrescue.webp', tunnelImageMobile: 'img/tunnel/resrescue-mobile.webp', colors: ['#7c5cff', '#22d3ee'],
      tags: ['React 18', 'Electron', 'Gemini API', 'Vite', 'Tailwind'],
      description: 'A free AI-powered desktop app that scrapes jobs, rewrites your resume to beat Applicant Tracking Systems, finds skill gaps, writes cover letters and exports pixel-perfect PDF & DOCX.',
      link: 'https://github.com/raunakpatil/Resrescue-ats-resume-optimizer',
    },
    {
      title: 'TriviaFlux', category: 'App', year: 2026, image: 'img/projects/triviaflux.webp', imageMobile: 'img/projects/triviaflux-mobile.webp', tunnelImage: 'img/tunnel/triviaflux.webp', tunnelImageMobile: 'img/tunnel/triviaflux-mobile.webp', colors: ['#ff4fd8', '#22d3ee'],
      tags: ['Next.js 15', 'TypeScript', 'Firebase', 'Genkit'],
      description: 'An AI-powered trivia game with Genkit-generated questions, four game modes, real-time leaderboards, a cyberpunk UI and a full Android APK release.',
      link: 'https://github.com/raunakpatil/triviaflux',
    },
    {
      title: 'Titanic Survival Predictor', category: 'Dashboard', year: 2026, image: 'img/projects/titanic-survival-predictor.webp', imageMobile: 'img/projects/titanic-survival-predictor-mobile.webp', tunnelImage: 'img/tunnel/titanic-survival-predictor.webp', tunnelImageMobile: 'img/tunnel/titanic-survival-predictor-mobile.webp', colors: ['#3b82f6', '#5eead4'],
      tags: ['XGBoost', 'SHAP', 'Streamlit', 'Plotly'],
      description: 'An interactive ML explainability dashboard: survival prediction, passenger search, a fairness audit and model insights powered by XGBoost and SHAP.',
      link: 'https://github.com/raunakpatil/titanic-survival-predictor',
      demo: 'https://titanic-survival-predictor-raunak.streamlit.app/', demoText: 'Try the live demo ↗',
    },
    {
      title: 'Interdimensional Cable', category: 'Website', year: 2026, image: 'img/projects/interdimensional-cable.webp', imageMobile: 'img/projects/interdimensional-cable-mobile.webp', tunnelImage: 'img/tunnel/interdimensional-cable.webp', tunnelImageMobile: 'img/tunnel/interdimensional-cable-mobile.webp', colors: ['#4ade80', '#a78bfa'],
      tags: ['Vanilla JS', 'Canvas', 'Web Audio API', 'YouTube API'],
      description: 'A nostalgic analog-TV simulator inspired by Rick and Morty, no algorithm, no grid, just a non-stop stream of curated rabbit holes behind a CSS CRT and a 60fps canvas static engine.',
      link: 'https://raunakpatil.github.io/InterdimentionalCable/',
    },
  ],

  /* Library page, case studies — shown as standing 3D books. Built from the experience highlights
     on your GitHub README.
       spine      — spine colour; ink = spine text colour; coverInk = title colour on the cover
       coverTitle — short title printed on the generated cover
       cover      — cover art (3:4, e.g. 900×1200; WebP keeps it small). Until that file exists,
                    a generated cover is shown instead — just save your image at this path. */
  caseStudies: [
    {
      title: 'Auditing RAG systems to cut hallucinations', coverTitle: 'Fewer Hallucinations', year: 2025,
      spine: '#e8553b', ink: '#fff4ec', coverInk: '#d8432a', colors: ['#f6b9c4', '#2f6b3a'], cover: 'img/covers/rag-hallucinations.webp',
      tags: ['RAG', 'Generative AI', 'Evaluation'],
      description: 'Audited RAG-based NLP and Generative AI systems, tracing hallucinations back to their sources and improving dataset accuracy by 18%.',
      link: '#',
    },
    {
      title: 'Keeping 14+ multilingual LLM projects on-guideline', coverTitle: 'Fourteen Languages, One Rulebook', year: 2025,
      spine: '#1c1c1c', ink: '#f2f0ea', coverInk: '#1c1c1c', colors: ['#efede6', '#1c1c1c'], cover: 'img/covers/multilingual-llm.webp',
      tags: ['LLM alignment', 'RLHF', 'Team lead'],
      description: 'As Data Controller across 14+ multilingual LLM training projects, held 100% compliance with safety and alignment guidelines while leading a team of 4 reviewers through prompt-response and RLHF datasets.',
      link: '#',
    },
    {
      title: 'A QA framework that made sprints 27% more consistent', coverTitle: '27% More Consistent', year: 2024,
      spine: '#2f6fd6', ink: '#f6e27a', coverInk: '#f6e27a', colors: ['#3a78dd', '#f28c38'], cover: 'img/covers/qa-framework.webp',
      tags: ['Power BI', 'Quality', 'Agile'],
      description: 'Built Power BI QA tracking that made reviewer output measurable sprint over sprint, and lifted consistency by 27%.',
      link: '#',
    },
    {
      title: 'From clusters to conversions', coverTitle: 'From Clusters to Conversions', year: 2021,
      spine: '#f2e58c', ink: '#2b3fa8', coverInk: '#2b3fa8', colors: ['#f8e1e4', '#2b3fa8'], cover: 'img/covers/clusters-conversions.webp',
      tags: ['K-Means', 'DBSCAN', 'Predictive ML'],
      description: 'Customer segmentation with K-Means and DBSCAN drove a 27% increase in conversions; behaviour analysis lifted engagement 36%; predictive-maintenance models cut downtime 15%.',
      link: '#',
    },
  ],

  /* Certificates & courses — books on the Library's second shelf, like the case studies.
     `short` is the title on the cover and spine; spine / ink / coverInk / colors are the book's colours; the cover window
     shows `photo` (a picture in img/certs/) or `logo` (an issuer's emblem, in img/logos/) — unless `cover` (a full
     cover in img/covers/) replaces the lot. Opening a book shows the
     one-line `brief`, the skills and the credential id — over `scan` (a picture of the actual certificate, in
     img/certs/scans/) if there is one, else over the book's cover.
     url: link for "Show credential" (leave '' to hide the link). */
  certifications: [
    { short: 'RAG: Retrieval-augmented generation', cover: 'img/covers/cert-rag.webp', spine: '#2b3fa8', ink: '#f2f0ea', coverInk: '#2b3fa8', colors: ['#dfe6f5', '#2b3fa8'], brief: 'How retrieval-augmented generation works: embeddings and vector databases, retrieval, building RAG pipelines and keeping hallucinations in check.', title: 'RAG: Retrieval-augmented generation', issuer: 'Great Learning', date: 'Oct 2026', id: 'SUYFCKKU', skills: ['RAG Pipelines', 'Embeddings & Vector DBs', 'Information Retrieval', 'LLMs & Prompting'], url: 'https://www.mygreatlearning.com/certificate/SUYFCKKU' },
    { short: 'Generative AI & LLMs', cover: 'img/covers/cert-gen-ai.webp', spine: '#e8553b', ink: '#fff4ec', coverInk: '#1c1c1c', colors: ['#f6e27a', '#e8553b'], photo: 'img/certs/generative-ai.webp', brief: 'How transformer models and large language models work, and how to put them to work.', title: 'Generative AI: Working with Large Language Models', issuer: 'LinkedIn Learning', date: 'Apr 2026', skills: ['Transformer Models', 'NLP', 'LLMs'], url: 'https://www.linkedin.com/in/raunakpatil/details/certifications/' },
    { short: 'Agentic AI', cover: 'img/covers/cert-agentic-ai.webp', spine: '#1c1c1c', ink: '#f2f0ea', coverInk: '#f2f0ea', colors: ['#1c1c1c', '#ff7a1a'], photo: 'img/certs/agentic-ai.webp', brief: 'Architectures and frameworks for AI agents that plan, use tools and act on their own.', title: 'Agentic AI Fundamentals: Architectures, Frameworks, and Applications', issuer: 'LinkedIn Learning', date: 'Apr 2026', skills: ['AI Agents', 'Agentic AI', 'AI Frameworks'], url: 'https://www.linkedin.com/in/raunakpatil/details/certifications/' },
    { short: 'AI in Project Management', cover: 'img/covers/cert-ai-pm.webp', spine: '#2f6fd6', ink: '#f6e27a', coverInk: '#f6e27a', colors: ['#2f6fd6', '#f6e27a'], photo: 'img/certs/ai-project-management.webp', brief: 'Using AI to plan, track and steer projects.', title: 'AI in Project Management', issuer: 'LinkedIn Learning', date: 'Apr 2026', skills: ['AI for Business', 'Project Management', 'AI'], url: 'https://www.linkedin.com/in/raunakpatil/details/certifications/' },
    { short: 'DIAT · AI Professional', scan: 'img/certs/scans/diat.webp', cover: 'img/covers/cert-diat.webp', spine: '#2f6b3a', ink: '#f2f0ea', coverInk: '#2f6b3a', colors: ['#efede6', '#2f6b3a'], logo: 'img/logos/drdo.webp', brief: "AI and machine learning, deep neural networks and SQL, certified by DRDO's defence institute.", title: 'DIAT Certified Artificial Intelligence Professional', issuer: 'Defence Institute of Advanced Technology (DIAT), DRDO', date: 'Jul 2021', id: 'OTCC/AIML/B2/2021/1145', skills: ['SQL', 'Deep Neural Networks', 'AI / ML'], url: '' },
    { short: 'Python for AI', cover: 'img/covers/cert-python-ai.webp', spine: '#f2e58c', ink: '#2b3fa8', coverInk: '#2b3fa8', colors: ['#f2e58c', '#2b3fa8'], photo: 'img/certs/python-for-ai.webp', brief: 'Python programming for AI work.', title: 'Python: Python Programming for Artificial Intelligence', issuer: 'Datai Team', date: 'Aug 2021', id: 'UC-13e67c75-000f-4b88-ae98-24036e560021', skills: ['Python', 'AI'], url: 'https://www.udemy.com/certificate/UC-13e67c75-000f-4b88-ae98-24036e560021/' },
    { short: 'NIELIT · Python', cover: 'img/covers/cert-nielit.webp', spine: '#f6b9c4', ink: '#1c1c1c', coverInk: '#1c1c1c', colors: ['#f8e1e4', '#e8553b'], logo: 'img/logos/nielit.webp', brief: "Certified programming in Python from India's national IT institute.", title: 'NIELIT Certified Programming in Python', issuer: 'National Institute of Electronics & IT (NIELIT)', date: 'Jul 2021', id: 'HDO01242', skills: ['Python'], url: '' },
    { short: 'Elements of AI', cover: 'img/covers/cert-elements-ai.webp?v=2', spine: '#ff7a1a', ink: '#1c1c1c', coverInk: '#1c1c1c', colors: ['#f3efe6', '#ff7a1a'], logo: 'img/logos/helsinki.svg', brief: "The basics of AI: what it is, what it can and can't do, and how it learns.", title: 'Elements of AI: Introduction to AI', issuer: 'University of Helsinki', date: 'Jul 2021', skills: ['AI fundamentals'], url: 'https://www.elementsofai.com/' },
  ],

  /* My Profile page (open it from the menu, or go to #profile). */
  profile: {
    // Top row: four cards, each with an icon, a short line, tags and a big title.
    traits: [
      { icon: 'chip', title: 'Rooted in Electronics', text: 'From signals and embedded systems in Nagpur to models and data, I like understanding a system from the hardware up.', tags: ['Signal Processing', 'Embedded Systems', 'Edge AI'] },
      { icon: 'code', title: 'Curiosity = Code', text: 'I turn ideas into working tools, free desktop apps, agent pipelines and games, shipped end to end.', tags: ['Python', 'React', 'Electron', 'Next.js'] },
      { icon: 'shield', title: 'AI Quality Engineer', text: 'In a world of confident models, I make them trustworthy, auditing RAG systems, evaluating LLMs and building RLHF quality frameworks.', tags: ['RAG', 'RLHF', 'LLM Evaluation'] },
      { icon: 'people', title: 'People', text: 'I lead reviewers, work across English, Hindi and Marathi, and like making complex AI make sense to everyone.', tags: ['Team Lead', 'Multilingual', 'Communicator'] },
    ],
    // Flip card. Front: radar of self-assessed traits (0–100) + goals. Back: photo, quote, mindset.
    persona: {
      traits: [
        { label: 'Analytical', value: 90 },
        { label: 'Curious', value: 95 },
        { label: 'Detail-focused', value: 88 },
        { label: 'Collaborative', value: 78 },
        { label: 'Builder', value: 85 },
      ],
      goal: ['Builds AI people can trust', 'Finds signal in the noise', 'Ships tools that are free for everyone'],
      role: 'AI Engineer · Open to work',
      photo: 'img/profile.webp',
      quote: 'The best AI system is one that knows what it doesn\'t know.',
      mindset: ['Learns best by building', 'Measures before guessing', 'Treats edge cases as the real test'],
    },
    // Right column. These are measured results from your experience.
    // To show LinkedIn recommendations instead, use { title: 'Their role', sub: 'Company', text: '"Their words…"' }.
    highlightsTitle: 'Impact',
    highlights: [
      { title: '+18% dataset accuracy', sub: 'RAG auditing · Sigma AI', text: 'Traced hallucinations in RAG-based NLP and Generative AI systems back to their sources.' },
      { title: '14+ multilingual LLM projects', sub: 'Data Controller · Sigma AI', text: 'Held 100% compliance with safety and alignment guidelines while leading a team of 4 reviewers.' },
      { title: '27% more consistent sprints', sub: 'Power BI QA framework', text: 'Made reviewer output measurable sprint over sprint across Agile teams.' },
      { title: '15% less downtime', sub: 'Predictive maintenance · Zummit Infolabs', text: 'Python ML models built through feature engineering and model iteration.' },
    ],
  },

  /* R.O.N.I.E. ("Ronie") — Raunak's Own Neural Intelligence Engine: the assistant that opens when
     someone clicks "Hello Stranger".
     Each step: `say` (one line is picked at random), then either `choices`, an `input`,
     or `next` (auto-continues). `progress` fills the bar (0–1).
     {name} is replaced with the visitor's name once they've given it.
     Choices: `to` = next step, `href` = go to a page/link, `set` = remember an answer.
     Steps with `send: 'hire' | 'word'` open the visitor's email app, addressed to `email`. */
  assistant: {
    name: 'Ronie', // R.O.N.I.E. — Raunak's Own Neural Intelligence Engine
    chatUrl: 'https://ronie-chat.ronie-chat.workers.dev/chat', // Ronie's chat worker (see worker/); '' = chat off
    email: 'raunakpatil15@gmail.com',
    model: {
      src: 'models/rai-robot.glb',
      credit: 'Sci-fi O.B. Robot Unit TH-ICC02 (animated)',
      creditUrl: 'https://sketchfab.com/3d-models/sci-fi-ob-robot-unit-th-icc02-animated-6c0764c2bc4c4aaa8e03ba1653f455a6',
      author: 'Jungle Jim',
      authorUrl: 'https://sketchfab.com/jungle_jim',
      license: 'CC BY 4.0',
      licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    },
    start: 'intro',
    steps: {
      intro: {
        progress: 0.05, next: 'your-name', skipIfName: 'welcome-back', face: 'happy', icon: 'sparkle',
        say: [
          "Hi {visitor}, I'm R.O.N.I.E., Raunak's Own Neural Intelligence Engine. Ronie, to friends.",
          "Oh! A visitor. I'm Ronie, Raunak's Own Neural Intelligence Engine. I basically run this place.",
          "Beep. Boop. Kidding, I'm Ronie, Raunak's Own Neural Intelligence Engine, and I'm fully awake now.",
          "Sorry, I was in sleep mode. Very deep sleep mode. I'm Ronie, Raunak's Own Neural Intelligence Engine.",
          "Whoa, that was a big jump. Hi! I'm Ronie, short for Raunak's Own Neural Intelligence Engine. Long name, small robot.",
          "System check: lights on, fans spinning, dignity mostly intact. Hello, {visitor}! I'm Ronie.",
          "Oh, hi {visitor}. You caught me napping. I'm R.O.N.I.E., Raunak's Own Neural Intelligence Engine, and I was definitely not drooling coolant.",
          "Rebooting charm module… done. Hi, I'm Ronie, Raunak's Own Neural Intelligence Engine. I know everything about him. It's a little awkward.",
          "Hello! I'm Ronie. Raunak built me to talk about him, which sounds vain, but I volunteered.",
          "Hi {visitor}! I'm Ronie, Raunak's Own Neural Intelligence Engine. Think of me as his tour guide, with more blinking.",
          "Good timing, I just finished updating myself. Hi, I'm Ronie, Raunak's Own Neural Intelligence Engine.",
        ],
      },
      greeting: {
        progress: 0.12,
        say: [
          "Finally, some company. Talking to my own logs was getting weird. What can I do for you?",
          "You have questions. I have… mostly answers. Pick one.",
          "I've cleared my calendar. Well, I don't have one. But still, how can I help?",
          "Speak, and the model shall respond. Accurately. Raunak checks.",
          "Neural engine warm, opinions fully loaded. What brings you here?",
        ],
        choices: [
          { label: 'Work with Raunak', to: 'hire-intro', set: { goal: 'hire' } },
          { label: 'Ask me anything', to: 'ask' },
          { label: 'Get to know him', to: 'story-menu' },
          { label: 'Drop a quick word', to: 'word-message', set: { goal: 'word' } },
          { label: 'Show me his work', to: 'work' },
        ],
      },

      // ---------- work with Raunak ----------
      'hire-intro': {
        progress: 0.2, next: 'hire-name',
        say: [
          "Ooh, an opportunity. Let me grab my notepad. It's imaginary, but it's very organised.",
          "A collaboration? Now we're talking. Raunak will be thrilled, I'll act casual.",
          "Excellent taste. Let's get you on his radar.",
        ],
      },
      'hire-name': {
        progress: 0.3, next: 'hire-post-name',
        input: { name: 'name', label: 'Your name', type: 'text' },
        say: [
          "First things first, who am I talking to?",
          "Let's not be strangers. What's your name?",
          "Name, please. I need something to say dramatically when I tell Raunak about this.",
        ],
      },
      'hire-post-name': {
        progress: 0.35, next: 'hire-company',
        say: [
          "Nice to meet you, {name}. I'll remember that. Probably.",
          "{name}. Strong name. Main-character energy.",
          "Got it, {name}. We're officially on a first-name basis.",
        ],
      },
      'hire-company': {
        progress: 0.45, next: 'hire-type',
        input: { name: 'company', label: 'Company or team', type: 'text', optional: true },
        say: [
          "Where are you reaching out from? Company, team, secret lab, all welcome.",
          "Which company or team are you with? You can skip this if it's top secret.",
        ],
      },
      'hire-type': {
        progress: 0.55,
        say: [
          "What kind of thing are we talking about?",
          "Give it to me straight, what's the mission?",
          "So what are we building? A team? A model? A miracle?",
        ],
        choices: [
          { label: 'A full-time role', to: 'hire-brief', set: { kind: 'A full-time role' } },
          { label: 'Contract / freelance', to: 'hire-brief', set: { kind: 'Contract / freelance work' } },
          { label: 'AI quality or LLM evaluation', to: 'hire-brief', set: { kind: 'An AI quality / LLM evaluation project' } },
          { label: 'Something else', to: 'hire-brief', set: { kind: 'Something else' } },
        ],
      },
      'hire-brief': {
        progress: 0.7, next: 'hire-email',
        input: { name: 'brief', label: 'A few lines about it', type: 'text', multiline: true },
        say: [
          "Tell me a little about it. A few lines is perfect, I'll do the rest.",
          "What's the story? The more context, the better Raunak's reply.",
        ],
      },
      'hire-email': {
        progress: 0.85, next: 'hire-processing',
        input: { name: 'email', label: 'Your email', type: 'email' },
        say: [
          "And where should Raunak reply?",
          "Last thing, your email, so he can get back to you.",
          "Email, please. I promise not to sign you up for my newsletter. I don't have one. Yet.",
        ],
      },
      'hire-processing': {
        progress: 0.95, next: 'hire-completion', send: 'hire',
        say: [
          "Drafting… formatting… adding exactly one polite exclamation mark…",
          "Compiling your message. Running a hallucination check. Clean.",
        ],
      },
      'hire-completion': {
        progress: 1,
        say: [
          "Done! Your email app should be open with everything filled in, just hit send.",
          "Your email is drafted and waiting. One click on send and it's in Raunak's inbox.",
        ],
        choices: [
          { label: 'Open the email again', send: 'hire' },
          { label: 'Get to know him', to: 'story-menu' },
          { label: 'Back to the start', to: 'greeting' },
        ],
      },

      // ---------- quick word ----------
      'word-message': {
        progress: 0.4, next: 'word-email',
        input: { name: 'message', label: 'Your message', type: 'text', multiline: true },
        say: [
          "Go on, what's on your mind?",
          "Short and sweet, I'm all ears. Metaphorically.",
          "Type away. I'll pass it on word for word.",
        ],
      },
      'word-email': {
        progress: 0.75, next: 'word-processing',
        input: { name: 'email', label: 'Your email', type: 'email' },
        say: [
          "Where should he reply?",
          "And your email, so this doesn't become a one-way conversation.",
        ],
      },
      'word-processing': {
        progress: 0.95, next: 'word-completion', send: 'word',
        say: ["Packaging your message with care…", "Folding it into a nice little email…"],
      },
      'word-completion': {
        progress: 1,
        say: [
          "Your email app is open with your note, hit send and you're done.",
          "Drafted and ready. Press send and Raunak's on it.",
        ],
        choices: [
          { label: 'Open the email again', send: 'word' },
          { label: 'Get to know him', to: 'story-menu' },
          { label: 'Back to the start', to: 'greeting' },
        ],
      },

      // ---------- his work ----------
      work: {
        progress: 0.5,
        say: ["Straight to the good stuff. Where to?", "Pick a door. They all lead somewhere impressive."],
        choices: [
          { label: 'Projects', href: '#projects' },
          { label: 'His library', href: '#library' },
          { label: 'His profile', href: '#profile' },
          { label: 'Back', to: 'greeting' },
        ],
      },

      // ---------- get to know him ----------
      // the conversation starts by asking the visitor's name (remembered on this device), then it's a free chat
      'your-name': {
        progress: 0.15, next: 'ask', skipIfName: 'welcome-back', face: 'curious', icon: 'question',
        input: { name: 'name', label: 'Your name', type: 'text' },
        say: [
          "Before we start, what should I call you?",
          "First things first: who am I talking to?",
          "I'm terrible with names. Mostly because nobody tells me theirs. What's yours?",
          "What's your name? I'll remember it. That's my one party trick.",
          "Quick question before the big ones: what do I call you?",
          "Let's do introductions properly. You know my name, what's yours?",
        ],
      },
      // a returning visitor: one line instead of the intro, then straight to the chat (it shares ask's settings)
      'welcome-back': {
        progress: 0.3, chat: true, face: 'love', icon: 'heart',
        say: [
          "Wait, {name}? You came back! I'm… not crying. That's coolant. Ask me anything about Raunak.",
          "{name}! Welcome back. I kept your seat warm, well, my fans did. What do you want to know about Raunak?",
          "Oh, hi {name}. I remembered your name. I've been practising. Ask away about Raunak.",
          "{name}! You're back. I'd hug you, but I'm mostly sharp edges. So, what about Raunak?",
          "Look who it is, {name}! My memory banks lit up. Literally, check my chest. Ask me anything about him.",
          "Hey {name}. I told the other robots you'd come back. There are no other robots. Still, I was right. What shall we talk about?",
          "Welcome back, {name}. Pick up where we left off, or start fresh, ask me anything about Raunak.",
        ],
      },
      // free chat: questions go to a small AI model (worker/), grounded only in this file's facts
      ask: {
        progress: 0.3, chat: true, face: 'happy', icon: 'speech',
        say: [
          "Right, {name}. Ask me anything about Raunak, his work, projects, skills, or how to reach him.",
          "Okay {name}, ask me anything about him. I've read everything he's written. Twice.",
          "So, {name} – questions about Raunak? Fire away. I'll answer as honestly as a robot can.",
          "Alright {name}, I'm all yours. Ask me about Raunak, work, projects, skills, anything.",
          "Go ahead, {name}. Ask me anything about Raunak. I promise to only overshare a little.",
          "Okay {name}, the floor is yours. What do you want to know about him?",
        ],
        fallback: "Sorry {name}, my chat brain is taking a nap right now (free-tier robots need sleep too). Try again in a bit, or email Raunak at {email}.",
        quota: "Okay, confession, {name}: I've talked so much today that I've used up my free brain juice. I recharge overnight, or email Raunak at {email}.",
        // tap-to-ask questions under the box, for anyone who'd rather not type (shown two at a time, best first)
        suggest: [
          'What has he built?',
          'Is he open to new roles?',
          'What does Raunak do?',
          "What's his tech stack?",
          'Where has he worked?',
          'Why should I hire him?',
          'What did he study?',
          'How do I contact him?',
          'Tell me a fun fact about him',
        ],
      },

      'story-menu': {
        progress: 0.2,
        say: [
          "What do you want to know? I have opinions on all of it.",
          "Pick a topic. I've read his entire LinkedIn. Twice.",
          "Where should we start?",
        ],
        choices: [
          { label: 'His journey', to: 'journey-1' },
          { label: 'What he builds', to: 'builds-1' },
          { label: 'How he works', to: 'works-1' },
          { label: 'Fun facts', to: 'facts-1' },
          { label: 'Back to the start', to: 'greeting' },
        ],
      },
      'journey-1': { progress: 0.25, story: 'journey-2', say: ["It started in Nagpur, with a degree in Electrical, Electronics and Communications Engineering at GH Raisoni University."] },
      'journey-2': { progress: 0.4, story: 'journey-3', say: ["Signals and circuits by day… and a growing obsession with machine learning by night."] },
      'journey-3': { progress: 0.55, story: 'journey-4', say: ["In 2021 he joined Zummit Infolabs in Bengaluru as a Junior Data Scientist. His models cut equipment downtime by 15%."] },
      'journey-4': { progress: 0.7, story: 'journey-5', say: ["Then the UK: an MSc in Data Science & AI at the University of Liverpool, with a dissertation on multi-agent reinforcement learning."] },
      'journey-5': { progress: 0.85, story: 'story-done', say: ["Most recently he was an AI Quality Engineer at Sigma AI in London, making large language models more trustworthy. Now he's back in Nagpur, and open to work."] },
      'builds-1': { progress: 0.3, story: 'builds-2', say: ["He builds free tools. Like ResRescue, a desktop app that rewrites résumés to get past applicant tracking systems."] },
      'builds-2': { progress: 0.5, story: 'builds-3', say: ["And a YouTube Agentic AI Studio that researches, scripts, narrates and uploads videos on its own. 96 stars on GitHub."] },
      'builds-3': { progress: 0.7, story: 'builds-4', say: ["There's TriviaFlux, an AI trivia game, and a Titanic survival predictor that explains its own decisions with SHAP."] },
      'builds-4': { progress: 0.85, story: 'story-done', say: ["And Interdimensional Cable, a retro TV that streams random rabbit holes. The man has range."] },
      'works-1': { progress: 0.3, story: 'works-2', say: ["At Sigma AI he audited RAG systems, tracing hallucinations back to their source. Dataset accuracy went up 18%."] },
      'works-2': { progress: 0.5, story: 'works-3', say: ["He's been data controller on 14+ multilingual LLM projects, with 100% compliance on safety and alignment guidelines."] },
      'works-3': { progress: 0.7, story: 'works-4', say: ["He led a team of four reviewers on RLHF datasets, and built Power BI tracking that made the team 27% more consistent."] },
      'works-4': { progress: 0.85, story: 'story-done', say: ["His rule of thumb: the best AI system is one that knows what it doesn't know. I'm working on it."] },
      'facts-1': { progress: 0.3, story: 'facts-2', say: ["He speaks English, Hindi and Marathi. And Python. Fluently."] },
      'facts-2': { progress: 0.5, story: 'facts-3', say: ["He's a DIAT-certified Artificial Intelligence Professional, that's the Defence Institute of Advanced Technology."] },
      'facts-3': { progress: 0.7, story: 'facts-4', say: ["He runs a YouTube channel, Eldritch Lore, where an AI pipeline does the heavy lifting."] },
      'facts-4': { progress: 0.85, story: 'story-done', say: ["He built this whole website. Including me. I'm still deciding how I feel about that."] },
      'story-done': {
        progress: 1,
        say: ["Want to hear about something else?", "There's more where that came from. Pick another?", "Not bad for one human, right? What next?"],
        choices: [
          { label: 'His journey', to: 'journey-1' },
          { label: 'What he builds', to: 'builds-1' },
          { label: 'How he works', to: 'works-1' },
          { label: 'Fun facts', to: 'facts-1' },
          { label: 'Work with Raunak', to: 'hire-intro', set: { goal: 'hire' } },
        ],
      },
    },
    // the guessing game (like Akinator): the visitor thinks of someone or something, Ronie asks and guesses
    game: {
      // the invite under the chat
      offer: { kicker: 'Mini game · 20 questions or so', title: 'Want me to read your mind?', sub: "Think of anyone, real or fictional. I'll guess who." },
      first: 'Is it a real person, not a fictional character?',
      intro: [
        "Okay {name}: think of a famous person, a character, an animal or a thing. Don't tell me. I'll read your mind. With questions. Ready?",
        "Game time! Think of someone or something famous, real or fictional. I'll guess it. Probably. Ready?",
      ],
      win: [
        "I knew it! I mean, I calculated it. Same thing. Another round, {name}?",
        "Yes! Mind: read. Fans: spinning with joy. Again?",
        "Got it! Don't tell Raunak, but that was my favourite part of today.",
      ],
      lose: [
        "Okay, you beat me, {name}. My circuits are humbled. Who was it?",
        "I give up. That's… not something I say often. Who were you thinking of?",
      ],
      reveal: [
        "{answer}! Of course. I was one question away. Probably. Rematch?",
        "{answer}?! That's… fine. That's fine. I'm fine. Rematch?",
      ],
      fallback: "My guessing brain just went to sleep, {name}. Let's try again in a bit.",
      quota: "I've played so much today that my free brain juice ran out, {name}. Rematch tomorrow?",
    },
  },
};

// the welcome-back line opens the chat too: it takes ask's suggestions and messages (its own lines, face and icon win)
{ const S = window.PORTFOLIO.assistant.steps; S['welcome-back'] = { ...S.ask, ...S['welcome-back'] }; }

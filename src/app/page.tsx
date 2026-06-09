import { UniverseCanvas } from '@/components/webgl/UniverseCanvas'
import { Act1_TheQuestion } from '@/components/acts/Act1_TheQuestion'
import { Act2_TheBeginning } from '@/components/acts/Act2_TheBeginning'
import { Act3_DiscoveringCode } from '@/components/acts/Act3_DiscoveringCode'
import { Act4_Patterns } from '@/components/acts/Act4_Patterns'
import { Act4_Obsession } from '@/components/acts/Act4_Obsession'
import { Act5_SigmaAI } from '@/components/acts/Act5_SigmaAI'
import { Act5_ProjectsTransition } from '@/components/acts/Act5_ProjectsTransition'
import { ProjectScene } from '@/components/acts/ProjectScene'
import { Project_YoutubeAgent } from '@/components/acts/Project_YoutubeAgent'
import { Act6_Growth } from '@/components/acts/Act6_Growth'
import { Act7_Philosophy } from '@/components/acts/Act7_Philosophy'
import { Act8_TheFuture } from '@/components/acts/Act8_TheFuture'
import { fetchGithubData } from '@/lib/github'
import { GlobalHeader } from '@/components/GlobalHeader'

import { Project_ResRescue } from '@/components/acts/Project_ResRescue'
import { Project_Titanic } from '@/components/acts/Project_Titanic'
import { Project_TriviaFlux } from '@/components/acts/Project_TriviaFlux'
import { Project_Interdimensional } from '@/components/acts/Project_Interdimensional'

export default async function Home() {
  const repos = await fetchGithubData('raunakpatil')

  return (
    <main className="relative w-full bg-transparent">
      <GlobalHeader />
      <UniverseCanvas repos={repos} />
      
      {/* The Cinematic Sequence (Overlay) */}
      <div className="relative z-10 pointer-events-none">
        
        {/* Intro */}
        <Act1_TheQuestion />
        <Act2_TheBeginning />
        <Act3_DiscoveringCode />
        <Act4_Patterns />
        <Act4_Obsession />
        <Act5_SigmaAI />
        <Act5_ProjectsTransition />
        
        {/* Project Ecosystems */}
        <div className="pointer-events-auto flex flex-col items-center justify-center">
          {repos.map((repo, i) => {
            if (repo.name === 'youtube-agentic-ai-studio') {
              return <Project_YoutubeAgent key={repo.id} repo={repo} index={i} />
            }
            if (repo.name === 'Resrescue-ats-resume-optimizer') {
              return <Project_ResRescue key={repo.id} repo={repo} index={i} />
            }
            if (repo.name === 'titanic-survival-predictor') {
              return <Project_Titanic key={repo.id} repo={repo} index={i} />
            }
            if (repo.name === 'triviaflux') {
              return <Project_TriviaFlux key={repo.id} repo={repo} index={i} />
            }
            if (repo.name === 'InterdimentionalCable') {
              return <Project_Interdimensional key={repo.id} repo={repo} index={i} />
            }
            
            return <ProjectScene key={repo.id} repo={repo} index={i} />
          })}
        </div>

        {/* Conclusion */}
        <Act7_Philosophy />
        <div className="pointer-events-auto">
          <Act8_TheFuture />
        </div>
      </div>
    </main>
  )
}

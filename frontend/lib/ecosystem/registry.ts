import { VulnerabilityScanner } from '../security/vulnerabilityScanner';
import { TalentEngine } from '../hiring/talentEngine';
import { RenderEngine } from '../graphics/renderEngine';
import { IslandEngine } from '../community/islandEngine';

const scanner = new VulnerabilityScanner();
const talent = new TalentEngine();
const renderer = new RenderEngine();
const island = new IslandEngine();

export const EcosystemRegistry = {
  tech: {
    scan: (dir: string) => scanner.scanDirectory(dir),
    generateCode: (prompt: string, ctx: string) => scanner.generateSecureCode(prompt, ctx),
    label: 'CyberGuard AI (ORCA Internal)'
  },
  marketing: {
    generateVoice: (text: string) => renderer.generateAudio(text),
    renderVideo: (config: any) => renderer.renderVideo(config),
    label: 'Render.AI (ORCA Internal)'
  },
  hiring: {
    hunt: (keywords: string[]) => talent.huntEliteTalent(keywords),
    verify: (resume: string, data: string) => talent.verifyCandidate(resume, data),
    label: 'Intuition & The Summit (ORCA Internal)'
  },
  community: {
    findEvents: (goals: string, niche: string) => island.findOpportunities(goals, niche),
    label: 'Island of Relevancy (ORCA Internal)'
  }
}

export type EcosystemService = keyof typeof EcosystemRegistry

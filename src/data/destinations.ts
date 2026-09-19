export interface DestinationData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  routeProgress: number; // 0.0 to 1.0 along the road spine
  side: 'left' | 'right';
  lateralOffset: number; // Distance in units from center of road
  verticalOffset?: number; // Elevation from ground level
  buildingType: 'tower' | 'lab' | 'nexus' | 'hub' | 'pyramid';
  primaryColor: string; // e.g. cyan #06b6d4, purple #a855f7, electric #3b82f6
  accentColor: string;
  tags: string[];
}

export const DESTINATIONS: DestinationData[] = [
  {
    id: 'destination-01',
    title: 'ABOUT US',
    subtitle: 'ARCHITECTURE & MISSION',
    description: 'Discover the foundation of DJSCE ACM — our mission, technical infrastructure, core culture, and vision for computing excellence.',
    category: 'ABOUT',
    routeProgress: 0.18,
    side: 'left',
    lateralOffset: 34,
    buildingType: 'tower',
    primaryColor: '#06b6d4', // Cyan
    accentColor: '#00f0ff',
    tags: ['Architecture', 'Mission', 'Core Culture']
  },
  {
    id: 'destination-02',
    title: 'TEAM',
    subtitle: 'CORE COMMITTEE & LEADERS',
    description: 'Meet the passionate developers, designers, researchers, and organizers powering the DJSCE ACM student chapter.',
    category: 'TEAM',
    routeProgress: 0.36,
    side: 'right',
    lateralOffset: 36,
    buildingType: 'lab',
    primaryColor: '#a855f7', // Purple/Magenta
    accentColor: '#e086ff',
    tags: ['Core Committee', 'Mentors', 'Leadership']
  },
  {
    id: 'destination-03',
    title: 'RESEARCH',
    subtitle: 'AI LABS & INNOVATION',
    description: 'Futuristic experimental lab dedicated to next-generation AI research, web graphics, machine learning, and interactive shaders.',
    category: 'RESEARCH',
    routeProgress: 0.58,
    side: 'left',
    lateralOffset: 38,
    buildingType: 'nexus',
    primaryColor: '#3b82f6', // Electric Blue
    accentColor: '#60a5fa',
    tags: ['AI Research', 'WebGL Shaders', 'R&D Labs']
  },
  {
    id: 'destination-04',
    title: 'EVENTS',
    subtitle: 'GLOBAL SUMMITS & WORKSHOPS',
    description: 'Expansive arena architectural landmark serving as a hub for collaborative hackathons, hands-on workshops, and global computing summits.',
    category: 'EVENTS',
    routeProgress: 0.80,
    side: 'right',
    lateralOffset: 40,
    buildingType: 'hub',
    primaryColor: '#10b981', // Emerald
    accentColor: '#34d399',
    tags: ['Hackathons', 'Workshops', 'Summits']
  }
];

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
    title: 'DESTINATION 01',
    subtitle: 'ADVANCED COMPUTING & TECH',
    description: 'Central landmark hub focusing on technical infrastructure, core algorithms, and scalable 3D systems.',
    category: 'TECHNICAL',
    routeProgress: 0.18,
    side: 'left',
    lateralOffset: 34,
    buildingType: 'tower',
    primaryColor: '#06b6d4', // Cyan
    accentColor: '#00f0ff',
    tags: ['Core Systems', '3D Architecture', 'High Performance']
  },
  {
    id: 'destination-02',
    title: 'DESTINATION 02',
    subtitle: 'CREATIVE & BRAND STRATEGY',
    description: 'Dynamic landmark structure showcasing modern brand experience, digital media, and aesthetic innovations.',
    category: 'MARKETING',
    routeProgress: 0.36,
    side: 'right',
    lateralOffset: 36,
    buildingType: 'lab',
    primaryColor: '#a855f7', // Purple/Magenta
    accentColor: '#e086ff',
    tags: ['Brand Identity', 'Digital Media', 'Campaigns']
  },
  {
    id: 'destination-03',
    title: 'DESTINATION 03',
    subtitle: 'RESEARCH & QUANTUM LABS',
    description: 'Futuristic experimental lab dedicated to next-generation AI research, web graphics, and interactive shaders.',
    category: 'INNOVATION',
    routeProgress: 0.58,
    side: 'left',
    lateralOffset: 38,
    buildingType: 'nexus',
    primaryColor: '#3b82f6', // Electric Blue
    accentColor: '#60a5fa',
    tags: ['AI Research', 'WebGL Shaders', 'R&D']
  },
  {
    id: 'destination-04',
    title: 'DESTINATION 04',
    subtitle: 'COMMUNITY & GLOBAL EVENTS',
    description: 'Expansive arena architectural landmark serving as a hub for collaborative workshops, events, and summits.',
    category: 'COMMUNITY',
    routeProgress: 0.80,
    side: 'right',
    lateralOffset: 40,
    buildingType: 'hub',
    primaryColor: '#10b981', // Emerald
    accentColor: '#34d399',
    tags: ['Global Summits', 'Workshops', 'Hackathons']
  }
];

import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';

export interface LeadRecord {
  id: string;
  listingId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

type LeadMap = Record<string, LeadRecord[]>;

const leadsPath = path.join(process.cwd(), 'src/data/leads.json');

async function readLeadMap() {
  const content = await fs.readFile(leadsPath, 'utf8');
  return JSON.parse(content) as LeadMap;
}

async function writeLeadMap(data: LeadMap) {
  await fs.writeFile(leadsPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function getLeadsByListingId(listingId: string) {
  const leadMap = await readLeadMap();
  return (leadMap[listingId] || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function createLead(input: Omit<LeadRecord, 'id' | 'created_at'>) {
  const leadMap = await readLeadMap();
  const nextLead: LeadRecord = {
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  const listingLeads = leadMap[input.listingId] || [];
  leadMap[input.listingId] = [nextLead, ...listingLeads];
  await writeLeadMap(leadMap);
  return nextLead;
}

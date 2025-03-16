import { Client } from "@gadget-client/quickpulse";
import { Logger } from "gadget-server";

export async function saveAndRefreshQueue(api: Client, logger?: Logger) {
  const users = await api.internal.user.findMany();

  // Group users by phase
  const assessmentUsers = users.filter(u => u.getField("phase") === "ASSESSMENT");
  const consultationUsers = users.filter(u => u.getField("phase") === "CONSULTATION");
  const treatmentUsers = users.filter(u => u.getField("phase") === "TREATMENT");

  logger?.warn("test", users);

  // Common sort function for all phases
  const priorityValues: Record<string, number> = {
    "CRITICAL": 5,
    "HIGH": 4,
    "MEDIUM": 3,
    "LOW": 2,
    "NONE": 1
  };

  const sortUsers = (a, b) => {
    // Sort by priority first (highest first)
    const aPriority = priorityValues[a.getField("priority")] || 0;
    const bPriority = priorityValues[b.getField("priority")] || 0;
    
    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }
    // Then by updated date (oldest first)
    return new Date(a.getField("updatedAt")).getTime() - new Date(b.getField("updatedAt")).getTime();
  };

  // Sort each group
  assessmentUsers.sort(sortUsers);
  consultationUsers.sort(sortUsers);
  treatmentUsers.sort(sortUsers);

  

  for (let i = 0; i < assessmentUsers.length; i++) {
    const user = assessmentUsers[i];
    const phasePosition = i + 1;
    assessmentUsers[i] = await api.internal.user.update(user.id, { phasePosition: phasePosition });
  }

    for (let i = 0; i < consultationUsers.length; i++) {
    const user = consultationUsers[i];
    const phasePosition = i + 1;
    consultationUsers[i] = await api.internal.user.update(user.id, { phasePosition: phasePosition });
  }

  for (let i = 0; i < treatmentUsers.length; i++) {
    const user = treatmentUsers[i];
    const phasePosition = i + 1;
    treatmentUsers[i] = await api.internal.user.update(user.id, { phasePosition: phasePosition });
  }
  
  let sortedQueue = [...assessmentUsers, ...consultationUsers, ...treatmentUsers];

  return sortedQueue;
}

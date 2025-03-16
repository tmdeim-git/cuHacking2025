import { RouteHandler } from "gadget-server";
import { saveAndRefreshQueue } from "../models/user/functions/saveAndUpdateQueue";
import { UserPhaseEnum, UserPriorityEnum } from "@gadget-client/quickpulse";
import { faker } from "@faker-js/faker";

//look for users, then find the user on position 1, and transfer him to the next position, 
const route: RouteHandler<{ Body: { source: UserPhaseEnum, target: UserPhaseEnum; } }> = async ({ request, reply, api, logger, connections, params }) => {
  logger.error(request.body);
  const { source, target } = request.body;

  if (!source || !target) {
    throw new Error("Missing required parameters: source and target must be provided");
  }

  const user = await api.user.findFirst({
    filter: {
      AND: [
        { phasePosition: { equals: 1 } },
        { phase: { equals: source } }
      ]
    }
  });
  if (user.id === undefined) {
    return;
  }

  let assignedPriority: UserPriorityEnum = user.priority;
  if (source === "ASSESSMENT") {
    const priority: UserPriorityEnum[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    assignedPriority = faker.helpers.arrayElement(priority);
  }
  const updated = await api.user.update(user.id, { phase: target, priority: assignedPriority });
  if (target === "DISCHARGED") {
    await api.user.update(user.id, { phasePosition: 1 });
  }

  logger?.info(`Transferring user ${user.id} from ${source} to ${target}`);

  await saveAndRefreshQueue(api);
  return updated;
};


export default route;

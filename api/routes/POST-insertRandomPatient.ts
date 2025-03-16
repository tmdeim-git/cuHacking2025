import { faker } from '@faker-js/faker';
import { RouteHandler, save } from 'gadget-server';
import { saveAndRefreshQueue } from '../models/user/functions/saveAndUpdateQueue';
import { UserPhaseEnum } from '@gadget-client/quickpulse';

const route: RouteHandler<{ Body?: { phase?: UserPhaseEnum; }; }> = async ({ request, reply, api, logger, connections }) => {
  const phase = [request.body?.phase || "ASSESSMENT", "CONSULTATION", "TREATMENT"];
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const birthDate = faker.date.birthdate();
  let randomPhase = faker.helpers.arrayElement(phase);
  const priority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  let randomPriority = faker.helpers.arrayElement(priority);
  if (randomPhase == "ASSESSMENT") {
    randomPriority = "NONE";
  }

  const user = {
    firstName,
    lastName,
    birthDate,
    priority: randomPriority,
    phase: randomPhase
  };

  await api.internal.user.create(user);
  await saveAndRefreshQueue(api, logger);

  return user;
};

export default route;
import { ActionOptions } from "gadget-server";
import { saveAndRefreshQueue } from "../functions/saveAndUpdateQueue";

// Powers form in web/routes/sign-in.tsx

export const run: ActionRun = async ({ params, logger, api, session }) => {
  if (!params.user) {
    throw new Error("User data is required");
  }

  const { firstName, lastName, birthDate } = params.user;

  // Find user with matching firstName, lastName, and birthDate
  const user = await api.user.findFirst({
    filter: {
      firstName: { equals: firstName },
      lastName: { equals: lastName },
      birthDate: { equals: birthDate }
    }
  }).catch(() => null);

  // If no user found, throw error
  if (!user) {
    throw new Error("No user found with the provided information. Please check your details and try again.");
  }

  // Assigns the found user to the active session
  session?.set("user", { _link: user.id });
  return user;
};

export const onSuccess: ActionOnSuccess = async ({ record, logger, api }) => {
  // Update the queue after successful login
  await saveAndRefreshQueue(api);
  logger.info(`Successfully logged in user ${record.id}`);
};

export const options: ActionOptions = {
  actionType: "create",
  returnType: true
};
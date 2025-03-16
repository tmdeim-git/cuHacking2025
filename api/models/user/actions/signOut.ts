import { ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, session }) => {
  // Removes the user from the active session
  session?.set("user", null);
};

export const options: ActionOptions = {
  actionType: "custom",
};

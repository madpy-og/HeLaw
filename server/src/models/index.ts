import { createUserTable } from "./userModel";
import { createConversationTable } from "./conversationModel";
import { createMessageTable } from "./messageModel";
import { createDocumentTable } from "./documentModel";

export const initializeDatabase = async () => {
  try {
    console.log("Initializing database tables...");
    await createUserTable();
    await createConversationTable();
    await createMessageTable();
    await createDocumentTable();
    console.log("All tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database tables:", error);
  }
};

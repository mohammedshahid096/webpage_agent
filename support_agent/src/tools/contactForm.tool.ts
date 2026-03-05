import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const contactFormDetailsSchema = z.object({
  name: z
    .string()
    .describe("Full name of the user submitting the contact form"),

  email: z
    .string()
    .email()
    .describe("Email address of the user submitting the contact form"),

  companyName: z
    .string()
    .optional()
    .describe("Company or organization name of the user (optional)"),

  phoneNumber: z
    .string()
    .describe("Phone number of the user including country code if available"),

  message: z
    .string()
    .describe(
      "Message or inquiry the user wants to send through the contact form",
    ),

  category: z
    .enum(["AI & Automation", "Agent Call Service", "Full Stack Solutions"])
    .describe(
      "Category of the service the user is interested in: AI & Automation, Agent Call Service, or Full Stack Solutions",
    ),
});

type ContactFormInput = z.infer<typeof contactFormDetailsSchema>;

const contactFormDetailsTool = new DynamicStructuredTool({
  name: "contactFormDetailsTool",
  description:
    "Use this tool to submit a user's contact form details including name, email, phone number, message, company name (optional), and service category.",

  schema: contactFormDetailsSchema,

  func: async ({
    name,
    email,
    companyName,
    phoneNumber,
    message,
    category,
  }: ContactFormInput): Promise<string> => {
    try {
      console.log({
        name,
        email,
        companyName,
        phoneNumber,
        message,
        category,
      });

      return JSON.stringify({
        success: true,
        message: "Contact form submitted successfully",
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        message: "Failed to submit contact form",
        error: error.message,
      });
    }
  },
});

export default contactFormDetailsTool;

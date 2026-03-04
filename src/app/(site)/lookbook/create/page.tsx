import { Metadata } from "next";
import CreateLookbookWizard from "@/components/Lookbook/CreateLookbookWizard";

export const metadata: Metadata = {
    title: "Create Lookbook | Fitova",
    description: "Curate your personal fashion lookbook on Fitova. Combine products you love into a styled collection.",
};

export default function CreateLookbookPage() {
    return <CreateLookbookWizard />;
}

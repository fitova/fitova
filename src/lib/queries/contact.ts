import { createClient } from "../supabase/client";

export type ContactMessageInput = {
    name: string;
    email: string;
    subject: string | null;
    message: string;
};

// Submit a new contact message
export async function submitContactMessage(contactData: ContactMessageInput) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("contact_messages")
        .insert([contactData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

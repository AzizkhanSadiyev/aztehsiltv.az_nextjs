import { notFound } from "next/navigation";

// This catch-all route handles any undefined routes
// and redirects them to the 404 page
export default function CatchAllPage() {
    notFound();
}

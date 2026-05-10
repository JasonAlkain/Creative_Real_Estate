import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-2">Property not found</h1>
      <p className="text-muted-foreground mb-6">
        This listing may have been removed or the link is incorrect.
      </p>
      <Button render={<Link href="/" />} variant="outline">
        <ArrowLeft size={14} className="mr-1.5" />
        Back to listings
      </Button>
    </div>
  );
}

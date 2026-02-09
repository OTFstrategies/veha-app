import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-xl font-semibold">Pagina niet gevonden</h2>
      <p className="text-center text-muted-foreground">
        De pagina die u zoekt bestaat niet of is verplaatst.
      </p>
      <Button asChild>
        <Link href="/">Terug naar home</Link>
      </Button>
    </div>
  );
}

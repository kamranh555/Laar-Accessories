import { getProfile } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-brown">Profile</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{profile.fullName || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{profile.phone || "Not set"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

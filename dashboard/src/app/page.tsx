import { DashboardClient } from "@/components/dashboard-client";
import { photoDataset } from "@/lib/photo-data";

export default function Home() {
  return <DashboardClient photos={photoDataset} />;
}

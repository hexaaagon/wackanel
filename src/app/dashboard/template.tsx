import { StoreProviderWrapper } from "@/lib/app/store/provider";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreProviderWrapper>{children}</StoreProviderWrapper>;
}

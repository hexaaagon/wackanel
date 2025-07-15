import { StoreProviderWrapper } from "@/lib/store/provider";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreProviderWrapper>{children}</StoreProviderWrapper>;
}

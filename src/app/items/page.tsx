import { RequiredItemsList } from "@/components/items/required-items-list";

export default function ItemsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold title-gold">Required Items</h1>
        <p className="text-muted-foreground">
          Track items needed for tasks and hideout upgrades across your current
          game mode.
        </p>
      </div>

      <RequiredItemsList />
    </div>
  );
}

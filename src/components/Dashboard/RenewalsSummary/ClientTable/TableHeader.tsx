
import { useClientTable } from "./ClientTableContext";

export function TableHeader() {
  const { isMobile } = useClientTable();

  return (
    <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
      <tr>
        <th className="p-3 text-left">Client Name</th>
        {!isMobile && <th className="p-3 text-left">Team</th>}
        <th className="p-3 text-left">Status</th>
        <th className="p-3 text-left">Reasons</th>
      </tr>
    </thead>
  );
}

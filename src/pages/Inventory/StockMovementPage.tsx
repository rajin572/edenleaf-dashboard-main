import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";

const DUMMY_DATA = [
  { id: "1", name: "Sample Stock Movement 1", status: "Active", date: "2026-08-19" },
  { id: "2", name: "Sample Stock Movement 2", status: "Pending", date: "2026-08-18" },
  { id: "3", name: "Sample Stock Movement 3", status: "Completed", date: "2026-08-17" },
];

const columns: Column<any>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { header: "Status", accessorKey: "status" },
  { header: "Date", accessorKey: "date" },
];

const StockMovementPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <PageWraper title="Stock Movement" description="Manage and view stock movement">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <ReusableTable
          data={DUMMY_DATA}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={3}
        />
      </div>
    </PageWraper>
  );
};

export default StockMovementPage;

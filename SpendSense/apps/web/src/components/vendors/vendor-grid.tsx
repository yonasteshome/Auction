import { VendorCard } from "./vendor-card";
import { VendorPagination } from "./vendor-pagination";
import { Search } from "lucide-react";
import { VendorListResponse } from "@/types/api/vendors";

interface VendorGridProps {
  data: VendorListResponse;
}

export function VendorGrid({ data }: VendorGridProps) {
  try {
		if (data.results.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card border-dashed">
					<Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
					<h3 className="text-lg font-medium">No vendors match your filters</h3>
					<p className="text-muted-foreground mt-2 max-w-sm">
						Try adjusting your search criteria or clear all filters to see more results.
					</p>
				</div>
			);
		}
	
		return (
			<>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{data.results.map((vendor) => (
						<VendorCard key={vendor.id} vendor={vendor} />
					))}
				</div>
				<VendorPagination 
					total={data.pagination.total_records} 
					page={data.pagination.current_page} 
					pageSize={data.pagination.page_size} 
					totalPages={data.pagination.total_pages} 
				/>
			</>
		);
	}catch(e){
		<div>{JSON.stringify(e)}</div>
	}

}

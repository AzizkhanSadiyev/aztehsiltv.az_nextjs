"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Search, 
  SlidersHorizontal,
  Download,
  RefreshCw,
  X,
  Check,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  title?: string;
  description?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRefresh?: () => void;
  toolbar?: ReactNode;
  emptyState?: ReactNode;
  stickyHeader?: boolean;
  minTableWidth?: number;
}

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="py-3 px-4">
              <Skeleton className="h-5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  isLoading = false,
  title,
  description,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  onRefresh,
  toolbar,
  emptyState,
  stickyHeader = true,
  minTableWidth = 720,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchValue("");
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue("");
    }
  };

  const hasRows = table.getRowModel().rows?.length > 0;
  const showEmptyState = !isLoading && !hasRows && emptyState;

  return (
    <div className="space-y-4">
      <div className="admin-card admin-card-table">
        {(toolbar || title || searchKey || onRefresh) && (
          <div className="admin-card-header">
            {toolbar ? (
              <div className="w-full">{toolbar}</div>
            ) : (
              <div className="w-full space-y-3">
                {title && (
                  <div>
                    <h2 className="admin-card-title">{title}</h2>
                    {description && (
                      <p className="admin-card-subtitle">{description}</p>
                    )}
                  </div>
                )}
                <div className="admin-toolbar">
                  {searchKey && (
                    <div className="admin-toolbar-search">
                      <Search className="admin-toolbar-search-icon" />
                      <input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                      {searchValue && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={clearSearch}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Clear search</span>
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="admin-toolbar-actions">
                    {onRefresh && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        className="h-9 gap-1 px-3"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Refresh</span>
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1 px-3">
                          <SlidersHorizontal className="h-4 w-4" />
                          <span className="hidden sm:inline">Columns</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                              {column.id.replace(/([A-Z])/g, " $1").trim()}
                            </DropdownMenuCheckboxItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" className="h-9 gap-1 px-3">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {Object.keys(rowSelection).length > 0 && (
          <div className="px-6 pt-4">
            <div className="bg-primary/5 border rounded-md p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {Object.keys(rowSelection).length} row(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {columnFilters.length > 0 && (
          <div className="px-6 pt-4">
            <div className="flex flex-wrap gap-2 items-center bg-muted/40 rounded-md p-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground mr-1">Filters:</span>
              {columnFilters.map((filter) => (
                <Badge key={filter.id} variant="outline" className="flex items-center gap-1 text-xs">
                  <span>{filter.id.replace(/([A-Z])/g, " $1").trim()}:</span>
                  <span className="font-medium">{String(filter.value)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      table.getColumn(filter.id)?.setFilterValue(undefined);
                    }}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs ml-auto"
                onClick={() => setColumnFilters([])}
              >
                Clear all
              </Button>
            </div>
          </div>
        )}

        {showEmptyState ? (
          <div className="admin-card-body">{emptyState}</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table" style={{ minWidth: minTableWidth }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      (() => {
                        const isActions = header.column.id === "actions";
                        return (
                      <th
                        key={header.id}
                        className={cn(
                          stickyHeader && "sticky top-0 z-10",
                          isActions && "admin-table-actions",
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {{
                            asc: <ChevronRight className="h-4 w-4 rotate-90" />,
                            desc: <ChevronRight className="h-4 w-4 -rotate-90" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                        );
                      })()
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={columns.length} />
                ) : hasRows ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(row.getIsSelected() && "bg-primary/5")}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isActions = cell.column.id === "actions";
                        return (
                        <td
                          key={cell.id}
                          className={cn("py-3 px-4", isActions && "admin-table-actions")}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No results found</p>
                        <p className="text-xs">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-card-footer">
          <div className="admin-pagination">
            <div className="admin-pagination-rows">
              <span>Rows per page</span>
              <select
                className="admin-select"
                value={`${table.getState().pagination.pageSize}`}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="admin-pagination-info">
                Showing{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {table.getFilteredRowModel().rows.length}
                </span>{" "}
                results
              </div>

              <div className="admin-pagination-controls">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">First page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                <span className="text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount() || 1}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8"
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

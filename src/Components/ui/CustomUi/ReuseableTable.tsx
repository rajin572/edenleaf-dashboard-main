/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "../table";
import ReusablePagination from './ReusablePagination';
import { cn } from '@/lib/utils';

export interface Column<T> {
    header: React.ReactNode;
    accessorKey: keyof T;
    headerClassName?: string;
    cellClassName?: string;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    fixed?: boolean;
    width?: string | number; // Support both "200px" and 200
}

export interface FooterCell {
    content: React.ReactNode;
    colSpan?: number;
    className?: string;
}

interface ReusableTableProps<T> {
    data: T[];
    columns: Column<T>[];
    caption?: string;
    footer?: FooterCell[];
    pagination?: boolean;
    currentPage?: number;
    setCurrentPage?: (page: number) => void;
    limit?: number;
    total?: number;
    onRowClick?: (row: T) => void;
    scroll?: boolean;
}

const ReusableTable = <T,>({
    data,
    columns,
    caption,
    footer,
    pagination = false,
    currentPage = 1,
    setCurrentPage = () => { },
    limit = 10,
    total = 0,
    onRowClick,
    scroll = true
}: ReusableTableProps<T>) => {
    // Helper function to format width
    const formatWidth = (width: string | number | undefined) => {
        if (!width) return undefined;
        return typeof width === 'number' ? `${width}px` : width;
    };

    return (
        <div className={cn(pagination && 'pb-5')}>
            <div className={cn(
                'overflow-x-auto',
                scroll ? 'lg:overflow-x-auto' : 'lg:overflow-x-visible'
            )}>
                <Table className={cn(' rounded-2xl! w-full', { 'min-w-max': scroll })}>
                    {caption && <TableCaption>{caption}</TableCaption>}

                    <TableHeader className='rounded-2xl! bg-[#F5F5F5]'>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className={cn("text-xl font-bold px-5 py-4", column.headerClassName)}
                                    style={{
                                        width: formatWidth(column.width),
                                        minWidth: formatWidth(column.width) || (scroll ? '150px' : "auto"),
                                        maxWidth: formatWidth(column.width),
                                        position: column.fixed ? 'sticky' : 'static',
                                        left: column.fixed ? 0 : 'auto',
                                        backgroundColor: column.fixed ? '#F5F5F5' : undefined,
                                        zIndex: column.fixed ? 10 : undefined,
                                    }}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center text-gray-500 py-8"
                                >
                                    No data available
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    onClick={() => onRowClick?.(row)}
                                    className={onRowClick ? 'cursor-pointer' : ''}
                                >
                                    {columns.map((column, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            className={cn(
                                                "px-5 py-4 text-base",
                                                "max-w-125 md:max-w-none",
                                                column.cellClassName,
                                                {
                                                    'whitespace-nowrap': scroll,
                                                    'whitespace-normal wrap-break-word overflow-wrap-anywhere': !scroll
                                                }
                                            )}
                                            style={{
                                                width: formatWidth(column.width),
                                                minWidth: scroll ? formatWidth(column.width) : undefined,
                                                maxWidth: window.innerWidth >= 768 && !scroll ? formatWidth(column.width) : undefined,
                                                position: column.fixed ? 'sticky' : 'static',
                                                left: column.fixed ? 0 : 'auto',
                                                backgroundColor: column.fixed ? 'white' : undefined,
                                                zIndex: column.fixed ? 10 : undefined
                                            }}
                                        >
                                            {column.render
                                                ? column.render(row[column.accessorKey], row, rowIndex)
                                                : (row[column.accessorKey] as React.ReactNode)
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>

                    {footer && (
                        <TableFooter>
                            <TableRow>
                                {footer.map((cell, index) => (
                                    <TableCell
                                        key={index}
                                        colSpan={cell.colSpan || 1}
                                        className={cell.className}
                                    >
                                        {cell.content}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>

            <div className='w-full mt-16 ml-auto'>
                {
                    pagination && <ReusablePagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        limit={limit}
                        total={total}
                    />
                }
            </div>
        </div>
    );
}

export default ReusableTable;
"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { currentTimezone } from "@/lib/helper/current-timezone";
import { Contact } from "@/types/types";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { ContactTableRowActions } from "../actions/contact-actions";

export function getContactColumns(
  fetchContacts: () => void
): ColumnDef<Contact>[] {
  const columns: ColumnDef<Contact, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center w-full">
            <div>
              <Avatar className="border-foreground/10 border-[1px]">
                <AvatarImage
                  className=""
                  src={
                    row.original.avatar?.includes("http")
                      ? row.original.avatar
                      : generateNameAvatar(row.original.name || "")
                  }
                  alt={row.original.name || ""}
                />
              </Avatar>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight ml-3">
              <span className="truncate font-semibold">
                {row.original.name || ""}
              </span>
              <span className="truncate text-xs">
                {row.original.contact_number || ""}
              </span>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const created = row.original.created_at;
        return (
          <div className="text-left overflow-hidden whitespace-nowrap">
            {created
              ? currentTimezone(created)?.toLocaleString()?.replace("GMT", "")
              : "-"}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <ContactTableRowActions
            row={row as unknown as Row<Contact>}
            fetchContacts={fetchContacts}
          />
        </div>
      ),
    },
  ];

  return columns;
}

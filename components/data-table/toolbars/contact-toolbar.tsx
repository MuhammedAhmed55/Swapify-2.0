"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import {
  Download,
  Loader2,
  Plus,
  RefreshCcw,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useAuth } from "@/context/AuthContext";
import { createContactWithConversation } from "@/modules";
import { syncWahaProConversations } from "@/modules/contacts/services/save-conversation-messages";

interface DataTableToolbarProps<TData> {
  table?: Table<TData>;
  onRefresh?: () => void;
  onExport?: () => void;
  tableName?: string;
  onGlobalFilterChange?: (value: string) => void;
  fetchRecords: () => void;
  type?: string;
  onChannelFilterChange?: (channelId: string | null) => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  contact_number: z
    .string()
    .min(8, { message: "Contact number must be at least 8 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Invalid phone number format" }),
  avatar: z.string().optional(),
});

export function ContactDataTableToolbar<TData>({
  table,
  onRefresh,
  onExport,
  tableName,
  onGlobalFilterChange,
  fetchRecords,
  type,
  onChannelFilterChange,
}: DataTableToolbarProps<TData>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const { whatsappConnected } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact_number: "",
      avatar: "",
    },
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    onGlobalFilterChange?.(value);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Use the new method to create contact with conversation
      const result = await createContactWithConversation({
        name: data.name,
        contact_number: data.contact_number.replace("+", "") + "@c.us",
        avatar: "",
        source: whatsappConnected?.me?.id,
      });

      if (result.contactExists) {
        toast.info(
          `Contact with number ${data.contact_number} already exists for this channel`
        );
      } else {
        toast.success("Contact and conversation created successfully");
        setIsDialogOpen(false);
        form.reset();
        fetchRecords();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  // Sync contacts from UltraMsg API
  async function handleSyncContacts() {
    console.log(
      "🚀 ~ handleSyncContacts ~ whatsappConnected:",
      whatsappConnected
    );
    if (!whatsappConnected?.me?.id) {
      toast.error("WhatsApp connection is required to sync contacts");
      return;
    }

    try {
      setIsSyncing(true);

      const result = await syncWahaProConversations(whatsappConnected?.me?.id);

      toast.success(
        `Contacts synced: ${result.added} added, ${result.existing} existing, ${result.errors} errors`
      );

      // Refresh contacts list
      await fetchRecords();

      // If a user is selected, refresh their linked contacts
      // if (selectedUser) {
      //   await fetchLinkedContacts(selectedUser.id);
      // }
    } catch (err) {
      console.error("Error syncing contacts:", err);
      toast.error("Failed to sync contacts");
    } finally {
      setIsSyncing(false);
    }
  }

  const isFiltered = globalFilter !== "";
  return (
    <div className="flex items-center justify-between ">
      <div className="flex flex-1 items-center space-x-2 ">
        <div className="relative w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or number..."
            value={globalFilter}
            onChange={handleFilterChange}
            className="pl-8 w-full bg-background"
            autoComplete="off"
          />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              onGlobalFilterChange?.("");
              setGlobalFilter("");
              // setSelectedChannelId(null);
              // onChannelFilterChange?.(null);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>{" "}
      {tableName && (
        <div className="px-2">
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
            onClick={onExport}
          >
            <Download className="p-1" />
            Export
          </Button>
        </div>
      )}
      <div className="px-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="ml-auto hidden h-8 lg:flex"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
      {table && <DataTableViewOptions table={table} />}
      <Button
        size="sm"
        variant="outline"
        className="ml-2"
        onClick={handleSyncContacts}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        {isSyncing ? "Syncing..." : "Sync WhatsApp"}
      </Button>
      {
        <div className="pl-2">
          <Button
            variant="default"
            size="sm"
            className="ml-auto h-8 "
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Contact
          </Button>
        </div>
      }
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.watch("avatar") && (
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={form.watch("avatar")} />
                    <AvatarFallback>
                      {form.watch("name")?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="ae"
                        value={field.value}
                        onChange={(phone: any) => field.onChange(phone)}
                        placeholder="Enter mobile number"
                        inputClassName="h-11 rounded-md px-3 text-sm placeholder:text-dark-600 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Contact"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-component';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const communicationSchema = z.object({
  type: z.enum(['email', 'call', 'meeting', 'note']),
  channel: z.string().min(1, 'Channel is required'),
  summary: z.string().min(1, 'Summary is required'),
  content: z.string().min(1, 'Content is required'),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.date().optional().nullable(),
});

type CommunicationFormValues = z.infer<typeof communicationSchema>;

export function CommunicationForm() {
  const { tenantId, communicationId } = useParams<{ tenantId: string; communicationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(communicationId);

  const form = useForm<CommunicationFormValues>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      type: 'email',
      channel: '',
      summary: '',
      content: '',
      followUpRequired: false,
      followUpDate: null,
    },
  });

  // Load communication data if in edit mode
  useEffect(() => {
    const loadCommunication = async () => {
      if (!isEdit || !communicationId) return;

      setIsLoading(true);
      try {
        const data = await api.get(`/communications/${communicationId}`);

        form.reset({
          type: data.type,
          channel: data.channel,
          summary: data.summary,
          content: data.content,
          followUpRequired: data.followUpRequired,
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        });
      } catch (error) {
        console.error('Error loading communication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunication();
  }, [communicationId, isEdit, form]);

  const onSubmit = async (data: CommunicationFormValues) => {
    if (!tenantId) {
      toast.error('Tenant ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        tenantId,
        followUpDate: data.followUpRequired && data.followUpDate 
          ? data.followUpDate.toISOString() 
          : null,
      };

      if (isEdit && communicationId) {
        await api.put(`/communications/${communicationId}`, payload);
        toast.success('Communication updated successfully');
      } else {
        await api.post('/communications', payload);
        toast.success('Communication created successfully');
      }

      // Navigate back to communications list
      navigate(`/dashboard/tenants/${tenantId}/communications`);
    } catch (error: any) {
      console.error('Error saving communication:', error);
      const errorMessage = error?.message || 'Failed to save communication';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="text-center py-12">
              <p className="text-red-500">Tenant ID is required</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/dashboard/tenants')}
              >
                Back to Tenants
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit Communication' : 'New Communication'}
            </h2>
            <p className="text-muted-foreground">
              {isEdit ? 'Update the communication details' : 'Log a new communication with the tenant'}
            </p>
          </div>

          <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select communication type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="meeting">In-Person Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <Input placeholder="e.g., Email, Phone, In-Person" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <Input placeholder="Brief summary of the communication" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <Textarea
                  placeholder="Enter the full details of the communication..."
                  className="min-h-[200px]"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="followUpRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Follow-up required</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check if this communication requires a follow-up
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('followUpRequired') && (
              <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Follow-up Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'} Communication
            </Button>
          </div>
        </form>
      </Form>
        </div>
      </div>
    </div>
  );
}

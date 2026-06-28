-- Create the documents bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Set up storage policies for the documents bucket
create policy "Public access to documents"
on storage.objects for select
using ( bucket_id = 'documents' );

create policy "Allow uploads to documents"
on storage.objects for insert
with check ( bucket_id = 'documents' );
